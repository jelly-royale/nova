import React, { useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message envoyé — notre service client vous répondra sous 48h.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch { toast.error("Une erreur est survenue."); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-[80vh]" data-testid="contact-page">
      <div className="px-6 lg:px-12 py-16 lg:py-24 max-w-lg mx-auto w-full">
        <p className="nova-eyebrow mb-4">SERVICE CLIENT</p>
        <h1 className="nova-h1 text-4xl md:text-5xl mb-6">Nous vous accompagnons.</h1>
        <p className="text-black/60 mb-10">Notre équipe est à votre disposition pour toute question, du choix d'une pièce au suivi de votre commande.</p>
        <form onSubmit={submit} className="space-y-6">
          {[["name", "Nom"], ["email", "Email"], ["subject", "Sujet"]].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs uppercase tracking-widest text-black/60">{l}</label>
              <input required type={k === "email" ? "email" : "text"} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid={`contact-${k}`} />
            </div>
          ))}
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Message</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="contact-message" />
          </div>
          <button disabled={loading} className="nova-btn" data-testid="contact-submit">{loading ? "…" : "Envoyer"}</button>
        </form>
        <div className="mt-16 text-sm text-black/60 space-y-1">
          <p>service.client@novamilan.com</p>
          <p>Du lundi au vendredi — 9h à 19h CET</p>
          <p className="text-black/40 mt-2">[Adresse & téléphone à compléter]</p>
        </div>
      </div>
      <div className="hidden md:block relative">
        <img src="https://images.unsplash.com/photo-1556228578-6b39aba552d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwzfHx0cmFuc3BhcmVudCUyMGplbGx5JTIwdG90ZSUyMGJhZyUyMHBhc3RlbHxlbnwwfHx8fDE3ODQ3NTIzNzl8MA&ixlib=rb-4.1.0&q=85" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
