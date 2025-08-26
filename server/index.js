const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Mock analysis results
const mockResults = [
  {
    result: "Probably Burkholderia pseudomallei",
    confidence: 0.9,
    details: {
      morphology:
        "Gram-negative bacilli with characteristic bipolar appearance",
      biochemical: "Oxidase positive, consistent with B. pseudomallei",
      recommendation:
        "Further confirmation recommended through molecular methods",
    },
  },
  {
    result: "Not Burkholderia pseudomallei",
    confidence: 0.85,
    details: {
      morphology: "Morphological characteristics do not match B. pseudomallei",
      biochemical: "Biochemical profile inconsistent with target organism",
      recommendation: "Consider alternative identification methods",
    },
  },
];

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Bacterial Pathogen Analyzer API",
  });
});

// Mock image analysis endpoint
app.post("/api/analyze-image", upload.single("image"), (req, res) => {
  try {
    // Simulate processing time
    setTimeout(() => {
      // Randomly select a mock result
      const selectedResult =
        mockResults[Math.floor(Math.random() * mockResults.length)];

      // Add some randomness to confidence
      const baseConfidence = selectedResult.confidence;
      const randomVariation = (Math.random() - 0.5) * 0.1; // ±5%
      const finalConfidence = Math.min(
        0.95,
        Math.max(0.8, baseConfidence + randomVariation)
      );

      const response = {
        ...selectedResult,
        confidence: finalConfidence,
        analysisId: `analysis_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        processingTime: `${Math.random() * 3 + 2}s`, // 2-5 seconds
      };

      console.log(
        `Image analysis completed: ${response.result} (${Math.round(
          finalConfidence * 100
        )}%)`
      );
      res.json(response);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Image analysis failed",
      message: error.message,
    });
  }
});

// Mock send report endpoint
app.post("/api/send-report", (req, res) => {
  try {
    const { characteristics, medium, result, confidence, timestamp, userId } =
      req.body;

    // Validate required fields
    if (!characteristics || !medium || !result) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["characteristics", "medium", "result"],
      });
    }

    // Simulate processing time
    setTimeout(() => {
      const reportId = `report_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const response = {
        reportId,
        status: "sent",
        sentTo: "laboratory@hospital.com",
        timestamp: new Date().toISOString(),
        priority: result.includes("Probably") ? "high" : "normal",
        estimatedReviewTime: result.includes("Probably")
          ? "2-4 hours"
          : "24-48 hours",
        message: "Report successfully sent to laboratory for review",
      };

      console.log(
        `Report sent: ${reportId} - ${result} (Priority: ${response.priority})`
      );
      res.json(response);
    }, 500 + Math.random() * 1500); // 0.5-2 second delay
  } catch (error) {
    console.error("Send report error:", error);
    res.status(500).json({
      error: "Failed to send report",
      message: error.message,
    });
  }
});

// Get analysis statistics endpoint
app.get("/api/statistics/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = "30d" } = req.query;

    // Mock statistics data
    const mockStats = {
      totalAnalyses: Math.floor(Math.random() * 100) + 20,
      positiveResults: Math.floor(Math.random() * 30) + 5,
      accuracy: 0.92 + Math.random() * 0.06, // 92-98%
      averageConfidence: 0.87 + Math.random() * 0.08, // 87-95%
      timeframe,
      lastUpdated: new Date().toISOString(),
    };

    mockStats.negativeResults =
      mockStats.totalAnalyses - mockStats.positiveResults;
    mockStats.positiveRate =
      mockStats.positiveResults / mockStats.totalAnalyses;

    res.json(mockStats);
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

// Create uploads directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /api/health",
      "POST /api/analyze-image",
      "POST /api/send-report",
      "GET /api/statistics/:userId",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Bacterial Pathogen Analyzer API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔬 Image analysis: POST http://localhost:${PORT}/api/analyze-image`
  );
  console.log(`📄 Send report: POST http://localhost:${PORT}/api/send-report`);
});

module.exports = app;
