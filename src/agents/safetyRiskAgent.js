import { BaseAgent } from './baseAgent.js';

export class SafetyRiskAgent extends BaseAgent {
  constructor() {
    super("Risk Detection Agent", "risk-detection-agent");
  }

  async run(data) {
    this.start();
    this.log("Auditing health indicators against risk parameters...");

    let isCritical = false;
    let severity = "Standard Care";
    let alertMessage = "";
    const clinicalDirectives = [];

    const { metrics, symptomAssessment } = data;

    // 1. Check symptoms for critical warnings
    if (symptomAssessment && (symptomAssessment.severity === "Critical Warning" || symptomAssessment.severity === "Emergency")) {
      isCritical = true;
      severity = "Critical Warning";
      alertMessage = "URGENT ADVISORY: Your symptom profile shows critical cardiovascular markers.";
      clinicalDirectives.push("Immediately contact emergency medical services or go to the nearest emergency department.");
      clinicalDirectives.push("Do not attempt to drive yourself to a facility.");
    }

    // 2. Check lab metrics for warning bounds
    if (metrics) {
      if (metrics.hba1c && metrics.hba1c >= 8.5) {
        isCritical = true;
        severity = severity === "Critical Warning" ? "Critical Warning" : "High Risk";
        alertMessage = alertMessage || "WARNING: Extracted glycemic index HbA1c shows significant metabolic stress.";
        clinicalDirectives.push(`Your HbA1c value (${metrics.hba1c}%) indicates a strong metabolic stress pattern. We recommend requesting an urgent consultation with your endocrinologist.`);
        clinicalDirectives.push("Monitor blood glucose values daily and strictly follow nutrition instructions.");
      }

      if (metrics.systolic && metrics.systolic >= 160) {
        isCritical = true;
        severity = severity === "Critical Warning" ? "Critical Warning" : "High Risk";
        alertMessage = alertMessage || "WARNING: Blood pressure levels are severely elevated.";
        clinicalDirectives.push(`Your blood pressure is tracked at ${metrics.systolic}/${metrics.diastolic || 'N/A'} mmHg. Rest and re-measure. If accompanied by headaches or chest symptoms, seek emergency care.`);
        clinicalDirectives.push("Confirm blood pressure medications compliance with your doctor.");
      }
    }

    if (!isCritical && symptomAssessment) {
      if (symptomAssessment.severity === "Moderate Concern") {
        severity = "Moderate Concern";
        alertMessage = "Notice: Health markers suggest moderate physiological fluctuations.";
        clinicalDirectives.push("Schedule a checkup with a primary care practitioner to discuss these changes.");
        clinicalDirectives.push("Log symptom frequency in your Health Timeline.");
      } else {
        severity = "Standard Care";
        alertMessage = "All monitored parameters are stable within standard bounds.";
        clinicalDirectives.push("Continue maintaining your daily health log and regular exercise.");
      }
    }

    const output = {
      severity,
      isCritical,
      alertMessage,
      clinicalDirectives
    };

    this.end(output);
    return output;
  }
}
