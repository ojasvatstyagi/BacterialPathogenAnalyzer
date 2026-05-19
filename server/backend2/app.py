import sys
import os

# ============================================================
# Fix Windows console encoding
# Prevents crash if logs contain special characters.
# ============================================================
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify   
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import joblib
import base64
import io
# pyrefly: ignore [missing-import]
from PIL import Image
import pandas as pd

# ============================================================
# Import project feature extraction pipeline
# These MUST match the same feature extraction used in training.
# ============================================================
from src.preprocessing import preprocess_image_for_features
from src.roberts_features import extract_roberts_features
from src.texture_features import extract_texture_features
from src.colony_features import extract_colony_features
from src.config import MODEL_PATH, DECISION_THRESHOLD


# ============================================================
# Flask app setup
# ============================================================
app = Flask(__name__)
CORS(app)


# ============================================================
# Load trained model
# The saved model bundle contains:
# 1. pipeline          -> trained sklearn pipeline
# 2. feature_columns  -> exact feature order used during training
# ============================================================
print("[INFO] Loading model from:", MODEL_PATH)

try:
    bundle = joblib.load(MODEL_PATH)
    model = bundle["pipeline"]
    feature_columns = bundle["feature_columns"]

    print("[INFO] Model loaded successfully.")
    print("[INFO] Number of feature columns:", len(feature_columns))
    print("[INFO] Model classes:", list(model.classes_))
    print("[INFO] Decision threshold:", DECISION_THRESHOLD)

except Exception as e:
    print("[ERROR] Failed to load model:", str(e))
    model = None
    feature_columns = None


# ============================================================
# Helper: Decode base64 image from mobile/app request
# ============================================================
def decode_image(image_base64: str) -> Image.Image:
    """
    Converts base64 image string into PIL image.

    Input may be:
    - pure base64 string
    - data:image/png;base64,xxxxx
    """
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(image_base64)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return img


# ============================================================
# Helper: Extract numeric time from colony age
# Example:
# "48 hours" -> 48
# "72"       -> 72
# Missing    -> 48
# ============================================================
def parse_time_hours(colony_age) -> int:
    digits = "".join(filter(str.isdigit, str(colony_age)))
    return int(digits) if digits else 48


# ============================================================
# Feature pipeline
# This must be same as training:
# image -> preprocessing -> Roberts -> texture -> colony -> DataFrame
# ============================================================
def extract_features(img: Image.Image, agar: str, time_hr: int) -> pd.DataFrame:
    """
    Extracts all features from input image and metadata.

    Output DataFrame must have same columns/order as training.
    """
    # Preprocess image
    # Returns grayscale image and plate mask.
    img_gray, mask = preprocess_image_for_features(img)

    # Extract image features
    roberts_features = extract_roberts_features(img_gray, mask)
    texture_features = extract_texture_features(img_gray, mask)
    colony_features = extract_colony_features(img_gray, mask)

    # Combine all extracted features
    features = {
        **roberts_features,
        **texture_features,
        **colony_features,
    }

    # Add metadata features expected by the model
    features["agar"] = agar
    features["time_hr"] = time_hr

    # Convert to DataFrame
    df = pd.DataFrame([features])

    # Align feature columns exactly as model was trained
    # Missing columns are filled with 0.
    df = df.reindex(columns=feature_columns, fill_value=0)

    return df


# ============================================================
# Helper: Get probability of B. pseudomallei correctly
# IMPORTANT:
# During training:
# class 0 = not B. pseudomallei
# class 1 = B. pseudomallei
#
# Therefore we MUST use probability column for class label 1.
# ============================================================
def get_bpseudomallei_probability(X: pd.DataFrame) -> float:
    """
    Returns probability for class 1 = B. pseudomallei.
    """
    probas = model.predict_proba(X)[0]
    class_labels = list(model.classes_)

    if 1 not in class_labels:
        raise ValueError(
            f"Model does not contain class label 1. Found classes: {class_labels}"
        )

    bpseudo_index = class_labels.index(1)
    prob_bpseudo = float(probas[bpseudo_index])

    return prob_bpseudo


# ============================================================
# API: Health check
# ============================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok" if model is not None else "model_not_loaded",
            "model_loaded": model is not None,
            "threshold": DECISION_THRESHOLD,
            "model_classes": [int(c) for c in model.classes_] if model is not None else None,
            "feature_columns": len(feature_columns) if feature_columns is not None else None,
        }
    )


# ============================================================
# API: Predict
# Expected JSON:
# {
#   "image": "base64 image string",
#   "agar": "Ashdown",
#   "colony_age": "48 hours",
#   "characteristics": []
# }
# ============================================================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Check model loaded
        if model is None or feature_columns is None:
            return jsonify(
                {
                    "error": "Model not loaded",
                    "message": "Please check server logs and model path.",
                }
            ), 500

        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        image_base64 = data.get("image")
        agar = data.get("agar", "Blood")
        colony_age = data.get("colony_age", "48")

        if not image_base64:
            return jsonify({"error": "No image provided"}), 400

        # Extract incubation time
        time_hr = parse_time_hours(colony_age)

        print("\n" + "=" * 70)
        print("[PREDICT] New prediction request")
        print(f"[PREDICT] Agar       : {agar}")
        print(f"[PREDICT] Colony age : {colony_age}")
        print(f"[PREDICT] Time hours : {time_hr}")

        # Decode image
        img = decode_image(image_base64)

        # Extract features
        X = extract_features(img, agar, time_hr)

        # Correct probability:
        # prob_bpseudo = probability of class 1
        prob_bpseudo = get_bpseudomallei_probability(X)

        print("[PREDICT] Model classes:", list(model.classes_))
        print(
            f"[PREDICT] Probability B. pseudomallei: {prob_bpseudo:.4f}"
        )
        print(f"[PREDICT] Threshold: {DECISION_THRESHOLD}")

        # Apply threshold
        is_bpseudo = prob_bpseudo >= DECISION_THRESHOLD

        # Confidence shown to user:
        # If positive -> confidence = probability of B. pseudomallei
        # If negative -> confidence = probability of not B. pseudomallei
        if is_bpseudo:
            confidence = prob_bpseudo
            result = "Probably Burkholderia pseudomallei"
            interpretation = (
                "High probability of B. pseudomallei. "
                "Confirmatory testing is recommended."
            )
            recommendations = [
                "Perform API 20NE / PCR confirmatory tests",
                "Review colony morphology and clinical context",
                "Handle as suspected B. pseudomallei until confirmed",
            ]
        else:
            confidence = 1.0 - prob_bpseudo
            result = "Not Burkholderia pseudomallei"
            interpretation = (
                "Low probability of B. pseudomallei. "
                "Consider alternative diagnoses."
            )
            recommendations = [
                "Continue differential diagnosis",
                "Review morphology and culture conditions",
                "Confirm with laboratory testing if clinically required",
            ]

        print(f"[PREDICT] Result     : {result}")
        print(f"[PREDICT] Confidence : {confidence * 100:.2f}%")
        print("=" * 70 + "\n")

        return jsonify(
            {
                "result": result,
                "confidence": round(confidence * 100, 2),
                "probability_bpseudomallei": round(prob_bpseudo, 4),
                "threshold": DECISION_THRESHOLD,
                "is_bpseudo": bool(is_bpseudo),
                "metadata": {
                    "agar": agar,
                    "colony_age": colony_age,
                    "time_hours": time_hr,
                    "characteristics": data.get("characteristics", []),
                },
                "interpretation": interpretation,
                "recommendations": recommendations,
            }
        ), 200

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(
            {
                "error": "Prediction failed",
                "message": str(e),
            }
        ), 500


# ============================================================
# Run Flask server
# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))

    print(f"\n[INFO] Starting ML API server on port {port}")
    print(f"[INFO] Health check : http://localhost:{port}/health")
    print(f"[INFO] Predict      : http://localhost:{port}/predict\n")

    app.run(host="0.0.0.0", port=port, debug=False)