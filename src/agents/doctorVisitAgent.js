import { BaseAgent } from './baseAgent.js';
import { LocalStorageTool } from '../tools/localStorageTool.js';

export class DoctorVisitPreparationAgent extends BaseAgent {
  constructor() {
    super("Doctor Summary Agent", "doctor-summary-agent");
  }

  async run(data) {
    this.start();
    this.log("Compiling timeline logs to request backend Gemini synthesis...");

    const { reportAnalysis, symptomAssessment, safetyRisk, insightGeneration } = data;
    
    // Retrieve histories from local storage to send to backend
    const allReports = LocalStorageTool.getReports();
    const allSymptoms = LocalStorageTool.getSymptoms();

    this.log(`Sending ${allReports.length} reports and ${allSymptoms.length} symptom logs to backend API...`);

    const response = await fetch('/api/doctor-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reports: allReports.map(r => ({ date: r.date, title: r.title, metrics: r.metrics })),
        symptoms: allSymptoms.map(s => ({ date: s.date, text: s.symptomText, severity: s.severity }))
      })
    });

    if (!response.ok) {
      let errorMsg = "Failed to compile doctor checklist via Gemini.";
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const geminiData = await response.json();
    this.log("Gemini consultation summary compiled successfully.");

    // Format output matching view requirements
    const visitSummary = {
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      patientName: "John Doe",
      age: 45,
      gender: "Male",
      reportTitle: reportAnalysis?.title || "None loaded",
      reportDate: reportAnalysis?.date || "N/A",
      symptomHistory: symptomAssessment?.symptomText || (allSymptoms[0] ? allSymptoms[0].symptomText : "No active symptoms logged."),
      riskLevel: safetyRisk?.severity || "Standard Care",
      healthScore: insightGeneration?.healthScore || 95,
      // Mapping real Gemini response keys
      summary: geminiData.summary || "Summary not compiled.",
      observations: geminiData.observations || [],
      questions: geminiData.doctorQuestions || [],
      suggestedTests: geminiData.observations?.slice(0, 2).map(o => `Monitor parameters related to: ${o}`) || ["Routine health follow-ups"],
      alerts: safetyRisk?.clinicalDirectives || []
    };

    this.end(visitSummary);
    return visitSummary;
  }
}
