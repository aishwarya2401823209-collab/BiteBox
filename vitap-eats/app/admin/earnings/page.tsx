"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, ShoppingBag, ArrowRight, DollarSign, Package } from "lucide-react";
import { rupees } from "@/lib/utils";
import { subscribeToAllOrders, type Order } from "@/lib/db/orders";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminEarningsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-10 flex flex-col items-center justify-center text-gray-400" style={{ backgroundColor: "#F7EDDF" }}>
        <Loader2 size={32} className="animate-spin mb-2 text-orange-600" />
        <span className="text-xs font-semibold">Loading real-time analytics...</span>
      </div>
    );
  }

  // Calculate summary metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Generate basic daily stats from orders (last 7 days)
  const today = new Date();
  const daily_stats = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const dayOrders = orders.filter(o => o.createdAt?.toDate && o.createdAt.toDate().toDateString() === d.toDateString());
    return {
      day: d.toISOString(),
      dateStr,
      revenue: dayOrders.reduce((acc, o) => acc + (o.total || 0), 0),
      total_orders: dayOrders.length,
    };
  }).reverse();

  // Calculate max revenue for bar chart scaling
  const maxRev = Math.max(...daily_stats.map(s => s.revenue || 0), 1000);

  // Top dishes
  const itemCounts: Record<string, { name: string; count: number; restaurant: string }> = {};
  orders.forEach(o => {
    o.items?.forEach(i => {
      if (!itemCounts[i.menuItemId]) {
        itemCounts[i.menuItemId] = { name: i.name, count: 0, restaurant: o.restaurantName || "Campus Kitchen" };
      }
      itemCounts[i.menuItemId].count += i.quantity;
    });
  });
  const top_dishes = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#F7EDDF" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link to Dashboard */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Top Header Card Container */}
        <div className="flex justify-between items-center bg-white/75 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-amber-900/10 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-gray-950 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              Insights & Financial Analytics 📈
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">Real-time performance metrics and campus order trends.</p>
          </div>
        </div>

        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-900/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{rupees(totalRevenue)}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-900/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Package size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{totalOrdersCount}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-900/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Avg. Order Value</p>
              <p className="text-lg font-bold text-gray-900">{rupees(averageOrderValue)}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Revenue Chart */}
          <div className="lg:col-span-2 bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-900/10 p-5">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-orange-600" />
              <h3 className="font-bold text-gray-900 text-sm">7-Day Revenue Trend</h3>
            </div>
            
            <div className="h-64 flex items-end gap-2 overflow-x-auto hide-scrollbar pb-2">
              {daily_stats.map((stat, i) => {
                const h = ((stat.revenue || 0) / maxRev) * 100;
                return (
                  <div key={i} className="group relative flex flex-col items-center justify-end h-full min-w-[36px] flex-1">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-xl shadow-lg pointer-events-none whitespace-nowrap z-20">
                      <p className="font-bold">{rupees(stat.revenue || 0)}</p>
                      <p className="text-gray-300 text-[10px]">{stat.total_orders} orders</p>
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-full bg-orange-200 group-hover:bg-orange-600 rounded-t-lg transition-all" 
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                    {/* X-axis label */}
                    <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center font-medium">
                      {stat.dateStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Dishes */}
          <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-900/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} className="text-amber-600" />
                <h3 className="font-bold text-gray-900 text-sm">Top Campus Dishes</h3>
              </div>

              <div className="space-y-3 pr-1 max-h-[220px] overflow-y-auto">
                {top_dishes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No order data recorded yet</p>
                ) : (
                  top_dishes.map((dish, i) => (
                    <div key={i} className="flex items-center gap-3 group p-2 rounded-xl hover:bg-orange-50/50 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{dish.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{dish.restaurant}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-900 tabular-nums">{dish.count}</p>
                        <p className="text-[9px] text-gray-400">units sold</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <button 
              onClick={() => alert("Full analytics report feature coming soon!")}
              className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors shadow-sm"
            >
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}