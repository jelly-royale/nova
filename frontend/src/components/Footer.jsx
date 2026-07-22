import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/contexts/AuthContext";

export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await axios.post(`${API}/newsletter`, { email });
      toast.success("Merci — vous rejoignez le cercle NOVA MILAN.");
      setEmail("");
    } catch { toast.error("Une erreur est survenue."); }
  };

  return (
    <footer className="bg-nova-black text-nova-ivory mt-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-20 pb-10">
        <div className="grid md:grid-cols-2 gap-12 pb-16 border-b border-white/10">
          <div>
            <p className="nova-eyebrow text-nova-gold mb-4">MAISON DE LUXE — MILANO</p>
            <h2 className="font-serif-display text-4xl md:text-5xl leading-tight">{t("home.newsletter_title")}</h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-sm text-white/70 mb-6 max-w-md">{t("home.newsletter_sub")}</p>
            <form onSubmit={subscribe} className="flex border-b border-white/30 pb-2" data-testid="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("home.newsletter_placeholder")}
                required
                className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
                data-testid="newsletter-email"
              />
              <button type="submit" className="text-xs tracking-[0.22em] uppercase hover:text-nova-gold transition-colors" data-testid="newsletter-submit">
                {t("home.subscribe")} →
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          <div>
            <p className="nova-eyebrow text-nova-gold mb-4">{t("footer.house")}</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/maison" className="hover:text-nova-gold">{t("footer.about")}</Link></li>
              <li><Link to="/journal" className="hover:text-nova-gold">{t("footer.journal")}</Link></li>
              <li><Link to="/collections" className="hover:text-nova-gold">{t("nav.collections")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="nova-eyebrow text-nova-gold mb-4">{t("footer.client")}</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/contact" className="hover:text-nova-gold">{t("footer.contact")}</Link></li>
              <li><Link to="/legal/faq" className="hover:text-nova-gold">{t("footer.faq")}</Link></li>
              <li><Link to="/legal/livraison" className="hover:text-nova-gold">{t("footer.shipping")}</Link></li>
              <li><Link to="/legal/retours" className="hover:text-nova-gold">{t("footer.returns")}</Link></li>
              <li><Link to="/track" className="hover:text-nova-gold">{t("footer.track_order")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="nova-eyebrow text-nova-gold mb-4">{t("footer.legal")}</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/legal/cgv" className="hover:text-nova-gold">{t("footer.terms")}</Link></li>
              <li><Link to="/legal/confidentialite" className="hover:text-nova-gold">{t("footer.privacy")}</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-nova-gold">{t("footer.cookies")}</Link></li>
              <li><Link to="/legal/mentions" className="hover:text-nova-gold">{t("footer.mentions")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="nova-eyebrow text-nova-gold mb-4">NOVA MILAN</p>
            <p className="text-sm text-white/60 leading-relaxed">
              Milano · Paris · London<br/>
              <span className="text-white/40">[Informations entreprise à compléter]</span>
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 tracking-wider">© {new Date().getFullYear()} NOVA MILAN — {t("footer.rights")}</p>
          <p className="font-serif-display text-lg tracking-[0.4em]">NOVA MILAN</p>
        </div>
      </div>
    </footer>
  );
}
