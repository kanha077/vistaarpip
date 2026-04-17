import { Router } from "express";
import User from "../models/User.js";
import HealthProfile from "../models/HealthProfile.js";
import SymptomLog from "../models/SymptomLog.js";
import Prediction from "../models/Prediction.js";
import WhatIfLog from "../models/WhatIfLog.js";
import { callGroq } from "../services/groqService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

// POST /api/ai/predict — full risk prediction
router.post("/predict", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await HealthProfile.findOne({ userId: req.user.id });
    const recentLogs = await SymptomLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const systemPrompt = `You are a proactive medical AI assistant. Analyze the following patient data and return a disease risk assessment.

You must respond with ONLY valid JSON. No markdown formatting, no backticks, no explanation text before or after. Just the raw JSON object.

Return this exact JSON structure:
{
  "risks": [
    {
      "disease": "string",
      "confidence": number (0-100),
      "contributingSymptoms": ["string array"],
      "urgency": "Monitor" | "See doctor soon" | "Seek immediate care",
      "geneticFactor": boolean
    }
  ],
  "healthScore": number (0-100),
  "trend": "improving" | "stable" | "declining",
  "correlations": [
    { "symptoms": ["string array"], "possibleCondition": "string" }
  ],
  "summary": "2-3 sentences plain English summary"
}`;

    const userMessage = `Patient Profile:
- Age: ${user.age || "unknown"}, Gender: ${user.gender || "unknown"}
- Medical History: ${profile?.medicalHistory?.join(", ") || "none"}
- Family History (Genetic Risks): ${JSON.stringify(profile?.familyHistory || [])}
- Lifestyle: Smoker: ${profile?.lifestyle?.smoker || false}, Alcohol: ${profile?.lifestyle?.alcohol || "none"}, Exercise: ${profile?.lifestyle?.exerciseFrequency || "unknown"}, Sleep: ${profile?.lifestyle?.sleepHours || "unknown"}hrs, Diet: ${profile?.lifestyle?.diet || "unknown"}
- Current Medicines: ${JSON.stringify(profile?.medicines || [])}
- Current Symptoms: ${profile?.currentSymptoms?.join(", ") || "none"}
- Symptom logs (last 30 entries with dates and severity): ${JSON.stringify(
      recentLogs.map((l) => ({
        date: l.date,
        symptoms: l.symptoms,
        severity: l.severity,
        notes: l.notes
      }))
    )}

IMPORTANT: Factor in genetic predispositions heavily (family history increases base risk). Analyze symptom trends over time (worsening = higher risk). Always include at least 2-3 risk items.`;
    const result = await callGroq(systemPrompt, userMessage);

    const prediction = await Prediction.create({
      userId: req.user.id,
      risks: result.risks || [],
      healthScore: result.healthScore || 75,
      trend: result.trend || "stable",
      correlations: result.correlations || [],
      summary: result.summary || ""
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Operation failed" });
  }
});


// POST /api/ai/whatif — scenario analysis
router.post("/whatif", async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return res.status(400).json({ success: false, error: "Scenario is required" });
    }

    const user = await User.findById(req.user.id).select("-password");
    const profile = await HealthProfile.findOne({ userId: req.user.id });
    const latestPrediction = await Prediction.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    const systemPrompt = `You are a predictive health AI. The user wants to know the long-term health impact of a lifestyle change.

You must respond with ONLY valid JSON. No markdown formatting, no backticks, no explanation text.

Return this exact JSON structure:
{
  "scenario": "string",
  "oneYear": {
    "summary": "string",
    "worseningConditions": ["string array"],
    "newRisks": ["string array"],
    "improvements": ["string array"],
    "healthScoreChange": number (e.g. -5 or +8)
  },
  "fiveYear": {
    "summary": "string",
    "worseningConditions": ["string array"],
    "newRisks": ["string array"],
    "improvements": ["string array"],
    "healthScoreChange": number
  },
  "tenYear": {
    "summary": "string",
    "worseningConditions": ["string array"],
    "newRisks": ["string array"],
    "improvements": ["string array"],
    "healthScoreChange": number
  }
}`;

    const userMessage = `The user wants to know: "${scenario}"

Their current health context:
- Age: ${user.age || "unknown"}, Gender: ${user.gender || "unknown"}
- Existing conditions: ${profile?.medicalHistory?.join(", ") || "none"}
- Family history (genetic risks): ${JSON.stringify(profile?.familyHistory || [])}
- Current risk profile: ${JSON.stringify(latestPrediction?.risks || [])}
- Current medicines: ${JSON.stringify(profile?.medicines || [])}
- Current health score: ${latestPrediction?.healthScore || 75}
- Recent symptom trend: ${latestPrediction?.trend || "stable"}
- Lifestyle: ${JSON.stringify(profile?.lifestyle || {})}

Consider how this change INTERACTS with their existing conditions and genetic predispositions. Be specific and realistic.`;

    const result = await callGroq(systemPrompt, userMessage);

    const whatifLog = await WhatIfLog.create({
      userId: req.user.id,
      scenario: result.scenario || scenario,
      impact: {
        oneYear: result.oneYear || {},
        fiveYear: result.fiveYear || {},
        tenYear: result.tenYear || {}
      }
    });

    res.json({ success: true, data: whatifLog });
  } catch (error) {
    console.error("AI Route error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Operation failed" });
  }
});


// POST /api/ai/seasonal — seasonal risk check
router.post("/seasonal", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await HealthProfile.findOne({ userId: req.user.id });
    const recentLogs = await SymptomLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const city = user.location?.city || "Unknown";
    const country = user.location?.country || "Unknown";

    const systemPrompt = `You are a seasonal health risk analyst. You must respond ONLY with valid JSON. No markdown, no backticks, no text.

Return: {
  "seasonalRisks": [{ "disease": "string", "season": "string", "regionRisk": "low"|"medium"|"high" }],
  "matchedSymptoms": ["string array"],
  "alert": "string or null",
  "recommendation": "string"
}`;

    const userMessage = `It is currently ${currentMonth} in ${city}, ${country}.
Patient's recent symptoms: ${recentLogs.flatMap(l => l.symptoms).join(", ") || "none"}
Patient's existing conditions: ${profile?.medicalHistory?.join(", ") || "none"}

Identify seasonal disease risks active in this region during this month. Compare with patient's symptoms to flag overlaps.`;

    const result = await callGroq(systemPrompt, userMessage);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Operation failed" });
  }
});


export default router;