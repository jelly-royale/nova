import React, { useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/password-reset/request`, { email });
      setSent(true);
      toast.success("Si un compte existe, un email a été envoyé.");
    } catch { toast.error("Une erreur est survenue"); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="forgot-password-page">
      <p className="nova-eyebrow mb-4">MOT DE PASSE OUBLIÉ</p>
      <h1 className="nova-h1 text-4xl mb-8">Réinitialisation</h1>
      {sent ? (
        <div>
          <p className="text-black/70 mb-6">Si un compte est associé à cette adresse, vous recevrez un email avec un lien de réinitialisation (valable 1 heure).</p>
          <Link to="/login" className="nova-btn-outline">Retour à la connexion</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="forgot-email" />
          </div>
          <button className="nova-btn w-full" disabled={loading} data-testid="forgot-submit">{loading ? "…" : "Recevoir le lien"}</button>
          <Link to="/login" className="block text-xs uppercase tracking-widest text-black/60 hover:text-black text-center">Retour</Link>
        </form>
      )}
    </div>
  );
}
