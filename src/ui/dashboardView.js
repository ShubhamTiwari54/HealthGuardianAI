import { LocalStorageTool } from '../tools/localStorageTool.js';
import { TrendAnalyzerTool } from '../tools/trendAnalyzerTool.js';
import { AgentOrchestrator } from '../core/agentOrchestrator.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const DashboardView = {
  render() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
    const symptoms = LocalStorageTool.getSymptoms().sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
    
    const latestReport = reports[0] || null;
    const latestSymptom = symptoms[0] || null;

    // Calculate health score metrics
    const scoreData = TrendAnalyzerTool.calculateHealthScore(latestReport);

    // Calculate stats details
    const reportsCount = reports.length;
    const symptomsCount = symptoms.length;
    
    // Count alerts
    let alertCount = 0;
    if (latestReport && latestReport.metrics) {
      const m = latestReport.metrics;
      if (m.hba1c >= 5.7) alertCount++;
      if (m.ldl >= 100) alertCount++;
      if (m.tsh && (m.tsh < 0.4 || m.tsh > 4.0)) alertCount++;
      if (m.systolic >= 130) alertCount++;
    }
    if (latestSymptom && (latestSymptom.severity === 'Critical Warning' || latestSymptom.severity === 'Moderate Concern')) {
      alertCount++;
    }

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in no-print">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Health Tracking Over Time:</strong> HealthGuardian AI aggregates your lab results and symptom reports chronologically. This helps you monitor physiological trends over months, compare metrics, and generate doctor-ready consultation checklists.
        </div>
      </div>

      <!-- Stats Grid (Top Row) -->
      <div class="stats-grid animate-fade-in">
        <!-- 1. Health Score Card -->
        <div class="stats-card">
          <div class="stats-info">
            <div class="stats-header-row">
              <i data-lucide="activity"></i>
              <span class="stats-label">Health Score</span>
            </div>
            <div class="stats-val">${scoreData.score}<span style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">/100</span></div>
            <span class="badge ${scoreData.score < 60 ? 'danger' : (scoreData.score < 80 ? 'warning' : 'good')}" style="width: fit-content; margin-top: 6px; font-size: 0.65rem;">
              ${scoreData.label}
            </span>
          </div>
          <canvas id="sparkline-score" class="stats-chart-preview" width="80" height="45"></canvas>
        </div>

        <!-- 2. Reports Analyzed Card -->
        <div class="stats-card">
          <div class="stats-info">
            <div class="stats-header-row">
              <i data-lucide="file-text"></i>
              <span class="stats-label">Reports Analyzed</span>
            </div>
            <div class="stats-val">${reportsCount}</div>
            <span class="stats-subval">This Month</span>
          </div>
          <canvas id="sparkline-reports" class="stats-chart-preview" width="80" height="45"></canvas>
        </div>

        <!-- 3. Symptoms Tracked Card -->
        <div class="stats-card">
          <div class="stats-info">
            <div class="stats-header-row">
              <i data-lucide="heart"></i>
              <span class="stats-label">Symptoms Tracked</span>
            </div>
            <div class="stats-val">${symptomsCount}</div>
            <span class="stats-subval">This Month</span>
          </div>
          <canvas id="sparkline-symptoms" class="stats-chart-preview" width="80" height="45"></canvas>
        </div>

        <!-- 4. Health Alerts Card -->
        <div class="stats-card">
          <div class="stats-info">
            <div class="stats-header-row">
              <i data-lucide="bell-ring" style="color: ${alertCount > 0 ? 'var(--accent-warning)' : 'var(--text-secondary)'};"></i>
              <span class="stats-label">Health Alerts</span>
            </div>
            <div class="stats-val">${alertCount}</div>
            <span class="stats-subval" style="color: ${alertCount > 0 ? 'var(--accent-danger)' : 'var(--text-secondary)'}; font-weight: ${alertCount > 0 ? '700' : '500'};">
              ${alertCount > 0 ? 'Requires Attention' : 'All parameters stable'}
            </span>
          </div>
          <div style="background-color: ${alertCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.05)'}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${alertCount > 0 ? 'var(--accent-warning)' : 'var(--text-secondary)'};">
            <i data-lucide="${alertCount > 0 ? 'alert-triangle' : 'shield'}" style="width: 20px; height: 20px;"></i>
          </div>
        </div>
      </div>

      <!-- Middle Row: Chart & Ingest Form -->
      <div class="dashboard-middle-grid animate-fade-in">
        <!-- Health Trends Chart Card -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="trending-up"></i> Health Trends</h3>
            <select class="chart-dropdown" id="dashboard-chart-range">
              <option value="6">Last 6 Months</option>
              <option value="3">Last 3 Months</option>
            </select>
          </div>
          <div style="position: relative; height: 250px; width: 100%;">
            ${reports.length > 0 ? `
              <canvas id="dashboard-trends-canvas"></canvas>
            ` : `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.85rem;">
                No historical report data loaded. Upload reports to view trend progress.
              </div>
            `}
          </div>
        </div>

        <!-- Upload Medical Report Card -->
        <div class="panel" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <div class="panel-header" style="margin-bottom: 12px; border-bottom: none; padding-bottom: 0;">
            <h3 class="panel-title"><i data-lucide="upload-cloud"></i> Upload Medical Report</h3>
          </div>
          
          <div class="pdf-upload-mock" id="dashboard-upload-mock">
            <div class="pdf-icon-bg">
              <i data-lucide="file-text"></i>
            </div>
            <div class="upload-mock-text" id="dash-upload-stage">Drag & drop your file here</div>
            <div class="upload-mock-sub" id="dash-upload-sub">or click below to browse files</div>
            
            <input type="file" id="dashboard-file-input" style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.txt" />
            <button class="btn-upload-mock" onclick="document.getElementById('dashboard-file-input').click()">Browse Files</button>
          </div>

          <!-- Mini Inline Progress loader -->
          <div id="dash-upload-progress" style="display: none; padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 4px; color: var(--accent-primary);">
              <span id="dash-progress-stage">Parsing...</span>
              <span id="dash-progress-percent">0%</span>
            </div>
            <div class="progress-container" style="height: 6px;">
              <div class="progress-bar" id="dash-progress-bar-fill"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Symptom Triage & Clinician Summary -->
      <div class="dashboard-bottom-grid animate-fade-in">
        <!-- AI Symptom Analysis Card -->
        <div class="panel" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;">
          <div>
            <div class="panel-header" style="border: none; padding-bottom: 0; margin-bottom: 14px;">
              <h3 class="panel-title"><i data-lucide="sparkles"></i> AI Symptom Analysis</h3>
              <span class="badge good" style="font-size: 0.65rem; background-color: rgba(16, 185, 129, 0.1); color: var(--accent-success);">
                Analysis Complete
              </span>
            </div>
            
            ${latestSymptom ? `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Symptom Logs</div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${latestSymptom.symptomText.length > 80 ? latestSymptom.symptomText.substring(0, 80) + '...' : latestSymptom.symptomText}</h4>
                </div>
                <div style="display: flex; gap: 32px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Possible Cause</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent-primary);">${latestSymptom.possibleCauses?.[0] || 'Unknown'}</div>
                  </div>
                  <div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Severity</div>
                    <span class="badge ${latestSymptom.severity === 'Critical Warning' ? 'severity-critical' : (latestSymptom.severity === 'Moderate Concern' ? 'severity-warning' : 'severity-good')}" style="font-size: 0.7rem; padding: 2px 8px; margin-top: 2px;">
                      ${latestSymptom.severity}
                    </span>
                  </div>
                </div>
                <p class="text-secondary" style="font-size: 0.8rem; line-height: 1.4; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px;">
                  ${latestSymptom.selfCareSuggestions?.[0] || 'Monitor symptoms and log details in timeline.'}
                </p>
              </div>
            ` : `
              <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 40px 0;">
                No symptom logs analyzed yet. Visit the Symptoms workspace to check status.
              </div>
            `}
          </div>
          <a href="#/symptoms" style="font-size: 0.8rem; color: var(--accent-primary); text-decoration: none; font-weight: 600; margin-top: 12px; display: inline-block;">Check Symptoms →</a>
        </div>

        <!-- Doctor Summary Status Card -->
        <div class="panel" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;">
          <div>
            <div class="panel-header" style="border: none; padding-bottom: 0; margin-bottom: 14px;">
              <h3 class="panel-title"><i data-lucide="clipboard-list"></i> Doctor Summary</h3>
              <a href="#/doctor" style="color: var(--text-muted);"><i data-lucide="external-link" style="width: 16px; height: 16px;"></i></a>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: flex-start;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">Overall Status</div>
                  <span class="badge good" style="font-size: 0.75rem; padding: 3px 10px; display: inline-flex; align-items: center; gap: 4px; background-color: rgba(16, 185, 129, 0.1); color: var(--accent-success); font-weight: 700;">
                    Stable
                  </span>
                </div>
                <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px;">
                  ${latestReport ? `Your health parameters are stable. We detected ${alertCount} alerts that should be discussed with your physician during your next physical checkup.` : 'Please upload a medical blood panel report or log symptoms to generate a consultation checklist brief.'}
                </p>
              </div>
              <div style="width: 80px; height: 80px; background-color: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 2px 8px rgba(59, 130, 246, 0.05);">
                <i data-lucide="shield-check" style="width: 44px; height: 44px; color: var(--accent-primary);"></i>
              </div>
            </div>
          </div>
          <a href="#/doctor" style="font-size: 0.8rem; color: var(--accent-primary); text-decoration: none; font-weight: 600; margin-top: 12px; display: inline-block;">Export Doctor Summary →</a>
        </div>
      </div>
    `;
  },

  afterRender() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological chronological
    const latestReport = reports[reports.length - 1] || null;

    // 1. Draw Sparklines on canvases
    const drawSparkline = (canvasId, dataPoints, color) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const len = dataPoints.length;
      if (len <= 1) {
        // Draw a flat baseline
        ctx.moveTo(2, height / 2);
        ctx.lineTo(width - 2, height / 2);
      } else {
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        const range = max - min || 1;

        for (let i = 0; i < len; i++) {
          const x = (i / (len - 1)) * (width - 6) + 3;
          const y = height - ((dataPoints[i] - min) / range) * (height - 8) - 4;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // Draw stats card sparklines
    const hba1cHistory = reports.map(r => r.metrics.hba1c).filter(v => v !== undefined);
    const scoreHistory = reports.map(r => TrendAnalyzerTool.calculateHealthScore(r).score);
    const symptomsHistory = LocalStorageTool.getSymptoms().map((s, idx) => idx + 1);

    // Fallbacks if history is empty to make sparklines look nice
    drawSparkline('sparkline-score', scoreHistory.length > 0 ? scoreHistory : [75, 78, 80, 84], '#10b981');
    drawSparkline('sparkline-reports', hba1cHistory.length > 0 ? hba1cHistory : [5.8, 6.1, 6.4, 6.2], '#3b82f6');
    drawSparkline('sparkline-symptoms', symptomsHistory.length > 0 ? symptomsHistory : [1, 2, 3, 2, 4], '#8b5cf6');

    // 2. Render main health trends chart
    const renderTrendsChart = () => {
      const canvas = document.getElementById('dashboard-trends-canvas');
      if (!canvas || reports.length === 0) return;

      const labels = reports.map(r => r.date);
      const hba1cData = reports.map(r => r.metrics.hba1c).filter(v => v !== undefined);
      const ldlData = reports.map(r => r.metrics.ldl).filter(v => v !== undefined);
      const cholData = reports.map(r => r.metrics.cholesterol).filter(v => v !== undefined);

      const ctx = canvas.getContext('2d');

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Blood Sugar (HbA1c %)',
              data: hba1cData.map(v => v * 15), // scale for visible compare
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 4,
              fill: true
            },
            {
              label: 'Cholesterol (LDL mg/dL)',
              data: ldlData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 4,
              fill: true
            },
            {
              label: 'Total Cholesterol (mg/dL)',
              data: cholData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderWidth: 3,
              tension: 0.35,
              pointRadius: 4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 12, font: { family: 'Outfit', size: 11 } }
            },
            tooltip: { backgroundColor: '#ffffff', titleColor: '#0f172a', bodyColor: '#475569', borderColor: '#e2e8f0', borderWidth: 1 }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } }
            }
          }
        }
      });
    };

    renderTrendsChart();

    // 3. Handle File Uploads on Dashboard
    const fileInput = document.getElementById('dashboard-file-input');
    const uploadMock = document.getElementById('dashboard-upload-mock');
    const uploadProgress = document.getElementById('dash-upload-progress');
    
    const progressStage = document.getElementById('dash-progress-stage');
    const progressPercent = document.getElementById('dash-progress-percent');
    const progressFill = document.getElementById('dash-progress-bar-fill');

    const triggerIngestion = async (fileObj) => {
      uploadMock.style.display = 'none';
      uploadProgress.style.display = 'block';
      
      progressStage.textContent = "Initializing parser...";
      progressPercent.textContent = "0%";
      progressFill.style.width = "0%";

      try {
        await AgentOrchestrator.processReport({
          file: fileObj,
          title: fileObj.name.replace(/\.[^/.]+$/, ""),
          date: new Date().toISOString().split('T')[0],
          type: "Fitted Panel"
        }, (prog) => {
          progressStage.textContent = prog.stage;
          progressPercent.textContent = `${prog.percent}%`;
          progressFill.style.width = `${prog.percent}%`;
        });

        setTimeout(() => {
          // Success reload to update dashboard
          window.location.hash = '#/reports'; // Redirect to reports view to view output
          window.location.reload();
        }, 1000);
      } catch (err) {
        uploadProgress.style.display = 'none';
        uploadMock.style.display = 'flex';
        alert(`Analysis failed: ${err.message}`);
        console.error(err);
      }
    };

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          triggerIngestion(fileInput.files[0]);
        }
      });
    }

    if (uploadMock) {
      uploadMock.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadMock.style.borderColor = 'var(--accent-primary)';
      });

      uploadMock.addEventListener('dragleave', () => {
        uploadMock.style.borderColor = '#cbd5e1';
      });

      uploadMock.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadMock.style.borderColor = '#cbd5e1';
        if (e.dataTransfer.files.length > 0) {
          triggerIngestion(e.dataTransfer.files[0]);
        }
      });
    }
  }
};
