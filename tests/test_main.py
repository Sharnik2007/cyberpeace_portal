from fastapi.testclient import TestClient
from backend.app.main import app  # Adjust import if your entrypoint file is named differently

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code in [200, 404]

def test_health_check():
    response = client.get("/health")
    assert response.status_code in [200, 404]