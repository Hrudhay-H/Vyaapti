from flask import Flask, request, jsonify
import torch
import joblib
import numpy as np

emission_model = joblib.load("emission_model.pkl")

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    X = np.array([
        data["distance_km"],
        data["vehicle_encoded"],
        data["congestion_encoded"]
    ]).reshape(1, -1)

    co2_pred = emission_model.predict(X)[0]
    delay_risk = 1 if data["avg_delay_hr"] > 4 else 0

    return jsonify({
        "co2_kg": round(co2_pred, 2),
        "delay_risk": delay_risk
    })

if __name__ == '__main__':
    app.run(debug=True)