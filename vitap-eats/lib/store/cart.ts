import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;            // menuItem id
  cartKey: string;       // id + variantLabel, used for uniqueness
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string; // e.g. "Regular", "Medium"
  customization?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity" | "cartKey">) => void;
  remove: (cartKey: string) => void;
  update: (cartKey: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add(item) {
        const cartKey = `${item.id}__${item.variantLabel ?? "default"}`;
        set((s) => {
          const existing = s.items.find((i) => i.cartKey === cartKey);
          if (existing) {
            return { items: s.items.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...s.items, { ...item, cartKey, quantity: 1 }] };
        });
      },

      remove: (cartKey) => set((s) => ({ items: s.items.filter((i) => i.cartKey !== cartKey) })),
      update: (cartKey, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => i.cartKey !== cartKey)
            : s.items.map((i) => i.cartKey === cartKey ? { ...i, quantity: qty } : i),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "vitap-cart" }
  )
);