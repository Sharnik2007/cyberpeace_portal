import sys
import os
import time
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root and app directory are explicitly in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from app.engine import AdvancedThreatEngine
except ModuleNotFoundError:
    from engine import AdvancedThreatEngine

# Structured Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

app = FastAPI(
    title="CyberPeace Threat Intelligence API Platform",
    version="2.0.0",
    description="Enterprise Threat Intelligence Platform featuring NLP Vectorization, Lexical URL Analysis, and Multi-Factor Scoring."
)

# Enable CORS for React Frontend (localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve absolute path to models directory
MODEL_DIR = os.path.join(PROJECT_ROOT, "models")
engine = AdvancedThreatEngine(model_dir=MODEL_DIR)

# Simple In-Memory Rate Limiting Tracker
client_request_history = {}

@app.middleware("http")
async def rate_limiting_and_logging_middleware(request: Request, call_next):
    """Production Middleware for Rate Limiting & Performance Telemetry Logging."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    current_time = time.time()
    
    # Rate Limiting: Max 30 requests per minute per IP
    requests = client_request_history.get(client_ip, [])
    requests = [t for t in requests if current_time - t < 60]  # Sliding window 60s
    
    if len(requests) >= 30:
        logging.warning(f"Rate limit exceeded for IP: {client_ip}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Maximum 30 requests per minute allowed."}
        )
    
    requests.append(current_time)
    client_request_history[client_ip] = requests

    # Log Execution Latency
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logging.info(f"Path: {request.url.path} | Client: {client_ip} | Status: {response.status_code} | Latency: {process_time:.2f}ms")
    return response

class TelemetryPayload(BaseModel):
    raw_text: str = Field(..., example="URGENT: Verify account at http://192.168.1.1/login.php immediately!")

@app.get("/")
async def root_ping():
    """Root endpoint for basic ping test."""
    return {"message": "CyberPeace Threat Intelligence API is active", "version": "2.0.0"}

@app.get("/api/health")
async def health_check():
    """System Health Check Endpoint."""
    return {
        "status": "online",
        "engine_ready": getattr(engine, "classifier", None) is not None,
        "vectorizer_ready": getattr(engine, "vectorizer", None) is not None,
        "active_models": ["MultinomialNB", "LinearSVC", "LogisticRegression"]
    }

@app.post("/api/verify")
async def verify_telemetry(payload: TelemetryPayload):
    """Analyze text telemetry and perform multi-factor risk scoring."""
    if not payload.raw_text or not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Input telemetry payload cannot be empty.")

    try:
        assessment = engine.compute_risk_assessment(payload.raw_text)
        return assessment
    except Exception as e:
        logging.error(f"Error processing telemetry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Threat Intelligence Engine Error: {str(e)}")