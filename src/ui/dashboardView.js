import { LocalStorageTool } from '../tools/localStorageTool.js';
import { TrendAnalyzerTool } from '../tools/trendAnalyzerTool.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const DashboardView = {
  render() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(b.date) - new Date(a.date));
    const symptoms = LocalStorageTool.getSymptoms().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const latestReport = reports[0] || null;
    const latestSymptom = symptoms[0] || null;

    // Calculate health score metrics
    const scoreData = TrendAnalyzerTool.calculateHealthScore(latestReport);

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Health Tracking Over Time:</strong> HealthGuardian AI aggregates your lab results and symptom reports chronologically. This helps you monitor physiological trends over months, compare metrics, and generate doctor-ready consultation checklists.
        </div>
      </div>

      <div class="dashboard-grid animate-fade-in">
        
        <!-- Left Column: Health Data overview -->
        <div class="dashboard-left">
          
          <!-- Key Metrics Block (Health Status Overview) -->
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
            
            <!-- Health Score radial -->
            <div class="health-score-widget">
              <h3 style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Health Score</h3>
              <div class="radial-progress-container">
                <svg class="radial-progress-svg" viewBox="0 0 160 160">
                  <circle class="radial-bg" cx="80" cy="80" r="70"></circle>
                  <circle class="radial-bar" id="dashboard-score-bar" cx="80" cy="80" r="70"></circle>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="var(--accent-primary)"></stop>
                      <stop offset="100%" stop-color="var(--accent-secondary)"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="radial-text">
                  <span class="radial-score-val" id="dashboard-score-val">0</span>
                  <span class="radial-score-lbl">Points</span>
                </div>
              </div>
              <div class="score-assessment">${scoreData.label}</div>
            </div>

            <!-- Health Insights (AI generated summaries) -->
            <div class="panel" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <h3 class="panel-title" style="font-size: 1.05rem; margin-bottom: 8px;"><i data-lucide="sparkles"></i> Health Insights</h3>
                <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5;" id="dashboard-insights-text">
                  Analyzing reports...
                </p>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 16px;">
                <a href="#/reports" class="btn-header-action btn-accent" style="text-decoration: none; flex: 1; justify-content: center; font-size: 0.8rem;">
                  <i data-lucide="file-plus" style="width: 14px; height: 14px;"></i> Upload Report
                </a>
                <a href="#/symptoms" class="btn-header-action" style="text-decoration: none; flex: 1; justify-content: center; font-size: 0.8rem;">
                  <i data-lucide="activity" style="width: 14px; height: 14px;"></i> Check Symptoms
                </a>
              </div>
            </div>

          </div>

          <!-- Trend Chart Preview -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title"><i data-lucide="line-chart"></i> Biomarker Progress Curve</h3>
              <a href="#/trends" style="font-size: 0.8rem; color: var(--accent-primary); text-decoration: none; font-weight: 600;">View All Trends →</a>
            </div>
            <div style="position: relative; height: 220px; width: 100%;">
              ${reports.length > 0 ? `
                <canvas id="dashboard-trend-canvas"></canvas>
              ` : `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.85rem;">
                  No historical data available. Upload your first blood report to view progress charts.
                </div>
              `}
            </div>
          </div>

          <!-- Recent Reports List -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title"><i data-lucide="file-text"></i> Recent Lab Reports</h3>
              <a href="#/timeline" style="font-size: 0.8rem; color: var(--accent-primary); text-decoration: none; font-weight: 600;">View History Timeline →</a>
            </div>
            ${reports.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${reports.slice(0, 2).map(rep => {
                  const keys = Object.keys(rep.metrics || {});
                  return `
                    <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${rep.title}</h4>
                        <p class="text-secondary" style="font-size: 0.75rem; margin-top: 4px;">Uploaded on ${rep.date} • ${rep.type}</p>
                      </div>
                      <div style="display: flex; gap: 6px;">
                        ${keys.slice(0, 3).map(k => `
                          <span class="badge" style="background-color: #f1f5f9; color: var(--text-secondary); font-size: 0.7rem;">
                            ${BIOMARKER_RANGES[k] ? BIOMARKER_RANGES[k].name.split(' ')[0] : k}: ${rep.metrics[k]}
                          </span>
                        `).join('')}
                        ${keys.length > 3 ? `<span class="badge" style="background-color: #f1f5f9; color: var(--text-secondary); font-size: 0.7rem;">+${keys.length - 3} more</span>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">
                No lab panels stored yet. Click 'Add Lab Report' to parse your values.
              </div>
            `}
          </div>

        </div>

        <!-- Right Column: Timeline Snippets & Tasks -->
        <div class="dashboard-right">
          
          <!-- Quick Actions Panel -->
          <div class="panel">
            <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
              <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="compass"></i> Quick Actions</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <a href="#/doctor" class="btn-header-action" style="text-decoration: none; font-size: 0.8rem; justify-content: flex-start; padding: 12px 16px;">
                <i data-lucide="clipboard-list" style="color: var(--accent-primary);"></i> Export Doctor Summary
              </a>
              <a href="#/timeline" class="btn-header-action" style="text-decoration: none; font-size: 0.8rem; justify-content: flex-start; padding: 12px 16px;">
                <i data-lucide="calendar" style="color: var(--accent-secondary);"></i> Browse Health Timeline
              </a>
            </div>
          </div>

          <!-- Recent Symptom History -->
          <div class="panel">
            <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
              <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="activity"></i> Recent Symptoms</h3>
            </div>
            ${symptoms.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${symptoms.slice(0, 2).map(sym => `
                  <div style="padding: 12px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${sym.date}</span>
                      <span class="badge ${sym.severity === 'Critical Warning' ? 'danger' : (sym.severity === 'Moderate Concern' ? 'warning' : 'good')}" style="font-size: 0.65rem; padding: 2px 6px;">
                        ${sym.severity}
                      </span>
                    </div>
                    <p class="text-secondary" style="font-size: 0.8rem; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      "${sym.symptomText}"
                    </p>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="color: var(--text-muted); font-size: 0.85rem; padding: 10px 0; text-align: center;">
                No symptom records logged.
              </div>
            `}
          </div>

          <!-- Upcoming Health Tasks -->
          <div class="panel">
            <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
              <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="check-square"></i> Upcoming Tasks</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 0.8rem; color: var(--text-secondary);">
                <input type="checkbox" checked disabled style="margin-top: 2px;" />
                <div>
                  <div style="text-decoration: line-through; color: var(--text-muted); font-weight: 500;">Upload January Baseline Panel</div>
                  <span style="color: var(--accent-success); font-size: 0.7rem; font-weight: 600;">Completed</span>
                </div>
              </div>
              <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 0.8rem; color: var(--text-secondary);">
                <input type="checkbox" ${latestReport && latestReport.date >= '2026-06-18' ? 'checked disabled' : ''} style="margin-top: 2px;" />
                <div>
                  <div style="${latestReport && latestReport.date >= '2026-06-18' ? 'text-decoration: line-through; color: var(--text-muted);' : ''} font-weight: 500;">Ingest June Metabolic Panel</div>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">Due June 2026</span>
                </div>
              </div>
              <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 0.8rem; color: var(--text-secondary);">
                <input type="checkbox" style="margin-top: 2px;" />
                <div>
                  <div style="font-weight: 500;">Schedule Metabolic Follow-Up Lab</div>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">Recommended in 3 months</span>
                </div>
              </div>
              <div style="display: flex; gap: 10px; align-items: flex-start; font-size: 0.8rem; color: var(--text-secondary);">
                <input type="checkbox" style="margin-top: 2px;" />
                <div>
                  <div style="font-weight: 500;">Print Consultation Notes for PCP Visit</div>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">Export via Doctor Summary</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  afterRender() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological
    const latestReport = reports[reports.length - 1] || null;

    // 1. Animate radial progress score
    const scoreData = TrendAnalyzerTool.calculateHealthScore(latestReport);
    const scoreValEl = document.getElementById('dashboard-score-val');
    const scoreBarEl = document.getElementById('dashboard-score-bar');
    
    if (scoreValEl && scoreBarEl) {
      let currentVal = 0;
      const targetScore = scoreData.score;
      
      const interval = setInterval(() => {
        if (currentVal >= targetScore) {
          clearInterval(interval);
        } else {
          currentVal++;
          scoreValEl.textContent = currentVal;
          const radius = 70;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (currentVal / 100) * circumference;
          scoreBarEl.style.strokeDashoffset = offset;
        }
      }, 15);
    }

    // 2. Load narrative insights into panel text
    const insightsEl = document.getElementById('dashboard-insights-text');
    if (insightsEl) {
      const trends = TrendAnalyzerTool.analyzeBiomarkerTrends(reports);
      let insightText = "";
      
      if (trends.hba1c && trends.hba1c.history.length > 1) {
        const h = trends.hba1c;
        if (h.direction === 'up') {
          insightText += `⚠️ <strong>HbA1c Glucose Progressing:</strong> Your average blood sugars rose by ${Math.abs(h.percentage).toFixed(1)}% to ${h.latest}% over the last checkup, moving further into the prediabetic/diabetic range. `;
        }
      }
      if (trends.ldl && trends.ldl.history.length > 1) {
        const l = trends.ldl;
        if (l.direction === 'up') {
          insightText += `📈 <strong>LDL Cholesterol Rising:</strong> Bad cholesterol has increased to ${l.latest} mg/dL. Cardiovascular screening advised. `;
        }
      }

      if (!insightText) {
        if (latestReport) {
          insightText = "Your biological parameters are currently stable. Log symptoms or repeat blood tests to update your timeline.";
        } else {
          insightText = "No patient reports have been loaded yet. Ingest your baseline lab metrics in the Upload workspace to compile initial profiles.";
        }
      }
      insightsEl.innerHTML = insightText;
    }

    // 3. Render Trend Chart Preview with Chart.js
    const canvas = document.getElementById('dashboard-trend-canvas');
    if (canvas && reports.length > 0) {
      const labels = reports.map(r => r.date);
      const hba1cData = reports.map(r => r.metrics.hba1c).filter(v => v !== undefined);
      const ldlData = reports.map(r => r.metrics.ldl).filter(v => v !== undefined);

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'HbA1c Glycation (%)',
              data: hba1cData,
              borderColor: '#2563eb',
              backgroundColor: gradient,
              fill: true,
              tension: 0.3,
              borderWidth: 3,
              pointBackgroundColor: '#2563eb',
              yAxisID: 'y'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#ffffff', titleColor: '#0f172a', bodyColor: '#475569', borderColor: '#e2e8f0', borderWidth: 1 }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Outfit' } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { color: '#64748b', font: { family: 'Outfit' } },
              title: { display: true, text: 'HbA1c (%)', color: '#2563eb', font: { family: 'Outfit', weight: 'bold' } }
            }
          }
        }
      });
    }
  }
};
