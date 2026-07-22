import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Minus } from "lucide-react";

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, setQty, removeItem } = useCart();
  const { t } = useI18n();
  const nav = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="bg-nova-ivory w-full sm:max-w-lg p-0 flex flex-col" data-testid="cart-drawer">
        <SheetHeader className="px-6 py-6 border-b border-black/10">
          <SheetTitle className="font-serif-display text-2xl font-normal">{t("cart.title")}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <p className="text-sm text-black/60">{t("cart.empty")}</p>
            <button className="nova-btn-outline" onClick={() => setOpen(false)} data-testid="continue-shopping-btn">{t("cart.continue")}</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6" data-testid="cart-items">
              {items.map(it => (
                <div key={`${it.product_id}-${it.color_key}`} className="flex gap-4" data-testid={`cart-item-${it.color_key}`}>
                  <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="w-24 h-28 bg-nova-soft flex-shrink-0 overflow-hidden">
                    {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-serif-display text-lg">{it.name}</p>
                      <p className="text-xs text-black/60 tracking-widest uppercase mt-1">{it.color_name}</p>
                      <p className="text-sm mt-2">{(it.price * it.quantity).toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-black/20">
                        <button className="px-2 py-1" onClick={() => setQty(it.product_id, it.color_key, it.quantity - 1)} aria-label="minus"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 text-sm">{it.quantity}</span>
                        <button className="px-2 py-1" onClick={() => setQty(it.product_id, it.color_key, it.quantity + 1)} aria-label="plus"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(it.product_id, it.color_key)} className="text-xs uppercase tracking-widest hover:text-nova-gold" data-testid={`cart-remove-${it.color_key}`}><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/10 px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t("cart.subtotal")}</span>
                <span data-testid="cart-subtotal">{subtotal.toFixed(2)} €</span>
              </div>
              <p className="text-xs text-black/50">{t("cart.free_shipping")}</p>
              <button
                onClick={() => { setOpen(false); nav("/checkout"); }}
                className="nova-btn w-full"
                data-testid="cart-checkout-btn"
              >
                {t("cart.checkout")}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
