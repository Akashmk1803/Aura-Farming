export const CONVENIENCE_FEE = 20;
export const PLATFORM_FEE = 23;
export const DELIVERY_FEE_PREPAID = 0;
export const DELIVERY_FEE_COD = 137;
export const COD_FEE_CHARGE = 19;
export const HANDLING_DEDUCTION = 40; // non-refundable handling fee for returns

export type CouponData = {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  isActive: boolean;
  isOneTime: boolean;
  expiryDate: Date | string | null;
  description?: string | null;
  isWelcome?: boolean;
  usageLimit?: number | null;
};

export type PricingSummary = {
  subtotal: number;
  mrpTotal: number;
  discount: number;
  convenienceFee: number;
  platformFee: number;
  deliveryFee: number;
  codFee: number;
  shippingFee: number;
  total: number;
};

export function calculateDiscount(subtotal: number, coupon?: CouponData | null): number {
  if (!coupon || !coupon.isActive) return 0;
  
  if (coupon.expiryDate && new Date() > coupon.expiryDate) return 0;
  if (subtotal < coupon.minOrderValue) return 0;

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.floor((subtotal * coupon.discountValue) / 100);
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  }

  if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  // Ensure discount doesn't exceed subtotal
  return Math.min(discount, subtotal);
}

export function calculateOrderSummary(
  items: { price: number; quantity: number; mrp?: number }[],
  isCOD: boolean,
  coupon?: CouponData | null
): PricingSummary {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      mrpTotal: 0,
      discount: 0,
      convenienceFee: 0,
      platformFee: 0,
      deliveryFee: 0,
      codFee: 0,
      shippingFee: 0,
      total: 0,
    };
  }

  let subtotal = 0;
  let mrpTotal = 0;

  for (const item of items) {
    subtotal += item.price * item.quantity;
    mrpTotal += (item.mrp || item.price) * item.quantity;
  }

  const discount = calculateDiscount(subtotal, coupon);
  const discountedSubtotal = subtotal - discount;

  const convenienceFee = CONVENIENCE_FEE;
  const platformFee = PLATFORM_FEE;
  const deliveryFee = isCOD ? DELIVERY_FEE_COD : DELIVERY_FEE_PREPAID;
  const codFee = isCOD ? COD_FEE_CHARGE : 0;
  const shippingFee = deliveryFee; // legacy compat

  const total = discountedSubtotal + convenienceFee + platformFee + deliveryFee + codFee;

  return {
    subtotal,
    mrpTotal,
    discount,
    convenienceFee,
    platformFee,
    deliveryFee,
    codFee,
    shippingFee,
    total,
  };
}
