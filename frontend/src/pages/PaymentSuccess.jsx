import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sid = params.get("session_id");
  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);
  const { clear } = useCart();

  useEffect(() => {
    if (!sid) { setStatus("error"); return; }
    let tries = 0;
    const poll = async () => {
      try {
        const r = await axios.get(`${API}/payments/status/${sid}`);
        if (r.data.payment_status === "paid") {
          setStatus("paid");
          setOrder(r.data.order);
          clear();
          return;
        }
        if (tries++ < 20) setTimeout(poll, 2000);
        else setStatus("timeout");
      } catch { setStatus("error"); }
    };
    poll();
  }, [sid, clear]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center" data-testid="payment-success-page">
      {status === "checking" && <>
        <p className="nova-eyebrow mb-4">CONFIRMATION</p>
        <h1 className="nova-h1 text-4xl mb-4">Traitement du paiement…</h1>
        <p className="text-black/60">Merci de patienter quelques instants.</p>
      </>}
      {status === "paid" && <>
        <p className="nova-eyebrow mb-4 text-nova-gold">COMMANDE CONFIRMÉE</p>
        <h1 className="nova-h1 text-5xl mb-6">Merci.</h1>
        <p className="text-black/60 mb-2">Votre commande NOVA MILAN a été confirmée.</p>
        {order && <p className="font-serif-display text-xl mb-2">N° {order.order_number}</p>}
        {order && <p className="text-sm text-black/50 mb-10">Un email de confirmation vous sera envoyé sous peu.</p>}
        <div className="flex justify-center gap-4">
          <Link to="/" className="nova-btn-outline">Retour à la maison</Link>
          <Link to="/account" className="nova-btn">Mes commandes</Link>
        </div>
      </>}
      {(status === "error" || status === "timeout") && <>
        <h1 className="nova-h1 text-4xl mb-6">Vérification en cours</h1>
        <p className="text-black/60 mb-8">Le paiement peut prendre quelques instants. Vérifiez votre espace client.</p>
        <Link to="/account" className="nova-btn">Mon compte</Link>
      </>}
    </div>
  );
}
