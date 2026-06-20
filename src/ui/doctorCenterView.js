import { LocalStorageTool } from '../tools/localStorageTool.js';
import { PDFExporterTool } from '../tools/pdfExporterTool.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const DoctorCenterView = {
  render() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(b.date) - new Date(a.date));
    const symptoms = LocalStorageTool.getSymptoms().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const latestReport = reports[0] || null;
    const latestSymptom = symptoms[0] || null;

    if (!latestReport && !latestSymptom) {
      return `
        <div class="panel animate-fade-in" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 60px;">
          <i data-lucide="clipboard-list" style="width: 64px; height: 64px; margin: 0 auto 20px auto; color: var(--text-muted);"></i>
          <h2 style="margin-bottom: 8px;">No Consultation Notes Generated</h2>
          <p class="text-secondary" style="font-size: 0.95rem; margin-bottom: 24px;">
            The Doctor Summary Center compiles findings from your uploaded reports and symptoms. Please ingest a blood panel or log symptoms to create your guide.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <a href="#/reports" class="btn-header-action btn-accent" style="text-decoration: none;">Upload Report</a>
            <a href="#/symptoms" class="btn-header-action" style="text-decoration: none;">Triage Symptoms</a>
          </div>
        </div>
      `;
    }

    // Dynamic Compilation of Consultation checklist
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    // Leverage AI-generated questions and parameters directly from the latest report
    let questions = latestReport?.questionsForDoctor ? [...latestReport.questionsForDoctor] : [];
    
    let recommendedTests = [];
    if (latestReport?.thingsToMonitor) {
      if (Array.isArray(latestReport.thingsToMonitor)) {
        recommendedTests = [...latestReport.thingsToMonitor];
      } else {
        const t = latestReport.thingsToMonitor;
        recommendedTests = t.includes('.') ? t.split('.').map(s => s.trim()).filter(s => s.length > 3) : [t];
      }
    }

    const riskAlerts = [];
    let riskLevel = "Standard Care";

    // 1. Merge clinical alert rules for risk badge and alerts list
    if (latestReport && latestReport.metrics) {
      const m = latestReport.metrics;
      if (m.hba1c) {
        if (m.hba1c >= 6.5) {
          recommendedTests.push("Fasting plasma glucose / oral glucose tolerance test");
          recommendedTests.push("Basic metabolic panel (BMP) to check kidney function");
          riskLevel = "High Risk";
          riskAlerts.push(`Severe glycemic elevation noted: HbA1c is ${m.hba1c}%`);
        } else if (m.hba1c >= 5.7) {
          recommendedTests.push("Follow-up HbA1c screening in 3-6 months");
          riskLevel = riskLevel === "High Risk" ? "High Risk" : "Moderate Risk";
        }
      }

      if (m.ldl) {
        if (m.ldl >= 130) {
          recommendedTests.push("Repeat lipid panel (Total, LDL, HDL, Triglycerides)");
          recommendedTests.push("ASCVD cardiovascular risk assessment");
          riskLevel = "High Risk";
          riskAlerts.push(`Severe LDL cholesterol elevation noted: ${m.ldl} mg/dL`);
        }
      }

      if (m.tsh && m.tsh > 4.0) {
        recommendedTests.push("Free T4 and Free T3 thyroid hormone panels");
        riskLevel = riskLevel === "High Risk" ? "High Risk" : "Moderate Risk";
      }
    }

    // 2. Analyze symptoms
    if (latestSymptom) {
      const symText = latestSymptom.symptomText.toLowerCase();
      
      if (latestSymptom.severity === "Critical Warning" || latestSymptom.severity === "Emergency") {
        riskLevel = "Critical Warning";
        questions.push("I experienced sudden, crushing chest pain/pressure combined with shortness of breath. What cardiac assessments (ECG, echocardiogram, troponins) do I need immediately?");
        recommendedTests.push("Electrocardiogram (ECG) and Cardiac Troponins");
        riskAlerts.push("URGENT: Cardiac symptoms reported. Seek emergency clinical review.");
      }

      if (symText.includes("tingling") || symText.includes("numbness")) {
        questions.push("I am experiencing tingling and numbness in my toes. Could this represent early peripheral nerve damage (neuropathy) linked to my blood sugars?");
        recommendedTests.push("Diabetic monofilament foot exam");
      }
    }

    // Deduplicate tests
    recommendedTests = [...new Set(recommendedTests)];

    // Defaults
    if (questions.length === 0) {
      questions.push("Based on my overall health profile, what general preventive steps and lifestyle objectives do you recommend for the next 12 months?");
    }
    if (recommendedTests.length === 0) {
      recommendedTests.push("Routine annual physical and biomarker panels");
    }

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert no-print animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Doctor Summary Export:</strong> This summary compiles details from your reports and symptom timeline. Export this document as a PDF to provide a structured clinical agenda for your family doctor.
        </div>
      </div>

      <!-- Action Row -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;" class="no-print animate-fade-in">
        <button class="btn-header-action btn-accent" id="btn-print-summary">
          <i data-lucide="printer"></i> Print / Save as PDF
        </button>
      </div>

      <!-- Printable Consultation Sheet -->
      <div class="doctor-summary-sheet animate-fade-in" id="doctor-summary-sheet-print">
        
        <!-- Header -->
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">HealthGuardian AI - Clinician Summary</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Compiled on ${dateStr} • Patient Consultation Guide</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Urgency Level</div>
            <span class="badge ${riskLevel === 'Critical Warning' ? 'danger' : (riskLevel === 'High Risk' ? 'danger' : (riskLevel === 'Moderate Risk' ? 'warning' : 'good'))}" style="padding: 4px 12px; margin-top: 4px;">
              ${riskLevel}
            </span>
          </div>
        </div>

        <!-- Patient Info -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background-color: #f8fafc; padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 24px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">PATIENT</div>
            <div style="font-size: 0.85rem; font-weight: 700;">${latestReport?.patientName || "John Doe"}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">AGE / GENDER</div>
            <div style="font-size: 0.85rem; font-weight: 700;">${latestReport?.patientAge || 45} / ${latestReport?.patientGender || "Male"}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">LATEST REPORT</div>
            <div style="font-size: 0.85rem; font-weight: 700; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${latestReport ? latestReport.title : 'None'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">REPORT DATE</div>
            <div style="font-size: 0.85rem; font-weight: 700;">${latestReport ? latestReport.date : 'N/A'}</div>
          </div>
        </div>

        <!-- Risk Alerts if any -->
        ${riskAlerts.length > 0 ? `
          <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: var(--radius-sm); padding: 16px; margin-bottom: 24px; color: #c53030;">
            <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              ⚠️ Risk Detection Agent Advisories
            </h4>
            <ul style="padding-left: 18px; font-size: 0.85rem; line-height: 1.4;">
              ${riskAlerts.map(alert => `<li>${alert}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Clinical Summary Section -->
        <div class="doctor-sheet-section">
          <h3><i data-lucide="sparkles" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Clinical Interpretation Summary</h3>
          <p style="background-color: #f8fafc; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); line-height: 1.5; font-size: 0.85rem; color: var(--text-secondary);">
            ${latestReport?.summary || 'No clinical report summary generated yet. Please upload a report to synthesize details.'}
          </p>
        </div>

        <!-- Active Symptoms -->
        <div class="doctor-sheet-section">
          <h3><i data-lucide="clipboard" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Symptom History Summary</h3>
          <p style="font-style: italic; background-color: #f8fafc; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary);">
            ${latestSymptom ? `"${latestSymptom.symptomText}"` : 'No symptom complaints logged in current timeline.'}
          </p>
        </div>

        <!-- Biomarkers Summary -->
        ${latestReport ? `
          <div class="doctor-sheet-section">
            <h3><i data-lucide="activity" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Key Biomarker Measurements</h3>
            <table class="health-table" style="margin-top: 10px;">
              <thead>
                <tr>
                  <th style="background-color: #f8fafc;">Biomarker</th>
                  <th style="background-color: #f8fafc;">Extracted Value</th>
                  <th style="background-color: #f8fafc;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(latestReport.metrics || {}).map(key => {
                  const val = latestReport.metrics[key];
                  const assess = latestReport.assessments?.[key] || { status: 'neutral', label: 'Unclassified' };
                  const name = BIOMARKER_RANGES[key] ? BIOMARKER_RANGES[key].name : key;
                  return `
                    <tr>
                      <td style="font-size: 0.85rem; font-weight: 500;">${name}</td>
                      <td style="font-size: 0.85rem; font-weight: 700;">${val} ${BIOMARKER_RANGES[key]?.unit || ''}</td>
                      <td><span class="badge ${assess.status}">${assess.label}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Discussion Checklist -->
        <div class="doctor-sheet-section">
          <h3><i data-lucide="help-circle" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Targeted Consultation Checklist</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Review these questions with your physician during your consultation:</p>
          <ul style="list-style-type: none; padding-left: 0;">
            ${questions.map((q, idx) => `
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5;">
                <input type="checkbox" id="doctor-q-${idx}" style="margin-top: 4px; cursor: pointer; width: 15px; height: 15px; flex-shrink: 0;" />
                <label for="doctor-q-${idx}" style="cursor: pointer; font-size: 0.9rem; color: #334155;">${q}</label>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Suggested Tests -->
        <div class="doctor-sheet-section">
          <h3><i data-lucide="test-tube" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Recommended Diagnostic Follow-Up</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Suggested tests based on report abnormalities:</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${recommendedTests.map(test => `
              <div style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; color: #1e293b;">
                🧪 ${test}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 16px; text-align: center; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
          HealthGuardian AI is a medical tracking assistant. This report summarizes personal health logs for clinical discussions and does not constitute a formal diagnosis or medical advice.
        </div>

      </div>
    `;
  },

  afterRender() {
    const printBtn = document.getElementById('btn-print-summary');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        PDFExporterTool.export('doctor-summary-sheet-print');
      });
    }
  }
};
