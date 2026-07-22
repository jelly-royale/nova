import React, { useEffect, useState } from "react";
import { useAuth, API } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Account() {
  const { user, token, logout, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!loading && !user) nav("/login");
  }, [loading, user, nav]);

  useEffect(() => {
    if (!token) return;
    const h = { headers: { Authorization: `Bearer ${token}` } };
    axios.get(`${API}/orders`, h).then(r => setOrders(r.data)).catch(() => {});
    axios.get(`${API}/wishlist`, h).then(r => setWishlist(r.data)).catch(() => {});
  }, [token]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16" data-testid="account-page">
      <p className="nova-eyebrow mb-4">MON ESPACE</p>
      <h1 className="nova-h1 text-4xl md:text-5xl mb-2">Bonjour, {user.first_name}.</h1>
      <p className="text-sm text-black/60 mb-12">{user.email}</p>

      <Tabs defaultValue="orders">
        <TabsList className="bg-transparent border-b border-black/10 rounded-none w-full justify-start gap-8 mb-8 p-0">
          <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black uppercase text-xs tracking-widest" data-testid="tab-orders">Commandes</TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black uppercase text-xs tracking-widest">Favoris</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black uppercase text-xs tracking-widest">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length === 0 ? <p className="text-black/50">Aucune commande pour le moment.</p> :
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="border border-black/10 p-6" data-testid={`order-${o.order_number}`}>
                  <div className="flex justify-between mb-2">
                    <p className="font-serif-display text-lg">N° {o.order_number}</p>
                    <p className="text-sm uppercase tracking-widest">{o.status}</p>
                  </div>
                  <p className="text-xs text-black/50 mb-4">{new Date(o.created_at).toLocaleDateString()}</p>
                  <div className="text-sm space-y-1 mb-4">
                    {o.items.map((it, i) => <p key={i} className="text-black/70">{it.product_name} — {it.color_name} × {it.quantity}</p>)}
                  </div>
                  <div className="flex justify-between text-sm border-t border-black/10 pt-3">
                    <span>Total</span><span>{o.total.toFixed(2)} €</span>
                  </div>
                  {o.tracking_number && <p className="text-xs text-nova-gold uppercase tracking-widest mt-3">Suivi : {o.tracking_number}</p>}
                </div>
              ))}
            </div>}
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlist.length === 0 ? <p className="text-black/50">Aucun favori.</p> :
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map(p => (
                <div key={p.id} className="border border-black/10 p-4">
                  <img src={p.images[0]} alt={p.name} className="w-full aspect-[4/5] object-cover" />
                  <p className="font-serif-display mt-3">{p.name}</p>
                  <p className="text-sm">{p.price} €</p>
                </div>
              ))}
            </div>}
        </TabsContent>

        <TabsContent value="profile">
          <div className="max-w-md space-y-4">
            <div><label className="text-xs uppercase tracking-widest text-black/60">Prénom</label><p>{user.first_name}</p></div>
            <div><label className="text-xs uppercase tracking-widest text-black/60">Nom</label><p>{user.last_name}</p></div>
            <div><label className="text-xs uppercase tracking-widest text-black/60">Email</label><p>{user.email}</p></div>
            <button onClick={() => { logout(); nav("/"); }} className="nova-btn-outline mt-8" data-testid="logout-btn">Se déconnecter</button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
