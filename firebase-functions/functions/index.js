const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

exports.runPrediction = functions.firestore
  .document("shipments/{docId}")
  .onCreate(async (snap, context) => {
    const shipment = snap.data();

    try {
      const response = await axios.post("https://your-cloud-api-url/predict", {
        distance_km: shipment.distance_km,
        vehicle_encoded: shipment.vehicle_encoded,
        congestion_encoded: shipment.congestion_encoded,
        avg_delay_hr: shipment.avg_delay_hr || 0
      });

      const { co2_kg, delay_risk } = response.data;

      await snap.ref.update({
        co2_prediction: co2_kg,
        delay_risk: delay_risk
      });

    } catch (err) {
      console.error("Prediction failed:", err);
      await snap.ref.update({ error: "Prediction failed" });
    }
  });