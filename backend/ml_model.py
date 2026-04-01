import joblib
import pandas as pd

model = joblib.load("severity_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

def predict_severity(cpu: int, memory: int, disk: int, alert_type: str):
    df = pd.DataFrame([{
        "cpu": cpu,
        "memory": memory,
        "disk": disk,
        "alert_type": alert_type
    }])
    pred = model.predict(df)
    return label_encoder.inverse_transform(pred)[0]
