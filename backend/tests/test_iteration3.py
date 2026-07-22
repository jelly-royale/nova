"""Iteration 3 backend tests — emails (deferred), Google OAuth session, password reset, edition badge/stock, regressions."""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nova-digital-maison.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@novamilan.com"
ADMIN_PASSWORD = "NovaAdmin2026!"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "nova_milan")
_mc = MongoClient(MONGO_URL)
_db = _mc[DB_NAME]


def _unique_email():
    return f"TEST_{uuid.uuid4().hex[:10]}@example.com"


@pytest.fixture(scope="session")
def admin_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------------- Register triggers welcome email (no crash w/o RESEND_API_KEY) ----------------
class TestRegisterWelcomeEmail:
    def test_register_returns_token_and_no_crash(self):
        email = _unique_email()
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Passw0rd!", "first_name": "T", "last_name": "U"
        }, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and data["user"]["email"] == email.lower()
        # cleanup
        _db.users.delete_one({"email": email.lower()})


# ---------------- Password reset ----------------
class TestPasswordReset:
    email = None
    password = "Origpass1!"
    new_password = "Newpass1234!"
    token = None

    def test_setup_user(self):
        TestPasswordReset.email = _unique_email().lower()
        r = requests.post(f"{API}/auth/register", json={
            "email": TestPasswordReset.email, "password": TestPasswordReset.password,
            "first_name": "R", "last_name": "S"
        }, timeout=15)
        assert r.status_code == 200

    def test_request_existing_returns_ok(self):
        r = requests.post(f"{API}/auth/password-reset/request", json={"email": TestPasswordReset.email}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_request_nonexistent_returns_ok(self):
        r = requests.post(f"{API}/auth/password-reset/request",
                          json={"email": f"nonexistent_{uuid.uuid4().hex[:8]}@example.com"}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_token_persisted_in_db(self):
        # small delay to allow insert
        time.sleep(0.5)
        rec = _db.password_resets.find_one({"email": TestPasswordReset.email, "used": False}, sort=[("created_at", -1)])
        assert rec is not None, "password_resets row missing"
        assert "token" in rec and "user_id" in rec and "expires_at" in rec
        TestPasswordReset.token = rec["token"]

    def test_confirm_with_invalid_token_returns_400(self):
        r = requests.post(f"{API}/auth/password-reset/confirm",
                          json={"token": "not_a_real_token_xxx", "new_password": "Whatever12"}, timeout=15)
        assert r.status_code == 400

    def test_confirm_with_valid_token_resets_password(self):
        assert TestPasswordReset.token, "prior test must have set token"
        r = requests.post(f"{API}/auth/password-reset/confirm",
                          json={"token": TestPasswordReset.token, "new_password": TestPasswordReset.new_password}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    def test_login_with_new_password(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": TestPasswordReset.email, "password": TestPasswordReset.new_password}, timeout=15)
        assert r.status_code == 200, r.text
        assert "token" in r.json()

    def test_reuse_token_returns_400(self):
        # token should now be used=True
        r = requests.post(f"{API}/auth/password-reset/confirm",
                          json={"token": TestPasswordReset.token, "new_password": "AnotherPass1!"}, timeout=15)
        assert r.status_code == 400

    def test_cleanup(self):
        _db.users.delete_one({"email": TestPasswordReset.email})
        _db.password_resets.delete_many({"email": TestPasswordReset.email})


# ---------------- Google Auth session exchange ----------------
class TestGoogleSession:
    def test_invalid_session_id_returns_401(self):
        r = requests.post(f"{API}/auth/google/session", json={"session_id": "invalid_fake_id_xxx"}, timeout=20)
        # Emergent should reject → we should return 401 (not 500)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    def test_empty_session_id_returns_error(self):
        r = requests.post(f"{API}/auth/google/session", json={"session_id": ""}, timeout=20)
        assert r.status_code in (400, 401, 422)


# ---------------- Jelly edition + stock ----------------
class TestJellyEdition:
    def test_jelly_has_edition_and_stock(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        jelly = next((p for p in r.json() if p.get("slug") == "jelly"), None)
        assert jelly is not None, "Jelly product not found"
        assert jelly.get("edition") == "Édition Confidentielle", f"edition field wrong: {jelly.get('edition')}"
        variants = jelly.get("variants") or []
        assert variants, "Jelly has no variants"
        for v in variants:
            assert isinstance(v.get("stock"), int), f"variant {v.get('color_key')} missing stock int"


# ---------------- Regression ----------------
class TestRegression:
    def test_products_list(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200

    def test_public_settings_no_leak(self):
        r = requests.get(f"{API}/settings/public", timeout=15)
        assert r.status_code == 200
        blob = str(r.json()).lower()
        for forbidden in ["company_info", "siret", "kone ismael", "denfert"]:
            assert forbidden not in blob

    def test_promo_validate(self):
        r = requests.post(f"{API}/promo/validate", params={"code": "NOVA10"}, timeout=15)
        assert r.status_code == 200
        assert r.json().get("percent_off") == 10.0 or "code" in r.json()

    def test_admin_analytics(self, admin_headers):
        r = requests.get(f"{API}/admin/analytics", headers=admin_headers, timeout=15)
        assert r.status_code == 200

    def test_admin_orders(self, admin_headers):
        r = requests.get(f"{API}/admin/orders", headers=admin_headers, timeout=15)
        assert r.status_code == 200

    def test_checkout_creates_stripe_session(self):
        products = requests.get(f"{API}/products", timeout=15).json()
        jelly = next(p for p in products if p.get("slug") == "jelly")
        payload = {
            "origin_url": BASE_URL,
            "items": [{"product_id": jelly["id"], "color_key": jelly["variants"][0]["color_key"], "quantity": 1}],
            "address": {
                "full_name": "Test User", "line1": "1 rue Test", "city": "Paris",
                "postal_code": "75001", "country": "FR", "phone": "0102030405"
            },
            "email": "test@example.com",
        }
        r = requests.post(f"{API}/checkout", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "checkout_url" in data and "stripe.com" in data["checkout_url"]
