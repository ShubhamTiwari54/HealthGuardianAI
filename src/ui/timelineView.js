import { LocalStorageTool } from '../tools/localStorageTool.js';
import { BIOMARKER_RANGES } from '../data/mockData.js';

export const TimelineView = {
  render() {
    const timeline = LocalStorageTool.getTimeline();

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Patient Health Timeline:</strong> Track your medical progress chronologically. Click on any report or symptom event below to inspect details, verify parameters, and review recommended doctor questions.
        </div>
      </div>

      <div class="panel animate-fade-in" style="max-width: 800px; margin: 0 auto;">
        <div class="panel-header">
          <h2 class="panel-title"><i data-lucide="calendar"></i> Health History Timeline</h2>
          <span class="text-secondary" style="font-size: 0.8rem;">Chronological Journal</span>
        </div>
        
        <p class="text-secondary" style="margin-bottom: 24px; font-size: 0.9rem; line-height: 1.5;">
          A consolidated chronological journal tracking your medical uploads, assessments, and warnings over time.
        </p>

        <div class="timeline">
          ${timeline.length > 0 ? timeline.map(event => this.buildTimelineCardHTML(event)).join('') : `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
              <i data-lucide="calendar-range" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--border-color);"></i>
              <p style="font-size: 0.9rem;">Timeline is empty. Please upload a report or check symptoms to begin tracking.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  buildTimelineCardHTML(event) {
    const isReport = event.type === 'report';
    const data = event.data || {};
    
    let badgeClass = 'report';
    let typeLabel = 'Lab Panel';
    let summaryText = event.description || '';

    if (!isReport) {
      badgeClass = 'symptom';
      typeLabel = 'Symptom Triage';
    }

    return `
      <div class="timeline-item">
        <div class="timeline-icon" style="border-color: ${isReport ? 'var(--accent-primary)' : 'var(--accent-secondary)'};"></div>
        <div class="timeline-date">${event.date}</div>
        <div class="timeline-card">
          <div class="timeline-header-row">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${event.title}</h4>
            <span class="timeline-type-badge ${badgeClass}">${typeLabel}</span>
          </div>

          <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 12px;">
            ${summaryText}
          </p>

          <!-- Collapsible Details Dropdown -->
          <details style="cursor: pointer; font-size: 0.8rem; color: var(--accent-primary);">
            <summary style="font-weight: 600; outline: none; margin-bottom: 8px; user-select: none;">Show Details</summary>
            
            <div style="cursor: default; padding: 12px; background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); margin-top: 8px;">
              ${isReport && data.metrics ? `
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 6px; font-size: 0.75rem; text-transform: uppercase;">Extracted Biomarkers:</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${Object.keys(data.metrics).map(k => {
                    const val = data.metrics[k];
                    const meta = BIOMARKER_RANGES[k];
                    const assess = data.assessments?.[k] || { label: 'Normal', status: 'good' };
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                        <span>${meta ? meta.name : k}: <strong style="color: var(--text-primary);">${val} ${meta ? meta.unit : ''}</strong></span>
                        <span class="badge ${assess.status}" style="font-size: 0.65rem; padding: 2px 6px;">${assess.label}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 6px; font-size: 0.75rem; text-transform: uppercase;">Assessment Findings:</div>
                <div style="font-size: 0.8rem; line-height: 1.4; margin-bottom: 8px;">"${data.symptomText}"</div>
                
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase; margin-top: 8px;">Possible Causes:</div>
                <ul style="padding-left: 14px; font-size: 0.75rem; margin-bottom: 8px; line-height: 1.4;">
                  ${(data.possibleCauses || []).map(cause => `<li>${cause}</li>`).join('')}
                </ul>
                
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase;">Suggested Care:</div>
                <ul style="padding-left: 14px; font-size: 0.75rem; line-height: 1.4;">
                  ${(data.selfCareSuggestions || []).map(sug => `<li>${sug}</li>`).join('')}
                </ul>
              `}
            </div>
          </details>

        </div>
      </div>
    `;
  },

  afterRender() {
    // Standard layout binders
  }
};
