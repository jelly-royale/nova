"""Iteration 4 backend tests — revert edition badge & stock, hero image update, regression on iteration 3 features."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@novamilan.com"
ADMIN_PASSWORD = "NovaAdmin2026!"


def _uniq():
    return f"TEST_{uuid.uuid4().hex[:10]}@example.com"


@pytest.fixture(scope="session")
def admin_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------------- Jelly product: edition REMOVED + images from customer-assets ----------------
class TestJellyReverted:
    def test_jelly_detail_no_edition_field(self):
        r = requests.get(f"{API}/products/jelly", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # edition either not present, or null/empty
        edition = data.get("edition")
        assert edition in (None, "", False), f"Jelly still has edition: {edition!r}"

    def test_jelly_list_no_edition_field(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        jelly = next((p for p in r.json() if p.get("slug") == "jelly"), None)
        assert jelly is not None
        edition = jelly.get("edition")
        assert edition in (None, "", False), f"Jelly list still has edition: {edition!r}"

    def test_jelly_has_6_customer_asset_images(self):
        r = requests.get(f"{API}/products/jelly", timeout=15)
        data = r.json()
        images = data.get("images") or []
        assert len(images) == 6, f"expected 6 images, got {len(images)}: {images}"
        for img in images:
            assert "customer-assets" in img and "emergentagent" in img, f"non customer-asset image: {img}"
            assert "unsplash" not in img.lower()

    def test_jelly_core_fields_intact(self):
        r = requests.get(f"{API}/products/jelly", timeout=15)
        data = r.json()
        assert data.get("name") == "Jelly"
        assert float(data.get("price")) == 890.0
        variants = data.get("variants") or []
        assert len(variants) == 9, f"expected 9 variants, got {len(variants)}"


# ---------------- Regression on iteration 3 features ----------------
class TestGoogleSessionRegression:
    def test_invalid_session_id_returns_401(self):
        r = requests.post(f"{API}/auth/google/session", json={"session_id": "invalid_fake_id_xxx"}, timeout=20)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"


class TestPasswordResetRegression:
    email = None

    def test_register_no_crash_email_noop(self):
        TestPasswordResetRegression.email = _uniq()
        r = requests.post(f"{API}/auth/register", json={
            "email": TestPasswordResetRegression.email, "password": "Passw0rd!",
            "first_name": "T", "last_name": "U"
        }, timeout=15)
        assert r.status_code == 200, r.text

    def test_password_reset_request_ok(self):
        r = requests.post(f"{API}/auth/password-reset/request",
                          json={"email": TestPasswordResetRegression.email}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_password_reset_request_nonexistent_ok(self):
        r = requests.post(f"{API}/auth/password-reset/request",
                          json={"email": f"nonex_{uuid.uuid4().hex[:6]}@example.com"}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_password_reset_confirm_bad_token_400(self):
        r = requests.post(f"{API}/auth/password-reset/confirm",
                          json={"token": "not_a_real_token_xxx", "new_password": "Whatever12"}, timeout=15)
        assert r.status_code == 400


# ---------------- General regression ----------------
class TestGeneral:
    def test_products_list(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0

    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200

    def test_public_settings_no_leak(self):
        r = requests.get(f"{API}/settings/public", timeout=15)
        assert r.status_code == 200
        blob = str(r.json()).lower()
        for forbidden in ["company_info", "siret", "kone ismael", "denfert", "994 632 701", "contact@novamilan.com"]:
            assert forbidden not in blob, f"leak: {forbidden}"

    def test_admin_settings_has_company_info(self, admin_headers):
        r = requests.get(f"{API}/admin/settings", headers=admin_headers, timeout=15)
        # Might be /api/settings/admin or /api/admin/settings; try both
        if r.status_code == 404:
            r = requests.get(f"{API}/settings/admin", headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        blob = str(r.json()).lower()
        # At least one of these private fields should be present on admin view
        assert "kone" in blob or "siret" in blob or "denfert" in blob or "company_info" in blob, (
            "admin settings does not expose private company_info"
        )

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
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com"), data["checkout_url"]

    def test_admin_analytics(self, admin_headers):
        r = requests.get(f"{API}/admin/analytics", headers=admin_headers, timeout=15)
        assert r.status_code == 200
