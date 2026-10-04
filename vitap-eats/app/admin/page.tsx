"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Users, DollarSign, UtensilsCrossed, TrendingUp, ArrowRight, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardHome() {
  const router = useRouter();

  const handleLogout = () => {
    // Agar koi Firebase auth signOut lagana ho toh yahan laga sakte ho, abhi direct redirect kar rahe hain
    toast.success("Logged out successfully");
    router.push("/"); // Ya jahan bhi login page ho
  };

  const adminModules = [
    {
      title: "Live Orders",
      description: "Manage incoming customer orders, update statuses, and check live delivery sync.",
      icon: <ClipboardList className="text-orange-600" size={28} />,
      href: "/admin/orders",
      bg: "bg-white/80 border-orange-200",
      badge: "Real-time sync 🟢"
    },
    {
      title: "Delivery Partners",
      description: "View active campus runners and assign delivery logistics.",
      icon: <Users className="text-blue-600" size={28} />,
      href: "/admin/partners",
      bg: "bg-white/80 border-blue-200",
    },
    {
      title: "Earnings & Analytics",
      description: "Track total revenue, daily sales performance, and insights.",
      icon: <DollarSign className="text-green-600" size={28} />,
      href: "/admin/earnings",
      bg: "bg-white/80 border-green-200",
    },
    {
      title: "Menu Management",
      description: "Add, update, or remove dishes, prices, and item availability.",
      icon: <UtensilsCrossed className="text-purple-600" size={28} />,
      href: "/admin/menu",
      bg: "bg-white/80 border-purple-200",
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#F7EDDF" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header with Profile / Logout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-900/10">
          <div>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 font-bold rounded-full text-xs uppercase tracking-wider">
              Admin Portal 🚀
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome back, Admin
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your store operations, live orders, and earnings from one central dashboard.
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-amber-900/10 shadow-sm">
              <TrendingUp size={18} className="text-green-600" />
              <div className="text-xs">
                <p className="text-gray-400 font-medium">System Status</p>
                <p className="font-bold text-gray-800">All Systems Online 🟢</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
              title="Logout from Admin Portal"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Quick Access Cards Grid */}
        <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Quick Management Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {adminModules.map((module, idx) => (
            <Link
              key={idx}
              href={module.href}
              className="p-6 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-amber-900/10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${module.bg} shadow-sm`}>
                    {module.icon}
                  </div>
                  {module.badge && (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 font-bold rounded-full text-[10px]">
                      {module.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                  {module.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-orange-600 mt-6 pt-4 border-t border-amber-900/10">
                <span>Access module</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}