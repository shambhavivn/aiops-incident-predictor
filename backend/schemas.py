from pydantic import BaseModel

class AlertCreate(BaseModel):
    cpu: int
    memory: int
    disk: int
    alert_type: str

class AlertResponse(AlertCreate):
    id: int
    predicted_severity: str

    class Config:
        from_attributes = True
