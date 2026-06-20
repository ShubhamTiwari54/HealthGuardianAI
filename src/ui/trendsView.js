import { LocalStorageTool } from '../tools/localStorageTool.js';
import { TrendAnalyzerTool } from '../tools/trendAnalyzerTool.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const TrendsView = {
  activeTab: 'hba1c',

  render() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological
    const trends = TrendAnalyzerTool.analyzeBiomarkerTrends(reports);

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Health Trends Over Time:</strong> Monitoring your clinical marker trajectory over time is critical. An upward or downward slope indicates physiological patterns that can warn of metabolic, lipid, or thyroid distress before they reach critical bounds.
        </div>
      </div>

      <div class="dashboard-grid animate-fade-in">
        
        <!-- Left: Interactive Chart Workspace -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="trending-up"></i> Biomarker Progress Charts</h3>
          </div>

          <!-- Trends Tab Selector -->
          <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <button class="btn-demo ${this.activeTab === 'hba1c' ? 'active' : ''}" id="tab-trend-hba1c" style="padding: 8px 16px;">Metabolic (HbA1c)</button>
            <button class="btn-demo ${this.activeTab === 'ldl' ? 'active' : ''}" id="tab-trend-ldl" style="padding: 8px 16px;">Lipids (LDL)</button>
            <button class="btn-demo ${this.activeTab === 'tsh' ? 'active' : ''}" id="tab-trend-tsh" style="padding: 8px 16px;">Endocrine (TSH)</button>
          </div>

          <div style="position: relative; height: 300px; width: 100%;">
            ${reports.length > 0 ? `
              <canvas id="trends-chart-canvas"></canvas>
            ` : `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.85rem;">
                No historical report data loaded. Upload reports to populate trends charts.
              </div>
            `}
          </div>
        </div>

        <!-- Right: Trend Summary delta panels -->
        <div class="panel">
          <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
            <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="activity"></i> Trajectory Analysis</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;" id="trends-summary-container">
            ${reports.length > 0 ? this.buildTrendSummariesHTML(trends) : `
              <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px; text-align: center;">
                Upload multiple blood panels to track slopes.
              </div>
            `}
          </div>
        </div>

      </div>
    `;
  },

  buildTrendSummariesHTML(trends) {
    const keys = ['hba1c', 'ldl', 'tsh'];
    
    return keys.map(key => {
      const tr = trends[key];
      const meta = BIOMARKER_RANGES[key];
      if (!tr) return '';

      const isUp = tr.direction === 'up';
      const isDown = tr.direction === 'down';
      
      let badgeClass = 'normal';
      let icon = 'arrow-right';
      
      if (isUp) {
        badgeClass = key === 'hba1c' || key === 'ldl' ? 'danger' : 'warning';
        icon = 'arrow-up-right';
      } else if (isDown) {
        badgeClass = key === 'hba1c' || key === 'ldl' ? 'good' : 'warning';
        icon = 'arrow-down-right';
      }

      return `
        <div style="padding: 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${meta ? meta.name : key}</span>
            <span class="badge ${badgeClass}" style="font-size: 0.65rem; padding: 2px 8px; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="${icon}" style="width: 10px; height: 10px;"></i> ${tr.direction.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            ${tr.latest} ${meta ? meta.unit : ''}
          </div>
          <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4;">${tr.summaryText}</p>
        </div>
      `;
    }).join('');
  },

  afterRender() {
    const reports = LocalStorageTool.getReports().sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological
    const canvas = document.getElementById('trends-chart-canvas');

    // 1. Draw chart if data exists
    let chartInstance = null;
    
    const drawChart = (markerKey) => {
      if (!canvas || reports.length === 0) return;
      
      // Clear previous chart instance if exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      const filteredReports = reports.filter(r => r.metrics && r.metrics[markerKey] !== undefined);
      const labels = filteredReports.map(r => r.date);
      const dataPoints = filteredReports.map(r => r.metrics[markerKey]);

      const meta = BIOMARKER_RANGES[markerKey];
      const unit = meta ? meta.unit : '';
      const name = meta ? meta.name : markerKey;

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 260);
      
      // Determine line color based on marker
      let strokeColor = '#2563eb';
      if (markerKey === 'ldl') strokeColor = '#0ea5e9';
      if (markerKey === 'tsh') strokeColor = '#f59e0b';

      gradient.addColorStop(0, `${strokeColor}33`); // 20% opacity
      gradient.addColorStop(1, `${strokeColor}00`); // 0% opacity

      chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: `${name} (${unit})`,
              data: dataPoints,
              borderColor: strokeColor,
              backgroundColor: gradient,
              fill: true,
              tension: 0.25,
              borderWidth: 3,
              pointBackgroundColor: strokeColor,
              pointRadius: 5,
              pointHoverRadius: 7
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
              title: { display: true, text: `${name} (${unit})`, color: strokeColor, font: { family: 'Outfit', weight: 'bold' } }
            }
          }
        }
      });
    };

    // Initial draw
    drawChart(this.activeTab);

    // Tab buttons click bindings
    const tabHba1c = document.getElementById('tab-trend-hba1c');
    const tabLdl = document.getElementById('tab-trend-ldl');
    const tabTsh = document.getElementById('tab-trend-tsh');

    if (tabHba1c) {
      tabHba1c.addEventListener('click', () => {
        this.activeTab = 'hba1c';
        this.refreshView();
      });
    }

    if (tabLdl) {
      tabLdl.addEventListener('click', () => {
        this.activeTab = 'ldl';
        this.refreshView();
      });
    }

    if (tabTsh) {
      tabTsh.addEventListener('click', () => {
        this.activeTab = 'tsh';
        this.refreshView();
      });
    }
  },

  refreshView() {
    const container = document.getElementById('app-view-mount');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
      if (window.lucide) window.lucide.createIcons();
    }
  }
};
