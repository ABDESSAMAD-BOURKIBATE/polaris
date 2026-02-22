import asyncio
import json
import random
import hashlib
import secrets
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

from .database import engine, SessionLocal, Base, get_db
from . import models

# Create tables
models.Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Security configuration (Simple implementation using standard library)
SALT = "POLARIS_SALT_X92" # In production, use a unique salt per user and secret env var
ACCESS_TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    """Simple SHA256 hashing with salt."""
    return hashlib.sha256((password + SALT).encode()).hexdigest()

app = FastAPI(
    title="POLARIS Cyber Intelligence API",
    description="Backend API with Real-time Live WebSocket streaming",
    version="1.0.2",
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str

class ProgressUpdate(BaseModel):
    data: Dict[str, Any]

# --- Database & Auth Support ---

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Restrict to admin:admin only as requested
    if user_data.username != "admin" or user_data.password != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: Specialized credentials required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure admin user exists in DB for foreign key relationships
    user = db.query(models.User).filter(models.User.username == "admin").first()
    if not user:
        user = models.User(username="admin", hashed_password=hash_password("admin"))
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate a simple token
    access_token = secrets.token_hex(32)
    expires_at = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Store token in DB
    db_token = models.Token(user_id=user.id, token=access_token, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- Progress Endpoints ---

@app.get("/user/progress")
async def get_progress(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    progress = db.query(models.Progress).filter(models.Progress.user_id == user.id).first()
    if not progress:
        return {"data": {}}
    return {"data": progress.data}

@app.put("/user/progress")
async def update_progress(username: str, update: ProgressUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    progress = db.query(models.Progress).filter(models.Progress.user_id == user.id).first()
    if not progress:
        progress = models.Progress(user_id=user.id, data=update.data)
        db.add(progress)
    else:
        progress.data = update.data
    
    db.commit()
    return {"status": "success"}

# --- Logs Endpoints ---

@app.get("/logs")
async def get_logs(db: Session = Depends(get_db)):
    logs = db.query(models.DailyLog).order_by(models.DailyLog.timestamp.desc()).limit(100).all()
    return logs

# --- WebSocket & Simulation ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message: {e}")

manager = ConnectionManager()

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {"status": "healthy", "service": "Live Engine Active"}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def live_data_generator():
    alert_counter = 4
    while True:
        try:
            current_time = datetime.now().strftime("%H:%M:%S")
            traffic_vol = random.randint(100, 5000)
            threats_vol = random.randint(0, 15)
            alert = None
            
            if random.random() > 0.8:
                threats_vol = random.randint(70, 100)
                traffic_vol = random.randint(10000, 50000)
                alert = {
                    "id": alert_counter,
                    "type": "Critical" if threats_vol > 90 else "High",
                    "source": "System Monitor",
                    "desc": f"CPU Spiked to {threats_vol}%! Potential DDoS block.",
                    "time": "Just now"
                }
                alert_counter += 1
            
            # Save significant alerts to DB
            if alert:
                db = SessionLocal()
                new_log = models.DailyLog(
                    type=alert["type"],
                    source=alert["source"],
                    description=alert["desc"]
                )
                db.add(new_log)
                db.commit()
                db.close()

            payload = {
                "type": "METRICS_UPDATE",
                "data": {
                    "time": current_time,
                    "threats": threats_vol,
                    "traffic": traffic_vol,
                },
                "alert": alert
            }
            
            if len(manager.active_connections) > 0:
                await manager.broadcast(json.dumps(payload))
                
        except Exception as e:
            logger.error(f"Live data generator error: {e}")

        await asyncio.sleep(2)

async def log_retention_task():
    """Deletes logs older than 7 days every 24 hours."""
    while True:
        try:
            logger.info("Running log retention task...")
            db = SessionLocal()
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            deleted_count = db.query(models.DailyLog).filter(models.DailyLog.timestamp < seven_days_ago).delete()
            db.commit()
            db.close()
            logger.info(f"Log retention task completed. Deleted {deleted_count} old logs.")
        except Exception as e:
            logger.error(f"Log retention task error: {e}")
        
        # Run every 24 hours
        await asyncio.sleep(24 * 3600)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(live_data_generator())
    asyncio.create_task(log_retention_task())
