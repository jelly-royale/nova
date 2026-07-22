import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { Heart, ChevronDown, Plus, Minus } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { toast } from "sonner";

export default function Product() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { t } = useI18n();
  const { addItem } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    axios.get(`${API}/products/${slug}`).then(r => {
      setProduct(r.data);
      const initial = params.get("color");
      const v = r.data.variants.find(v => v.color_key === initial) || r.data.variants[0];
      setSelected(v);
    });
  }, [slug, params]);

  if (!product) return <div className="p-24 text-center">…</div>;

  const addToCart = () => {
    if (!selected) { toast.error(t("product.select_color")); return; }
    addItem(product, selected, qty);
  };

  const addWishlist = async () => {
    if (!token) { toast("Connectez-vous pour utiliser les favoris"); return; }
    await axios.post(`${API}/wishlist/${product.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    toast.success("Ajouté aux favoris");
  };

  return (
    <div data-testid="product-page">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 px-6 lg:px-12 py-8 lg:py-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden relative" style={{ background: selected?.hex || "#f4f4f0" }}>
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
              data-testid="product-main-image"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square overflow-hidden ${activeImg === i ? "ring-1 ring-black" : ""}`}
                style={{ background: selected?.hex || "#f4f4f0" }}
                data-testid={`thumb-${i}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover mix-blend-multiply" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-32 self-start">
          <p className="nova-eyebrow mb-3">NOVA MILAN — SIGNATURE</p>
          <h1 className="nova-h1 text-4xl md:text-6xl mb-2" data-testid="product-name">{product.name}</h1>
          {product.edition && (
            <div className="inline-flex items-center gap-2 border border-nova-gold px-3 py-1 mb-4" data-testid="edition-badge">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-nova-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-nova-gold">{product.edition}</span>
            </div>
          )}
          <p className="text-lg mb-6" data-testid="product-price">{product.price.toFixed(2)} €</p>

          <p className="text-black/70 leading-relaxed mb-8 max-w-md">{product.description}</p>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest mb-4">
              {t("product.color")}: <span className="text-black/60">{selected?.color_name}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map(v => (
                <button
                  key={v.color_key}
                  onClick={() => setSelected(v)}
                  className={`nova-swatch ${selected?.color_key === v.color_key ? "active" : ""}`}
                  style={{ background: v.hex }}
                  title={v.color_name}
                  data-testid={`swatch-${v.color_key}`}
                />
              ))}
            </div>
            {selected && (
              <p className="text-xs mt-4" data-testid="stock-info">
                {selected.stock > 5 ? (
                  <span className="text-black/60">Disponible — expédition sous 24 à 72h</span>
                ) : selected.stock > 0 ? (
                  <span className="text-nova-gold">Il ne reste que {selected.stock} pièces dans ce coloris</span>
                ) : (
                  <span className="text-red-700">Coloris temporairement épuisé</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-black">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-3" aria-label="minus"><Minus className="w-4 h-4" /></button>
              <span className="px-4 text-sm" data-testid="qty">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-3" aria-label="plus"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={addToCart} className="nova-btn flex-1" data-testid="add-to-cart-btn">{t("product.add_to_cart")}</button>
          </div>

          <button onClick={addWishlist} className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-nova-gold" data-testid="wishlist-btn">
            <Heart className="w-4 h-4" /> {t("product.wishlist")}
          </button>

          <Accordion type="single" collapsible className="mt-12 border-t border-black/10">
            <AccordionItem value="details" className="border-b border-black/10">
              <AccordionTrigger className="uppercase text-xs tracking-widest py-6" data-testid="acc-details">{t("product.details")}</AccordionTrigger>
              <AccordionContent className="text-sm text-black/70 leading-relaxed">
                Silhouette architecturale • Fermeture cadenas signature • Poignées cousues main •
                Doublure NOVA MILAN • Dimensions : L 34 × H 27 × P 18 cm.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="material" className="border-b border-black/10">
              <AccordionTrigger className="uppercase text-xs tracking-widest py-6">{t("product.material")}</AccordionTrigger>
              <AccordionContent className="text-sm text-black/70">{product.material}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="care" className="border-b border-black/10">
              <AccordionTrigger className="uppercase text-xs tracking-widest py-6">{t("product.care")}</AccordionTrigger>
              <AccordionContent className="text-sm text-black/70">Nettoyer avec un chiffon doux légèrement humide. Éviter l'exposition prolongée au soleil. Conserver dans la housse NOVA MILAN.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="border-b border-black/10">
              <AccordionTrigger className="uppercase text-xs tracking-widest py-6">{t("product.shipping")}</AccordionTrigger>
              <AccordionContent className="text-sm text-black/70">Livraison premium sous 2 à 5 jours ouvrés en Europe. Retours gratuits sous 14 jours. Voir <Link to="/legal/livraison" className="underline">politique de livraison</Link>.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
