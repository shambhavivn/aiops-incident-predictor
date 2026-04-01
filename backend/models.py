from sqlalchemy import Column, Integer, String
from database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    cpu = Column(Integer)
    memory = Column(Integer)
    disk = Column(Integer)
    alert_type = Column(String, index=True)
    predicted_severity = Column(String, index=True)
