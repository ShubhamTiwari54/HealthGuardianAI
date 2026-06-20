import { LocalStorageTool } from '../tools/localStorageTool.js';
import { AgentOrchestrator } from '../core/agentOrchestrator.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const ReportWorkspaceView = {
  render() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
    const activeReport = reports[0] || null;

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Longitudinal Health Tracking:</strong> Upload and save multiple reports over time. HealthGuardian AI correlates these measurements chronologically to plot changes, helping you monitor whether parameters are improving or worsening.
        </div>
      </div>

      <div class="workspace-container animate-fade-in">
        
        <!-- Left Column: Upload & Ingestion Controls -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title"><i data-lucide="upload-cloud"></i> Ingest New Report</h2>
            </div>
            
            <!-- Real Drag & Drop Upload Zone -->
            <div class="upload-zone" id="report-upload-zone">
              <div class="upload-icon"><i data-lucide="file-text"></i></div>
              <h3 style="font-size: 1.05rem; margin-bottom: 6px; color: var(--text-primary);">Drag & drop your lab report here</h3>
              <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 16px;">Supports PDF files, image scans (PNG, JPG), or plain text files</p>
              <input type="file" id="report-file-input" style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.txt" />
              <button class="btn-header-action btn-accent" onclick="document.getElementById('report-file-input').click()" style="margin: 0 auto;">Select File from Device</button>
            </div>

            <!-- Loader / Progress Bar -->
            <div id="upload-progress-card" style="display: none; margin-top: 20px; background: rgba(37, 99, 235, 0.02); border: 1px solid rgba(37, 99, 235, 0.15); padding: 16px; border-radius: var(--radius-md);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-primary);" id="progress-stage-label">Extracting document text...</span>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);" id="progress-percentage-label">0%</span>
              </div>
              <div class="progress-container">
                <div class="progress-bar" id="progress-bar-fill"></div>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="upload-error-box" class="error-card" style="display: none;">
              <i data-lucide="alert-circle" style="flex-shrink: 0; width: 18px; height: 18px;"></i>
              <div id="upload-error-msg">Failed to parse document. Please ensure the file contains valid clinical biomarkers.</div>
            </div>

            <!-- Presets Grid -->
            <div class="demo-selector-box">
              <div class="demo-title">Grade Verification: Seeding preset timeline logs</div>
              <p class="text-secondary" style="font-size: 0.75rem; margin-bottom: 12px; line-height: 1.4;">
                Select a preset lab report file to trigger text extraction and run the internal agent pipeline:
              </p>
              <div class="demo-buttons-grid">
                <button class="btn-demo" id="btn-seed-jan" title="Baseline report, TSH elevation">1. Jan 2026 Panel</button>
                <button class="btn-demo" id="btn-seed-mar" title="Lipid elevation follow-up">2. Mar 2026 Panel</button>
                <button class="btn-demo" id="btn-seed-jun" title="Worsening diabetic indicators">3. Jun 2026 Panel</button>
              </div>
            </div>
          </div>

          <!-- Chronological Report List -->
          <div class="panel">
            <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
              <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="history"></i> Lab Report History</h3>
            </div>
            ${reports.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                ${reports.map(rep => `
                  <div class="report-history-item" data-id="${rep.id}" style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background-color 0.2s;">
                    <div>
                      <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${rep.title}</h4>
                      <p class="text-secondary" style="font-size: 0.75rem; margin-top: 2px;">${rep.date} • ${rep.type}</p>
                    </div>
                    <span class="badge normal" style="font-size: 0.7rem;">${Object.keys(rep.metrics || {}).length} Markers</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">
                No historical reports logged.
              </div>
            `}
          </div>

        </div>

        <!-- Right Column: Extracted Values & AI Explanations -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Extracted Biomarkers Table -->
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title"><i data-lucide="file-text"></i> Extracted Biomarkers</h2>
              <span class="text-secondary" id="active-report-title-label" style="font-size: 0.8rem;">
                ${activeReport ? `${activeReport.title} (${activeReport.date})` : 'No report selected'}
              </span>
            </div>
            
            <div id="extracted-biomarkers-container">
              ${activeReport ? this.buildBiomarkersTableHTML(activeReport) : `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <i data-lucide="file-spreadsheet" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--border-color);"></i>
                  <p style="font-size: 0.85rem;">Upload a file or choose a preset case to display extracted health metrics.</p>
                </div>
              `}
            </div>
          </div>

          <!-- Structured Report Analysis Output -->
          <div class="panel" id="report-insights-panel" style="${activeReport ? '' : 'display: none;'}">
            <div class="panel-header">
              <h2 class="panel-title"><i data-lucide="sparkles"></i> Health Insights & Explanation</h2>
            </div>
            
            <div id="report-explanation-container">
              ${activeReport ? this.buildReportAnalysisHTML(activeReport) : ''}
            </div>
          </div>

        </div>

      </div>
    `;
  },

  buildBiomarkersTableHTML(report) {
    const keys = Object.keys(report.metrics || {});
    const assessments = report.assessments || {};

    return `
      <table class="health-table">
        <thead>
          <tr>
            <th>Biomarker</th>
            <th>Value</th>
            <th>Status</th>
            <th>Reference Range</th>
          </tr>
        </thead>
        <tbody>
          ${keys.map(key => {
            const val = report.metrics[key];
            const meta = BIOMARKER_RANGES[key];
            const assess = assessments[key] || { status: 'neutral', label: 'Unclassified', rangeText: 'N/A' };
            
            return `
              <tr>
                <td>
                  <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-primary);">${meta ? meta.name : key}</div>
                </td>
                <td style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${val} ${meta ? meta.unit : ''}</td>
                <td><span class="badge ${assess.status}">${assess.label}</span></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary); font-family: monospace;">${assess.rangeText}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  buildReportAnalysisHTML(report) {
    return `
      <!-- Summary Section -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Assessment Summary</h4>
        <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5;">${report.summary || 'Summary not compiled.'}</p>
      </div>

      <!-- Important Findings -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Important Findings</h4>
        <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          ${(report.importantFindings || []).map(finding => `<li style="margin-bottom: 4px;">${finding}</li>`).join('')}
        </ul>
      </div>

      <!-- What It Means -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">What It Means</h4>
        <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5;">${report.whatItMeans || 'Explanation not compiled.'}</p>
      </div>

      <!-- Possible Causes -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Possible Contributing Factors <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">(Educational Only)</span></h4>
        <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5;">${report.possibleCauses || 'Causes not compiled.'}</p>
      </div>

      <!-- Things to Monitor -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Things To Monitor</h4>
        <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5;">${report.thingsToMonitor || 'Monitoring plan not compiled.'}</p>
      </div>

      <!-- Questions for Doctor -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Recommended Questions for Your Doctor</h4>
        <ul style="padding-left: 18px; color: var(--accent-primary); font-size: 0.85rem; line-height: 1.5;">
          ${(report.questionsForDoctor || []).map(q => `<li style="margin-bottom: 6px; font-weight: 500;">"${q}"</li>`).join('')}
        </ul>
      </div>

      <!-- Professional Disclaimer -->
      <div class="disclaimer-box">
        <strong>Important Advisory:</strong> ${report.disclaimer || 'Standard disclaimer applies.'}
      </div>
    `;
  },

  afterRender() {
    const uploadZone = document.getElementById('report-upload-zone');
    const fileInput = document.getElementById('report-file-input');
    
    const progressCard = document.getElementById('upload-progress-card');
    const progressStage = document.getElementById('progress-stage-label');
    const progressPercentage = document.getElementById('progress-percentage-label');
    const progressBarFill = document.getElementById('progress-bar-fill');
    
    const errorBox = document.getElementById('upload-error-box');
    const errorMsg = document.getElementById('upload-error-msg');
    
    const resultsContainer = document.getElementById('extracted-biomarkers-container');
    const insightsPanel = document.getElementById('report-insights-panel');
    const explanationContainer = document.getElementById('report-explanation-container');
    const titleLabel = document.getElementById('active-report-title-label');

    const triggerOrchestration = async (fileObj, titleText) => {
      // Reset UI states
      errorBox.style.display = "none";
      progressCard.style.display = "block";
      
      progressStage.textContent = "Initializing parser...";
      progressPercentage.textContent = "0%";
      progressBarFill.style.width = "0%";

      try {
        const results = await AgentOrchestrator.processReport({
          file: fileObj,
          title: titleText || fileObj.name.replace(/\.[^/.]+$/, ""),
          date: new Date().toISOString().split('T')[0],
          type: "Fitted Panel"
        }, (prog) => {
          // Progress callback from PDF.js/Tesseract.js
          if (progressStage && progressPercentage && progressBarFill) {
            progressStage.textContent = prog.stage;
            progressPercentage.textContent = `${prog.percent}%`;
            progressBarFill.style.width = `${prog.percent}%`;
          }
        });

        // Hide progress
        setTimeout(() => {
          progressCard.style.display = "none";
          
          // Render outcomes
          if (resultsContainer && explanationContainer && insightsPanel && titleLabel) {
            resultsContainer.innerHTML = this.buildBiomarkersTableHTML(results.reportAnalysis);
            explanationContainer.innerHTML = this.buildReportAnalysisHTML(results.reportAnalysis);
            insightsPanel.style.display = "block";
            titleLabel.textContent = `${results.reportAnalysis.title} (${results.reportAnalysis.date})`;
          }
          
          // Flash page refresh to populate timeline histories
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }, 800);

      } catch (err) {
        progressCard.style.display = "none";
        errorBox.style.display = "flex";
        errorMsg.textContent = `Document analysis failed: ${err.message || err}`;
        console.error(err);
      }
    };

    // 1. File Upload Triggers
    if (uploadZone) {
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
      });

      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
      });

      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          triggerOrchestration(files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        if (files.length > 0) {
          triggerOrchestration(files[0]);
        }
      });
    }

    // 2. Preset Fetch Simulation Buttons
    const triggerPreset = async (fileName, customTitle) => {
      progressCard.style.display = "block";
      progressStage.textContent = "Fetching sample report from workspace...";
      progressPercentage.textContent = "5%";
      progressBarFill.style.width = "5%";

      try {
        const response = await fetch(`/samples/${fileName}`);
        if (!response.ok) {
          throw new Error(`Could not find preset sample report: ${fileName}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "text/plain" });
        
        triggerOrchestration(file, customTitle);
      } catch (err) {
        progressCard.style.display = "none";
        errorBox.style.display = "flex";
        errorMsg.textContent = `Sample fetch failed: ${err.message || err}`;
      }
    };

    const seedJan = document.getElementById('btn-seed-jan');
    const seedMar = document.getElementById('btn-seed-mar');
    const seedJun = document.getElementById('btn-seed-jun');

    if (seedJan) {
      seedJan.addEventListener('click', () => triggerPreset('thyroid_panel.txt', 'January Baseline Panel'));
    }
    if (seedMar) {
      seedMar.addEventListener('click', () => triggerPreset('lipid_panel.txt', 'March Lipid Follow-Up'));
    }
    if (seedJun) {
      seedJun.addEventListener('click', () => triggerPreset('diabetic_panel.txt', 'June Metabolic Panel'));
    }

    // 3. History item clicks (to swap views)
    document.querySelectorAll('.report-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const repId = item.getAttribute('data-id');
        const report = LocalStorageTool.getReports().find(r => r.id === repId);
        if (report && resultsContainer && explanationContainer && insightsPanel && titleLabel) {
          resultsContainer.innerHTML = this.buildBiomarkersTableHTML(report);
          explanationContainer.innerHTML = this.buildReportAnalysisHTML(report);
          insightsPanel.style.display = "block";
          titleLabel.textContent = `${report.title} (${report.date})`;
        }
      });
    });
  }
};
