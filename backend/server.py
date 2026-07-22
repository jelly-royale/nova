"""NOVA MILAN — Luxury Maison Digital backend."""
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List

import bcrypt
import jwt
import stripe
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient as SyncMongoClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- MongoDB ----------
mongo_url = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[DB_NAME]

sync_client = SyncMongoClient(mongo_url)
sync_db = sync_client[DB_NAME]
payment_transactions = sync_db["payment_transactions"]

# ---------- Stripe ----------
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# ---------- Auth ----------
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
security = HTTPBearer(auto_error=False)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=14),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not creds:
        return None
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        return user
    except Exception:
        return None

async def require_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    user = await get_current_user(creds)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user

async def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    user = await require_user(creds)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user

# ---------- Models ----------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AddressModel(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = ""
    city: str
    postal_code: str
    country: str
    phone: Optional[str] = ""

class ProductVariant(BaseModel):
    color_key: str
    color_name: str
    hex: str
    stock: int = 20
    image: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    slug: str
    category: str = "sacs"
    description: str
    material: str = "Cuir souple italien"
    price: float
    currency: str = "EUR"
    images: List[str] = []
    variants: List[ProductVariant] = []
    featured: bool = False
    active: bool = True

class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

class CartItemIn(BaseModel):
    product_id: str
    color_key: str
    quantity: int = 1

class CheckoutRequest(BaseModel):
    origin_url: str
    items: List[CartItemIn]
    address: AddressModel
    promo_code: Optional[str] = None
    email: Optional[str] = None

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class NewsletterSub(BaseModel):
    email: EmailStr

class PromoCreate(BaseModel):
    code: str
    percent_off: float
    active: bool = True

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str

class OrderStatusUpdate(BaseModel):
    status: str  # pending, paid, preparing, shipped, delivered, cancelled
    tracking_number: Optional[str] = None

class SettingsUpdate(BaseModel):
    ga_id: Optional[str] = None
    meta_pixel_id: Optional[str] = None
    tiktok_pixel_id: Optional[str] = None
    company_info: Optional[dict] = None

# ---------- App ----------
app = FastAPI(title="NOVA MILAN API")
api = APIRouter(prefix="/api")

# ---------- Health ----------
@api.get("/")
async def root():
    return {"brand": "NOVA MILAN", "status": "online"}

# ---------- Auth Routes ----------
@api.post("/auth/register")
async def register(payload: UserRegister):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(400, "Un compte existe déjà avec cet email")
    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "role": "customer",
        "addresses": [],
        "wishlist": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = make_token(user["id"], user["role"])
    user.pop("password", None)
    user.pop("_id", None)
    return {"token": token, "user": user}

@api.post("/auth/login")
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    token = make_token(user["id"], user["role"])
    user.pop("password", None)
    user.pop("_id", None)
    return {"token": token, "user": user}

@api.get("/auth/me")
async def me(user=Depends(require_user)):
    return user

@api.put("/auth/me")
async def update_me(payload: dict, user=Depends(require_user)):
    allowed = {k: v for k, v in payload.items() if k in {"first_name", "last_name", "phone", "addresses"}}
    await db.users.update_one({"id": user["id"]}, {"$set": allowed})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated

# ---------- Products ----------
@api.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None):
    q = {"active": True}
    if category:
        q["category"] = category
    if featured is not None:
        q["featured"] = featured
    products = await db.products.find(q, {"_id": 0}).to_list(500)
    return products

@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Produit introuvable")
    return p

@api.post("/admin/products")
async def create_product(payload: ProductCreate, admin=Depends(require_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/admin/products/{product_id}")
async def update_product(product_id: str, payload: dict, admin=Depends(require_admin)):
    payload.pop("_id", None)
    payload.pop("id", None)
    await db.products.update_one({"id": product_id}, {"$set": payload})
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    return p

@api.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(require_admin)):
    await db.products.delete_one({"id": product_id})
    return {"ok": True}

# ---------- Wishlist ----------
@api.get("/wishlist")
async def get_wishlist(user=Depends(require_user)):
    ids = user.get("wishlist", [])
    if not ids:
        return []
    products = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(200)
    return products

@api.post("/wishlist/{product_id}")
async def add_wishlist(product_id: str, user=Depends(require_user)):
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"wishlist": product_id}})
    return {"ok": True}

@api.delete("/wishlist/{product_id}")
async def remove_wishlist(product_id: str, user=Depends(require_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"wishlist": product_id}})
    return {"ok": True}

# ---------- Promo ----------
@api.post("/promo/validate")
async def validate_promo(code: str):
    promo = await db.promos.find_one({"code": code.upper(), "active": True}, {"_id": 0})
    if not promo:
        raise HTTPException(404, "Code promo invalide")
    return promo

@api.get("/admin/promos")
async def list_promos(admin=Depends(require_admin)):
    return await db.promos.find({}, {"_id": 0}).to_list(500)

@api.post("/admin/promos")
async def create_promo(payload: PromoCreate, admin=Depends(require_admin)):
    doc = payload.model_dump()
    doc["code"] = doc["code"].upper()
    doc["id"] = str(uuid.uuid4())
    await db.promos.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.delete("/admin/promos/{promo_id}")
async def delete_promo(promo_id: str, admin=Depends(require_admin)):
    await db.promos.delete_one({"id": promo_id})
    return {"ok": True}

# ---------- Orders ----------
async def _compute_totals(items: List[CartItemIn], promo_code: Optional[str]):
    line_items = []
    subtotal = 0.0
    for it in items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(400, f"Produit {it.product_id} introuvable")
        variant = next((v for v in p["variants"] if v["color_key"] == it.color_key), None)
        if not variant:
            raise HTTPException(400, "Coloris indisponible")
        amount = float(p["price"]) * it.quantity
        subtotal += amount
        line_items.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "color_key": it.color_key,
            "color_name": variant["color_name"],
            "quantity": it.quantity,
            "unit_price": float(p["price"]),
            "total": amount,
            "image": p["images"][0] if p["images"] else None,
        })
    discount = 0.0
    if promo_code:
        promo = await db.promos.find_one({"code": promo_code.upper(), "active": True})
        if promo:
            discount = subtotal * (float(promo["percent_off"]) / 100.0)
    shipping = 0.0 if subtotal >= 500 else 15.0
    total = max(subtotal - discount + shipping, 0.0)
    return line_items, subtotal, discount, shipping, total

@api.post("/checkout")
async def checkout(payload: CheckoutRequest, user=Depends(get_current_user)):
    line_items, subtotal, discount, shipping, total = await _compute_totals(payload.items, payload.promo_code)
    order_id = str(uuid.uuid4())
    order_number = "NM" + datetime.now(timezone.utc).strftime("%y%m%d") + order_id[:5].upper()

    stripe_line_items = [{
        "price_data": {
            "currency": "eur",
            "product_data": {"name": li["product_name"] + " — " + li["color_name"]},
            "unit_amount": int(round(li["unit_price"] * 100)),
        },
        "quantity": li["quantity"],
    } for li in line_items]
    if shipping > 0:
        stripe_line_items.append({
            "price_data": {"currency": "eur", "product_data": {"name": "Livraison premium"}, "unit_amount": int(shipping * 100)},
            "quantity": 1,
        })
    discounts = []
    if discount > 0:
        coupon = stripe.Coupon.create(amount_off=int(discount * 100), currency="eur", duration="once", name=payload.promo_code or "PROMO")
        discounts = [{"coupon": coupon.id}]

    session = stripe.checkout.Session.create(
        line_items=stripe_line_items,
        mode="payment",
        success_url=f"{payload.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{payload.origin_url}/payment/cancel",
        customer_email=(user.get("email") if user else payload.email),
        metadata={"order_id": order_id, "user_id": (user["id"] if user else "")},
        discounts=discounts,
    )

    order = {
        "id": order_id,
        "order_number": order_number,
        "user_id": user["id"] if user else None,
        "email": user.get("email") if user else payload.email,
        "items": line_items,
        "address": payload.address.model_dump(),
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "total": total,
        "currency": "EUR",
        "promo_code": payload.promo_code,
        "status": "pending",
        "payment_status": "pending",
        "session_id": session.id,
        "tracking_number": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    payment_transactions.insert_one({
        "session_id": session.id,
        "order_id": order_id,
        "amount": int(total * 100),
        "currency": "eur",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    return {"checkout_url": session.url, "session_id": session.id, "order_id": order_id}

@api.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    record = payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(404, "Transaction introuvable")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
                )
                await db.orders.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"payment_status": "paid", "status": "paid"}},
                )
                record = payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
        "order": order,
    }

@api.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"), "updated_at": datetime.now(timezone.utc)}},
        )
        await db.orders.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"payment_status": "paid", "status": "paid"}},
        )
    return {"status": "ok"}

@api.get("/orders")
async def my_orders(user=Depends(require_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.get("/orders/track/{order_number}")
async def track_order(order_number: str, email: str):
    order = await db.orders.find_one({"order_number": order_number.upper(), "email": email.lower()}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Commande introuvable")
    return order

@api.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.put("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, payload: OrderStatusUpdate, admin=Depends(require_admin)):
    update = {"status": payload.status}
    if payload.tracking_number:
        update["tracking_number"] = payload.tracking_number
    await db.orders.update_one({"id": order_id}, {"$set": update})
    return await db.orders.find_one({"id": order_id}, {"_id": 0})

# ---------- Customers (admin) ----------
@api.get("/admin/customers")
async def admin_customers(admin=Depends(require_admin)):
    users = await db.users.find({"role": "customer"}, {"_id": 0, "password": 0}).to_list(500)
    return users

# ---------- Contact / Newsletter ----------
@api.post("/contact")
async def contact(payload: ContactMessage):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}

@api.get("/admin/contacts")
async def admin_contacts(admin=Depends(require_admin)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.post("/newsletter")
async def newsletter(payload: NewsletterSub):
    email = payload.email.lower()
    if await db.newsletter.find_one({"email": email}):
        return {"ok": True, "already": True}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": email, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}

@api.get("/admin/newsletter")
async def admin_newsletter(admin=Depends(require_admin)):
    return await db.newsletter.find({}, {"_id": 0}).to_list(2000)

# ---------- Reviews ----------
@api.get("/products/{product_id}/reviews")
async def product_reviews(product_id: str):
    return await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(500)

@api.post("/reviews")
async def create_review(payload: ReviewCreate, user=Depends(require_user)):
    doc = payload.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": f"{user.get('first_name','')} {user.get('last_name','')[:1]}.",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc

# ---------- Settings (public + admin) ----------
@api.get("/settings/public")
async def public_settings():
    s = await db.settings.find_one({"_id": "global"}) or {}
    return {
        "ga_id": s.get("ga_id", ""),
        "meta_pixel_id": s.get("meta_pixel_id", ""),
        "tiktok_pixel_id": s.get("tiktok_pixel_id", ""),
        "stripe_publishable_key": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""),
    }

@api.get("/admin/settings")
async def admin_get_settings(admin=Depends(require_admin)):
    s = await db.settings.find_one({"_id": "global"}) or {}
    s.pop("_id", None)
    return s

@api.put("/admin/settings")
async def admin_update_settings(payload: SettingsUpdate, admin=Depends(require_admin)):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.settings.update_one({"_id": "global"}, {"$set": data}, upsert=True)
    return {"ok": True, **data}

# ---------- Analytics dashboard ----------
@api.get("/admin/analytics")
async def analytics(admin=Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"payment_status": "paid"})
    revenue_pipe = [{"$match": {"payment_status": "paid"}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    revenue_agg = await db.orders.aggregate(revenue_pipe).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    customers_count = await db.users.count_documents({"role": "customer"})
    products_count = await db.products.count_documents({})
    # top products
    top_pipe = [
        {"$match": {"payment_status": "paid"}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.product_name", "qty": {"$sum": "$items.quantity"}, "revenue": {"$sum": "$items.total"}}},
        {"$sort": {"qty": -1}}, {"$limit": 5},
    ]
    top = await db.orders.aggregate(top_pipe).to_list(5)
    # daily last 14
    daily_pipe = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}, {"$limit": 30},
    ]
    daily = await db.orders.aggregate(daily_pipe).to_list(30)
    return {
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "revenue": revenue,
        "customers": customers_count,
        "products": products_count,
        "top_products": top,
        "daily": daily,
    }

# ---------- Seed ----------
@api.post("/seed")
async def seed():
    if await db.products.count_documents({}) > 0 and await db.users.find_one({"role": "admin"}):
        return {"ok": True, "seeded": False}
    # Admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@novamilan.com").lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "NovaAdmin2026!")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hash_password(admin_pw),
            "first_name": "NOVA",
            "last_name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Jelly colors
    colors = [
        ("citron", "Jaune Citron", "#EEE79A"),
        ("ciel", "Bleu Ciel", "#7FC0E8"),
        ("pistache", "Vert Pistache", "#C8D68F"),
        ("poudre", "Rose Poudré", "#F4C6D4"),
        ("fuchsia", "Rose Fuchsia", "#E85A9A"),
        ("turquoise", "Turquoise Tiffany", "#7DDCC9"),
        ("cristal", "Blanc Cristal", "#F4F4F0"),
        ("fume", "Noir Fumé", "#3A3A3A"),
        ("lavande", "Violet Lavande", "#C7A9E5"),
    ]
    variants = [{"color_key": k, "color_name": n, "hex": h, "stock": 25, "image": None} for k, n, h in colors]

    jelly_images = [
        "https://images.unsplash.com/photo-1718254309963-49ce69a853df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHx0cmFuc3BhcmVudCUyMGplbGx5JTIwdG90ZSUyMGJhZyUyMHBhc3RlbHxlbnwwfHx8fDE3ODQ3NTIzNzl8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1556228578-6b39aba552d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwzfHx0cmFuc3BhcmVudCUyMGplbGx5JTIwdG90ZSUyMGJhZyUyMHBhc3RlbHxlbnwwfHx8fDE3ODQ3NTIzNzl8MA&ixlib=rb-4.1.0&q=85",
        "https://customer-assets.emergentagent.com/job_nova-digital-maison/artifacts/uzuny7dh_IMG_4148.jpeg",
        "https://customer-assets.emergentagent.com/job_nova-digital-maison/artifacts/vhhcvatg_IMG_4149.jpeg",
    ]

    await db.products.insert_one({
        "id": str(uuid.uuid4()),
        "name": "Jelly",
        "slug": "jelly",
        "category": "sacs",
        "description": "Le sac Jelly incarne la signature NOVA MILAN : une silhouette architecturale héritée des grandes maisons italiennes, réinterprétée dans une matière contemporaine translucide. Un manifeste de modernité, façonné avec précision.",
        "material": "PVC premium translucide, ferrure argent poli, cadenas signature",
        "price": 890.0,
        "currency": "EUR",
        "images": jelly_images,
        "variants": variants,
        "featured": True,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Promo
    if not await db.promos.find_one({"code": "NOVA10"}):
        await db.promos.insert_one({
            "id": str(uuid.uuid4()),
            "code": "NOVA10",
            "percent_off": 10.0,
            "active": True,
        })
    return {"ok": True, "seeded": True}

# ---------- Register app ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("nova")

@app.on_event("startup")
async def _startup():
    try:
        await seed()
        logger.info("Nova seed executed.")
    except Exception as e:
        logger.warning(f"Seed failed: {e}")

@app.on_event("shutdown")
async def _shutdown():
    client.close()
    sync_client.close()
