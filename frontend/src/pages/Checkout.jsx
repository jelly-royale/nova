import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth, API } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email || "",
    line1: "", line2: "", city: "", postal_code: "", country: "FR", phone: "",
  });
  const [promo, setPromo] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPromo = async () => {
    if (!promo) return;
    try {
      const r = await axios.post(`${API}/promo/validate`, null, { params: { code: promo } });
      setPromoData(r.data);
      toast.success(`Code appliqué (-${r.data.percent_off}%)`);
    } catch { toast.error("Code invalide"); setPromoData(null); }
  };

  const discount = promoData ? subtotal * (promoData.percent_off / 100) : 0;
  const shipping = subtotal >= 500 ? 0 : 15;
  const total = Math.max(subtotal - discount + shipping, 0);

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Panier vide"); return; }
    setLoading(true);
    try {
      const r = await axios.post(`${API}/checkout`, {
        origin_url: window.location.origin,
        items: items.map(i => ({ product_id: i.product_id, color_key: i.color_key, quantity: i.quantity })),
        address: form,
        promo_code: promoData ? promoData.code : null,
        email: form.email,
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      localStorage.setItem("nova_last_session", r.data.session_id);
      window.location.href = r.data.checkout_url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur checkout");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="checkout-empty">
        <p className="font-serif-display text-3xl mb-6">Votre panier est vide.</p>
        <button onClick={() => nav("/collections")} className="nova-btn-outline">Découvrir les collections</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12" data-testid="checkout-page">
      <p className="nova-eyebrow mb-4">FINALISER LA COMMANDE</p>
      <h1 className="nova-h1 text-4xl md:text-5xl mb-12">Checkout</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-serif-display text-2xl">Adresse de livraison</h2>
          {[
            ["full_name", "Nom complet"],
            ["email", "Email"],
            ["line1", "Adresse"],
            ["line2", "Complément (facultatif)"],
            ["city", "Ville"],
            ["postal_code", "Code postal"],
            ["country", "Pays (ISO, ex FR, IT)"],
            ["phone", "Téléphone"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs uppercase tracking-widest text-black/60">{label}</label>
              <input
                type={k === "email" ? "email" : "text"}
                required={!["line2","phone"].includes(k)}
                value={form[k]}
                onChange={e => setForm({ ...form, [k]: e.target.value })}
                className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black"
                data-testid={`checkout-${k}`}
              />
            </div>
          ))}
        </div>

        <aside className="lg:col-span-2 bg-nova-soft p-8 h-fit sticky top-28">
          <h3 className="font-serif-display text-2xl mb-6">Récapitulatif</h3>
          <div className="space-y-4 mb-6">
            {items.map(i => (
              <div key={`${i.product_id}-${i.color_key}`} className="flex gap-3 text-sm">
                <div className="w-14 h-16 flex-shrink-0 bg-white overflow-hidden">
                  {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-serif-display">{i.name} × {i.quantity}</p>
                  <p className="text-xs text-black/60 uppercase tracking-widest">{i.color_name}</p>
                </div>
                <p>{(i.price * i.quantity).toFixed(2)} €</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Code promo" className="flex-1 border border-black/30 bg-transparent px-3 py-2 text-sm" data-testid="promo-input" />
            <button type="button" onClick={applyPromo} className="text-xs uppercase tracking-widest hover:text-nova-gold px-3" data-testid="promo-apply">Appliquer</button>
          </div>

          <div className="border-t border-black/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
            {discount > 0 && <div className="flex justify-between text-nova-gold"><span>Remise</span><span>−{discount.toFixed(2)} €</span></div>}
            <div className="flex justify-between"><span>Livraison</span><span>{shipping === 0 ? "Offerte" : `${shipping.toFixed(2)} €`}</span></div>
            <div className="flex justify-between font-serif-display text-xl pt-3 border-t border-black/10 mt-3">
              <span>Total</span><span data-testid="checkout-total">{total.toFixed(2)} €</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="nova-btn w-full mt-8" data-testid="submit-checkout">
            {loading ? "Redirection…" : "Payer avec Stripe"}
          </button>
          <p className="text-[10px] text-black/50 tracking-widest uppercase text-center mt-4">Paiement sécurisé — SSL</p>
        </aside>
      </form>
    </div>
  );
}
