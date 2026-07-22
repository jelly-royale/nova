import React, { useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";

export default function TrackOrder() {
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const search = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const r = await axios.get(`${API}/orders/track/${num}`, { params: { email } });
      setOrder(r.data);
    } catch { setErr("Commande introuvable. Vérifiez le numéro et l'email."); setOrder(null); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16" data-testid="track-page">
      <p className="nova-eyebrow mb-4">SUIVI DE COMMANDE</p>
      <h1 className="nova-h1 text-4xl md:text-5xl mb-10">Suivre mon colis</h1>
      <form onSubmit={search} className="space-y-6">
        <div>
          <label className="text-xs uppercase tracking-widest text-black/60">N° de commande</label>
          <input required value={num} onChange={e => setNum(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="track-number" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-black/60">Email</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="track-email" />
        </div>
        <button className="nova-btn" data-testid="track-submit">Rechercher</button>
      </form>
      {err && <p className="mt-8 text-sm text-red-600">{err}</p>}
      {order && (
        <div className="mt-12 border-t border-black/10 pt-8" data-testid="track-result">
          <p className="font-serif-display text-2xl">N° {order.order_number}</p>
          <p className="text-sm uppercase tracking-widest mt-2">Statut : {order.status}</p>
          {order.tracking_number && <p className="text-sm mt-2">Suivi : {order.tracking_number}</p>}
          <div className="mt-6 space-y-2">
            {order.items.map((i, k) => <p key={k} className="text-sm text-black/70">{i.product_name} — {i.color_name} × {i.quantity}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}
