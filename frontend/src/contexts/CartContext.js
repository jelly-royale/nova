import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const KEY = "nova_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const addItem = useCallback((product, variant, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product_id === product.id && i.color_key === variant.color_key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, {
        product_id: product.id, slug: product.slug, name: product.name, price: product.price,
        image: product.images?.[0], color_key: variant.color_key, color_name: variant.color_name,
        color_hex: variant.hex, quantity,
      }];
    });
    toast.success(`${product.name} — ${variant.color_name}`, { description: "Ajouté au panier" });
    setOpen(true);
  }, []);

  const removeItem = useCallback((product_id, color_key) => {
    setItems(prev => prev.filter(i => !(i.product_id === product_id && i.color_key === color_key)));
  }, []);

  const setQty = useCallback((product_id, color_key, qty) => {
    setItems(prev => prev.map(i => (i.product_id === product_id && i.color_key === color_key) ? { ...i, quantity: Math.max(1, qty) } : i));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clear, subtotal, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
