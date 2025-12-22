/**
 * ML Service for B. pseudomallei Detection
 * Handles communication with the Flask ML API
 */

import Constants from "expo-constants";
import * as ImageManipulator from "expo-image-manipulator";

// API Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.251:5000";

export interface PredictionRequest {
  imageUri: string;
  agar: string;
  colonyAge: string;
  characteristics: string[];
}

export interface PredictionResponse {
  result: string;
  confidence: number;
  is_bpseudo: boolean;
  metadata: {
    agar: string;
    colony_age: string;
    time_hours: number;
    characteristics: string[];
  };
  interpretation: string;
  recommendations: string[];
}

export interface MLServiceError {
  error: string;
  message?: string;
}

/**
 * Normalize agar names to match backend expectations
 * Frontend: "Ashdown Agar" → Backend: "Ashdown"
 * The model expects just the agar type name without "Agar" suffix
 */
function normalizeAgarName(agarName: string): string {
  const agarMapping: { [key: string]: string } = {
    "Blood Agar": "Blood",
    "MacConkey Agar": "Macconkey",
    "Nutrient Agar": "Nutrient",
    "Ashdown Agar": "Ashdown",
  };

  return agarMapping[agarName] || agarName;
}

/**
 * Convert image URI to base64 string
 * Uses expo-image-manipulator to handle the deprecated FileSystem API
 */
async function imageToBase64(uri: string): Promise<string> {
  try {
    console.log("Processing image URI:", uri);

    // Use ImageManipulator to get base64 directly
    // This avoids the deprecated FileSystem.readAsStringAsync
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // No manipulations needed
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!result.base64) {
      throw new Error("Failed to generate base64 from image");
    }

    console.log("Image converted to base64 successfully");
    return result.base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error("Failed to process image: " + String(error));
  }
}

/**
 * Check if ML API is available
 */
export async function checkMLApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === "healthy" && data.model_loaded === true;
  } catch (error) {
    console.error("ML API health check failed:", error);
    return false;
  }
}

/**
 * Send image and metadata to ML API for prediction
 */
export async function predictBacterium(
  request: PredictionRequest
): Promise<PredictionResponse> {
  try {
    // Debug logging
    console.log("=== PREDICTION REQUEST DEBUG ===");
    console.log("Received request:", JSON.stringify(request, null, 2));
    console.log("Agar value:", request.agar);
    console.log("Agar type:", typeof request.agar);
    console.log("Agar is empty:", !request.agar || request.agar.trim() === "");

    // Validate request first
    const validation = validatePredictionRequest(request);
    if (!validation.valid) {
      console.error("Validation failed:", validation.error);
      throw new Error(validation.error);
    }

    // Convert image to base64
    console.log("Converting image to base64...");
    const imageBase64 = await imageToBase64(request.imageUri);

    // Normalize agar name for backend compatibility
    const normalizedAgar = normalizeAgarName(request.agar);
    console.log("Agar normalization:", request.agar, "→", normalizedAgar);

    // Prepare request payload
    const payload = {
      image: imageBase64,
      agar: normalizedAgar,
      colony_age: request.colonyAge,
      characteristics: request.characteristics,
    };

    console.log("Sending prediction request to:", `${API_URL}/predict`);
    console.log("Payload metadata:", {
      agar: payload.agar,
      colony_age: payload.colony_age,
      characteristics: payload.characteristics,
      imageSize: imageBase64.length,
    });

    // Send request
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      //   timeout: 30000, // 30 second timeout
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Prediction failed");
    }

    console.log("Prediction successful:", data);
    return data as PredictionResponse;
  } catch (error) {
    console.error("Error in predictBacterium:", error);

    if (error instanceof Error) {
      throw new Error(`ML Analysis Failed: ${error.message}`);
    }

    throw new Error("ML Analysis Failed: Unknown error");
  }
}

/**
 * Test metadata encoding without prediction
 */
export async function testEncoding(agar: string, colonyAge: string) {
  try {
    const response = await fetch(`${API_URL}/test-encoding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agar,
        colony_age: colonyAge,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error testing encoding:", error);
    throw error;
  }
}

/**
 * Get API status and configuration
 */
export function getMLApiConfig() {
  return {
    apiUrl: API_URL,
    endpoints: {
      health: `${API_URL}/health`,
      predict: `${API_URL}/predict`,
      testEncoding: `${API_URL}/test-encoding`,
    },
  };
}

/**
 * Validate prediction request before sending
 */
export function validatePredictionRequest(request: PredictionRequest): {
  valid: boolean;
  error?: string;
} {
  // Debug: Log the request
  console.log("Validating request:", {
    imageUri: !!request.imageUri,
    agar: request.agar,
    colonyAge: request.colonyAge,
    characteristics: request.characteristics,
  });

  if (!request.imageUri || request.imageUri.trim() === "") {
    return { valid: false, error: "Image URI is required" };
  }

  if (!request.agar || request.agar.trim() === "") {
    return {
      valid: false,
      error: `Agar type is required. Received: "${request.agar}"`,
    };
  }

  if (!request.colonyAge || request.colonyAge.trim() === "") {
    return { valid: false, error: "Colony age is required" };
  }

  if (!request.characteristics || request.characteristics.length === 0) {
    return { valid: false, error: "At least one characteristic is required" };
  }

  return { valid: true };
}
