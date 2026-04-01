from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Base, Alert
from schemas import AlertCreate, AlertResponse
from ml_model import predict_severity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIOps Incident Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def health():
    return {"message": "Backend is running"}

@app.post("/predict", response_model=AlertResponse)
def create_prediction(alert: AlertCreate, db: Session = Depends(get_db)):
    severity = predict_severity(
        alert.cpu, alert.memory, alert.disk, alert.alert_type
    )

    db_alert = Alert(
        cpu=alert.cpu,
        memory=alert.memory,
        disk=alert.disk,
        alert_type=alert.alert_type,
        predicted_severity=severity
    )

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return db_alert

@app.get("/alerts", response_model=list[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()
