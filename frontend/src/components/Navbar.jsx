import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Globe } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { t, lang, setLang, langs, flags, labels } = useI18n();
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { to: "/collections", label: t("nav.collections") },
    { to: "/collections/sacs", label: t("nav.bags") },
    { to: "/maison", label: t("nav.maison") },
    { to: "/journal", label: t("nav.journal") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-500 ${
        scrolled ? "bg-nova-ivory/85 backdrop-blur-xl border-b border-black/5" : "bg-nova-ivory border-b border-transparent"
      }`}
      data-testid="site-header"
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Mobile menu */}
        <div className="lg:hidden flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-btn" aria-label="Menu"><Menu className="w-5 h-5" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-nova-ivory">
              <div className="flex flex-col gap-8 mt-12">
                {nav.map(n => (
                  <NavLink key={n.to} to={n.to} className="nova-link text-base" data-testid={`mobile-link-${n.to}`}>{n.label}</NavLink>
                ))}
                <Link to={user ? "/account" : "/login"} className="nova-link text-base">{user ? t("nav.account") : t("nav.login")}</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left nav desktop */}
        <nav className="hidden lg:flex items-center gap-8 flex-1">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className="nova-link"
              data-testid={`nav-link-${n.to.replace(/\//g, "-")}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Logo */}
        <Link to="/" className="font-serif-display text-2xl lg:text-3xl tracking-[0.2em] font-normal" data-testid="nova-logo">
          NOVA <span className="nova-gold">MILAN</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1 text-xs tracking-widest uppercase" data-testid="language-selector">
                <Globe className="w-4 h-4" /> <span>{flags[lang]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-nova-ivory">
              {langs.map(l => (
                <DropdownMenuItem key={l} onClick={() => setLang(l)} data-testid={`lang-${l}`}>
                  <span className="mr-2">{flags[l]}</span> {labels[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to={user ? "/account" : "/login"} aria-label="Account" data-testid="account-link">
            <User className="w-5 h-5" />
          </Link>
          <button onClick={() => setOpen(true)} aria-label="Cart" className="relative" data-testid="cart-button">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-nova-black text-nova-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-count">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
