import { EventBus, EVENTS } from './eventBus.js';
import { LocalStorageTool } from '../tools/localStorageTool.js';
import { ReportAnalysisAgent } from '../agents/reportAnalysisAgent.js';
import { SymptomAssessmentAgent } from '../agents/symptomAssessmentAgent.js';
import { HealthMemoryAgent } from '../agents/healthMemoryAgent.js';
import { InsightGenerationAgent } from '../agents/insightGenerationAgent.js';
import { SafetyRiskAgent } from '../agents/safetyRiskAgent.js';
import { DoctorVisitPreparationAgent } from '../agents/doctorVisitAgent.js';

class AgentOrchestratorClass {
  constructor() {
    this.reportAgent = new ReportAnalysisAgent();
    this.symptomAgent = new SymptomAssessmentAgent();
    this.memoryAgent = new HealthMemoryAgent();
    this.insightAgent = new InsightGenerationAgent();
    this.safetyAgent = new SafetyRiskAgent();
    this.doctorAgent = new DoctorVisitPreparationAgent();
    
    this.isBusy = false;
  }

  // Orchestration helper: delays execution slightly to simulate reasoning/processing
  async delay(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Pipeline 1: Medical Report Upload & Processing with progress hooks
  async processReport(input, onProgress) {
    if (this.isBusy) {
      throw new Error("The processing pipeline is currently busy. Please wait.");
    }
    
    this.isBusy = true;
    EventBus.publish(EVENTS.ORCHESTRATION_START, { pipeline: "Medical Report Processing" });
    
    try {
      // Step 1: Report character extraction (real OCR / PDF parsing)
      if (onProgress) onProgress({ stage: "Extracting report values", percent: 10 });
      
      let rawText = "";
      const file = input.file;

      if (file) {
        if (file.type === "application/pdf") {
          rawText = await this.reportAgent.executeTool(this.reportAgent.reportAgent?.pdfParser || window.PDFParserTool || require('../tools/pdfParserTool.js').PDFParserTool, "parse", file, (p) => {
            if (onProgress) onProgress({ stage: `Reading PDF text content...`, percent: Math.round(10 + (p * 0.4)) }); // scales 10% to 50%
          });
        } else if (file.type === "text/plain") {
          // Plain text helper
          if (onProgress) onProgress({ stage: "Reading clinical text...", percent: 30 });
          rawText = await this.reportAgent.executeTool(window.OCRTool || require('../tools/ocrTool.js').OCRTool, "process", file, (p) => {
            if (onProgress) onProgress({ stage: "Reading file...", percent: Math.round(10 + (p * 0.4)) });
          });
        } else {
          // Image OCR via Tesseract
          if (onProgress) onProgress({ stage: "Initializing Tesseract OCR core...", percent: 20 });
          rawText = await this.reportAgent.executeTool(window.OCRTool || require('../tools/ocrTool.js').OCRTool, "process", file, (p) => {
            if (onProgress) onProgress({ stage: `Running OCR text recognition...`, percent: Math.round(20 + (p * 0.4)) }); // scales 20% to 60%
          });
        }
      } else {
        rawText = input.rawText;
      }

      if (onProgress) onProgress({ stage: "Extracting biomarker values...", percent: 65 });
      await this.delay(500);

      // Run analysis agent
      const reportData = await this.reportAgent.run({
        title: input.title,
        date: input.date,
        type: input.type,
        rawText
      });
      reportData.id = reportData.id || `rep-${Date.now()}`;

      // Step 2: Health Memory Agent
      if (onProgress) onProgress({ stage: "Comparing with historical timeline...", percent: 75 });
      await this.delay(600);
      const memoryData = await this.memoryAgent.run(reportData);

      // Save report in Local Storage
      LocalStorageTool.addReport(reportData);
      EventBus.publish(EVENTS.DATA_UPDATED);

      // Step 3: Insight Generation Agent
      if (onProgress) onProgress({ stage: "Generating longitudinal insights...", percent: 85 });
      await this.delay(600);
      const insightData = await this.insightAgent.run(reportData);

      // Step 4: Safety & Risk Agent (Risk Detection)
      if (onProgress) onProgress({ stage: "Auditing health risk parameters...", percent: 90 });
      await this.delay(500);
      const safetyData = await this.safetyAgent.run({
        metrics: reportData.metrics,
        symptomAssessment: null
      });

      // Step 5: Doctor Visit Preparation Agent (Doctor Summary)
      if (onProgress) onProgress({ stage: "Compiling physician consultation guide...", percent: 95 });
      await this.delay(600);
      const doctorData = await this.doctorAgent.run({
        reportAnalysis: reportData,
        healthMemory: memoryData,
        insightGeneration: insightData,
        symptomAssessment: null,
        safetyRisk: safetyData
      });

      const results = {
        reportAnalysis: reportData,
        healthMemory: memoryData,
        insightGeneration: insightData,
        safetyRisk: safetyData,
        doctorVisit: doctorData
      };

      if (onProgress) onProgress({ stage: "Completed analysis", percent: 100 });
      await this.delay(400);

      EventBus.publish(EVENTS.ORCHESTRATION_END, {
        pipeline: "Medical Report Processing",
        results
      });

      this.isBusy = false;
      return results;
    } catch (error) {
      this.isBusy = false;
      this.reportAgent.log(`Processing pipeline failed: ${error.message}`, "error");
      throw error;
    }
  }

  // Pipeline 2: Symptom Assessment & Integration
  async processSymptoms(symptomText, onProgress) {
    if (this.isBusy) {
      throw new Error("The processing pipeline is currently busy. Please wait.");
    }

    this.isBusy = true;
    EventBus.publish(EVENTS.ORCHESTRATION_START, { pipeline: "Symptom Assessment & Triage" });

    try {
      if (onProgress) onProgress({ stage: "Analyzing symptoms cluster...", percent: 20 });
      await this.delay(800);

      // Step 1: Symptom Assessment Agent
      const symptomData = await this.symptomAgent.run(symptomText);
      symptomData.id = `sym-${Date.now()}`;
      symptomData.date = new Date().toISOString().split('T')[0];

      // Save symptom record
      LocalStorageTool.addSymptom(symptomData);
      EventBus.publish(EVENTS.DATA_UPDATED);

      // Step 2: Health Memory Agent
      if (onProgress) onProgress({ stage: "Querying patient health records...", percent: 50 });
      await this.delay(600);
      const reports = LocalStorageTool.getReports();
      const latestReport = reports.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
      const memoryData = await this.memoryAgent.run(latestReport || { metrics: {} });

      // Step 3: Safety & Risk Agent
      if (onProgress) onProgress({ stage: "Auditing emergency indicators...", percent: 75 });
      await this.delay(600);
      const safetyData = await this.safetyAgent.run({
        metrics: latestReport?.metrics || null,
        symptomAssessment: symptomData
      });

      // Step 4: Insight Generation Agent
      const insightData = await this.insightAgent.run(latestReport || { metrics: {} });

      // Step 5: Doctor Visit Preparation Agent
      if (onProgress) onProgress({ stage: "Compiling consultation notes...", percent: 90 });
      await this.delay(600);
      const doctorData = await this.doctorAgent.run({
        reportAnalysis: latestReport,
        healthMemory: memoryData,
        insightGeneration: insightData,
        symptomAssessment: symptomData,
        safetyRisk: safetyData
      });

      const results = {
        symptomAssessment: symptomData,
        healthMemory: memoryData,
        safetyRisk: safetyData,
        insightGeneration: insightData,
        doctorVisit: doctorData
      };

      if (onProgress) onProgress({ stage: "Completed triage", percent: 100 });
      await this.delay(400);

      EventBus.publish(EVENTS.ORCHESTRATION_END, {
        pipeline: "Symptom Assessment & Triage",
        results
      });

      this.isBusy = false;
      return results;
    } catch (error) {
      this.isBusy = false;
      this.symptomAgent.log(`Triage pipeline failed: ${error.message}`, "error");
      throw error;
    }
  }
}

export const AgentOrchestrator = new AgentOrchestratorClass();
