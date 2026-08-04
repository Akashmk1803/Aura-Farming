import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, user, coupons, couponUsages } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { gte, lte, and, eq, inArray, isNotNull, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Default to last 30 days if not provided
    const now = new Date();
    let startDate = startParam ? new Date(startParam) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let endDate = endParam ? new Date(endParam) : now;
    
    // Ensure end date covers the whole day
    endDate.setHours(23, 59, 59, 999);

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Fetch all orders within range (excluding cancelled/returned for revenue)
    const allOrdersRange = await db.select().from(orders).where(
      and(
        gte(orders.createdAt, startISO),
        lte(orders.createdAt, endISO)
      )
    ).all();

    const validOrdersRange = allOrdersRange.filter(o => o.status !== 'cancelled' && o.status !== 'returned');

    // To calculate "Today", "This Week", "This Month" accurately, we might just fetch all valid orders ever, or just do it in JS
    const allOrdersEver = await db.select().from(orders).all();
    const validOrdersEver = allOrdersEver.filter(o => o.status !== 'cancelled' && o.status !== 'returned');

    const todayStart = new Date(now);
    todayStart.setHours(0,0,0,0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRevenue = validOrdersEver.filter(o => new Date(o.createdAt || 0) >= todayStart).reduce((sum, o) => sum + o.total, 0);
    const weekRevenue = validOrdersEver.filter(o => new Date(o.createdAt || 0) >= weekStart).reduce((sum, o) => sum + o.total, 0);
    const monthRevenue = validOrdersEver.filter(o => new Date(o.createdAt || 0) >= monthStart).reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = validOrdersEver.reduce((sum, o) => sum + o.total, 0);

    // Range specific metrics
    const rangeRevenue = validOrdersRange.reduce((sum, o) => sum + o.total, 0);
    const rangeOrdersCount = validOrdersRange.length;
    const averageOrderValue = rangeOrdersCount > 0 ? rangeRevenue / rangeOrdersCount : 0;

    // Fetch all customers for "New vs Returning" logic
    const allCustomers = await db.select().from(user).all();
    const rangeCustomers = allCustomers.filter(c => c.createdAt >= startDate && c.createdAt <= endDate);
    const newCustomers = rangeCustomers.length;
    
    // Customers with > 1 valid order in range or ever? Usually returning means > 1 order overall.
    // Let's define returning as users who placed an order in the range, and also have previous orders.
    const userOrderCounts = new Map<string, number>();
    validOrdersEver.forEach(o => {
      userOrderCounts.set(o.userId || 'guest', (userOrderCounts.get(o.userId || 'guest') || 0) + 1);
    });
    const returningCustomers = Array.from(userOrderCounts.values()).filter(count => count > 1).length;

    // Time-series Data (Revenue & Orders by Day within range)
    const timeSeriesMap = new Map<string, { revenue: number, orders: number }>();
    
    // Initialize map with all days in range to avoid gaps
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timeSeriesMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    validOrdersRange.forEach(o => {
      const dateStr = new Date(o.createdAt || 0).toISOString().split('T')[0];
      if (timeSeriesMap.has(dateStr)) {
        const current = timeSeriesMap.get(dateStr)!;
        timeSeriesMap.set(dateStr, { revenue: current.revenue + o.total, orders: current.orders + 1 });
      }
    });

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Products & Categories Data
    const rangeOrderIds = validOrdersRange.map(o => o.id);
    let itemsInRange: any[] = [];
    if (rangeOrderIds.length > 0) {
      itemsInRange = await db.select().from(orderItems).where(inArray(orderItems.orderId, rangeOrderIds)).all();
    }

    const allProducts = await db.select().from(products).all();
    const productMap = new Map(allProducts.map(p => [p.id, p]));

    const categoryMap = new Map<string, { name: string, sales: number, revenue: number, productsSold: number }>();
    const topProductsMap = new Map<string, { name: string, unitsSold: number, revenue: number }>();

    itemsInRange.forEach(item => {
      const product = productMap.get(item.productId);
      const cat = product?.categoryLabel || 'Uncategorized';
      const catKey = product?.category || 'uncategorized';
      
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, { name: cat, sales: 0, revenue: 0, productsSold: 0 });
      }
      const c = categoryMap.get(catKey)!;
      c.sales += 1;
      c.revenue += item.price * item.quantity;
      c.productsSold += item.quantity;

      if (!topProductsMap.has(item.productId)) {
        topProductsMap.set(item.productId, { name: item.name, unitsSold: 0, revenue: 0 });
      }
      const tp = topProductsMap.get(item.productId)!;
      tp.unitsSold += item.quantity;
      tp.revenue += item.price * item.quantity;
    });

    const categoryData = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
    const topProducts = Array.from(topProductsMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const totalProductsSold = itemsInRange.reduce((sum, item) => sum + item.quantity, 0);

    // Low Stock Alert
    const lowStockThreshold = 10;
    const lowStockProducts = allProducts.filter(p => p.stock <= lowStockThreshold).sort((a, b) => a.stock - b.stock);

    // Top Customers
    const topCustomersMap = new Map<string, { id: string, name: string, email: string, spending: number, orders: number }>();
    validOrdersEver.forEach(o => {
      if (!o.userId) return; // Skip guests
      if (!topCustomersMap.has(o.userId)) {
        const userObj = allCustomers.find(c => c.id === o.userId);
        if (userObj) {
          topCustomersMap.set(o.userId, { id: userObj.id, name: userObj.name, email: userObj.email, spending: 0, orders: 0 });
        }
      }
      const tc = topCustomersMap.get(o.userId);
      if (tc) {
        tc.spending += o.total;
        tc.orders += 1;
      }
    });
    const topCustomers = Array.from(topCustomersMap.values()).sort((a, b) => b.spending - a.spending).slice(0, 10);

    // Coupon Analytics
    const allCouponUsages = await db.select().from(couponUsages).where(isNotNull(couponUsages.orderId)).all();
    const couponAnalyticsMap = new Map<string, { code: string, uses: number, revenue: number }>();
    
    // We need to join usages with orders to get revenue influenced.
    const validOrderMap = new Map(validOrdersEver.map(o => [o.id, o]));
    allCouponUsages.forEach(usage => {
      const order = validOrderMap.get(usage.orderId!);
      if (order) {
        if (!couponAnalyticsMap.has(usage.couponCode)) {
          couponAnalyticsMap.set(usage.couponCode, { code: usage.couponCode, uses: 0, revenue: 0 });
        }
        const ca = couponAnalyticsMap.get(usage.couponCode)!;
        ca.uses += 1;
        ca.revenue += order.total;
      }
    });
    const topCoupons = Array.from(couponAnalyticsMap.values()).sort((a, b) => b.uses - a.uses).slice(0, 10);

    return NextResponse.json({
      summary: {
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        rangeRevenue,
        totalOrders: rangeOrdersCount,
        averageOrderValue,
        totalCustomers: allCustomers.length,
        newCustomers,
        returningCustomers,
        totalProductsSold
      },
      timeSeriesData,
      categoryData,
      topProducts,
      lowStockProducts,
      topCustomers,
      topCoupons
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
