// Utility for Gemini API calls (text and vision)
// Usage: import { getGeminiSummary, getGeminiSuggestions } from './gemini';

/**
 * Get a Gemini medical summary (optionally with photo analysis)
 * @param {Object} params
 * @param {string[]} params.symptoms
 * @param {number} params.severity
 * @param {string} params.notes
 * @param {string|null} params.photo - base64 data URL (optional)
 * @returns {Promise<string>} Gemini summary
 */
export async function getGeminiSummary({ symptoms, severity, notes, photo }) {
  const apiKey = "AQ.Ab8RN6K8FMXJNwwysIT2D-_xonvtHbdaHLGfZBGwFFxsp_9yHw"; // Replace with your real key
  let endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=" + apiKey;
  let body;
  let prompt;
  if (photo) {
    prompt = `Patient symptoms: ${symptoms.join(", ")}. Severity: ${severity}/10. Notes: ${notes || "none"}. The following image is a photo of the patient's symptom. Please include visual analysis in your summary, but keep the tone friendly and non-alarming.`;
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-vision:generateContent?key=" + apiKey;
    body = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/png", data: photo.split(",")[1] } }
        ]
      }]
    };
  } else {
    prompt = `A patient is experiencing the following symptoms: ${symptoms.join(", ")}. Severity: ${severity}/10. Additional notes: ${notes || "none"}.

Please provide a brief, friendly, and supportive summary for the patient. Avoid alarming or overly clinical language. Focus on reassurance, possible next steps, and when to seek medical attention. If relevant, suggest simple self-care tips. Do not mention specific diseases unless absolutely necessary. Limit your answer to 2-3 sentences.`;
    body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    // Debug: log the full response
    if (typeof window !== 'undefined' && window.console) {
      console.log('[NoRog AI] Gemini API raw response:', data);
    }
    // Try to extract summary from all possible locations
    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!summary && data.candidates?.[0]?.content?.parts) {
      // Try joining all parts
      summary = data.candidates[0].content.parts.map(p => p.text).filter(Boolean).join('\n');
    }
    if (!summary) {
      summary = data.candidates?.[0]?.content?.text;
    }
    if (!summary) {
      summary = data.candidates?.[0]?.text;
    }
    if (!summary) {
      summary = data.text;
    }
    return summary || "No summary available. (NoRog AI could not generate a response. Please try again later.)";
  } catch (err) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('[NoRog AI] Gemini API error:', err);
    }
    return "Gemini analysis failed.";
  }
}

/**
 * Get Gemini-powered symptom suggestions for autocomplete
 * @param {string} search
 * @returns {Promise<string[]>}
 */
export async function getGeminiSuggestions(search) {
  const apiKey = "AQ.Ab8RN6K8FMXJNwwysIT2D-_xonvtHbdaHLGfZBGwFFxsp_9yHw"; // Replace with your real key
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=" + apiKey;
  const prompt = `Suggest up to 5 medical symptoms matching or related to: '${search}'. Only return a JSON array of strings, no explanation.`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return JSON.parse(text.match(/\[.*\]/)?.[0] || "[]");
  } catch {
    return [];
  }
}

/**
 * Get Gemini-based explanation for medicine interaction results.
 * @param {Object} params
 * @param {string[]} params.medicines
 * @param {Object} params.interactionResult
 * @returns {Promise<string>}
 */
export async function getGeminiMedicineInsight({ medicines, interactionResult }) {
  const apiKey = "AQ.Ab8RN6K8FMXJNwwysIT2D-_xonvtHbdaHLGfZBGwFFxsp_9yHw";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=" + apiKey;

  const meds = Array.isArray(medicines) ? medicines : [];
  const safeToTake = interactionResult?.safeToTake;
  const drugInteractions = interactionResult?.drugInteractions || [];
  const diseaseInteractions = interactionResult?.diseaseInteractions || [];

  const prompt = `You are NoRog AI, a friendly healthcare assistant.

Medicines entered: ${meds.join(", ") || "none"}
Safe to take together: ${safeToTake ? "yes" : "no"}
Drug-drug interactions found: ${drugInteractions.length}
Drug-condition interactions found: ${diseaseInteractions.length}

Important details from checker:
${JSON.stringify({ drugInteractions, diseaseInteractions })}

Write for a patient in warm, calm, and supportive language.
Use plain words, avoid jargon, and include simple practical next steps.

Write the explanation in 4-6 short bullet points.
Requirements:
- Explain what this result means in plain language
- Mention practical next steps (timing, hydration, food, monitoring)
- Clearly mention when to contact a doctor urgently
- Do not diagnose disease
- End with a reassuring one-line summary`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text && data.candidates?.[0]?.content?.parts) {
      text = data.candidates[0].content.parts.map((p) => p.text).filter(Boolean).join("\n");
    }
    if (!text) text = data.candidates?.[0]?.content?.text;
    if (!text) text = data.candidates?.[0]?.text;
    return text || "NoRog AI could not generate a medicine guidance note right now.";
  } catch (err) {
    if (typeof window !== "undefined" && window.console) {
      console.error("[NoRog AI] Gemini medicine insight error:", err);
    }
    return "NoRog AI guidance is temporarily unavailable. Please rely on interaction severity cards above and consult your doctor if unsure.";
  }
}
