# NOVA MILAN — Product Requirements Document

## Original Problem Statement
Créer une maison de luxe digitale « NOVA MILAN » — plateforme e-commerce premium (React + FastAPI + MongoDB) présentant le sac signature **Jelly** dans 9 coloris, avec expérience internationale multilingue (FR/EN/IT/ES/DE), administration style Shopify, paiement Stripe, et tous les textes légaux/informations client. Design inspiré de Dior/Louis Vuitton/Jacquemus + jellyferkin.com, revisité en luxe contemporain.

## Architecture
- **Frontend:** React 19 + React Router 7 + TailwindCSS + Shadcn UI + Framer Motion (Playfair Display + Manrope typography)
- **Backend:** FastAPI + Motor async MongoDB (+ sync pymongo for Stripe payment_transactions)
- **Auth:** JWT (bcrypt) with `customer` / `admin` roles
- **Payments:** Stripe (test sandbox keys, ready for KYC claim)
- **i18n:** Custom context with 5 languages, browser detection, persisted in localStorage

## User Personas
- **Cliente premium** — découvre la maison, ajoute Jelly au panier, paie, suit son colis
- **Administrateur** — pilote produits, commandes, promotions, statistiques (Shopify-like)

## Implemented (2026-02)
### Storefront
- Home cinématique (hero, marquee, signature Jelly, grille 9 coloris, éditorial)
- Collections + fiche produit (galerie zoom, 9 swatches, accordion détails/matière/entretien/livraison, wishlist, ajout panier)
- Panier drawer (qty, remove, promo, sous-total)
- Checkout Stripe (adresse, promo, résumé, session Stripe hosted)
- Payment success/cancel avec polling
- Compte client (commandes, favoris, profil, logout)
- Auth login/register (JWT bcrypt)
- La Maison (histoire NOVA MILAN, valeurs)
- Journal éditorial (3 chapitres)
- Contact (formulaire, stocké BDD)
- Suivi de commande public (n° + email)
- Pages légales complètes: mentions, CGV, confidentialité RGPD, retours, livraison, paiement, cookies, FAQ
- Language switcher (FR/EN/IT/ES/DE) avec détection navigateur
- Footer newsletter, réseaux, liens légaux

### Admin (Shopify-style)
- Sidebar dark + main content
- Dashboard (CA, commandes, clients, top produits)
- Produits (list, edit prix/description, delete)
- Commandes (list, update status/tracking)
- Clients (list)
- Promotions (create/delete)
- Messages contact
- Réglages (GA / Meta Pixel / TikTok Pixel IDs — configurables)

### Backend endpoints
- `/api/auth/*` — register, login, me, update
- `/api/products` GET, `/api/products/{slug}` GET
- `/api/admin/products` POST/PUT/DELETE
- `/api/wishlist` GET/POST/DELETE
- `/api/promo/validate` POST (query param)
- `/api/admin/promos` GET/POST/DELETE
- `/api/checkout` POST (Stripe session)
- `/api/payments/status/{sid}` GET (polling)
- `/api/stripe/webhook` POST
- `/api/orders` GET, `/api/orders/track/{number}` GET
- `/api/admin/orders` GET/PUT
- `/api/admin/customers` GET
- `/api/contact` POST, `/api/admin/contacts` GET
- `/api/newsletter` POST, `/api/admin/newsletter` GET
- `/api/reviews` POST, `/api/products/{id}/reviews` GET
- `/api/settings/public` GET, `/api/admin/settings` GET/PUT
- `/api/admin/analytics` GET
- `/api/seed` POST (idempotent) + auto on startup

## Pending / Deferred
- **Emails transactionnels** — architecture prête, en attente clé Resend/SendGrid
- **Google OAuth** — architecture JWT compatible, à intégrer avec vraies clés
- **Analytics live** — emplacements Réglages prêts, en attente des IDs GA/Meta/TikTok
- **Informations légales entreprise** — placeholders `[Informations entreprise à compléter]` à remplacer avant go-live
- **Upload d'images produit** — actuellement via URL dans admin ; upload direct à ajouter
- **Traduction dynamique produits/journal** — actuellement UI seulement ; contenus produit non traduits

## Backlog P0/P1/P2
- **P0** Emails Resend + KYC Stripe pour production
- **P0** Remplacer placeholders légaux avec vraies infos société
- **P1** Upload images admin (media library) via object storage
- **P1** Search + filtre produits (multi-catégories)
- **P1** Reviews UI sur fiche produit
- **P2** Google OAuth avec Emergent Auth
- **P2** Vidéos produit (embed)
- **P2** Traduction contenu produit (i18n DB)

## Test Credentials
Voir `/app/memory/test_credentials.md`
