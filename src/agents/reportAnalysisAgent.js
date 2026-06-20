import { BaseAgent } from './baseAgent.js';
import { OCRTool } from '../tools/ocrTool.js';
import { PDFParserTool } from '../tools/pdfParserTool.js';
import { MetricExtractorTool } from '../tools/metricExtractorTool.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export class ReportAnalysisAgent extends BaseAgent {
  constructor() {
    super("Report Analysis Agent", "report-analysis-agent");
  }

  async run(input) {
    this.start();
    this.log("Reviewing uploaded report input...");

    let rawText = "";
    let file = input.file;

    if (file) {
      this.log(`Ingested file: ${file.name} (type: ${file.type})`);
      if (file.type === "application/pdf") {
        rawText = await this.executeTool(PDFParserTool, "parse", file);
      } else {
        rawText = await this.executeTool(OCRTool, "process", file);
      }
    } else if (input.rawText) {
      this.log("Ingested text transcript input directly.");
      rawText = input.rawText;
    } else {
      this.log("No valid report input provided.", "error");
      throw new Error("Missing report inputs for Analysis Agent");
    }

    this.log("Extracting biomarkers from parsed raw text...");
    const metrics = await this.executeTool(MetricExtractorTool, "extract", rawText);
    
    this.log("Sending report transcript to secure backend API for Gemini analysis...");
    
    // Call Express API backend route
    const response = await fetch('/api/report-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reportText: rawText })
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
    this.log("Gemini report interpretation received successfully.");

    // Evaluate each metric against clinical references for UI tables
    const assessments = {};
    Object.keys(metrics).forEach(key => {
      const val = metrics[key];
      const assessment = MetricExtractorTool.assessMetric(key, val);
      const metadata = BIOMARKER_RANGES[key];
      
      assessments[key] = {
        name: metadata ? metadata.name : key,
        value: val,
        unit: metadata ? metadata.unit : "",
        status: assessment.status, // 'good', 'warning', 'danger'
        label: assessment.label,
        rangeText: assessment.rangeText,
        description: metadata ? metadata.description : ""
      };
    });

    const output = {
      id: `rep-${Date.now()}`,
      title: input.title || file?.name?.replace(/\.[^/.]+$/, "") || "Biomarker Report",
      date: input.date || new Date().toISOString().split('T')[0],
      type: input.type || "Blood Panel",
      rawText,
      metrics,
      assessments,
      // Real Gemini structured content
      summary: geminiData.summary,
      importantFindings: geminiData.importantFindings || [],
      whatItMeans: Array.isArray(geminiData.whatItMeans) ? geminiData.whatItMeans.join(' ') : geminiData.whatItMeans,
      possibleCauses: Array.isArray(geminiData.possibleCauses) ? geminiData.possibleCauses.join(' ') : geminiData.possibleCauses,
      thingsToMonitor: Array.isArray(geminiData.thingsToMonitor) ? geminiData.thingsToMonitor.join(' ') : geminiData.thingsToMonitor,
      questionsForDoctor: geminiData.questionsForDoctor || [],
      disclaimer: geminiData.disclaimer || "Disclaimer: This assessment is generated for educational purposes based on text extractions and is not a clinical diagnosis or medical treatment plan. Always present this lab report and consult with a licensed physician."
    };

    this.end(output);
    return output;
  }
}
