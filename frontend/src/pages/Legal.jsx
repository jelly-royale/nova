import React from "react";
import { useParams } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const PLACEHOLDER = "[Informations entreprise à compléter]";

const PAGES = {
  mentions: {
    title: "Mentions légales",
    body: (
      <>
        <p><strong>Éditeur du site.</strong> Le site novamilan.com est édité par NOVA MILAN. {PLACEHOLDER}</p>
        <p><strong>Responsable de la publication.</strong> {PLACEHOLDER}</p>
        <p><strong>Hébergement.</strong> Le site est hébergé par un prestataire d'hébergement cloud sécurisé. {PLACEHOLDER}</p>
        <p><strong>Propriété intellectuelle.</strong> L'ensemble des contenus présents sur ce site — textes, visuels, photographies, logos, marques et bases de données — est la propriété exclusive de NOVA MILAN ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation préalable et écrite de la Maison, est strictement interdite.</p>
        <p><strong>Contact.</strong> Pour toute demande relative aux mentions légales : service.client@novamilan.com.</p>
      </>
    ),
  },
  cgv: {
    title: "Conditions Générales de Vente",
    body: (
      <>
        <p><strong>1. Présentation.</strong> Les présentes CGV régissent l'ensemble des ventes conclues sur le site novamilan.com par NOVA MILAN, maison de maroquinerie contemporaine.</p>
        <p><strong>2. Produits.</strong> Les caractéristiques essentielles des produits sont présentées sur chaque fiche produit. Les visuels sont non contractuels et peuvent présenter de légères variations avec le produit livré.</p>
        <p><strong>3. Commande.</strong> Toute commande passée sur le site vaut acceptation sans réserve des présentes CGV.</p>
        <p><strong>4. Prix.</strong> Les prix sont affichés en euros TTC. NOVA MILAN se réserve le droit de modifier ses prix à tout moment.</p>
        <p><strong>5. Paiement.</strong> Les paiements sont sécurisés par Stripe. Aucune donnée bancaire n'est stockée par NOVA MILAN.</p>
        <p><strong>6. Livraison.</strong> Les délais de livraison sont indicatifs et calculés en jours ouvrés à compter de la confirmation de commande.</p>
        <p><strong>7. Retours et échanges.</strong> Vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation.</p>
        <p><strong>8. Remboursements.</strong> Ils sont effectués sous 14 jours après réception et vérification de la pièce retournée.</p>
        <p><strong>9. Garanties.</strong> Tous nos produits bénéficient de la garantie légale de conformité.</p>
        <p><strong>10. Responsabilité.</strong> NOVA MILAN ne saurait être tenue responsable de tout dommage résultant d'un usage non conforme du produit.</p>
        <p><strong>11. Litiges.</strong> Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant tout recours.</p>
      </>
    ),
  },
  confidentialite: {
    title: "Politique de confidentialité",
    body: (
      <>
        <p><strong>Données collectées.</strong> Nous collectons les données strictement nécessaires au traitement de vos commandes et à l'amélioration de votre expérience.</p>
        <p><strong>Utilisation.</strong> Vos données sont utilisées pour traiter les commandes, gérer votre compte, personnaliser votre expérience et — avec votre consentement — vous adresser notre newsletter.</p>
        <p><strong>Comptes clients.</strong> Vos identifiants sont chiffrés et stockés dans un environnement sécurisé.</p>
        <p><strong>Paiements.</strong> Les transactions sont opérées via Stripe. Aucune donnée bancaire n'est enregistrée par NOVA MILAN.</p>
        <p><strong>Cookies.</strong> Voir notre <em>Politique de cookies</em>.</p>
        <p><strong>Conservation.</strong> Les données sont conservées pendant la durée nécessaire au traitement de la relation commerciale et aux obligations légales.</p>
        <p><strong>Vos droits.</strong> Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité. Contact : service.client@novamilan.com.</p>
      </>
    ),
  },
  retours: {
    title: "Retours, remboursements et échanges",
    body: (
      <>
        <p><strong>Conditions de retour.</strong> Vous disposez de 14 jours à compter de la réception pour retourner votre pièce. Le produit doit être neuf, non porté, non abîmé, dans son emballage d'origine avec l'ensemble de ses accessoires.</p>
        <p><strong>Délais.</strong> Le remboursement intervient sous 14 jours après réception et vérification du retour.</p>
        <p><strong>Procédure.</strong> Contactez notre service client à service.client@novamilan.com. Un bordereau de retour vous sera adressé.</p>
        <p><strong>Remboursement.</strong> Le remboursement est effectué sur le moyen de paiement utilisé lors de la commande.</p>
      </>
    ),
  },
  livraison: {
    title: "Politique de livraison",
    body: (
      <>
        <p><strong>Préparation.</strong> Les commandes sont préparées avec soin dans notre atelier sous 24 à 72h ouvrées.</p>
        <p><strong>Délais estimés.</strong> Europe : 2 à 5 jours ouvrés. International : 5 à 10 jours ouvrés.</p>
        <p><strong>Suivi.</strong> Un numéro de suivi vous est communiqué par email dès l'expédition.</p>
        <p><strong>Livraison offerte.</strong> À partir de 500 € d'achat en Europe.</p>
      </>
    ),
  },
  paiement: {
    title: "Paiement et facturation",
    body: (
      <>
        <p><strong>Moyens de paiement.</strong> Carte bancaire (Visa, Mastercard, American Express), Apple Pay, Google Pay via notre partenaire Stripe.</p>
        <p><strong>Sécurité.</strong> Toutes les transactions sont chiffrées en SSL. NOVA MILAN ne stocke aucune donnée bancaire.</p>
        <p><strong>Confirmation.</strong> Un email de confirmation est envoyé dès validation du paiement.</p>
        <p><strong>Facturation.</strong> La facture est disponible dans votre espace client et jointe à votre email de confirmation.</p>
      </>
    ),
  },
  cookies: {
    title: "Politique de cookies",
    body: (
      <>
        <p>Notre site utilise des cookies pour améliorer votre expérience de navigation, mesurer l'audience et personnaliser certains contenus.</p>
        <p><strong>Cookies essentiels.</strong> Requis au fonctionnement du site (session, panier).</p>
        <p><strong>Cookies analytiques.</strong> Google Analytics, Meta Pixel, TikTok Pixel — soumis à votre consentement.</p>
        <p><strong>Gestion.</strong> Vous pouvez à tout moment gérer vos préférences de cookies depuis les paramètres de votre navigateur.</p>
      </>
    ),
  },
  faq: {
    title: "Questions fréquentes",
    body: (
      <Accordion type="single" collapsible className="mt-4">
        {[
          ["Comment passer une commande ?", "Sélectionnez votre pièce, ajoutez-la au panier, puis suivez les étapes du checkout. Un email de confirmation vous sera adressé."],
          ["Quels moyens de paiement acceptez-vous ?", "Cartes Visa, Mastercard, American Express, Apple Pay et Google Pay via Stripe."],
          ["Quels sont les délais de livraison ?", "Europe : 2 à 5 jours ouvrés. International : 5 à 10 jours ouvrés."],
          ["Puis-je retourner un article ?", "Oui, sous 14 jours à compter de la réception, dans son état d'origine."],
          ["Comment entretenir mon sac Jelly ?", "Nettoyer avec un chiffon doux légèrement humide. Éviter l'exposition prolongée au soleil. Conserver dans la housse NOVA MILAN."],
          ["Le produit est-il en stock ?", "La disponibilité est indiquée sur chaque fiche produit et sur chaque swatch de couleur."],
          ["Comment contacter le service client ?", "Via notre formulaire de contact ou par email : service.client@novamilan.com."],
        ].map(([q, a], i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-b border-black/10">
            <AccordionTrigger className="text-left uppercase text-xs tracking-widest py-6">{q}</AccordionTrigger>
            <AccordionContent className="text-sm text-black/70">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ),
  },
};

export default function Legal() {
  const { page } = useParams();
  const p = PAGES[page] || PAGES.mentions;
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24" data-testid={`legal-${page}`}>
      <p className="nova-eyebrow mb-4">LÉGAL</p>
      <h1 className="nova-h1 text-4xl md:text-5xl mb-10">{p.title}</h1>
      <div className="space-y-6 text-black/70 leading-relaxed">{p.body}</div>
    </div>
  );
}
