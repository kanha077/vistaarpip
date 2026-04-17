import { Router } from "express";
import User from "../models/User.js";
import HealthProfile from "../models/HealthProfile.js";
import MedicineLog from "../models/MedicineLog.js";
import { callGroq } from "../services/groqService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

// POST /api/medicines/check — check drug-drug and drug-disease interactions
router.post("/check", async (req, res) => {
  try {
    const { medicines } = req.body; // Array of drug names
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, error: "Medicines list is required" });
    }

    const user = await User.findById(req.user.id);
    const profile = await HealthProfile.findOne({ userId: req.user.id });

    const systemPrompt = `You are a clinical pharmacology AI. Analyze pharmacological interactions between provided drugs and the patient's existing conditions.

You must respond with ONLY valid JSON. No markdown, no backticks, no text.

Return this JSON structure:
{
  "interactions": [
    { "drug1": "string", "drug2": "string", "severity": "mild"|"moderate"|"severe", "description": "string" }
  ],
  "diseaseInteractions": ["string array of warnings"],
  "safeToTake": boolean,
  "recommendation": "string summary of advice"
}`;

    const userMessage = `Patient Context:
- Existing Conditions: ${profile?.medicalHistory?.join(", ") || "none"}
- Current Medications: ${profile?.medicines?.join(", ") || "none"}
- NEW Medications to check: ${medicines.join(", ")}

Analyze:
1. Interactions between the NEW medications themselves.
2. Interactions between NEW medications and CURRENT medications.
3. Contraindications between NEW medications and EXISTING conditions.`;

    const result = await callGroq(systemPrompt, userMessage);

    const log = await MedicineLog.create({
      userId: req.user.id,
      medicines: medicines,
      interactions: result.interactions || [],
      diseaseInteractions: result.diseaseInteractions || [],
      safeToTake: result.safeToTake !== false,
      recommendation: result.recommendation || ""
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error("Medicine check error:", error);
    res.status(500).json({ success: false, error: error.message || "Medicine check failed" });
  }
});

export default router;