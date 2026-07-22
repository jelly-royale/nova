import React, { useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (pw !== pw2) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/password-reset/confirm`, { token, new_password: pw });
      setDone(true);
      toast.success("Mot de passe réinitialisé");
      setTimeout(() => nav("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Lien invalide ou expiré");
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <p className="text-black/70 mb-6">Lien invalide.</p>
      <Link to="/forgot-password" className="nova-btn-outline">Demander un nouveau lien</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="reset-password-page">
      <p className="nova-eyebrow mb-4">NOUVEAU MOT DE PASSE</p>
      <h1 className="nova-h1 text-4xl mb-8">Définir mon mot de passe</h1>
      {done ? (
        <p className="text-black/70">Mot de passe mis à jour. Redirection…</p>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Nouveau mot de passe</label>
            <input required type="password" minLength={6} value={pw} onChange={e => setPw(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="new-password" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Confirmation</label>
            <input required type="password" minLength={6} value={pw2} onChange={e => setPw2(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="new-password-confirm" />
          </div>
          <button className="nova-btn w-full" disabled={loading} data-testid="reset-submit">{loading ? "…" : "Réinitialiser"}</button>
        </form>
      )}
    </div>
  );
}
