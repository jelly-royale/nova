import React from "react";
import { Link } from "react-router-dom";
export default function PaymentCancel() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center" data-testid="payment-cancel-page">
      <p className="nova-eyebrow mb-4">PAIEMENT ANNULÉ</p>
      <h1 className="nova-h1 text-4xl mb-6">Votre commande n'a pas été validée.</h1>
      <p className="text-black/60 mb-10">Aucun montant ne vous a été prélevé. Vous pouvez réessayer à tout moment.</p>
      <div className="flex gap-4 justify-center">
        <Link to="/checkout" className="nova-btn">Reprendre le checkout</Link>
        <Link to="/collections" className="nova-btn-outline">Poursuivre la découverte</Link>
      </div>
    </div>
  );
}
