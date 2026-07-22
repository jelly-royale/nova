import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

export default function Collections() {
  const { category } = useParams();
  const { t } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products`, { params: category ? { category } : {} }).then(r => setProducts(r.data));
  }, [category]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-24" data-testid="collections-page">
      <div className="mb-16 border-b border-black/10 pb-12">
        <p className="nova-eyebrow mb-4">COLLECTIONS — 2026</p>
        <h1 className="nova-h1 text-5xl md:text-7xl">{category ? category.toUpperCase() : t("nav.collections")}</h1>
      </div>

      {products.map(p => (
        <div key={p.id} className="mb-24">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-serif-display text-3xl md:text-4xl">{p.name}</h2>
            <Link to={`/product/${p.slug}`} className="nova-link" data-testid={`open-product-${p.slug}`}>{t("home.view_product")} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {p.variants.map((v, idx) => (
              <Link to={`/product/${p.slug}?color=${v.color_key}`} key={v.color_key} className="group nova-product-card" data-testid={`variant-${v.color_key}`}>
                <div className="aspect-[4/5] overflow-hidden relative" style={{ background: v.hex }}>
                  <img src={p.images[idx % p.images.length]} alt={`${p.name} ${v.color_name}`} className="w-full h-full object-cover mix-blend-multiply nova-product-img opacity-90" />
                </div>
                <div className="mt-3 flex justify-between">
                  <div>
                    <p className="font-serif-display text-lg">{p.name}</p>
                    <p className="text-xs uppercase tracking-widest text-black/60">{v.color_name}</p>
                  </div>
                  <p className="text-sm">{p.price} €</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
