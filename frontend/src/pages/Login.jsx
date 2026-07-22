import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Bienvenue");
      nav(u.role === "admin" ? "/admin" : "/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur de connexion");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-[80vh]" data-testid="login-page">
      <div className="hidden md:block relative">
        <img src="https://images.unsplash.com/photo-1779406275908-1dabe4083373?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWwlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc4NDc1MjM3OXww&ixlib=rb-4.1.0&q=85" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm">
          <p className="nova-eyebrow mb-4">NOVA MILAN</p>
          <h1 className="nova-h1 text-4xl mb-4">{t("auth.login_title")}</h1>
          <p className="text-sm text-black/60 mb-10">{t("auth.login_sub")}</p>
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">{t("account.email")}</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="login-email" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">{t("account.password")}</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-b border-black/30 bg-transparent py-2 outline-none focus:border-black" data-testid="login-password" />
            </div>
          </div>
          <button className="nova-btn w-full mt-8" disabled={loading} data-testid="login-submit">{loading ? "…" : t("nav.login")}</button>
          <p className="text-sm text-black/60 mt-8">{t("auth.no_account")} <Link to="/register" className="underline">{t("nav.register")}</Link></p>
        </form>
      </div>
    </div>
  );
}
