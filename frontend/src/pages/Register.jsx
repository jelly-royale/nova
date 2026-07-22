import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Bienvenue chez NOVA MILAN");
      nav("/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur d'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-[80vh]" data-testid="register-page">
      <div className="flex items-center justify-center px-6 py-16 order-2 md:order-1">
        <form onSubmit={submit} className="w-full max-w-sm">
          <p className="nova-eyebrow mb-4">NOVA MILAN</p>
          <h1 className="nova-h1 text-4xl mb-4">{t("auth.register_title")}</h1>
          <p className="text-sm text-black/60 mb-10">{t("auth.register_sub")}</p>
          <div className="space-y-6">
            {[["first_name", t("account.first_name")], ["last_name", t("account.last_name")], ["email", t("account.email")], ["password", t("account.password")]].map(([k, label]) => (
              <div key={k}>
                <label className="text-xs uppercase tracking-widest text-black/60">{label}</label>
                <input required type={k === "password" ? "password" : k === "email" ? "email" : "text"} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid={`reg-${k}`} />
              </div>
            ))}
          </div>
          <button className="nova-btn w-full mt-8" disabled={loading} data-testid="register-submit">{loading ? "…" : t("nav.register")}</button>
          <p className="text-sm text-black/60 mt-8">{t("auth.have_account")} <Link to="/login" className="underline">{t("nav.login")}</Link></p>
        </form>
      </div>
      <div className="hidden md:block relative order-1 md:order-2">
        <img src="https://images.unsplash.com/photo-1779406273777-38a6f61fb5fa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWwlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc4NDc1MjM3OXww&ixlib=rb-4.1.0&q=85" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
