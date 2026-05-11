# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import joblib
import base64
import io
# pyrefly: ignore [missing-import]
from PIL import Image
import pandas as pd

# Import your feature functions
from src.preprocessing import preprocess_image_for_features
from src.roberts_features import extract_roberts_features
from src.texture_features import extract_texture_features
from src.colony_features import extract_colony_features
from src.config import MODEL_PATH, DECISION_THRESHOLD

app = Flask(__name__)
CORS(app)

print("🔄 Loading model...")

bundle = joblib.load(MODEL_PATH)
model = bundle["pipeline"]
feature_columns = bundle["feature_columns"]

print("✅ Model loaded")

# ===========================
# HELPER: decode image
# ===========================
def decode_image(image_base64):
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    image_bytes = base64.b64decode(image_base64)
    img = Image.open(io.BytesIO(image_bytes))
    return img

# ===========================
# FEATURE PIPELINE
# ===========================
def extract_features(img, agar, time_hr):
    # Preprocess
    img_gray, mask = preprocess_image_for_features(img)

    # Feature extraction
    f1 = extract_roberts_features(img_gray, mask)
    f2 = extract_texture_features(img_gray, mask)
    f3 = extract_colony_features(img_gray, mask)

    features = {**f1, **f2, **f3}

    # Add metadata
    features["agar"] = agar
    features["time_hr"] = time_hr

    df = pd.DataFrame([features])

    # Align columns
    df = df.reindex(columns=feature_columns, fill_value=0)

    return df

# ===========================
# API
# ===========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        image_base64 = data.get("image")
        agar = data.get("agar", "Blood")
        colony_age = data.get("colony_age", "48")

        if not image_base64:
            return jsonify({"error": "No image"}), 400

        # Extract time
        time_hr = int(''.join(filter(str.isdigit, colony_age)))

        # Decode image
        img = decode_image(image_base64)

        # Extract features
        X = extract_features(img, agar, time_hr)

        # Predict
        # Note: In alphabetical sorting, 'B. pseudomallei' is class 0, 'Other' is class 1.
        prob = model.predict_proba(X)[0][0]

        # Apply threshold
        is_bpseudo = prob >= DECISION_THRESHOLD

        # Confidence logic
        if is_bpseudo:
            confidence = prob
            result = "Probably Burkholderia pseudomallei"
        else:
            confidence = 1 - prob
            result = "Not Burkholderia pseudomallei"

        return jsonify({
            "result": result,
            "confidence": round(confidence * 100, 2),
            "raw_probability": round(prob, 4),
            "threshold": DECISION_THRESHOLD,
            "is_bpseudo": bool(is_bpseudo),
            "metadata": {
                "agar": agar,
                "colony_age": colony_age,
                "time_hours": time_hr,
                "characteristics": data.get("characteristics", [])
            },
            "interpretation": "High probability of B. pseudomallei" if is_bpseudo else "Low probability of B. pseudomallei",
            "recommendations": [
                "Proceed with standard confirmation protocols" if is_bpseudo else "Consider alternative diagnoses"
            ]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ===========================
# HEALTH
# ===========================
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": True,
        "threshold": DECISION_THRESHOLD
    })

# ===========================
# RUN
# ===========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)