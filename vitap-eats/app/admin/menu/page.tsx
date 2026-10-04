"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, Check, ArrowLeft, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import { rupees, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// Type definition for Menu Item Variant
export interface MenuItemVariant {
  label: string;
  price: number;
}

// Type definition for Menu Item
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  variants?: MenuItemVariant[];
}

// ── Form defaults ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  isVeg: false,
  isAvailable: true,
  variants: [] as MenuItemVariant[],
};

// ── Small modal component ──────────────────────────────────────────────────
function ItemModal({
  title,
  form,
  categories,
  onChange,
  onVariantChange,
  onAddVariant,
  onRemoveVariant,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  form: typeof EMPTY_FORM;
  categories: string[];
  onChange: (k: keyof Omit<typeof EMPTY_FORM, "variants">, v: string | boolean) => void;
  onVariantChange: (idx: number, field: keyof MenuItemVariant, value: string | number) => void;
  onAddVariant: () => void;
  onRemoveVariant: (idx: number) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [isCustomCategory, setIsCustomCategory] = useState(
    form.category ? !categories.includes(form.category) : false
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Item Name *</label>
              <input value={form.name} onChange={e => onChange("name", e.target.value)}
                placeholder="e.g. Chicken Biryani"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
              <textarea value={form.description} onChange={e => onChange("description", e.target.value)}
                placeholder="Short description of the item"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Base Price (₹) *</label>
              <input type="number" min="0" value={form.price} onChange={e => onChange("price", e.target.value)}
                placeholder="e.g. 130"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <p className="text-xs text-gray-500 mt-1">Used when no variants are set.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Category *</label>
              {!isCustomCategory ? (
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                      onChange("category", "");
                    } else {
                      onChange("category", e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Add Custom Category</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.category}
                    onChange={(e) => onChange("category", e.target.value)}
                    placeholder="e.g. Biryani"
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsCustomCategory(false); onChange("category", ""); }}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Image URL (optional)</label>
              <input value={form.imageUrl} onChange={e => onChange("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange("isVeg", !form.isVeg)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                  form.isVeg ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-300 text-red-700")}
              >
                <span className={cn("w-3 h-3 rounded-full", form.isVeg ? "bg-green-500" : "bg-red-500")} />
                {form.isVeg ? "Veg" : "Non-Veg"}
              </button>
              <button
                type="button"
                onClick={() => onChange("isAvailable", !form.isAvailable)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors",
                  form.isAvailable ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-gray-100 border-gray-300 text-gray-500")}
              >
                {form.isAvailable ? "Available" : "Hidden"}
              </button>
            </div>
          </div>

          {/* ── Variants Section ── */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-800">Variants (Optional)</p>
                <p className="text-xs text-gray-500">Add sizes like Regular/Medium or Half/Full with separate prices.</p>
              </div>
              <button
                type="button"
                onClick={onAddVariant}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
              >
                <Plus size={12} /> Add Variant
              </button>
            </div>

            {form.variants.length === 0 && (
              <p className="text-xs text-gray-500 italic">No variants — item uses the base price above.</p>
            )}

            {form.variants.map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  value={v.label}
                  onChange={e => onVariantChange(idx, "label", e.target.value)}
                  placeholder="Label (e.g. Regular)"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-gray-500 shrink-0 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  value={v.price || ""}
                  onChange={e => onVariantChange(idx, "price", Number(e.target.value))}
                  placeholder="Price"
                  className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => onRemoveVariant(idx)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors font-medium">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !form.name || !form.price || !form.category}
            className="px-4 py-2 text-sm font-bold rounded-xl text-white flex items-center gap-2 disabled:opacity-60 transition-colors bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const [menu, setMenu]               = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<MenuItem | null>(null);
  const [form, setForm]               = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  // Fetch menu items from Firestore collection "menu_items"
  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "menu_items"));
      const itemsList: MenuItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        itemsList.push({ 
          id: docSnap.id, 
          name: data.name ?? "Unnamed",
          description: data.description ?? "",
          price: Number(data.price ?? 0),
          category: data.category ?? "General",
          imageUrl: data.imageUrl ?? "",
          isVeg: Boolean(data.isVeg),
          isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
          variants: data.variants ?? []
        });
      });
      setMenu(itemsList);
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load menu from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditTarget(item);
    setForm({
      name:        item.name,
      description: item.description ?? "",
      price:       String(item.price),
      category:    item.category,
      imageUrl:    item.imageUrl ?? "",
      isVeg:       item.isVeg,
      isAvailable: item.isAvailable,
      variants:    item.variants ?? [],
    });
    setShowModal(true);
  };

  const handleChange = (k: keyof Omit<typeof EMPTY_FORM, "variants">, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleVariantChange = (idx: number, field: keyof MenuItemVariant, value: string | number) =>
    setForm(f => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...f, variants };
    });

  const handleAddVariant = () =>
    setForm(f => ({ ...f, variants: [...f.variants, { label: "", price: 0 }] }));

  const handleRemoveVariant = (idx: number) =>
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return;
    setSaving(true);
    
    try {
      const validVariants = form.variants.filter(v => v.label && v.price > 0);
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        category:    form.category.trim(),
        imageUrl:    form.imageUrl.trim(),
        isVeg:       Boolean(form.isVeg),
        isAvailable: Boolean(form.isAvailable),
        variants:    validVariants.length > 0 ? validVariants : [],
        updated_at:  serverTimestamp(),
      };

      if (editTarget) {
        const docRef = doc(db, "menu_items", editTarget.id);
        await updateDoc(docRef, payload);
        setMenu(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...payload } : m));
        toast.success("Menu item updated in database!");
      } else {
        const newPayload = {
          ...payload,
          created_at: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "menu_items"), newPayload);
        setMenu(prev => [...prev, { id: docRef.id, ...payload }]);
        toast.success("New menu item added & synced with customer side!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Failed to save to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await deleteDoc(doc(db, "menu_items", item.id));
      setMenu(prev => prev.filter(m => m.id !== item.id));
      toast.success(`"${item.name}" deleted from database`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvail = async (item: MenuItem) => {
    const newVal = !item.isAvailable;
    // Optimistically update UI first
    setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newVal } : m));
    try {
      const docRef = doc(db, "menu_items", item.id);
      await updateDoc(docRef, { isAvailable: newVal });
      toast.success(`${item.name} is now ${newVal ? "Available" : "Hidden on Customer Side"}`);
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability in database.");
      // Revert back on error
      setMenu(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !newVal } : m));
    }
  };

  const filtered = menu.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach(m => cats.add(m.category));
    return Array.from(cats).sort();
  }, [menu]);

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

        {/* Modal */}
        {showModal && (
          <ItemModal
            title={editTarget ? "Edit Menu Item" : "Add New Menu Item"}
            form={form}
            categories={categories}
            onChange={handleChange}
            onVariantChange={handleVariantChange}
            onAddVariant={handleAddVariant}
            onRemoveVariant={handleRemoveVariant}
            onSave={handleSave}
            onClose={() => setShowModal(false)}
            saving={saving}
          />
        )}

        {/* Top Header Card Container */}
        <div className="flex justify-between items-center bg-white/75 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-amber-900/10 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-gray-950 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              Menu Management 🍔
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">Manage items in Firestore database for instant customer-side updates.</p>
          </div>
          <button 
            onClick={openAdd} 
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-700 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-amber-900/10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 shadow-sm"
          />
        </div>

        {/* Menu List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin mb-2 text-orange-600" />
            <span className="text-xs font-semibold">Loading menu items from database...</span>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 bg-white/80 rounded-2xl border border-amber-900/10 border-dashed shadow-sm">
            <UtensilsCrossed size={36} className="mx-auto text-gray-400 mb-2 opacity-50" />
            <p className="font-semibold text-gray-700">No menu items found in database.</p>
            <button onClick={openAdd} className="mt-3 px-4 py-2 text-white rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 shadow-sm transition-all">
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-900/10 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 mb-4 border-b border-amber-900/10 pb-2 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(items as MenuItem[]).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-white rounded-xl border p-4 flex gap-4 transition-all shadow-sm",
                        deletingId === item.id && "opacity-40",
                        !item.isAvailable ? "border-gray-200 opacity-60" : "border-amber-900/10 hover:border-orange-300"
                      )}
                    >
                      <div className="relative w-16 h-16 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden bg-orange-50 text-orange-600 border border-amber-900/10">
                        {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" /> : "No Img"}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-sm text-gray-900 truncate flex items-center gap-1.5">
                              <span className={cn("w-2 h-2 rounded-full shrink-0", item.isVeg ? "bg-green-500" : "bg-red-500")} />
                              {item.name}
                            </p>
                            <span className="font-extrabold text-sm text-gray-900 tabular-nums shrink-0">{rupees(item.price)}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description || "No description provided"}</p>
                          
                          {/* Variant badges */}
                          {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.variants.map((v, i) => (
                                <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700">
                                  {v.label} ₹{v.price}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleAvail(item)}
                            className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors",
                              item.isAvailable ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                          >
                            {item.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {item.isAvailable ? "Available" : "Hidden"}
                          </button>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit item">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Delete item">
                              {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}