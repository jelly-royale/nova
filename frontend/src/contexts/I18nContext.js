import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  fr: {
    nav: { collections: "Collections", bags: "Sacs", new: "Nouveautés", maison: "La Maison", journal: "Journal", contact: "Contact", account: "Compte", cart: "Panier", search: "Rechercher", login: "Connexion", logout: "Déconnexion", register: "S'inscrire" },
    home: {
      eyebrow: "MAISON DE LUXE — MILANO",
      hero_title: "Un nouveau chapitre de l'élégance italienne.",
      hero_sub: "NOVA MILAN présente Jelly, une réinterprétation contemporaine du sac emblématique.",
      discover: "Découvrir la collection",
      story_title: "L'objet devient signature.",
      story_body: "NOVA MILAN dessine des pièces intemporelles, taillées dans la précision italienne et animées par l'audace du présent. Chaque sac Jelly est pensé comme une architecture — épurée, sculpturale, désirable.",
      collection_title: "La collection Jelly",
      collection_sub: "Neuf teintes, un manifeste.",
      values_title: "Notre engagement",
      journal_title: "Journal",
      newsletter_title: "Rejoignez la Maison",
      newsletter_sub: "Accès privilégié aux lancements, éditions confidentielles et rendez-vous exclusifs.",
      newsletter_placeholder: "Votre adresse email",
      subscribe: "S'inscrire",
      view_product: "Voir le produit",
    },
    product: {
      add_to_cart: "Ajouter au panier", added: "Ajouté au panier", select_color: "Sélectionnez un coloris",
      color: "Coloris", availability: "Disponibilité", in_stock: "En stock", out_of_stock: "Épuisé",
      material: "Matière", description: "Description", care: "Entretien", shipping: "Livraison & Retours",
      wishlist: "Ajouter aux favoris", similar: "Vous aimerez aussi",
      details: "Détails de la pièce", price_from: "À partir de",
    },
    cart: {
      title: "Panier", empty: "Votre panier est vide.", continue: "Poursuivre les achats",
      subtotal: "Sous-total", shipping: "Livraison", discount: "Remise", total: "Total",
      promo: "Code promotionnel", apply: "Appliquer", checkout: "Passer commande", remove: "Retirer",
      free_shipping: "Livraison offerte à partir de 500 €",
    },
    account: {
      title: "Mon compte", orders: "Commandes", profile: "Profil", addresses: "Adresses", wishlist: "Favoris",
      first_name: "Prénom", last_name: "Nom", email: "Email", password: "Mot de passe",
      save: "Enregistrer", no_orders: "Aucune commande pour le moment.", order_number: "N° commande",
      status: "Statut", track: "Suivi",
    },
    auth: {
      login_title: "Bienvenue", login_sub: "Connectez-vous à votre espace NOVA MILAN.",
      register_title: "Créer un compte", register_sub: "Rejoignez la Maison NOVA MILAN.",
      no_account: "Pas encore de compte ?", have_account: "Déjà membre ?",
    },
    footer: {
      house: "La Maison", client: "Service Client", legal: "Légal",
      about: "Notre histoire", journal: "Journal", careers: "Carrières",
      contact: "Contact", faq: "FAQ", shipping: "Livraison", returns: "Retours & échanges",
      terms: "CGV", privacy: "Confidentialité", cookies: "Cookies", mentions: "Mentions légales",
      track_order: "Suivre ma commande",
      rights: "Tous droits réservés",
      lang: "Langue",
    },
  },
  en: {
    nav: { collections: "Collections", bags: "Bags", new: "New In", maison: "The House", journal: "Journal", contact: "Contact", account: "Account", cart: "Bag", search: "Search", login: "Sign in", logout: "Sign out", register: "Sign up" },
    home: {
      eyebrow: "MAISON DE LUXE — MILANO",
      hero_title: "A new chapter of Italian elegance.",
      hero_sub: "NOVA MILAN presents Jelly, a contemporary reinterpretation of the iconic bag.",
      discover: "Discover the collection",
      story_title: "An object becomes a signature.",
      story_body: "NOVA MILAN crafts timeless pieces, sculpted with Italian precision and animated by contemporary boldness. Every Jelly bag is conceived as architecture — pure, sculptural, desirable.",
      collection_title: "The Jelly collection",
      collection_sub: "Nine shades, one manifesto.",
      values_title: "Our commitment",
      journal_title: "Journal",
      newsletter_title: "Join the Maison",
      newsletter_sub: "Privileged access to launches, confidential editions and exclusive appointments.",
      newsletter_placeholder: "Your email address",
      subscribe: "Subscribe",
      view_product: "View product",
    },
    product: {
      add_to_cart: "Add to bag", added: "Added to bag", select_color: "Select a colour",
      color: "Colour", availability: "Availability", in_stock: "In stock", out_of_stock: "Sold out",
      material: "Material", description: "Description", care: "Care", shipping: "Shipping & Returns",
      wishlist: "Add to wishlist", similar: "You may also love",
      details: "Piece details", price_from: "From",
    },
    cart: {
      title: "Shopping bag", empty: "Your bag is empty.", continue: "Continue shopping",
      subtotal: "Subtotal", shipping: "Shipping", discount: "Discount", total: "Total",
      promo: "Promo code", apply: "Apply", checkout: "Checkout", remove: "Remove",
      free_shipping: "Complimentary shipping from €500",
    },
    account: {
      title: "My account", orders: "Orders", profile: "Profile", addresses: "Addresses", wishlist: "Wishlist",
      first_name: "First name", last_name: "Last name", email: "Email", password: "Password",
      save: "Save", no_orders: "No orders yet.", order_number: "Order #",
      status: "Status", track: "Tracking",
    },
    auth: {
      login_title: "Welcome", login_sub: "Sign in to your NOVA MILAN account.",
      register_title: "Create account", register_sub: "Join the NOVA MILAN Maison.",
      no_account: "No account yet?", have_account: "Already a member?",
    },
    footer: {
      house: "The House", client: "Client Care", legal: "Legal",
      about: "Our story", journal: "Journal", careers: "Careers",
      contact: "Contact", faq: "FAQ", shipping: "Shipping", returns: "Returns & Exchanges",
      terms: "Terms of Sale", privacy: "Privacy", cookies: "Cookies", mentions: "Legal notice",
      track_order: "Track my order",
      rights: "All rights reserved",
      lang: "Language",
    },
  },
  it: {
    nav: { collections: "Collezioni", bags: "Borse", new: "Novità", maison: "La Maison", journal: "Journal", contact: "Contatti", account: "Account", cart: "Borsa", search: "Cerca", login: "Accedi", logout: "Esci", register: "Registrati" },
    home: {
      eyebrow: "MAISON DI LUSSO — MILANO",
      hero_title: "Un nuovo capitolo dell'eleganza italiana.",
      hero_sub: "NOVA MILAN presenta Jelly, una reinterpretazione contemporanea della borsa iconica.",
      discover: "Scopri la collezione",
      story_title: "L'oggetto diventa firma.",
      story_body: "NOVA MILAN disegna pezzi senza tempo, scolpiti con precisione italiana e animati da audacia contemporanea.",
      collection_title: "La collezione Jelly",
      collection_sub: "Nove tonalità, un manifesto.",
      values_title: "Il nostro impegno",
      journal_title: "Journal",
      newsletter_title: "Entra nella Maison",
      newsletter_sub: "Accesso privilegiato ai lanci ed edizioni riservate.",
      newsletter_placeholder: "Il tuo indirizzo email",
      subscribe: "Iscriviti",
      view_product: "Vedi prodotto",
    },
    product: { add_to_cart: "Aggiungi alla borsa", added: "Aggiunto", select_color: "Scegli un colore", color: "Colore", availability: "Disponibilità", in_stock: "Disponibile", out_of_stock: "Esaurito", material: "Materiale", description: "Descrizione", care: "Cura", shipping: "Spedizione e resi", wishlist: "Aggiungi ai preferiti", similar: "Potrebbero piacerti", details: "Dettagli", price_from: "A partire da" },
    cart: { title: "Borsa", empty: "La tua borsa è vuota.", continue: "Continua lo shopping", subtotal: "Subtotale", shipping: "Spedizione", discount: "Sconto", total: "Totale", promo: "Codice promo", apply: "Applica", checkout: "Checkout", remove: "Rimuovi", free_shipping: "Spedizione gratuita da 500 €" },
    account: { title: "Il mio account", orders: "Ordini", profile: "Profilo", addresses: "Indirizzi", wishlist: "Preferiti", first_name: "Nome", last_name: "Cognome", email: "Email", password: "Password", save: "Salva", no_orders: "Nessun ordine.", order_number: "N° ordine", status: "Stato", track: "Tracciamento" },
    auth: { login_title: "Benvenuto", login_sub: "Accedi al tuo account NOVA MILAN.", register_title: "Crea account", register_sub: "Entra nella Maison NOVA MILAN.", no_account: "Non hai un account?", have_account: "Sei già membro?" },
    footer: { house: "La Maison", client: "Servizio Clienti", legal: "Legale", about: "La nostra storia", journal: "Journal", careers: "Carriere", contact: "Contatti", faq: "FAQ", shipping: "Spedizione", returns: "Resi", terms: "Termini di vendita", privacy: "Privacy", cookies: "Cookie", mentions: "Note legali", track_order: "Traccia ordine", rights: "Tutti i diritti riservati", lang: "Lingua" },
  },
  es: {
    nav: { collections: "Colecciones", bags: "Bolsos", new: "Novedades", maison: "La Maison", journal: "Journal", contact: "Contacto", account: "Cuenta", cart: "Bolso", search: "Buscar", login: "Entrar", logout: "Salir", register: "Registrarse" },
    home: { eyebrow: "MAISON DE LUJO — MILANO", hero_title: "Un nuevo capítulo de la elegancia italiana.", hero_sub: "NOVA MILAN presenta Jelly, una reinterpretación contemporánea.", discover: "Descubrir la colección", story_title: "El objeto se convierte en firma.", story_body: "NOVA MILAN crea piezas atemporales, esculpidas con precisión italiana.", collection_title: "La colección Jelly", collection_sub: "Nueve matices, un manifiesto.", values_title: "Nuestro compromiso", journal_title: "Journal", newsletter_title: "Únete a la Maison", newsletter_sub: "Acceso privilegiado a lanzamientos y ediciones confidenciales.", newsletter_placeholder: "Tu correo", subscribe: "Suscribirse", view_product: "Ver producto" },
    product: { add_to_cart: "Añadir al bolso", added: "Añadido", select_color: "Elige un color", color: "Color", availability: "Disponibilidad", in_stock: "Disponible", out_of_stock: "Agotado", material: "Material", description: "Descripción", care: "Cuidados", shipping: "Envío y devoluciones", wishlist: "Añadir a favoritos", similar: "También te gustará", details: "Detalles", price_from: "Desde" },
    cart: { title: "Bolso", empty: "Tu bolso está vacío.", continue: "Continuar", subtotal: "Subtotal", shipping: "Envío", discount: "Descuento", total: "Total", promo: "Código promo", apply: "Aplicar", checkout: "Finalizar", remove: "Quitar", free_shipping: "Envío gratis desde 500 €" },
    account: { title: "Mi cuenta", orders: "Pedidos", profile: "Perfil", addresses: "Direcciones", wishlist: "Favoritos", first_name: "Nombre", last_name: "Apellido", email: "Email", password: "Contraseña", save: "Guardar", no_orders: "Sin pedidos.", order_number: "N° pedido", status: "Estado", track: "Seguimiento" },
    auth: { login_title: "Bienvenido", login_sub: "Accede a tu cuenta NOVA MILAN.", register_title: "Crear cuenta", register_sub: "Únete a la Maison.", no_account: "¿Aún no tienes cuenta?", have_account: "¿Ya eres miembro?" },
    footer: { house: "La Maison", client: "Atención al cliente", legal: "Legal", about: "Nuestra historia", journal: "Journal", careers: "Carreras", contact: "Contacto", faq: "FAQ", shipping: "Envío", returns: "Devoluciones", terms: "Condiciones", privacy: "Privacidad", cookies: "Cookies", mentions: "Aviso legal", track_order: "Seguir pedido", rights: "Todos los derechos reservados", lang: "Idioma" },
  },
  de: {
    nav: { collections: "Kollektionen", bags: "Taschen", new: "Neu", maison: "Das Haus", journal: "Journal", contact: "Kontakt", account: "Konto", cart: "Tasche", search: "Suche", login: "Anmelden", logout: "Abmelden", register: "Registrieren" },
    home: { eyebrow: "LUXUSHAUS — MILANO", hero_title: "Ein neues Kapitel italienischer Eleganz.", hero_sub: "NOVA MILAN präsentiert Jelly, eine zeitgenössische Neuinterpretation.", discover: "Kollektion entdecken", story_title: "Ein Objekt wird zur Signatur.", story_body: "NOVA MILAN entwirft zeitlose Stücke mit italienischer Präzision.", collection_title: "Die Jelly Kollektion", collection_sub: "Neun Nuancen, ein Manifest.", values_title: "Unser Engagement", journal_title: "Journal", newsletter_title: "Dem Haus beitreten", newsletter_sub: "Exklusiver Zugang zu Launches und vertraulichen Editionen.", newsletter_placeholder: "Ihre E-Mail", subscribe: "Abonnieren", view_product: "Produkt ansehen" },
    product: { add_to_cart: "In die Tasche", added: "Hinzugefügt", select_color: "Farbe wählen", color: "Farbe", availability: "Verfügbarkeit", in_stock: "Verfügbar", out_of_stock: "Ausverkauft", material: "Material", description: "Beschreibung", care: "Pflege", shipping: "Versand & Rücksendung", wishlist: "Merken", similar: "Das gefällt Ihnen auch", details: "Details", price_from: "Ab" },
    cart: { title: "Tasche", empty: "Ihre Tasche ist leer.", continue: "Weiter einkaufen", subtotal: "Zwischensumme", shipping: "Versand", discount: "Rabatt", total: "Gesamt", promo: "Promo-Code", apply: "Anwenden", checkout: "Zur Kasse", remove: "Entfernen", free_shipping: "Kostenloser Versand ab 500 €" },
    account: { title: "Mein Konto", orders: "Bestellungen", profile: "Profil", addresses: "Adressen", wishlist: "Merkliste", first_name: "Vorname", last_name: "Nachname", email: "E-Mail", password: "Passwort", save: "Speichern", no_orders: "Keine Bestellungen.", order_number: "Bestell-Nr.", status: "Status", track: "Verfolgen" },
    auth: { login_title: "Willkommen", login_sub: "Melden Sie sich bei NOVA MILAN an.", register_title: "Konto erstellen", register_sub: "Treten Sie dem Haus bei.", no_account: "Noch kein Konto?", have_account: "Bereits Mitglied?" },
    footer: { house: "Das Haus", client: "Kundenservice", legal: "Rechtliches", about: "Unsere Geschichte", journal: "Journal", careers: "Karriere", contact: "Kontakt", faq: "FAQ", shipping: "Versand", returns: "Rücksendungen", terms: "AGB", privacy: "Datenschutz", cookies: "Cookies", mentions: "Impressum", track_order: "Bestellung verfolgen", rights: "Alle Rechte vorbehalten", lang: "Sprache" },
  },
};

const LANG_MAP = { fr: "fr", en: "en", it: "it", es: "es", de: "de" };
const FLAGS = { fr: "🇫🇷", en: "🇬🇧", it: "🇮🇹", es: "🇪🇸", de: "🇩🇪" };
const LABELS = { fr: "Français", en: "English", it: "Italiano", es: "Español", de: "Deutsch" };

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem("nova_lang");
    if (stored && translations[stored]) return stored;
    const browser = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return LANG_MAP[browser] || "fr";
  });

  useEffect(() => {
    localStorage.setItem("nova_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const keys = path.split(".");
    let value = translations[lang];
    for (const k of keys) value = value?.[k];
    if (!value) {
      value = translations.fr;
      for (const k of keys) value = value?.[k];
    }
    return value || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, langs: Object.keys(translations), flags: FLAGS, labels: LABELS }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
