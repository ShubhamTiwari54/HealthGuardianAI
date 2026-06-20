import { BaseAgent } from './baseAgent.js';

export class SymptomAssessmentAgent extends BaseAgent {
  constructor() {
    super("Symptom Analysis Agent", "symptom-assessment-agent");
  }

  async run(symptomText) {
    this.start();
    this.log(`Analyzing symptom profile: "${symptomText.slice(0, 80)}..."`);
    
    this.log("Sending symptoms checklist to secure backend API for Gemini assessment...");
    
    // Call Express API backend route
    const response = await fetch('/api/symptom-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symptoms: symptomText })
    });

    if (!response.ok) {
      let errorMsg = "Failed to communicate with Gemini API.";
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const geminiData = await response.json();
    this.log("Gemini symptom assessment received successfully.");

    // Evaluate severity from causes or warnings to update badge
    let severity = "Mild";
    const text = symptomText.toLowerCase();
    
    if (text.includes("chest") || text.includes("pressure") || (text.includes("pain") && text.includes("breath")) || text.includes("radiating") || text.includes("sudden")) {
      severity = "Critical Warning";
    } else if (text.includes("thirst") || text.includes("urinate") || text.includes("tingling") || text.includes("numbness") || text.includes("chronic")) {
      severity = "Moderate Concern";
    }

    const output = {
      id: `sym-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: "Symptom Assessment",
      symptomText,
      severity,
      // Mapping real Gemini structured values
      possibleCauses: geminiData.possibleCauses || [],
      commonTriggers: geminiData.commonTriggers || [],
      selfCareSuggestions: geminiData.selfCareSuggestions || [],
      warningSigns: geminiData.warningSigns || [],
      whenToSeeDoctor: geminiData.whenToSeeDoctor || [],
      disclaimer: geminiData.disclaimer || "Disclaimer: This assessment is generated for educational purposes based on symptom checkups and is not a clinical diagnosis. Consult a certified doctor for health concerns.",
      urgency: geminiData.whenToSeeDoctor?.[0] || "Monitor symptoms. Consult a physician if symptoms worsen."
    };

    this.end(output);
    return output;
  }
}
