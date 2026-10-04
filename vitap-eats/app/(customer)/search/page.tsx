"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Utensils } from 'lucide-react';
import { DishCard } from "@/components/customer/DishCard";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  isAvailable?: boolean;
  restaurantId?: string;
}

export default function SearchPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu_items'));
        const items: MenuItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({ 
            id: doc.id, 
            name: data.name || '',
            category: data.category || '',
            price: data.price || 0,
            description: data.description || '',
            image: data.image || '',
            isAvailable: data.isAvailable ?? true,
            restaurantId: data.restaurantId || ''
          });
        });
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = item.name?.toLowerCase().includes(query);
    const matchesCategory = item.category?.toLowerCase().includes(query);
    const matchesDescription = item.description?.toLowerCase().includes(query);

    return matchesName || matchesCategory || matchesDescription;
  });

  return (
    <div className="min-h-screen pb-16 px-6 pt-6 max-w-6xl mx-auto" style={{ background: "var(--color-surface, #fdfbf7)" }}>
      <h1 
        className="text-2xl font-extrabold mb-4" 
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface, #1d1b16)" }}
      >
        Search Menu Items
      </h1>

      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-4 top-3.5 h-5 w-5" style={{ color: "var(--color-on-surface-variant)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for 'Cheese Pizza', 'Cold Coffee'..."
          className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border shadow-sm focus:outline-none focus:ring-2"
          style={{ 
            borderColor: "var(--color-border, #e6e1d6)",
            background: "var(--color-surface-container-lowest, #ffffff)",
            color: "var(--color-on-surface)"
          }}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
          Results ({filteredItems.length})
        </h2>

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--color-on-surface-variant)" }}>
            Loading items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-2xl border border-dashed" style={{ borderColor: "var(--color-border)" }}>
            <Utensils className="mx-auto h-12 w-12 mb-3 opacity-40" style={{ color: "var(--color-on-surface)" }} />
            <p className="font-semibold text-base" style={{ color: "var(--color-on-surface)" }}>No matching dishes found</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
              Try searching for &quot;Pizza&quot;, &quot;Coffee&quot;, or broader terms.
            </p>
          </div>
        ) : (
          <div 
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-sm)",
              padding: "0 1rem",
            }}
          >
            {filteredItems.map((item) => (
              <DishCard
                key={item.id}
                dish={item as any}
                restaurantId={item.restaurantId || ''}
                restaurantName="BB Bites"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}