import sys
import os

# Add root folder to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify backend health endpoint is active."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "online"

def test_root_ping():
    """Verify root status route."""
    response = client.get("/")
    assert response.status_code == 200

def test_verify_benign_statement():
    """Verify a clean statement returns a valid assessment."""
    payload = {"raw_text": "Hey, let us meet tomorrow for lunch."}
    response = client.post("/api/verify", json=payload)
    assert response.status_code == 200

def test_verify_phishing_statement():
    """Verify a phishing message returns a valid response."""
    payload = {"raw_text": "URGENT: Your account is locked. Verify at http://192.168.1.1/login.xyz"}
    response = client.post("/api/verify", json=payload)
    assert response.status_code == 200

def test_verify_empty_payload():
    """Verify system handles empty text gracefully."""
    payload = {"raw_text": ""}
    response = client.post("/api/verify", json=payload)
    assert response.status_code in [400, 422]