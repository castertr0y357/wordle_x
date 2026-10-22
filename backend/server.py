from fastapi import FastAPI, APIRouter, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import sys
import time
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from observability import logger, metrics, set_debug_logging, is_debug_enabled

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Validate required configuration variables
required_env_vars = ["MONGO_URL", "DB_NAME", "JWT_SECRET_KEY"]
missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    logger.error(f"[Startup] - [Configuration] - Missing required environment variables: {', '.join(missing_vars)}")
    sys.exit(1)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# HTTP Middleware for Correlation ID, Latency, and Prometheus Metrics
class RequestObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID") or uuid.uuid4().hex
        request.state.correlation_id = correlation_id
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response.headers["X-Correlation-ID"] = correlation_id
            
            # Prometheus metrics tracking
            metrics.record_request(request.method, request.url.path, response.status_code)
            
            # Structured action log
            if not request.url.path.endswith("/metrics"):
                logger.info(
                    f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
                    extra={
                        "correlation_id": correlation_id,
                        "action": "http.request",
                        "context": {
                            "method": request.method,
                            "path": request.url.path,
                            "status_code": response.status_code,
                            "duration_ms": duration_ms
                        }
                    }
                )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            metrics.record_request(request.method, request.url.path, 500)
            logger.error(
                f"{request.method} {request.url.path} -> 500 Uncaught Exception ({duration_ms}ms): {exc}",
                exc_info=True,
                extra={
                    "correlation_id": correlation_id,
                    "action": "http.error",
                    "context": {
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": duration_ms
                    }
                }
            )
            raise

app.add_middleware(RequestObservabilityMiddleware)

# Kubernetes Probes & Health Endpoints
@app.get("/readyz")
@app.get("/livez")
@app.get("/healthz")
async def health_check():
    return Response(content="OK", media_type="text/plain")

# Prometheus /metrics endpoint
@app.get("/metrics")
async def get_metrics():
    return Response(
        content=metrics.generate_metrics(),
        media_type="text/plain; version=0.0.4; charset=utf-8"
    )

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Observability Debug Toggle endpoints
class DebugToggleRequest(BaseModel):
    enabled: bool

@api_router.get("/observability/debug")
async def get_debug_status():
    return {"debug_enabled": is_debug_enabled()}

@api_router.post("/observability/debug")
async def toggle_debug_logging(req: DebugToggleRequest):
    set_debug_logging(req.enabled)
    return {"debug_enabled": is_debug_enabled(), "message": f"Debug logging set to {req.enabled}"}

# Import routes
from routes import auth_router, profile_router, game_router, preferences_router

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include auth, profile, game, and preferences routers
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(game_router)
api_router.include_router(preferences_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_check():
    # 1. Self-healing pre-flight connection check with exponential backoff
    retries = 5
    delay = 1
    connected = False
    logger.info("[Startup] - [Database] - Initiating pre-flight connection check to MongoDB", extra={"action": "startup.database"})
    for i in range(retries):
        try:
            # Ping the database
            await client.admin.command('ping')
            connected = True
            logger.info("[Startup] - [Database] - Pre-flight connection check successful", extra={"action": "startup.database"})
            break
        except Exception as e:
            logger.warning(f"[Startup] - [Database] - Connection failed, retrying in {delay}s: {e}", extra={"action": "startup.database"})
            await asyncio.sleep(delay)
            delay *= 2
    
    if not connected:
        logger.error("[Startup] - [Database] - Could not establish connection to MongoDB after retries. Exiting.", extra={"action": "startup.database"})
        sys.exit(1)
        
    # 2. Database Relationships & Indexing initialization
    try:
        logger.info("[Startup] - [Database] - Initializing database indexes", extra={"action": "startup.database"})
        # users: Unique index on email and id
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        
        # user_stats: Unique index on user_id
        await db.user_stats.create_index("user_id", unique=True)
        
        # user_preferences: Unique index on user_id
        await db.user_preferences.create_index("user_id", unique=True)
        
        # game_sessions: Index on user_id
        await db.game_sessions.create_index("user_id")
        logger.info("[Startup] - [Database] - Database indexes initialized successfully", extra={"action": "startup.database"})
    except Exception as e:
        logger.error(f"[Startup] - [Database] - Failed to initialize database indexes: {e}", extra={"action": "startup.database"})

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("[Shutdown] - Closing MongoDB client connection", extra={"action": "shutdown.database"})
    client.close()
