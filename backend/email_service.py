"""NOVA MILAN — Email service via Resend.
Gracefully no-op when RESEND_API_KEY is missing (dev/staging).
Templates in FR + EN (basic i18n by user lang preference).
"""
import os
import asyncio
import logging
from typing import Optional

import resend

logger = logging.getLogger("nova.email")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "NOVA MILAN <onboarding@resend.dev>")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

BRAND_HEADER = """
<div style="background:#0a0a0a;padding:32px 40px;text-align:center;">
  <div style="font-family:Georgia,'Playfair Display',serif;color:#fdfbf7;font-size:28px;letter-spacing:6px;">
    NOVA <span style="color:#b89968;">MILAN</span>
  </div>
</div>
"""

BRAND_FOOTER = """
<div style="background:#0a0a0a;color:#888;padding:24px 40px;font-size:11px;text-align:center;letter-spacing:1px;">
  © 2025 NOVA MILAN — Maison de maroquinerie contemporaine.<br/>
  Milano · Paris · London
</div>
"""

def _wrap(inner_html: str, preheader: str = "") -> str:
    return f"""
<html><body style="margin:0;padding:0;background:#fdfbf7;font-family:'Manrope',Helvetica,Arial,sans-serif;color:#0a0a0a;">
<div style="display:none;opacity:0;color:transparent;height:0;overflow:hidden;">{preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin:32px 0;box-shadow:0 1px 0 rgba(0,0,0,0.05);">
      <tr><td>{BRAND_HEADER}</td></tr>
      <tr><td style="padding:48px 40px;font-size:15px;line-height:1.7;color:#0a0a0a;">{inner_html}</td></tr>
      <tr><td>{BRAND_FOOTER}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""


async def _send(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        logger.info(f"[EMAIL SKIPPED — no RESEND_API_KEY] to={to} subject={subject!r}")
        return False
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"[EMAIL SENT] to={to} id={result.get('id')} subject={subject!r}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL ERROR] to={to} subject={subject!r} err={e}")
        return False


# ---------- Templates ----------

def _t(lang: str, key: str) -> str:
    """Minimal translation for email copy."""
    d = {
        "welcome_subject": {"fr": "Bienvenue chez NOVA MILAN", "en": "Welcome to NOVA MILAN", "it": "Benvenuto in NOVA MILAN", "es": "Bienvenido a NOVA MILAN", "de": "Willkommen bei NOVA MILAN"},
        "order_subject": {"fr": "Confirmation de votre commande {n}", "en": "Order confirmation {n}", "it": "Conferma ordine {n}", "es": "Confirmación de pedido {n}", "de": "Bestellbestätigung {n}"},
        "payment_subject": {"fr": "Paiement confirmé — commande {n}", "en": "Payment confirmed — order {n}", "it": "Pagamento confermato — ordine {n}", "es": "Pago confirmado — pedido {n}", "de": "Zahlung bestätigt — Bestellung {n}"},
        "shipped_subject": {"fr": "Votre commande {n} est expédiée", "en": "Your order {n} has shipped", "it": "Il tuo ordine {n} è stato spedito", "es": "Tu pedido {n} ha sido enviado", "de": "Ihre Bestellung {n} wurde versandt"},
        "reset_subject": {"fr": "Réinitialisation de votre mot de passe", "en": "Reset your password", "it": "Reimposta la password", "es": "Restablecer contraseña", "de": "Passwort zurücksetzen"},
    }
    return d.get(key, {}).get(lang, d.get(key, {}).get("fr", ""))


async def send_welcome(email: str, first_name: str, lang: str = "fr") -> bool:
    subject = _t(lang, "welcome_subject")
    greetings = {"fr": f"Chère {first_name}, cher {first_name},", "en": f"Dear {first_name},", "it": f"Gentile {first_name},", "es": f"Estimado/a {first_name},", "de": f"Liebe(r) {first_name},"}
    bodies = {
        "fr": "Bienvenue dans la Maison NOVA MILAN. Vous rejoignez un cercle privilégié — celles et ceux qui font de l'élégance un art de vivre. Nous vous accompagnerons désormais dans la découverte de nos créations, avec un accès en avant-première à nos lancements et éditions confidentielles.",
        "en": "Welcome to the NOVA MILAN Maison. You now belong to a privileged circle — those who make elegance an art of living. From now on, we will accompany you in discovering our creations, with early access to our launches and confidential editions.",
        "it": "Benvenuto nella Maison NOVA MILAN. Entra in un cerchio esclusivo — coloro che fanno dell'eleganza un'arte di vivere. D'ora in poi, ti accompagneremo nella scoperta delle nostre creazioni.",
        "es": "Bienvenido a la Maison NOVA MILAN. Se une a un círculo privilegiado — quienes hacen de la elegancia un arte de vivir.",
        "de": "Willkommen im Hause NOVA MILAN. Sie gehören nun zu einem privilegierten Kreis — jenen, die Eleganz zur Lebenskunst machen.",
    }
    inner = f"""
    <p style="font-family:Georgia,serif;font-size:24px;margin:0 0 24px;">{greetings.get(lang, greetings['fr'])}</p>
    <p style="margin:0 0 32px;">{bodies.get(lang, bodies['fr'])}</p>
    <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b89968;margin:32px 0 8px;">La Maison NOVA MILAN</p>
    <p style="margin:0;color:#666;">Milano · Paris · London</p>
    """
    return await _send(email, subject, _wrap(inner, "Bienvenue chez NOVA MILAN."))


def _items_html(items: list) -> str:
    rows = ""
    for it in items:
        rows += f"""
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eee;">
            <div style="font-family:Georgia,serif;font-size:16px;">{it.get('product_name','')}</div>
            <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">{it.get('color_name','')} × {it.get('quantity',1)}</div>
          </td>
          <td style="text-align:right;padding:16px 0;border-bottom:1px solid #eee;font-size:14px;">{it.get('total',0):.2f} €</td>
        </tr>"""
    return rows


async def send_order_confirmation(email: str, order: dict, lang: str = "fr") -> bool:
    subject = _t(lang, "order_subject").format(n=order.get("order_number", ""))
    intros = {
        "fr": "Nous avons bien reçu votre commande. Vous recevrez un second email dès que le paiement sera confirmé.",
        "en": "We have received your order. You will receive a second email once payment is confirmed.",
        "it": "Abbiamo ricevuto il tuo ordine. Riceverai una seconda email dopo la conferma del pagamento.",
        "es": "Hemos recibido su pedido. Recibirá un segundo correo cuando se confirme el pago.",
        "de": "Wir haben Ihre Bestellung erhalten. Sie erhalten eine zweite E-Mail nach Zahlungsbestätigung.",
    }
    inner = f"""
    <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b89968;margin:0 0 8px;">Commande reçue</p>
    <p style="font-family:Georgia,serif;font-size:28px;margin:0 0 8px;">N° {order.get('order_number','')}</p>
    <p style="margin:0 0 32px;color:#666;">{intros.get(lang, intros['fr'])}</p>
    <table width="100%" cellpadding="0" cellspacing="0">{_items_html(order.get('items', []))}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr><td style="padding:4px 0;color:#666;">Sous-total</td><td style="text-align:right;padding:4px 0;">{order.get('subtotal', 0):.2f} €</td></tr>
      { '<tr><td style="padding:4px 0;color:#b89968;">Remise</td><td style="text-align:right;padding:4px 0;color:#b89968;">-' + f"{order.get('discount', 0):.2f}" + ' €</td></tr>' if order.get('discount', 0) > 0 else '' }
      <tr><td style="padding:4px 0;color:#666;">Livraison</td><td style="text-align:right;padding:4px 0;">{'Offerte' if order.get('shipping',0) == 0 else f"{order.get('shipping',0):.2f} €"}</td></tr>
      <tr><td style="padding:12px 0;border-top:1px solid #0a0a0a;font-family:Georgia,serif;font-size:18px;">Total</td><td style="text-align:right;padding:12px 0;border-top:1px solid #0a0a0a;font-family:Georgia,serif;font-size:18px;">{order.get('total', 0):.2f} €</td></tr>
    </table>
    """
    return await _send(email, subject, _wrap(inner, f"Commande {order.get('order_number','')}"))


async def send_payment_confirmation(email: str, order: dict, lang: str = "fr") -> bool:
    subject = _t(lang, "payment_subject").format(n=order.get("order_number", ""))
    bodies = {
        "fr": "Votre paiement a bien été confirmé. Nous préparons votre commande avec le plus grand soin dans notre atelier. Vous recevrez un email lorsque votre colis sera expédié.",
        "en": "Your payment has been confirmed. We are preparing your order with the greatest care. You will receive an email when your parcel is shipped.",
        "it": "Il tuo pagamento è confermato. Stiamo preparando il tuo ordine con la massima cura.",
        "es": "Su pago ha sido confirmado. Preparamos su pedido con el mayor cuidado.",
        "de": "Ihre Zahlung wurde bestätigt. Wir bereiten Ihre Bestellung mit größter Sorgfalt vor.",
    }
    inner = f"""
    <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b89968;margin:0 0 8px;">Paiement confirmé</p>
    <p style="font-family:Georgia,serif;font-size:28px;margin:0 0 24px;">Merci.</p>
    <p style="margin:0 0 16px;">{bodies.get(lang, bodies['fr'])}</p>
    <p style="margin:0 0 32px;color:#666;">Commande N° <strong>{order.get('order_number','')}</strong> — Total {order.get('total', 0):.2f} €</p>
    """
    return await _send(email, subject, _wrap(inner))


async def send_shipment_notification(email: str, order: dict, tracking: Optional[str] = None, lang: str = "fr") -> bool:
    subject = _t(lang, "shipped_subject").format(n=order.get("order_number", ""))
    bodies = {
        "fr": "Votre commande vient d'être remise à notre transporteur premium. Elle vous parviendra très prochainement.",
        "en": "Your order has just been handed to our premium carrier. It will reach you very soon.",
        "it": "Il tuo ordine è stato affidato al nostro corriere premium.",
        "es": "Su pedido ha sido entregado a nuestro transportista premium.",
        "de": "Ihre Bestellung wurde unserem Premium-Kurier übergeben.",
    }
    tracking_html = f'<p style="margin:16px 0;padding:16px;background:#f4f4f0;font-family:monospace;font-size:14px;">N° de suivi : <strong>{tracking}</strong></p>' if tracking else ""
    inner = f"""
    <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b89968;margin:0 0 8px;">Expédiée</p>
    <p style="font-family:Georgia,serif;font-size:28px;margin:0 0 24px;">Votre commande est en route.</p>
    <p style="margin:0 0 16px;">{bodies.get(lang, bodies['fr'])}</p>
    {tracking_html}
    <p style="color:#666;">Commande N° <strong>{order.get('order_number','')}</strong></p>
    """
    return await _send(email, subject, _wrap(inner))


async def send_password_reset(email: str, reset_url: str, lang: str = "fr") -> bool:
    subject = _t(lang, "reset_subject")
    bodies = {
        "fr": "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable 1 heure.",
        "en": "You have requested a password reset. Click the button below to set a new password. This link is valid for 1 hour.",
        "it": "Hai richiesto la reimpostazione della password. Clicca sul pulsante qui sotto. Il link è valido per 1 ora.",
        "es": "Ha solicitado restablecer su contraseña. Haga clic en el botón. El enlace es válido durante 1 hora.",
        "de": "Sie haben eine Passwortzurücksetzung angefordert. Klicken Sie auf die Schaltfläche. Der Link ist 1 Stunde gültig.",
    }
    btn = {"fr": "Réinitialiser mon mot de passe", "en": "Reset my password", "it": "Reimposta password", "es": "Restablecer contraseña", "de": "Passwort zurücksetzen"}
    inner = f"""
    <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#b89968;margin:0 0 8px;">Sécurité</p>
    <p style="font-family:Georgia,serif;font-size:28px;margin:0 0 24px;">Nouveau mot de passe</p>
    <p style="margin:0 0 32px;">{bodies.get(lang, bodies['fr'])}</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="{reset_url}" style="display:inline-block;background:#0a0a0a;color:#fdfbf7;padding:16px 40px;text-decoration:none;letter-spacing:3px;text-transform:uppercase;font-size:12px;">{btn.get(lang, btn['fr'])}</a>
    </p>
    <p style="font-size:12px;color:#888;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email — votre mot de passe restera inchangé.</p>
    """
    return await _send(email, subject, _wrap(inner))
