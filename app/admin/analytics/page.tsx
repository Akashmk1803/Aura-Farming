'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('30days'); // 7days, 30days, 90days, year, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    let url = '/api/admin/analytics';
    
    if (filter !== 'custom') {
      const now = new Date();
      let start = new Date();
      if (filter === '7days') start.setDate(now.getDate() - 7);
      else if (filter === '30days') start.setDate(now.getDate() - 30);
      else if (filter === '90days') start.setDate(now.getDate() - 90);
      else if (filter === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
      }
      url += `?start=${start.toISOString()}&end=${now.toISOString()}`;
    } else if (customStart && customEnd) {
      url += `?start=${new Date(customStart).toISOString()}&end=${new Date(customEnd).toISOString()}`;
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter !== 'custom' || (filter === 'custom' && customStart && customEnd)) {
      fetchAnalytics();
    }
  }, [filter, customStart, customEnd]);

  if (loading && !data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--bone)' }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>Failed to load data.</div>;

  const { summary, timeSeriesData, categoryData, topProducts, lowStockProducts, topCustomers, topCoupons } = data;

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#3b82f6'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--body)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)' }}>Analytics</h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            style={{ padding: '10px 16px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          {filter === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: '8px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '4px', color: 'var(--bone)' }} />
              <span style={{ color: 'var(--dim)' }}>to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: '8px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '4px', color: 'var(--bone)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Range Revenue', value: formatCurrency(summary.rangeRevenue), color: '#4ade80' },
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue) },
          { label: 'Total Orders', value: summary.totalOrders },
          { label: 'Avg Order Value', value: formatCurrency(Math.round(summary.averageOrderValue)) },
          { label: 'Total Customers', value: summary.totalCustomers },
          { label: 'New / Returning', value: `${summary.newCustomers} / ${summary.returningCustomers}` },
          { label: 'Products Sold', value: summary.totalProductsSold },
          { label: 'Today Revenue', value: formatCurrency(summary.todayRevenue) },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--coal)', padding: '20px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
            <div style={{ color: 'var(--dim)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            <div style={{ color: stat.color || 'var(--bone)', fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--disp)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '24px' }}>Revenue Over Time</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--dim)" fontSize={12} tickFormatter={val => new Date(val).toLocaleDateString('en-IN', {month:'short', day:'numeric'})} />
                <YAxis stroke="var(--dim)" fontSize={12} tickFormatter={val => `₹${val / 1000}k`} />
                <RechartsTooltip contentStyle={{ background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }} itemStyle={{ color: '#4ade80' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4ade80" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '24px' }}>Orders Over Time</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--dim)" fontSize={12} tickFormatter={val => new Date(val).toLocaleDateString('en-IN', {month:'short', day:'numeric'})} />
                <YAxis stroke="var(--dim)" fontSize={12} />
                <RechartsTooltip contentStyle={{ background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }} itemStyle={{ color: '#a855f7' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="orders" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Category Breakdown */}
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '24px' }}>Sales by Category</h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} contentStyle={{ background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {categoryData.map((c: any, i: number) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                  <span style={{ color: 'var(--bone)' }}>{c.name}</span>
                </div>
                <span style={{ color: 'var(--dim)' }}>{formatCurrency(c.revenue)} ({c.productsSold} items)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Top Selling Products</h2>
          {topProducts.length === 0 ? <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>No data available.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((p: any, i: number) => (
                <div key={`${p.name}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--hair)', paddingBottom: '8px' }}>
                  <div style={{ color: 'var(--bone)', fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{i+1}. {p.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(p.revenue)}</div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>{p.unitsSold} units</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--red)', borderRadius: '50%' }}></span>
            Low Stock Alerts
          </h2>
          {lowStockProducts.length === 0 ? <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>All products are sufficiently stocked.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {lowStockProducts.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(225,6,0,0.05)', border: '1px solid rgba(225,6,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--bone)', fontSize: '0.9rem', flex: 1 }}>{p.name}</div>
                  <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1.1rem' }}>{p.stock} left</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Top Customers */}
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Top Customers</h2>
          {topCustomers.length === 0 ? <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>No data available.</div> : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Customer</th>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Orders</th>
                  <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Lifetime Spend</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--hair)' }}>
                    <td style={{ padding: '12px 0', color: 'var(--bone)' }}>{c.name}<br/><span style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>{c.email}</span></td>
                    <td style={{ padding: '12px 0', color: 'var(--bone)' }}>{c.orders}</td>
                    <td style={{ padding: '12px 0', color: 'var(--green)', fontWeight: 600, textAlign: 'right' }}>{formatCurrency(c.spending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Coupon Analytics */}
        <div style={{ background: 'var(--coal)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair)' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Top Coupons</h2>
          {topCoupons.length === 0 ? <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>No coupon usage recorded.</div> : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Coupon Code</th>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Times Used</th>
                  <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Revenue Influenced</th>
                </tr>
              </thead>
              <tbody>
                {topCoupons.map((c: any) => (
                  <tr key={c.code} style={{ borderBottom: '1px solid var(--hair)' }}>
                    <td style={{ padding: '12px 0', color: 'var(--bone)', fontWeight: 600, letterSpacing: '1px' }}>{c.code}</td>
                    <td style={{ padding: '12px 0', color: 'var(--bone)' }}>{c.uses}</td>
                    <td style={{ padding: '12px 0', color: 'var(--bone)', textAlign: 'right' }}>{formatCurrency(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
