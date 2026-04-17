import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import SymptomLog from "../models/SymptomLog.js";
import HealthProfile from "../models/HealthProfile.js";
import { callGroq } from "../services/groqService.js";
import { imageToBase64, deleteUploadedFile } from "../services/imageService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(authMiddleware);

// POST /api/symptoms/log — log symptoms with optional photo
router.post("/log", upload.single("photo"), async (req, res) => {
  try {
    const { symptoms, severity, notes } = req.body;
    const parsedSymptoms = typeof symptoms === "string" ? JSON.parse(symptoms) : symptoms;

    let photoUrl = "";
    let photoAIDescription = "";

    // Process photo if uploaded
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      try {
        // Note: Using text description since Llama 3.3 doesn't support vision
        // In production, you'd use a vision model here
        const photoResult = await callGroq(
          `You are a medical AI assistant. The user has uploaded a photo of a symptom along with these reported symptoms: ${parsedSymptoms.join(", ")}. Provide a helpful description of what these symptoms could indicate. Return ONLY valid JSON with no markdown, no backticks: { "description": "string describing likely visual symptoms", "flaggedSymptoms": ["array of concerning symptoms"], "urgencyFlag": "none|monitor|see_doctor" }`,
          `The patient reports these symptoms: ${parsedSymptoms.join(", ")} with severity ${severity}/10. Notes: ${notes || "none"}. They have uploaded a photo of their symptoms. Please analyze.`
        );
        photoAIDescription = photoResult.description || "";
      } catch (err) {
        console.warn("Photo AI analysis failed, continuing:", err.message);
      }
    }

    const log = await SymptomLog.create({
      userId: req.user.id,
      symptoms: parsedSymptoms,
      severity: Number(severity) || 5,
      notes: notes || "",
      photoUrl,
      photoAIDescription
    });

    // Auto-trigger early warning check
    let warning = null;
    try {
      const recentLogs = await SymptomLog.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(10);
      
      const profile = await HealthProfile.findOne({ userId: req.user.id });

      const warningResult = await callGroq(
        `You are an early warning medical AI. Analyze recent symptom patterns for urgent health concerns. You must respond with ONLY valid JSON. No markdown, no backticks, no text before or after. Just the raw JSON object.`,
        `New symptoms logged today: ${parsedSymptoms.join(", ")} (severity: ${severity}/10)
        
Recent symptom history (last 10 entries): ${JSON.stringify(recentLogs.map(l => ({
          date: l.date, symptoms: l.symptoms, severity: l.severity
        })))}
        
Patient's existing conditions: ${profile?.medicalHistory?.join(", ") || "none"}

Return: { "warningTriggered": boolean, "reason": "string or null", "urgency": "none|monitor|see_doctor" }`
      );

      if (warningResult.warningTriggered) {
        log.warningFlagged = true;
        log.warningReason = warningResult.reason || "";
        log.warningUrgency = warningResult.urgency || "monitor";
        await log.save();
        warning = warningResult;
      }
    } catch (err) {
      console.warn("Early warning check failed:", err.message);
    }

    res.status(201).json({ success: true, data: { log, warning } });
  } catch (error) {
    console.error("Log symptom error:", error);
    res.status(500).json({ success: false, error: "Failed to log symptoms" });
  }
});

// GET /api/symptoms/history — get symptom history
router.get("/history", async (req, res) => {
  try {
    const logs = await SymptomLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
});

export default router;