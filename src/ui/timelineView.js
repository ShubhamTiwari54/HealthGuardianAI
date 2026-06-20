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
          <strong>Patient Health Timeline & Reminders:</strong> Track your medical checkups and manage medication timings chronologically. Add scheduling reminders below, and HealthGuardian AI will alert you when they are due.
        </div>
      </div>

      <div class="panel animate-fade-in" style="max-width: 800px; margin: 0 auto;">
        <div class="panel-header" style="margin-bottom: 20px;">
          <h2 class="panel-title"><i data-lucide="calendar"></i> Health History Timeline</h2>
          <span class="text-secondary" style="font-size: 0.8rem;">Chronological Journal</span>
        </div>

        <!-- Schedule Reminder Form Panel (Initially Collapsed) -->
        <div id="reminder-form-panel" style="display: none; margin-bottom: 24px; padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #f8fafc;">
          <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="clock" style="color: var(--accent-primary); width: 18px; height: 18px;"></i> Schedule Medication / Checkup Reminder
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label class="form-label" for="rem-input-title">Reminder Title / Medication Details</label>
              <input type="text" class="form-control" id="rem-input-title" placeholder="e.g. Metformin 500mg or Cardiologist checkup" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label" for="rem-input-type">Reminder Category</label>
                <select id="rem-input-type" class="form-control">
                  <option value="medication">💊 Medication Timing</option>
                  <option value="checkup">📅 Doctor Checkup / Lab Test</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="rem-input-datetime">Scheduled Date & Time</label>
                <input type="datetime-local" class="form-control" id="rem-input-datetime" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="rem-input-notes">Dosage Instructions / Special Notes</label>
              <textarea class="form-control" id="rem-input-notes" placeholder="e.g. Take 1 tablet after meals. Fast 12 hours prior to panel." style="height: 60px;"></textarea>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 8px;">
              <button class="btn-header-action btn-accent" id="btn-save-reminder" style="flex: 1; justify-content: center;">
                Save Scheduled Reminder
              </button>
              <button class="btn-header-action" id="btn-cancel-reminder" style="justify-content: center;">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px;">
          <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5; margin: 0;">
            A consolidated chronological journal tracking your medical uploads, symptom assessments, and reminders.
          </p>
          <button class="btn-header-action btn-accent" id="btn-toggle-reminder-form" style="flex-shrink: 0;">
            <i data-lucide="plus"></i> Add Timing Reminder
          </button>
        </div>

        <div class="timeline">
          ${timeline.length > 0 ? timeline.map(event => this.buildTimelineCardHTML(event)).join('') : `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
              <i data-lucide="calendar-range" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--border-color);"></i>
              <p style="font-size: 0.9rem;">Timeline is empty. Please upload a report or schedule a reminder to begin.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  buildTimelineCardHTML(event) {
    const data = event.data || {};
    let badgeClass = 'report';
    let typeLabel = 'Lab Panel';
    let summaryText = event.description || '';

    if (event.type === 'symptom') {
      badgeClass = 'symptom';
      typeLabel = 'Symptom Triage';
    } else if (event.type === 'reminder') {
      badgeClass = 'warning';
      typeLabel = data.type === 'medication' ? '💊 Medication' : '📅 Checkup';
      if (data.completed) {
        badgeClass = 'good';
        typeLabel += ' (Taken)';
      }
    }

    return `
      <div class="timeline-item animate-fade-in">
        <div class="timeline-icon" style="border-color: ${event.type === 'report' ? 'var(--accent-primary)' : (event.type === 'symptom' ? 'var(--accent-secondary)' : 'var(--accent-emerald)')};"></div>
        <div class="timeline-date">${event.date}</div>
        <div class="timeline-card" style="${event.type === 'reminder' && !data.completed ? 'border-left: 3px solid var(--accent-amber);' : ''}">
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
              ${event.type === 'reminder' ? `
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 6px; font-size: 0.75rem; text-transform: uppercase;">Reminder Configuration:</div>
                <div style="font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary);">
                  Time Scheduled: <strong>${data.datetime?.replace('T', ' ')}</strong>
                </div>
                <div style="font-size: 0.8rem; line-height: 1.4; margin-top: 4px; color: var(--text-secondary);">
                  Instructions: <em>${data.notes || 'None provided'}</em>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
                  ${data.completed ? `
                    <span class="badge good" style="font-size: 0.7rem; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
                      <i data-lucide="check" style="width: 12px; height: 12px;"></i> Completed / Taken
                    </span>
                  ` : `
                    <button class="btn-header-action btn-accent btn-mark-reminder-complete" data-id="${data.id}" style="padding: 6px 12px; font-size: 0.7rem; height: auto;">
                      Mark as Completed / Taken
                    </button>
                  `}
                </div>
              ` : (event.type === 'report' && data.metrics ? `
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
                <ul style="padding-left: 14px; font-size: 0.75rem; margin-bottom: 8px; line-height: 1.4; list-style-type: disc;">
                  ${(data.possibleCauses || []).map(cause => `<li>${cause}</li>`).join('')}
                </ul>
                
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase;">Suggested Care:</div>
                <ul style="padding-left: 14px; font-size: 0.75rem; line-height: 1.4; list-style-type: disc;">
                  ${(data.selfCareSuggestions || []).map(sug => `<li>${sug}</li>`).join('')}
                </ul>
              `)}
            </div>
          </details>

        </div>
      </div>
    `;
  },

  afterRender() {
    const toggleFormBtn = document.getElementById('btn-toggle-reminder-form');
    const cancelFormBtn = document.getElementById('btn-cancel-reminder');
    const saveReminderBtn = document.getElementById('btn-save-reminder');
    const formPanel = document.getElementById('reminder-form-panel');

    // Toggle reminder form
    if (toggleFormBtn && formPanel) {
      toggleFormBtn.addEventListener('click', () => {
        formPanel.style.display = formPanel.style.display === 'none' ? 'block' : 'none';
        if (formPanel.style.display === 'block') {
          document.getElementById('rem-input-title').focus();
        }
      });
    }

    if (cancelFormBtn && formPanel) {
      cancelFormBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    // Save scheduled reminder
    if (saveReminderBtn) {
      saveReminderBtn.addEventListener('click', () => {
        const title = document.getElementById('rem-input-title').value.trim();
        const type = document.getElementById('rem-input-type').value;
        const datetime = document.getElementById('rem-input-datetime').value;
        const notes = document.getElementById('rem-input-notes').value.trim();

        if (!title || !datetime) {
          alert("Please fill in both the Reminder Title and the Scheduled Date/Time.");
          return;
        }

        const reminder = {
          id: `rem-${Date.now()}`,
          title,
          type,
          datetime,
          notes,
          notified: false,
          completed: false
        };

        LocalStorageTool.addReminder(reminder);
        alert("Reminder scheduled successfully!");
        
        // Refresh Timeline view
        this.refreshView();
      });
    }

    // Mark reminder as completed
    document.querySelectorAll('.btn-mark-reminder-complete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const remId = btn.getAttribute('data-id');
        const reminders = LocalStorageTool.getReminders();
        const reminder = reminders.find(r => r.id === remId);

        if (reminder) {
          reminder.completed = true;
          LocalStorageTool.updateReminder(reminder);

          // Update corresponding timeline event description
          const timeline = LocalStorageTool.getTimeline();
          const event = timeline.find(e => e.id === `time-${remId}`);
          if (event) {
            event.title = `${reminder.type === 'medication' ? '💊 Medication' : '📅 Checkup'} (Taken): ${reminder.title}`;
            event.description = `Completed at ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}. Notes: ${reminder.notes || 'None'}`;
            event.data = reminder;
            LocalStorageTool.saveTimeline(timeline);
          }

          alert("Reminder marked as Completed / Taken!");
          this.refreshView();
        }
      });
    });
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
