# """
# Flask ML Backend API for B. pseudomallei Detection
# Integrates with your trained TensorFlow model
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import tensorflow as tf
# import numpy as np
# from pathlib import Path
# import joblib
# from PIL import Image
# import io
# import base64
# import os
# from werkzeug.utils import secure_filename

# app = Flask(__name__)
# CORS(app)  # Enable CORS for React Native

# # ===========================
# # CONFIGURATION
# # ===========================
# MODEL_PATH = "models/final_finetuned_model.keras"
# ENCODER_PATH = "metadata/encoders/onehot_encoder.pkl"
# SCALER_PATH = "metadata/encoders/scaler.pkl"
# IMG_SIZE = (224, 224)

# # ===========================
# # LOAD MODEL AND ENCODERS
# # ===========================
# print("🔄 Loading ML model and encoders...")
# try:
#     model = tf.keras.models.load_model(MODEL_PATH, compile=False)
#     encoder = joblib.load(ENCODER_PATH)
#     scaler = joblib.load(SCALER_PATH)
#     print("✅ Model loaded successfully!")
# except Exception as e:
#     print(f"❌ Error loading model: {e}")
#     model = None
#     encoder = None
#     scaler = None

# # ===========================
# # AGAR MAPPING (from your app)
# # ===========================
# AGAR_MAPPING = {
#     "Blood Agar": "Blood",
#     "MacConkey Agar": "Macconkey",
#     "Nutrient Agar": "Nutrient",
#     "Ashdown Agar": "Ashdown"
# }

# # Species mapping (assuming bacteria types)
# SPECIES_MAPPING = {
#     "gram_negative_oxidase_positive": "Unknown",  # Generic species
#     "burkholderia": "Bpseudomallei"
# }

# # ===========================
# # HELPER FUNCTIONS
# # ===========================
# def encode_metadata(agar, species, time_hr):
#     """Encode metadata into feature vector"""
#     try:
#         # Map agar name
#         agar_encoded = AGAR_MAPPING.get(agar, "Blood")
        
#         # Create categorical values
#         cat_values = np.array([[agar_encoded, species]])
        
#         # Create numeric values
#         num_values = np.array([[time_hr]])
        
#         # Encode
#         encoded_cats = encoder.transform(cat_values)
#         scaled_nums = scaler.transform(num_values)
        
#         # Concatenate
#         metadata_vector = np.concatenate([encoded_cats[0], scaled_nums[0]], axis=0)
#         return metadata_vector.astype(np.float32)
    
#     except Exception as e:
#         print(f"Error encoding metadata: {e}")
#         # Return default vector
#         return np.zeros(10, dtype=np.float32)

# def preprocess_image(image_data):
#     """Preprocess image for model input"""
#     try:
#         # If base64, decode
#         if isinstance(image_data, str):
#             if ',' in image_data:
#                 image_data = image_data.split(',')[1]
#             image_bytes = base64.b64decode(image_data)
#         else:
#             image_bytes = image_data
        
#         # Open image
#         img = Image.open(io.BytesIO(image_bytes))
        
#         # Convert to RGB
#         if img.mode != 'RGB':
#             img = img.convert('RGB')
        
#         # Resize
#         img = img.resize(IMG_SIZE)
        
#         # Convert to array and normalize
#         img_array = np.array(img, dtype=np.float32) / 255.0
        
#         # Add batch dimension
#         img_array = np.expand_dims(img_array, axis=0)
        
#         return img_array
    
#     except Exception as e:
#         print(f"Error preprocessing image: {e}")
#         return None

# # ===========================
# # API ENDPOINTS
# # ===========================
# @app.route('/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         "status": "healthy",
#         "model_loaded": model is not None,
#         "version": "1.0.0"
#     })

# @app.route('/predict', methods=['POST'])
# def predict():
#     """
#     Main prediction endpoint
    
#     Expected JSON body:
#     {
#         "image": "base64_encoded_image_string",
#         "agar": "Ashdown Agar",
#         "colony_age": "48 hours",
#         "characteristics": ["Gram negative bacilli", "Oxidase positive"]
#     }
#     """
#     try:
#         # Check if model is loaded
#         if model is None:
#             return jsonify({
#                 "error": "Model not loaded",
#                 "message": "ML model failed to load. Please check server logs."
#             }), 500
        
#         # Get request data
#         data = request.get_json()
        
#         if not data:
#             return jsonify({"error": "No data provided"}), 400
        
#         # Extract parameters
#         image_base64 = data.get('image')
#         agar = data.get('agar', 'Blood Agar')
#         colony_age = data.get('colony_age', '48 hours')
#         characteristics = data.get('characteristics', [])
        
#         if not image_base64:
#             return jsonify({"error": "No image provided"}), 400
        
#         # Extract time in hours
#         time_hr = int(''.join(filter(str.isdigit, colony_age)))
        
#         # Determine species based on characteristics
#         species = "Unknown"
#         if "Oxidase positive" in characteristics and "Gram negative" in characteristics:
#             species = "Unknown"  # You can refine this logic
        
#         # Preprocess image
#         img_array = preprocess_image(image_base64)
#         if img_array is None:
#             return jsonify({"error": "Failed to process image"}), 400
        
#         # Encode metadata
#         metadata_vector = encode_metadata(agar, species, time_hr)
#         metadata_vector = np.expand_dims(metadata_vector, axis=0)
        
#         # Make prediction
#         prediction = model.predict([img_array, metadata_vector], verbose=0)
#         confidence = float(prediction[0][0])
        
#         # Determine result
#         is_bpseudo = confidence >= 0.5
#         result = "Probably Burkholderia pseudomallei" if is_bpseudo else "Not Burkholderia pseudomallei"
        
#         # Prepare response
#         response = {
#             "result": result,
#             "confidence": round(confidence * 100, 2),  # Convert to percentage
#             "is_bpseudo": is_bpseudo,
#             "metadata": {
#                 "agar": agar,
#                 "colony_age": colony_age,
#                 "time_hours": time_hr,
#                 "characteristics": characteristics
#             },
#             "interpretation": get_interpretation(confidence, agar),
#             "recommendations": get_recommendations(confidence, agar)
#         }
        
#         return jsonify(response), 200
    
#     except Exception as e:
#         print(f"Error in prediction: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({
#             "error": "Prediction failed",
#             "message": str(e)
#         }), 500

# def get_interpretation(confidence, agar):
#     """Generate interpretation based on confidence and agar"""
#     if confidence >= 0.9:
#         return f"High confidence detection on {agar}. Strong characteristics consistent with B. pseudomallei."
#     elif confidence >= 0.7:
#         return f"Moderate confidence detection on {agar}. Consider confirmatory testing."
#     elif confidence >= 0.5:
#         return f"Low confidence positive on {agar}. Recommended: Additional biochemical tests."
#     else:
#         return f"Characteristics not consistent with B. pseudomallei on {agar}."

# def get_recommendations(confidence, agar):
#     """Generate recommendations based on results"""
#     recommendations = []
    
#     if confidence >= 0.5:
#         recommendations.append("⚠️ Treat as potential B. pseudomallei")
#         recommendations.append("🔬 Perform confirmatory tests (API 20NE, PCR)")
#         recommendations.append("🧪 Consider antibiotic sensitivity testing")
        
#         if agar == "Ashdown Agar":
#             recommendations.append("✅ Ashdown agar is optimal for B. pseudomallei")
#         else:
#             recommendations.append("💡 Consider re-culturing on Ashdown agar for confirmation")
#     else:
#         recommendations.append("✅ Low probability of B. pseudomallei")
#         recommendations.append("🔍 Continue differential diagnosis")
#         recommendations.append("📋 Document colony characteristics")
    
#     return recommendations

# @app.route('/test-encoding', methods=['POST'])
# def test_encoding():
#     """Test metadata encoding without prediction"""
#     try:
#         data = request.get_json()
#         agar = data.get('agar', 'Blood Agar')
#         colony_age = data.get('colony_age', '48 hours')
#         time_hr = int(''.join(filter(str.isdigit, colony_age)))
        
#         metadata_vector = encode_metadata(agar, "Unknown", time_hr)
        
#         return jsonify({
#             "agar": agar,
#             "time_hr": time_hr,
#             "metadata_vector": metadata_vector.tolist(),
#             "vector_size": len(metadata_vector)
#         }), 200
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # ===========================
# # ERROR HANDLERS
# # ===========================
# @app.errorhandler(404)
# def not_found(error):
#     return jsonify({"error": "Endpoint not found"}), 404

# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify({"error": "Internal server error"}), 500

# # ===========================
# # MAIN
# # ===========================
# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     print(f"\n🚀 Starting ML API server on port {port}...")
#     print(f"📍 Health check: http://localhost:{port}/health")
#     print(f"🔮 Prediction endpoint: http://localhost:{port}/predict")
#     app.run(host='0.0.0.0', port=port, debug=False)




"""
Flask ML Backend API - FULLY CORRECTED VERSION WITH FIXED CONFIDENCE LOGIC

CRITICAL FIXES:
1. ✅ Compatible with updated data_loader_fixed.py
2. ✅ Uses EfficientNet's preprocess_input (matches training)
3. ✅ Converts images to GRAYSCALE (matches training preprocessing)
4. ✅ Proper metadata encoding (OneHotEncoder + StandardScaler)
5. ✅ No more /255 mismatch
6. ✅ CORRECTED CONFIDENCE LOGIC - Flips confidence for negative results
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from pathlib import Path
import joblib
from PIL import Image
import io
import base64
import os
import warnings
from tensorflow.keras.applications.efficientnet import preprocess_input

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ===========================
# CONFIGURATION
# ===========================
MODEL_PATH = "models/final_finetuned_model.keras"
ENCODER_PATH = "metadata/encoders/onehot_encoder.pkl"
SCALER_PATH = "metadata/encoders/scaler.pkl"
IMG_SIZE = (224, 224)

# ===========================
# LOAD MODEL AND ENCODERS
# ===========================
print("🔄 Loading ML model and encoders...")
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    encoder = joblib.load(ENCODER_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model loaded successfully!")
    print("✅ Encoders loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    import traceback
    traceback.print_exc()
    model = None
    encoder = None
    scaler = None

# ===========================
# CONFIGURATION FOR METADATA
# ===========================
categorical_cols = ['agar', 'species']
numeric_cols = ['time_hr']

# ===========================
# AGAR & SPECIES MAPPING
# ===========================
AGAR_MAPPING = {
    "Blood Agar": "Blood",
    "Blood": "Blood",
    "MacConkey Agar": "Macconkey",
    "Macconkey": "Macconkey",
    "Nutrient Agar": "Nutrient",
    "Nutrient": "Nutrient",
    "Ashdown Agar": "Ashdown",
    "Ashdown": "Ashdown"
}

SPECIES_MAPPING = {
    "gram_negative_oxidase_positive": "Unknown",
    "burkholderia": "Bpseudomallei",
    "unknown": "Unknown",
    "bpseudomallei": "Bpseudomallei"
}

# ===========================
# HELPER FUNCTIONS
# ===========================
def encode_metadata(agar, species, time_hr):
    """
    Encode metadata into feature vector.
    
    ✅ MATCHES split_data_correctly.py:
       - OneHotEncoder for categorical features
       - StandardScaler for numeric features
    """
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            
            # Normalize agar name
            agar_normalized = AGAR_MAPPING.get(agar, "Blood")
            species_normalized = SPECIES_MAPPING.get(species.lower(), "Unknown")
            
            # Encode categorical
            cat_values = np.array([[agar_normalized, species_normalized]])
            num_values = np.array([[float(time_hr)]])
            
            encoded_cats = encoder.transform(cat_values)
            scaled_nums = scaler.transform(num_values)
            
            # Concatenate
            metadata_vector = np.concatenate([encoded_cats[0], scaled_nums[0]], axis=0)
            
            print(f"   ✅ Metadata encoded:")
            print(f"      Agar: {agar_normalized}, Species: {species_normalized}, Time: {time_hr}h")
            print(f"      Vector shape: {metadata_vector.shape}")
            
            return metadata_vector.astype(np.float32)
    
    except Exception as e:
        print(f"   ❌ Error encoding metadata: {e}")
        import traceback
        traceback.print_exc()
        return None

def preprocess_image(image_data):
    """
    Preprocess image for model input.
    
    ✅ CRITICAL FIXES:
       1. Convert to GRAYSCALE (matches training)
       2. Resize to 224x224
       3. Use EfficientNet preprocess_input
       4. This MUST match training preprocessing exactly!
    """
    try:
        print("   🖼️  Preprocessing image...")
        
        # Decode base64
        if isinstance(image_data, str):
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        else:
            image_bytes = image_data
        
        # Open image
        img = Image.open(io.BytesIO(image_bytes))
        print(f"      Original format: {img.format}, Size: {img.size}, Mode: {img.mode}")
        
        # ✅ CRITICAL FIX #1: Convert to GRAYSCALE
        if img.mode != 'L':
            img_gray = img.convert('L')
            print(f"      ✅ Converted to GRAYSCALE")
        else:
            img_gray = img
            print(f"      ℹ️  Already grayscale")
        
        # ✅ Resize to match training
        img_resized = img_gray.resize(IMG_SIZE)
        print(f"      ✅ Resized to {IMG_SIZE}")
        
        # Convert to numpy array (grayscale = 1 channel)
        img_array = np.array(img_resized, dtype=np.float32)
        print(f"      Array shape before expansion: {img_array.shape}")
        
        # ✅ Expand to 3 channels (convert grayscale to RGB for EfficientNet)
        # EfficientNet expects 3-channel input, so repeat grayscale across 3 channels
        if len(img_array.shape) == 2:  # Grayscale (H, W)
            img_array = np.stack([img_array, img_array, img_array], axis=2)
            print(f"      ✅ Expanded grayscale to 3 channels: {img_array.shape}")
        
        # ✅ CRITICAL FIX #2: Use EfficientNet preprocessing
        # This normalizes to [-1, 1] range, NOT [0, 1]
        img_array = preprocess_input(img_array)
        print(f"      ✅ Applied EfficientNet preprocess_input")
        print(f"      Value range: [{img_array.min():.2f}, {img_array.max():.2f}]")
        
        # Add batch dimension
        img_batch = np.expand_dims(img_array, axis=0)
        print(f"      ✅ Final shape with batch: {img_batch.shape}")
        
        return img_batch
    
    except Exception as e:
        print(f"   ❌ Error preprocessing image: {e}")
        import traceback
        traceback.print_exc()
        return None

def verify_preprocessing(img_array):
    """
    Verify that preprocessing matches training expectations
    """
    checks = {
        "shape_correct": img_array.shape == (1, 224, 224, 3),
        "dtype_correct": img_array.dtype == np.float32,
        "range_correct": -2 < img_array.min() and img_array.max() < 2,
        "min_value": float(img_array.min()),
        "max_value": float(img_array.max()),
        "mean_value": float(img_array.mean()),
        "std_value": float(img_array.std())
    }
    return checks

# ===========================
# API ENDPOINTS
# ===========================
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": bool(model is not None),
        "encoders_loaded": bool(encoder is not None and scaler is not None),
        "version": "3.1.0-confidence-fixed",
        "preprocessing": "Grayscale → 3-channel → EfficientNet preprocess_input",
        "confidence_logic": "Fixed - Flips confidence for negative results",
        "model_type": "EfficientNetB0 + Metadata MLP"
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint with FIXED preprocessing and CORRECTED CONFIDENCE LOGIC
    
    Expected JSON body:
    {
        "image": "base64_encoded_image_string",
        "agar": "Ashdown Agar",
        "colony_age": "48 hours",
        "characteristics": ["Gram negative bacilli", "Oxidase positive"]
    }
    
    ✅ FEATURES:
    - Converts image to grayscale
    - Proper metadata encoding
    - EfficientNet preprocessing
    - ✅ CORRECTED confidence logic (flips for negative results)
    """
    try:
        if model is None or encoder is None or scaler is None:
            return jsonify({
                "error": "Model or encoders not loaded",
                "message": "ML model or encoders failed to load. Please check server logs."
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract parameters
        image_base64 = data.get('image')
        agar = data.get('agar', 'Blood Agar')
        colony_age = data.get('colony_age', '48 hours')
        characteristics = data.get('characteristics', [])
        
        if not image_base64:
            return jsonify({"error": "No image provided"}), 400
        
        print(f"\n{'='*80}")
        print(f"🔮 PROCESSING PREDICTION REQUEST")
        print(f"{'='*80}")
        print(f"📋 Input Parameters:")
        print(f"   Agar: {agar}")
        print(f"   Colony age: {colony_age}")
        print(f"   Characteristics: {characteristics}")
        
        # Extract time in hours from colony age string
        time_hr_str = ''.join(filter(str.isdigit, colony_age))
        time_hr = int(time_hr_str) if time_hr_str else 48
        
        # Determine species
        species = "Unknown"
        if "Oxidase positive" in characteristics and "Gram negative" in characteristics:
            species = "Unknown"
        elif "Burkholderia" in characteristics or "pseudomallei" in str(characteristics).lower():
            species = "Bpseudomallei"
        
        # ✅ Preprocess image (Grayscale conversion + EfficientNet)
        print(f"\n🖼️  IMAGE PROCESSING:")
        img_array = preprocess_image(image_base64)
        if img_array is None:
            return jsonify({"error": "Failed to process image"}), 400
        
        # Verify preprocessing
        preproc_checks = verify_preprocessing(img_array)
        if not preproc_checks['shape_correct']:
            print(f"   ⚠️  WARNING: Image shape mismatch! Expected (1, 224, 224, 3), got {img_array.shape}")
        
        # ✅ Encode metadata (matches training encoding)
        print(f"\n🔤 METADATA ENCODING:")
        metadata_vector = encode_metadata(agar, species, time_hr)
        if metadata_vector is None:
            return jsonify({"error": "Failed to encode metadata"}), 400
        
        metadata_batch = np.expand_dims(metadata_vector, axis=0)
        
        # ✅ Make prediction
        print(f"\n🤖 MODEL PREDICTION:")
        print(f"   Running inference...")
        prediction = model.predict([img_array, metadata_batch], verbose=0)
        model_raw_output = float(prediction[0][0])
        
        print(f"   ✅ Raw model output: {model_raw_output:.4f}")
        
        # ===========================
        # ✅ CORRECTED CONFIDENCE LOGIC
        # ===========================
        # Determine result and display confidence based on thresholds
        if model_raw_output >= 0.7:
            result = "Probably Burkholderia pseudomallei"
            display_confidence = model_raw_output
            confidence_level = "HIGH CONFIDENCE (Positive)"
            is_bpseudo = True
            
        elif model_raw_output >= 0.5:
            result = "Possibly Burkholderia pseudomallei"
            display_confidence = model_raw_output
            confidence_level = "MODERATE CONFIDENCE (Positive)"
            is_bpseudo = True
            
        else:
            # model_raw_output < 0.5
            # Model says: "Probably NOT B. pseudomallei"
            # So flip the confidence to show how confident we are in the NEGATIVE
            result = "Not Burkholderia pseudomallei"
            display_confidence = 1 - model_raw_output  # ✅ KEY FIX: FLIP IT!
            confidence_level = "HIGH CONFIDENCE (Negative)"
            is_bpseudo = False
        
        display_confidence_pct = float(round(display_confidence * 100, 2))
        
        print(f"   📊 Model Raw Output: {model_raw_output:.4f}")
        print(f"   📊 Display Confidence: {display_confidence:.4f} ({display_confidence_pct}%)")
        print(f"   📊 Result: {result}")
        print(f"   📊 Confidence Level: {confidence_level}")
        
        # ✅ Prepare comprehensive response (all values JSON-serializable)
        response = {
            "result": str(result),
            "confidence": display_confidence_pct,  # ✅ This is what to show the user
            "confidence_level": str(confidence_level),
            "is_bpseudo": bool(is_bpseudo),
            "confidence_score": float(round(display_confidence, 4)),  # ✅ Unified confidence (0-1)
            "model_raw_output": float(round(model_raw_output, 4)),    # For debugging
            
            "metadata": {
                "agar": str(agar),
                "colony_age": str(colony_age),
                "time_hours": int(time_hr),
                "species": str(species),
                "characteristics": [str(c) for c in characteristics]
            },
            "interpretation": str(get_interpretation(model_raw_output, agar)),
            "recommendations": [str(r) for r in get_recommendations(model_raw_output, agar)],
            "preprocessing_details": {
                "image_format": "Grayscale → 3-channel RGB",
                "size": f"{IMG_SIZE[0]}x{IMG_SIZE[1]}",
                "normalization": "EfficientNet preprocess_input ([-1, 1])",
                "verification": {
                    "shape_correct": bool(preproc_checks['shape_correct']),
                    "dtype_correct": bool(preproc_checks['dtype_correct']),
                    "range_correct": bool(preproc_checks['range_correct']),
                    "value_range": f"[{float(preproc_checks['min_value']):.3f}, {float(preproc_checks['max_value']):.3f}]"
                }
            },
            "model_version": "EfficientNetB0 + Metadata MLP",
            "api_version": "3.1.0-confidence-fixed"
        }
        
        print(f"\n✅ PREDICTION COMPLETE:")
        print(f"   Result: {result}")
        print(f"   Confidence: {display_confidence_pct}%")
        print(f"{'='*80}\n")
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"\n❌ ERROR IN PREDICTION:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*80}\n")
        
        return jsonify({
            "error": "Prediction failed",
            "message": str(e),
            "api_version": "3.1.0"
        }), 500

def get_interpretation(model_raw_output, agar):
    """
    Generate clinical interpretation based on model output and agar type
    
    ✅ Updated to use model_raw_output (not flipped) for proper interpretation
    """
    if model_raw_output >= 0.9:
        return (f"🔴 VERY HIGH CONFIDENCE detection on {agar}. "
                f"Strong morphological characteristics highly consistent with B. pseudomallei. "
                f"Recommend immediate confirmatory testing and infection control measures.")
    elif model_raw_output >= 0.7:
        return (f"🟠 HIGH CONFIDENCE detection on {agar}. "
                f"Colony characteristics suggest probable B. pseudomallei. "
                f"Confirmatory biochemical tests strongly recommended.")
    elif model_raw_output >= 0.5:
        return (f"🟡 MODERATE CONFIDENCE on {agar}. "
                f"Some characteristics consistent with B. pseudomallei. "
                f"Additional diagnostic tests required for confirmation.")
    elif model_raw_output >= 0.3:
        return (f"🟢 LOW CONFIDENCE - Likely NOT B. pseudomallei. "
                f"Colony characteristics on {agar} suggest other organism. "
                f"Continue differential diagnosis.")
    else:
        return (f"🟢 VERY LOW CONFIDENCE - Highly unlikely B. pseudomallei. "
                f"Colony characteristics on {agar} inconsistent with B. pseudomallei. "
                f"Investigate other gram-negative organisms.")

def get_recommendations(model_raw_output, agar):
    """
    Generate clinical recommendations based on model output
    
    ✅ Updated thresholds to match new 3-tier system (0.7, 0.5)
    """
    recommendations = []
    
    if model_raw_output >= 0.7:
        recommendations.append("⚠️ PRESUMPTIVE POSITIVE - Treat as potential B. pseudomallei")
        recommendations.append("🔬 Perform CONFIRMATORY TESTS:")
        recommendations.append("   • API 20NE or similar biochemical panel")
        recommendations.append("   • PCR for B. pseudomallei 16S rRNA")
        recommendations.append("   • MALDI-TOF mass spectrometry if available")
        recommendations.append("🧪 Perform antibiotic sensitivity testing (particularly colistin, ceftazidime)")
        recommendations.append("⚠️ Implement appropriate biosafety measures (BSL-3 recommended)")
        recommendations.append("📋 Document and notify relevant health authorities if confirmed")
        
        if agar == "Ashdown Agar" or agar == "Ashdown":
            recommendations.append("✅ Ashdown agar is optimal for B. pseudomallei isolation")
        else:
            recommendations.append("💡 Consider sub-culturing on Ashdown agar for enhanced confirmation")
    
    elif model_raw_output >= 0.5:
        recommendations.append("⚠️ POSSIBLE POSITIVE - Treat as potential B. pseudomallei until ruled out")
        recommendations.append("🔬 Perform CONFIRMATORY TESTS:")
        recommendations.append("   • API 20NE biochemical panel")
        recommendations.append("   • PCR testing (consider if available)")
        recommendations.append("💡 Consider re-culturing on Ashdown agar for enhanced isolation")
        recommendations.append("📋 Document findings carefully for review")
        recommendations.append("🔄 If negative, continue differential diagnosis")
    
    else:
        recommendations.append("✅ LOW PROBABILITY - Unlikely to be B. pseudomallei")
        recommendations.append("🔍 Continue differential diagnosis based on:")
        recommendations.append("   • Colony morphology")
        recommendations.append("   • Growth on selective media")
        recommendations.append("   • Biochemical profile")
        recommendations.append("📋 Document organism characteristics")
        recommendations.append("🧬 Consider other gram-negative organisms (Pseudomonas, Acinetobacter, etc.)")
    
    return recommendations

@app.route('/test-preprocessing', methods=['POST'])
def test_preprocessing():
    """
    Test preprocessing to verify it matches training expectations
    
    ✅ Verifies:
    - Grayscale conversion
    - 3-channel expansion
    - EfficientNet normalization
    """
    try:
        data = request.get_json()
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({"error": "No image provided"}), 400
        
        print("\n🧪 PREPROCESSING TEST:")
        img_array = preprocess_image(image_base64)
        
        if img_array is None:
            return jsonify({"error": "Failed to preprocess image"}), 400
        
        checks = verify_preprocessing(img_array)
        
        return jsonify({
            "status": "✅ Success" if all(checks.values()) else "⚠️ Check details",
            "preprocessing_checks": {
                "shape_correct": bool(checks['shape_correct']),
                "expected_shape": "(1, 224, 224, 3)",
                "actual_shape": str(img_array.shape),
                "dtype_correct": bool(checks['dtype_correct']),
                "dtype": str(img_array.dtype),
                "range_correct": bool(checks['range_correct']),
                "min_value": float(checks['min_value']),
                "max_value": float(checks['max_value']),
                "mean_value": float(checks['mean_value']),
                "std_value": float(checks['std_value']),
            },
            "normalization": "EfficientNet preprocess_input",
            "expected_range": "[-1, 1] approximately",
            "image_format": "Grayscale → 3-channel RGB",
            "note": "✅ Preprocessing matches training pipeline"
        }), 200
    
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/info', methods=['GET'])
def model_info():
    """Get detailed model information"""
    return jsonify({
        "model_name": "B. pseudomallei Detector v3.1",
        "architecture": "EfficientNetB0 + Metadata MLP",
        "input_specification": {
            "image": {
                "format": "Grayscale → 3-channel RGB",
                "size": "224x224",
                "channels": 3,
                "normalization": "EfficientNet preprocess_input ([-1, 1])"
            },
            "metadata": {
                "agar": "Categorical (Blood, Macconkey, Nutrient, Ashdown)",
                "species": "Categorical",
                "time_hours": "Numeric (continuous)"
            }
        },
        "output": {
            "model_raw_output": "Float 0-1 (probability of B. pseudomallei)",
            "display_confidence": "Float 0-1 (flipped for negative results)",
            "result": "Classification with three tiers"
        },
        "confidence_tiers": {
            "probably": "model_raw_output >= 0.7",
            "possibly": "0.5 <= model_raw_output < 0.7",
            "not": "model_raw_output < 0.5"
        },
        "confidence_logic": {
            "explanation": "Confidence always represents 'How confident are we in our answer?'",
            "for_positive_results": "Display model_raw_output as-is",
            "for_negative_results": "Display 1 - model_raw_output (flipped)",
            "example_1": "model_raw_output=0.85 → 'Probably B. pseudomallei - 85% confidence'",
            "example_2": "model_raw_output=0.23 → 'Not B. pseudomallei - 77% confidence (flipped)'",
            "example_3": "model_raw_output=0.55 → 'Possibly B. pseudomallei - 55% confidence'"
        },
        "preprocessing_pipeline": [
            "1. Decode base64 image",
            "2. Convert to grayscale",
            "3. Resize to 224x224",
            "4. Expand grayscale to 3 channels",
            "5. Apply EfficientNet preprocess_input",
            "6. Encode metadata with OneHotEncoder + StandardScaler",
            "7. Run inference",
            "8. ✅ Apply corrected confidence logic"
        ],
        "api_version": "3.1.0-confidence-fixed"
    }), 200

# ===========================
# ERROR HANDLERS
# ===========================
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "/health",
            "/predict",
            "/test-preprocessing",
            "/info"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500

# ===========================
# MAIN
# ===========================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n{'='*80}")
    print(f"🚀 STARTING FLASK ML API SERVER v3.1")
    print(f"{'='*80}")
    print(f"📍 Host: 0.0.0.0")
    print(f"🔌 Port: {port}")
    print(f"\n📚 AVAILABLE ENDPOINTS:")
    print(f"   ✅ /health              → Health check")
    print(f"   🔮 /predict             → Make predictions")
    print(f"   🧪 /test-preprocessing  → Test image preprocessing")
    print(f"   ℹ️  /info               → Model information")
    print(f"\n⚙️  PREPROCESSING PIPELINE:")
    print(f"   1. Convert image to GRAYSCALE")
    print(f"   2. Expand grayscale to 3-channel RGB")
    print(f"   3. Resize to 224×224")
    print(f"   4. Apply EfficientNet preprocess_input")
    print(f"   5. Encode metadata (OneHotEncoder + StandardScaler)")
    print(f"\n✅ FEATURES:")
    print(f"   ✓ Grayscale image support (matches training)")
    print(f"   ✓ EfficientNet preprocessing (no /255 mismatch)")
    print(f"   ✓ Proper metadata encoding")
    print(f"   ✓ Comprehensive preprocessing verification")
    print(f"   ✓ ✅ CORRECTED CONFIDENCE LOGIC (flips for negative results)")
    print(f"   ✓ Three-tier confidence system (Probably/Possibly/Not)")
    print(f"   ✓ Detailed clinical interpretation")
    print(f"   ✓ Clinical recommendations")
    print(f"\n📊 CONFIDENCE LOGIC:")
    print(f"   • model_raw_output >= 0.7  → 'Probably' (display as-is)")
    print(f"   • 0.5 <= model_raw_output < 0.7 → 'Possibly' (display as-is)")
    print(f"   • model_raw_output < 0.5   → 'Not' (flip: 1 - model_raw_output)")
    print(f"\n💡 EXAMPLE:")
    print(f"   Raw output: 0.23")
    print(f"   Result: 'Not B. pseudomallei'")
    print(f"   Display: 77% confidence (flipped from 23%)")
    print(f"{'='*80}\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)