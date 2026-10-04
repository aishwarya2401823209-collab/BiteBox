"use client";

import { useState, useEffect } from "react";
import { Search, Bike, UserPlus, ArrowLeft, MapPin, ShieldCheck, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
// Apne project ke firebase instance ka correct relative import path yahan check kar lena
import { db } from "@/lib/firebase"; 
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New partner form states
  const [newName, setNewName]     = useState("");
  const [newPhone, setNewPhone]   = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Firebase se partners fetch karna on page load
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "delivery_partners"));
      const partnersList: any[] = [];
      querySnapshot.forEach((doc) => {
        partnersList.push({ id: doc.id, ...doc.data() });
      });
      
      // Agar Firebase mein koi data na ho toh default mock partners dikha sakte hain ya empty rakh sakte hain
      if (partnersList.length === 0) {
        setPartners([
          { id: "p1", full_name: "Rahul Sharma", phone: "+91 98765 43210", vehicle: "Honda Activa", is_online: true, rating: 4.8, total_deliveries: 34, location: "Near Gate No. 2" },
          { id: "p2", full_name: "Amit Verma", phone: "+91 87654 32109", vehicle: "Hero Splendor", is_online: true, rating: 4.9, total_deliveries: 52, location: "Hostel Block C" },
        ]);
      } else {
        setPartners(partnersList);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filtered = partners.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Firebase Firestore mein naya partner permanently save karna
  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      toast.error("Please fill in name and phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const newPartnerData = {
        full_name: newName,
        phone: newPhone,
        vehicle: newVehicle || "Scooter",
        is_online: true,
        rating: 5.0,
        total_deliveries: 0,
        location: "Campus Hub",
        created_at: serverTimestamp()
      };

      // Firestore collection "delivery_partners" mein data add kar rahe hain
      const docRef = await addDoc(collection(db, "delivery_partners"), newPartnerData);

      // Local state mein bhi turant update kar do bina page refresh kiye
      setPartners([{ id: docRef.id, ...newPartnerData }, ...partners]);
      
      setNewName("");
      setNewPhone("");
      setNewVehicle("");
      setShowAddModal(false);
      toast.success("Delivery partner permanently registered!");
    } catch (error) {
      console.error("Error adding partner: ", error);
      toast.error("Failed to save partner to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#F7EDDF" }}>
      <div className="max-w-6xl mx-auto">
        {/* Back Link to Dashboard */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {/* Top Action Bar for Admin Controls */}
          <div className="flex justify-between items-center bg-white/75 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-amber-900/10 flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-gray-950 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                Delivery Fleet & Live Tracking 🛵
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Manage permanent campus delivery runners via Firebase database.</p>
            </div>
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-700 transition-all active:scale-95"
            >
              <UserPlus size={16} /> {showAddModal ? "Close Form" : "Add Partner"}
            </button>
          </div>

          {/* Add Partner Form Dropdown */}
          {showAddModal && (
            <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-amber-900/15 animate-fadeIn">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Register New Campus Runner (Database Connected)</h3>
              <form onSubmit={handleAddPartner} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Vehicle (e.g. Activa / Bicycle)"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white text-gray-900"
                />
                <div className="sm:col-span-3 flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    Save to Database
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Live Status View */}
            <div className="flex-1 bg-white/80 rounded-2xl p-6 border border-amber-900/10 shadow-sm flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <MapPin className="text-orange-600" size={18} /> Active Fleet Radar
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {partners.filter(p => p.is_online).length} Online Now
                  </span>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="animate-spin mb-2" size={28} />
                    <span className="text-xs font-medium">Loading database partners...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {partners.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-white border border-amber-900/10 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                              {p.full_name?.[0] || "P"}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{p.full_name}</p>
                              <p className="text-xs text-gray-500">{p.vehicle}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            p.is_online ? "bg-green-500 ring-4 ring-green-100" : "bg-gray-300"
                          )} />
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {p.location || "Campus Hub"}</span>
                          <span className="font-semibold text-orange-600">{p.rating ?? 5.0} ★ ({p.total_deliveries ?? 0} orders)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-orange-50/60 rounded-xl border border-orange-200/50 flex items-center justify-between text-xs text-orange-900">
                <span className="flex items-center gap-2 font-medium">
                  <ShieldCheck size={16} className="text-orange-600" /> Database synchronized with Firebase Firestore storage.
                </span>
              </div>
            </div>

            {/* Sidebar List */}
            <div className="w-full lg:w-80 flex flex-col bg-white/85 backdrop-blur-sm rounded-2xl border border-amber-900/10 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-amber-900/10 bg-white/50">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search partners..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow text-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[420px]">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Bike size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No partners found</p>
                  </div>
                ) : (
                  filtered.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-amber-900/10 bg-white/70 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                            {p.full_name?.[0] || "P"}
                          </div>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                            p.is_online ? "bg-green-500" : "bg-gray-400"
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{p.full_name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{p.phone}</p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${p.phone}`} 
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Call Partner"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}