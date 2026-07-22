import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useI18n } from "@/contexts/I18nContext";
import { API } from "@/contexts/AuthContext";

export default function Home() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const jelly = products.find(p => p.slug === "jelly");

  return (
    <div className="bg-nova-ivory">
      {/* HERO */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-end overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src="https://customer-assets.emergentagent.com/job_nova-digital-maison/artifacts/g3nmvhgy_IMG_4150.jpeg"
            alt="Collection Jelly NOVA MILAN"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 pb-16 md:pb-24 text-nova-ivory w-full">
          <p className="nova-eyebrow nova-reveal">{t("home.eyebrow")}</p>
          <h1 className="nova-h1 text-4xl sm:text-5xl md:text-7xl lg:text-8xl mt-6 max-w-4xl nova-reveal nova-reveal-d1">
            {t("home.hero_title")}
          </h1>
          <p className="mt-6 md:mt-8 max-w-xl text-sm md:text-base text-white/80 nova-reveal nova-reveal-d2">{t("home.hero_sub")}</p>
          <div className="mt-8 md:mt-10 flex gap-4 nova-reveal nova-reveal-d3">
            <Link to="/collections" className="nova-btn" data-testid="hero-cta-collection">{t("home.discover")}</Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-black/10 py-4 md:py-6 bg-nova-ivory overflow-hidden">
        <div className="marquee">
          <div className="marquee-track whitespace-nowrap">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex items-center gap-8 md:gap-12 pr-8 md:pr-12">
                {["JELLY — LA SIGNATURE", "MADE IN ITALY", "LIVRAISON PREMIUM", "MAISON DE LUXE", "MILANO — PARIS — LONDON", "COLLECTION 2026"].map((w, i) => (
                  <span key={i} className="font-serif-display text-lg md:text-2xl tracking-[0.3em] flex items-center gap-8 md:gap-12">
                    {w} <span className="nova-gold">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SIGNATURE */}
      {jelly && (
        <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center" data-testid="signature-section">
          <div className="relative bg-nova-soft aspect-[4/5] overflow-hidden">
            <img src={jelly.images[2] || jelly.images[0]} alt="Jelly signature" className="w-full h-full object-cover nova-product-img" />
          </div>
          <div>
            <p className="nova-eyebrow mb-6">LA SIGNATURE — NOVA MILAN</p>
            <h2 className="nova-h2 text-4xl md:text-6xl mb-8">{t("home.story_title")}</h2>
            <p className="text-black/70 leading-relaxed max-w-md mb-8">{t("home.story_body")}</p>
            <div className="flex flex-wrap gap-3 mb-10">
              {jelly.variants.slice(0, 9).map(v => (
                <div key={v.color_key} className="nova-swatch" style={{ background: v.hex }} title={v.color_name} />
              ))}
            </div>
            <Link to={`/product/${jelly.slug}`} className="nova-btn-outline" data-testid="signature-cta">{t("home.view_product")}</Link>
          </div>
        </section>
      )}

      {/* COLLECTION GRID */}
      {jelly && (
        <section className="bg-nova-soft py-24 lg:py-32">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <p className="nova-eyebrow mb-4">LA COLLECTION</p>
                <h2 className="nova-h2 text-4xl md:text-6xl">{t("home.collection_title")}</h2>
              </div>
              <p className="text-black/60 max-w-sm md:text-right">{t("home.collection_sub")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {jelly.variants.slice(0, 9).map((v, idx) => (
                <Link
                  to={`/product/${jelly.slug}?color=${v.color_key}`}
                  key={v.color_key}
                  className="group nova-product-card"
                  data-testid={`collection-tile-${v.color_key}`}
                >
                  <div className="aspect-[4/5] overflow-hidden relative" style={{ background: v.hex }}>
                    <img
                      src={jelly.images[idx % jelly.images.length]}
                      alt={`Jelly ${v.color_name}`}
                      className="w-full h-full object-cover mix-blend-multiply nova-product-img opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  <div className="mt-4 flex justify-between items-baseline">
                    <div>
                      <p className="font-serif-display text-xl">Jelly</p>
                      <p className="text-xs text-black/60 tracking-widest uppercase">{v.color_name}</p>
                    </div>
                    <p className="text-sm">890 €</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VALUES */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 grid md:grid-cols-3 gap-12">
        {[
          { t: "Précision italienne", d: "Un savoir-faire de maroquinerie hérité des ateliers milanais." },
          { t: "Design contemporain", d: "Des silhouettes sculpturales, pensées pour durer au-delà des saisons." },
          { t: "Excellence servie", d: "Un service confidentiel, un packaging signature, une expérience sur-mesure." },
        ].map((v, i) => (
          <div key={i} className="border-t border-black/10 pt-8">
            <p className="font-serif-display text-2xl mb-4">{v.t}</p>
            <p className="text-sm text-black/60 leading-relaxed">{v.d}</p>
          </div>
        ))}
      </section>

      {/* EDITORIAL */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src="https://images.pexels.com/photos/14916457/pexels-photo-14916457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Éditorial" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex items-center">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-nova-ivory">
            <p className="nova-eyebrow text-nova-gold">JOURNAL — CHAPITRE 01</p>
            <h3 className="nova-h2 text-3xl md:text-5xl mt-4 max-w-xl">L'art de porter la transparence.</h3>
            <Link to="/journal" className="mt-8 inline-block nova-link text-nova-ivory">Lire le journal →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
