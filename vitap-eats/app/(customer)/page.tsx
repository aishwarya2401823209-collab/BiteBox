"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, Flame, Star, TrendingUp, Package, Gift } from "lucide-react";
import { useRestaurants, useMenuItems } from "@/lib/hooks";
import { useLocationStore } from "@/lib/store/location";
import { DishCard } from "@/components/customer/DishCard";

const CUISINES = [
  { id: "all",       label: "All",       emoji: "🍽️" },
  { id: "pizza",     label: "Pizza",     emoji: "🍕" },
  { id: "wraps",     label: "Wraps",     emoji: "🌯" },
  { id: "fast-food", label: "Fast Food", emoji: "🍟" },
  { id: "beverages", label: "Beverages", emoji: "☕" },
  { id: "chinese",   label: "Chinese",   emoji: "🍜" },
];

export default function HomePage() {
  const [activeCuisine, setActiveCuisine] = useState("all");
  const { label } = useLocationStore();

  const { data: restaurants } = useRestaurants(
    activeCuisine === "all" ? undefined : activeCuisine
  );
  const activeCategoryLabel = CUISINES.find(c => c.id === activeCuisine)?.label;
  const { data: menuItems, isLoading: isMenuLoading } = useMenuItems(
    activeCuisine === "all" ? undefined : activeCategoryLabel
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--color-bg)" }}>

      

      {/* ── HERO / SEARCH ────────────────────────────────── */}
      <section
        className="relative px-6 md:px-10 pt-5 pb-6"
        style={{ background: "var(--color-primary)" }}
      >
        <h1
          className="text-2xl font-extrabold mb-1"
          style={{ color: "var(--color-on-primary)", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}
        >
          Hungry? 🍕<br />We deliver <span style={{ opacity: 0.8 }}>fresh.</span>
        </h1>
        <p className="text-xs mb-5" style={{ color: "var(--color-primary-fixed)" }}>
          BB Bites · Collect at Main Gate · Receive by Evening
        </p>

        {/* Small offer pill in banner */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-5 rounded-full" style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Gift size={12} style={{ color: "#ffffff" }} />
          <span className="text-[11px] font-bold tracking-wide" style={{ color: "#ffffff" }}>
            ORDER ABOVE ₹700 FOR A SURPRISE
          </span>
        </div>

        {/* Stats row */}
<div   className="absolute right-6 md:right-10 top-6 flex flex-col items-end gap-2">
  {[
    { icon: Star, value: "4.8★", label: "Avg rating" },
    { icon: Flame, value: "Fresh Daily", label: "Made fresh" },
    { icon: Package, value: "Main Gate", label: "Easy pickup" },
  ].map(({ icon: Icon, value, label }) => (
    <div key={label} className="text-right">
      <div
        className="flex items-center justify-end gap-1 font-bold text-sm"
        style={{ color: "var(--color-on-primary)" }}
      >
        <Icon size={13} style={{ opacity: 0.8 }} />
        {value}
      </div>
      <div
        className="text-[11px]"
        style={{ color: "var(--color-primary-fixed)" }}
      >
        {label}
      </div>
    </div>
  ))}
</div>

        {/* Search bar */}
        <Link
          href="/search"
          className="flex items-center gap-3 px-4 py-3 mt-4"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Search size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
          <span className="text-sm flex-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Search dishes or restaurants…
          </span>
        </Link>
</section>
 
          
        

      <div className="px-4 py-5 space-y-8">

        {/* ── PROMO CARD ─────────────────────────────── */}
        <section>
          <div 
            className="relative overflow-hidden p-5 flex items-center justify-between transition-transform active:scale-[0.98]"
            style={{ 
              background: "linear-gradient(135deg, var(--color-primary) 0%, #FF8A50 100%)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 8px 20px -6px rgba(255, 107, 53, 0.5)",
              color: "#ffffff"
            }}
          >
            <div className="relative z-10 max-w-[80%]">
              <h3 className="font-extrabold text-lg mb-1 shadow-sm" style={{ fontFamily: "var(--font-heading)", textShadow: "0 1px 2px rgba(0,0,0,0.1)", color: "#ffffff" }}>
                Special Offer! ✨
              </h3>
              <p className="text-[13px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
                Order above <span className="font-extrabold" style={{ color: "#ffffff" }}>₹700</span> and receive a <span className="font-extrabold" style={{ color: "#ffffff" }}>complimentary surprise</span> with your meal!
              </p>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none" style={{ color: "#ffffff" }}>
              <Gift size={100} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* ── CUISINE FILTERS ─────────────────────────────── */}
        <section>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {CUISINES.map((c) => {
              const active = activeCuisine === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCuisine(c.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[64px]"
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl transition-all"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      background: active ? "var(--color-primary)" : "var(--color-surface-container-lowest)",
                      boxShadow: active ? "var(--shadow-primary)" : "var(--shadow-sm)",
                    }}
                  >
                    {c.emoji}
                  </div>
                  <span
                    className="text-xs font-semibold whitespace-nowrap"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── DISHES LIST ────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="section-heading flex items-center gap-1.5"
              style={{ color: "var(--color-on-surface)" }}
            >
              <Flame size={18} style={{ color: "var(--color-primary)" }} />
              {activeCuisine === "all" ? "Popular Dishes" : `${activeCategoryLabel} Menu`}
            </h2>
          </div>

          <div
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-sm)",
              padding: "0 1rem",
            }}
          >
            {isMenuLoading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse"
                    style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)" }}
                  />
                ))}
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div>
                {menuItems.map((item) => {
                  const rName = restaurants?.find((r) => r.id === item.restaurantId)?.name || " BB Bites";
                  return (
                    <DishCard
                      key={item.id}
                      dish={item}
                      restaurantId={item.restaurantId}
                      restaurantName={rName}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">🍽️</p>
                <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>No dishes available in this category</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        className="px-4 py-6 mt-4"
        style={{
          background: "var(--color-surface-container)",
        }}
      >
        <div className="flex items-center justify-between gap-3 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          <span className="font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface)" }}>
            BiteBox
          </span>
          <span>© 2026 · Made on campus ❤️</span>
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:+919034537165" className="hover:underline" style={{ color: "var(--color-primary)" }}>Call: +91 90345 37165</a>
            <Link href="/partner/apply" className="hover:underline" style={{ color: "var(--color-primary)" }}>Partner</Link>
            <Link href="/admin" className="hover:underline" style={{ color: "var(--color-primary)" }}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}