"""
Fleet app test suite
====================
Covers:
  - Vehicle CRUD (list, retrieve, create, update, partial_update, destroy)
  - Driver  CRUD (list, retrieve, create, update, partial_update, destroy)
  - Custom actions: /available/ and /eligible/
  - Filtering, search, and ordering query params
  - Role-based permission enforcement (401 / 403)
  - Serializer validation (duplicate reg, bad capacity, score range, etc.)
  - Soft-delete behaviour on vehicles (retire, not hard-delete)

Run with:
    python manage.py test fleet
"""

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Vehicle, Driver

User = get_user_model()


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def make_token(user):
    """Return a Bearer-ready access token string for *user*."""
    return str(RefreshToken.for_user(user).access_token)


def auth(user):
    """Return an Authorization header dict for use in APIClient calls."""
    return {"HTTP_AUTHORIZATION": f"Bearer {make_token(user)}"}


def make_user(email, role, password="pass1234"):
    u = User.objects.create_user(
        username=email.split("@")[0],
        email=email,
        password=password,
        role=role,
    )
    return u


def make_vehicle(**kwargs):
    defaults = dict(
        registration_number="TEST-001",
        model_name="Test Van",
        vehicle_type="Van",
        max_load_capacity=1000.0,
        odometer=0.0,
        acquisition_cost=30000.0,
        status="Available",
        region="North",
    )
    defaults.update(kwargs)
    return Vehicle.objects.create(**defaults)


def make_driver(**kwargs):
    defaults = dict(
        name="Test Driver",
        license_number="LIC-001",
        license_category="Class A",
        license_expiry=date.today() + timedelta(days=365),
        contact_number="+1-555-0000",
        safety_score=90.0,
        status="Available",
    )
    defaults.update(kwargs)
    return Driver.objects.create(**defaults)


# ---------------------------------------------------------------------------
# Base test case with four role users always available
# ---------------------------------------------------------------------------

class FleetTestBase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.fleet_mgr   = make_user("fleet@t.com",   "Fleet Manager")
        cls.driver_user = make_user("driver@t.com",  "Driver")
        cls.safety      = make_user("safety@t.com",  "Safety Officer")
        cls.analyst     = make_user("finance@t.com", "Financial Analyst")


# ===========================================================================
# VEHICLE TESTS
# ===========================================================================

class VehicleListTests(FleetTestBase):
    """GET /api/vehicles/"""

    def setUp(self):
        self.v1 = make_vehicle(registration_number="MH-VAN-001", vehicle_type="Van",   status="Available", region="North")
        self.v2 = make_vehicle(registration_number="MH-TRK-001", vehicle_type="Truck", status="On Trip",   region="South", model_name="Big Truck")
        self.v3 = make_vehicle(registration_number="MH-VAN-002", vehicle_type="Van",   status="In Shop",   region="North")
        self.url = "/api/vehicles/"

    def test_unauthenticated_returns_401(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_any_role_can_list(self):
        for user in (self.fleet_mgr, self.driver_user, self.safety, self.analyst):
            r = self.client.get(self.url, **auth(user))
            self.assertEqual(r.status_code, status.HTTP_200_OK, msg=user.role)

    def test_list_returns_all_vehicles(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertEqual(r.data["count"], 3)

    def test_filter_by_status(self):
        r = self.client.get(self.url + "?status=Available", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)
        self.assertEqual(r.data["results"][0]["registration_number"], "MH-VAN-001")

    def test_filter_by_vehicle_type(self):
        r = self.client.get(self.url + "?vehicle_type=Van", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 2)

    def test_filter_by_region(self):
        r = self.client.get(self.url + "?region=South", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)

    def test_search_by_model_name(self):
        r = self.client.get(self.url + "?search=big", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)
        self.assertEqual(r.data["results"][0]["registration_number"], "MH-TRK-001")

    def test_search_by_registration_number(self):
        r = self.client.get(self.url + "?search=TRK", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)

    def test_ordering_by_odometer(self):
        Vehicle.objects.filter(registration_number="MH-VAN-001").update(odometer=500)
        Vehicle.objects.filter(registration_number="MH-TRK-001").update(odometer=100)
        r = self.client.get(self.url + "?ordering=odometer", **auth(self.driver_user))
        odos = [v["odometer"] for v in r.data["results"]]
        self.assertEqual(odos, sorted(odos))

    def test_ordering_by_acquisition_cost_desc(self):
        r = self.client.get(self.url + "?ordering=-acquisition_cost", **auth(self.driver_user))
        costs = [v["acquisition_cost"] for v in r.data["results"]]
        self.assertEqual(costs, sorted(costs, reverse=True))

    def test_invalid_ordering_falls_back_to_default(self):
        # Should not raise — unknown ordering silently uses -created_at
        r = self.client.get(self.url + "?ordering=injected_field", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class VehicleRetrieveTests(FleetTestBase):
    """GET /api/vehicles/{id}/"""

    def setUp(self):
        self.v = make_vehicle()

    def test_retrieve_returns_detail_serializer_fields(self):
        r = self.client.get(f"/api/vehicles/{self.v.pk}/", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        for field in ("trip_count", "image_url", "created_at"):
            self.assertIn(field, r.data)

    def test_retrieve_nonexistent_returns_404(self):
        r = self.client.get("/api/vehicles/99999/", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_trip_count_is_zero_for_new_vehicle(self):
        r = self.client.get(f"/api/vehicles/{self.v.pk}/", **auth(self.driver_user))
        self.assertEqual(r.data["trip_count"], 0)


class VehicleCreateTests(FleetTestBase):
    """POST /api/vehicles/"""

    def setUp(self):
        self.url = "/api/vehicles/"
        self.payload = {
            "registration_number": "NEW-VAN-001",
            "model_name": "New Van",
            "vehicle_type": "Van",
            "max_load_capacity": 800.0,
            "odometer": 0.0,
            "acquisition_cost": 40000.0,
            "status": "Available",
            "region": "East",
        }

    def test_fleet_manager_can_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_registration_number_uppercased(self):
        payload = {**self.payload, "registration_number": "new-van-lower"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["registration_number"], "NEW-VAN-LOWER")

    def test_driver_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_safety_officer_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_financial_analyst_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.analyst))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_registration_returns_400(self):
        make_vehicle(registration_number="DUPE-001")
        payload = {**self.payload, "registration_number": "DUPE-001"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_number", r.data)

    def test_zero_max_load_capacity_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "max_load_capacity": 0}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_negative_max_load_capacity_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "max_load_capacity": -500}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_zero_acquisition_cost_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "acquisition_cost": 0}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_vehicle_type_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "vehicle_type": "Motorbike"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_status_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "status": "Broken"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_required_fields_returns_400(self):
        r = self.client.post(self.url, {"model_name": "Incomplete"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_optional_image_url_accepted(self):
        payload = {**self.payload, "registration_number": "IMG-001", "image_url": "https://example.com/van.jpg"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["image_url"], "https://example.com/van.jpg")


class VehicleUpdateTests(FleetTestBase):
    """PUT and PATCH /api/vehicles/{id}/"""

    def setUp(self):
        self.v = make_vehicle(registration_number="UPD-001")
        self.url = f"/api/vehicles/{self.v.pk}/"
        self.full_payload = {
            "registration_number": "UPD-001",
            "model_name": "Updated Van",
            "vehicle_type": "Van",
            "max_load_capacity": 900.0,
            "odometer": 5000.0,
            "acquisition_cost": 35000.0,
            "status": "In Shop",
            "region": "South",
        }

    def test_fleet_manager_can_full_update(self):
        r = self.client.put(self.url, self.full_payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["model_name"], "Updated Van")

    def test_fleet_manager_can_partial_update(self):
        r = self.client.patch(self.url, {"odometer": 9999.0}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.v.refresh_from_db()
        self.assertEqual(self.v.odometer, 9999.0)

    def test_driver_cannot_update(self):
        r = self.client.patch(self.url, {"odometer": 1.0}, format="json", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_duplicate_registration_on_update(self):
        make_vehicle(registration_number="OTHER-001")
        r = self.client.patch(self.url, {"registration_number": "OTHER-001"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_same_registration_on_update_is_allowed(self):
        """A vehicle can be updated keeping its own registration number."""
        r = self.client.patch(self.url, {"registration_number": "UPD-001"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class VehicleDestroyTests(FleetTestBase):
    """DELETE /api/vehicles/{id}/ — soft-retire"""

    def setUp(self):
        self.v = make_vehicle(registration_number="DEL-001", status="Available")
        self.url = f"/api/vehicles/{self.v.pk}/"

    def test_fleet_manager_can_retire(self):
        r = self.client.delete(self.url, **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("retired", r.data["detail"].lower())

    def test_retire_sets_status_to_retired(self):
        self.client.delete(self.url, **auth(self.fleet_mgr))
        self.v.refresh_from_db()
        self.assertEqual(self.v.status, "Retired")

    def test_vehicle_still_exists_after_retire(self):
        """Soft-delete — record must not be removed from DB."""
        self.client.delete(self.url, **auth(self.fleet_mgr))
        self.assertTrue(Vehicle.objects.filter(pk=self.v.pk).exists())

    def test_retiring_already_retired_returns_400(self):
        self.v.status = "Retired"
        self.v.save()
        r = self.client.delete(self.url, **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_driver_cannot_retire(self):
        r = self.client.delete(self.url, **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_safety_officer_cannot_retire(self):
        r = self.client.delete(self.url, **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class VehicleAvailableActionTests(FleetTestBase):
    """GET /api/vehicles/available/"""

    def setUp(self):
        self.v_avail   = make_vehicle(registration_number="AV-001", status="Available")
        self.v_ontrip  = make_vehicle(registration_number="AV-002", status="On Trip")
        self.v_inshop  = make_vehicle(registration_number="AV-003", status="In Shop")
        self.v_retired = make_vehicle(registration_number="AV-004", status="Retired")
        self.url = "/api/vehicles/available/"

    def test_returns_only_available_vehicles(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        registrations = [v["registration_number"] for v in r.data]
        self.assertIn("AV-001", registrations)
        self.assertNotIn("AV-002", registrations)
        self.assertNotIn("AV-003", registrations)
        self.assertNotIn("AV-004", registrations)

    def test_unauthenticated_returns_401(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_response_is_a_list_not_paginated(self):
        """The custom action returns a plain list, not a paginated dict."""
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertIsInstance(r.data, list)


# ===========================================================================
# DRIVER TESTS
# ===========================================================================

class DriverListTests(FleetTestBase):
    """GET /api/drivers/"""

    def setUp(self):
        self.d1 = make_driver(name="Alice", license_number="LIC-A", status="Available",  license_category="Class A", safety_score=90)
        self.d2 = make_driver(name="Bob",   license_number="LIC-B", status="On Trip",    license_category="Class B", safety_score=75)
        self.d3 = make_driver(name="Alice2",license_number="LIC-C", status="Suspended",  license_category="Class A", safety_score=40)
        self.url = "/api/drivers/"

    def test_unauthenticated_returns_401(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_any_role_can_list(self):
        for user in (self.fleet_mgr, self.driver_user, self.safety, self.analyst):
            r = self.client.get(self.url, **auth(user))
            self.assertEqual(r.status_code, status.HTTP_200_OK, msg=user.role)

    def test_list_returns_all_drivers(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertEqual(r.data["count"], 3)

    def test_filter_by_status(self):
        r = self.client.get(self.url + "?status=On+Trip", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)
        self.assertEqual(r.data["results"][0]["name"], "Bob")

    def test_filter_by_license_category(self):
        r = self.client.get(self.url + "?license_category=Class+A", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 2)

    def test_search_by_name(self):
        r = self.client.get(self.url + "?search=alice", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 2)

    def test_search_by_license_number(self):
        r = self.client.get(self.url + "?search=LIC-B", **auth(self.driver_user))
        self.assertEqual(r.data["count"], 1)

    def test_ordering_by_safety_score_asc(self):
        r = self.client.get(self.url + "?ordering=safety_score", **auth(self.driver_user))
        scores = [d["safety_score"] for d in r.data["results"]]
        self.assertEqual(scores, sorted(scores))

    def test_ordering_by_safety_score_desc(self):
        r = self.client.get(self.url + "?ordering=-safety_score", **auth(self.driver_user))
        scores = [d["safety_score"] for d in r.data["results"]]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_list_includes_is_license_expired_field(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertIn("is_license_expired", r.data["results"][0])


class DriverRetrieveTests(FleetTestBase):
    """GET /api/drivers/{id}/"""

    def setUp(self):
        self.d_eligible = make_driver(
            name="Eligible Driver",
            license_number="LIC-E",
            status="Available",
            license_expiry=date.today() + timedelta(days=100),
        )
        self.d_expired = make_driver(
            name="Expired Driver",
            license_number="LIC-X",
            status="Available",
            license_expiry=date.today() - timedelta(days=1),
        )

    def test_retrieve_contains_detail_fields(self):
        r = self.client.get(f"/api/drivers/{self.d_eligible.pk}/", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        for field in ("contact_number", "is_license_expired", "is_eligible_for_trip", "avatar_url"):
            self.assertIn(field, r.data)

    def test_eligible_driver_flags(self):
        r = self.client.get(f"/api/drivers/{self.d_eligible.pk}/", **auth(self.driver_user))
        self.assertFalse(r.data["is_license_expired"])
        self.assertTrue(r.data["is_eligible_for_trip"])

    def test_expired_license_driver_not_eligible(self):
        r = self.client.get(f"/api/drivers/{self.d_expired.pk}/", **auth(self.driver_user))
        self.assertTrue(r.data["is_license_expired"])
        self.assertFalse(r.data["is_eligible_for_trip"])

    def test_retrieve_nonexistent_returns_404(self):
        r = self.client.get("/api/drivers/99999/", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


class DriverCreateTests(FleetTestBase):
    """POST /api/drivers/"""

    def setUp(self):
        self.url = "/api/drivers/"
        self.payload = {
            "name": "New Driver",
            "license_number": "NEW-LIC-001",
            "license_category": "Class B",
            "license_expiry": str(date.today() + timedelta(days=365)),
            "contact_number": "+1-555-1234",
            "safety_score": 88.0,
            "status": "Available",
        }

    def test_fleet_manager_can_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_safety_officer_can_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_driver_role_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_financial_analyst_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json", **auth(self.analyst))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create(self):
        r = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_license_number_uppercased(self):
        payload = {**self.payload, "license_number": "new-lic-lower"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["license_number"], "NEW-LIC-LOWER")

    def test_duplicate_license_number_returns_400(self):
        make_driver(license_number="DUPE-LIC")
        payload = {**self.payload, "license_number": "DUPE-LIC"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_number", r.data)

    def test_safety_score_above_100_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "safety_score": 101}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_safety_score_below_0_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "safety_score": -1}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_safety_score_boundary_0_accepted(self):
        payload = {**self.payload, "license_number": "SCORE-ZERO", "safety_score": 0}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_safety_score_boundary_100_accepted(self):
        payload = {**self.payload, "license_number": "SCORE-100", "safety_score": 100}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_invalid_license_category_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "license_category": "Class E"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_status_returns_400(self):
        r = self.client.post(self.url, {**self.payload, "status": "Vacationing"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_required_fields_returns_400(self):
        r = self.client.post(self.url, {"name": "Incomplete"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_optional_avatar_url_accepted(self):
        payload = {**self.payload, "license_number": "AVT-001", "avatar_url": "https://example.com/avatar.jpg"}
        r = self.client.post(self.url, payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)


class DriverUpdateTests(FleetTestBase):
    """PUT and PATCH /api/drivers/{id}/"""

    def setUp(self):
        self.d = make_driver(license_number="UPD-LIC", safety_score=80, status="Available")
        self.url = f"/api/drivers/{self.d.pk}/"
        self.full_payload = {
            "name": "Updated Driver",
            "license_number": "UPD-LIC",
            "license_category": "Class A",
            "license_expiry": str(date.today() + timedelta(days=200)),
            "contact_number": "+1-555-9999",
            "safety_score": 95.0,
            "status": "Off Duty",
        }

    def test_fleet_manager_can_full_update(self):
        r = self.client.put(self.url, self.full_payload, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_safety_officer_can_partial_update_score(self):
        r = self.client.patch(self.url, {"safety_score": 55.0}, format="json", **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.d.refresh_from_db()
        self.assertEqual(self.d.safety_score, 55.0)

    def test_safety_officer_can_change_status(self):
        r = self.client.patch(self.url, {"status": "Suspended"}, format="json", **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_driver_role_cannot_update(self):
        r = self.client.patch(self.url, {"safety_score": 10}, format="json", **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_analyst_cannot_update(self):
        r = self.client.patch(self.url, {"safety_score": 10}, format="json", **auth(self.analyst))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_set_duplicate_license_on_update(self):
        make_driver(license_number="OTHER-LIC")
        r = self.client.patch(self.url, {"license_number": "OTHER-LIC"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_same_license_on_update_is_allowed(self):
        r = self.client.patch(self.url, {"license_number": "UPD-LIC"}, format="json", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class DriverDestroyTests(FleetTestBase):
    """DELETE /api/drivers/{id}/ — hard delete"""

    def setUp(self):
        self.d = make_driver(license_number="DEL-LIC")
        self.url = f"/api/drivers/{self.d.pk}/"

    def test_fleet_manager_can_delete(self):
        r = self.client.delete(self.url, **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_driver_hard_deleted_from_db(self):
        self.client.delete(self.url, **auth(self.fleet_mgr))
        self.assertFalse(Driver.objects.filter(pk=self.d.pk).exists())

    def test_safety_officer_cannot_delete(self):
        r = self.client.delete(self.url, **auth(self.safety))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_driver_role_cannot_delete(self):
        r = self.client.delete(self.url, **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_analyst_cannot_delete(self):
        r = self.client.delete(self.url, **auth(self.analyst))
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_nonexistent_returns_404(self):
        r = self.client.delete("/api/drivers/99999/", **auth(self.fleet_mgr))
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


class DriverEligibleActionTests(FleetTestBase):
    """GET /api/drivers/eligible/"""

    def setUp(self):
        today = date.today()
        # Should appear
        self.d_ok = make_driver(name="OK",      license_number="EL-OK",  status="Available", license_expiry=today + timedelta(days=1))
        # Should NOT appear — expired license despite Available status
        self.d_exp = make_driver(name="Expired", license_number="EL-EXP", status="Available", license_expiry=today - timedelta(days=1))
        # Should NOT appear — on trip
        self.d_trip = make_driver(name="OnTrip",  license_number="EL-TR",  status="On Trip",  license_expiry=today + timedelta(days=100))
        # Should NOT appear — suspended
        self.d_susp = make_driver(name="Susp",    license_number="EL-SU",  status="Suspended",license_expiry=today + timedelta(days=100))
        # Should NOT appear — off duty
        self.d_off  = make_driver(name="Off",     license_number="EL-OFF", status="Off Duty", license_expiry=today + timedelta(days=100))
        self.url = "/api/drivers/eligible/"

    def test_returns_only_eligible_drivers(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        names = [d["name"] for d in r.data]
        self.assertIn("OK", names)
        self.assertNotIn("Expired", names)
        self.assertNotIn("OnTrip", names)
        self.assertNotIn("Susp", names)
        self.assertNotIn("Off", names)

    def test_response_is_a_plain_list(self):
        r = self.client.get(self.url, **auth(self.driver_user))
        self.assertIsInstance(r.data, list)

    def test_unauthenticated_returns_401(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_any_role_can_access(self):
        for user in (self.fleet_mgr, self.driver_user, self.safety, self.analyst):
            r = self.client.get(self.url, **auth(user))
            self.assertEqual(r.status_code, status.HTTP_200_OK, msg=user.role)

    def test_expiry_today_is_eligible(self):
        """A license expiring exactly today is still valid (expiry >= today)."""
        d = make_driver(name="TodayExp", license_number="EL-TODAY",
                        status="Available", license_expiry=date.today())
        r = self.client.get(self.url, **auth(self.driver_user))
        names = [d["name"] for d in r.data]
        self.assertIn("TodayExp", names)
