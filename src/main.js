import { LocalStorageTool } from './tools/localStorageTool.js';
import { TrendAnalyzerTool } from './tools/trendAnalyzerTool.js';
import { Router } from './ui/router.js';

// Views
import { DashboardView } from './ui/dashboardView.js';
import { ReportWorkspaceView } from './ui/reportWorkspaceView.js';
import { SymptomWorkspaceView } from './ui/symptomWorkspaceView.js';
import { TrendsView } from './ui/trendsView.js';
import { AIAssistantView } from './ui/aiAssistantView.js';
import { DoctorCenterView } from './ui/doctorCenterView.js';
import { TimelineView } from './ui/timelineView.js';
import { SettingsView } from './ui/settingsView.js';

// 1. Seed database with baseline data
LocalStorageTool.seedDatabase();

// 2. Register Views in Hashing Router
Router.register('#/dashboard', DashboardView);
Router.register('#/reports', ReportWorkspaceView);
Router.register('#/symptoms', SymptomWorkspaceView);
Router.register('#/trends', TrendsView);
Router.register('#/assistant', AIAssistantView);
Router.register('#/doctor', DoctorCenterView);
Router.register('#/timeline', TimelineView);
Router.register('#/settings', SettingsView);

// Helper to update sidebar score widget dynamically
export function updateSidebarScore() {
  const reports = LocalStorageTool.getReports().sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestReport = reports[0] || null;
  const scoreData = TrendAnalyzerTool.calculateHealthScore(latestReport);

  const badgeEl = document.getElementById('sidebar-score-badge');
  const valueEl = document.getElementById('sidebar-score-value');
  const barEl = document.getElementById('sidebar-score-bar');

  if (badgeEl) {
    badgeEl.textContent = scoreData.label;
    badgeEl.className = 'score-badge';
    if (scoreData.score < 60) {
      badgeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      badgeEl.style.color = 'var(--accent-danger)';
    } else if (scoreData.score < 80) {
      badgeEl.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
      badgeEl.style.color = 'var(--accent-warning)';
    } else {
      badgeEl.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      badgeEl.style.color = 'var(--accent-success)';
    }
  }

  if (valueEl) {
    valueEl.innerHTML = `${scoreData.score}<span class="score-max">/100</span>`;
  }

  if (barEl) {
    barEl.style.width = `${scoreData.score}%`;
    if (scoreData.score < 60) {
      barEl.style.background = 'var(--accent-danger)';
    } else if (scoreData.score < 80) {
      barEl.style.background = 'var(--accent-warning)';
    } else {
      barEl.style.background = 'var(--gradient-emerald)';
    }
  }
}

// 3. Update header title and dynamic subtitle on hash change
const updateHeaderTitle = () => {
  const hash = window.location.hash || '#/dashboard';
  const headerTitle = document.getElementById('header-page-title');
  const headerSubtitle = document.getElementById('header-page-subtitle');
  
  // Also sync sidebar score card on every page change
  updateSidebarScore();

  if (headerTitle && headerSubtitle) {
    switch(hash) {
      case '#/dashboard':
        headerTitle.textContent = "Dashboard";
        headerSubtitle.textContent = "Welcome back! Here's your health overview.";
        break;
      case '#/reports':
        headerTitle.textContent = "Medical Reports";
        headerSubtitle.textContent = "Upload and analyze your lab panels to extract biomarkers.";
        break;
      case '#/symptoms':
        headerTitle.textContent = "Symptom Assessment";
        headerSubtitle.textContent = "Input symptoms for structured triage warnings and education.";
        break;
      case '#/trends':
        headerTitle.textContent = "Health Trends";
        headerSubtitle.textContent = "Longitudinal biological progress trajectories over time.";
        break;
      case '#/assistant':
        headerTitle.textContent = "Clinical AI Assistant";
        headerSubtitle.textContent = "Chat with secure AI for supportive and educational health insights.";
        break;
      case '#/doctor':
        headerTitle.textContent = "Doctor Summary";
        headerSubtitle.textContent = "Synthesize clinician briefing sheets and consultation checklists.";
        break;
      case '#/timeline':
        headerTitle.textContent = "Patient Health Timeline";
        headerSubtitle.textContent = "Chronological journal tracking checkups, panels, and reminders.";
        break;
      case '#/settings':
        headerTitle.textContent = "System Settings";
        headerSubtitle.textContent = "Configure platform preferences and reset sandbox database logs.";
        break;
      default:
        headerTitle.textContent = "HealthGuardian AI";
        headerSubtitle.textContent = "Longitudinal Health Intelligence";
    }
  }
};

window.addEventListener('hashchange', updateHeaderTitle);
window.addEventListener('load', updateHeaderTitle);

// 4. Initialize Router
Router.init('app-view-mount');

// 5. Expose Timeline/Score Refresh globally for background updates
window.TimelineViewInstance = TimelineView;
window.refreshSidebarScore = updateSidebarScore;

// 6. Reminders Background Alert Checker
function showReminderToast(reminder) {
  let container = document.getElementById('health-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'health-toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'val-prop-alert animate-fade-in';
  toast.style.width = '350px';
  toast.style.margin = '0';
  toast.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.15)';
  toast.style.border = '1px solid rgba(245, 158, 11, 0.3)';
  toast.style.borderLeft = '4px solid var(--accent-warning)';
  toast.style.background = '#ffffff';
  toast.style.color = 'var(--text-primary)';
  toast.style.padding = '16px';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.display = 'flex';
  toast.style.flexDirection = 'column';
  toast.style.gap = '10px';

  const typeIcon = reminder.type === 'medication' ? '💊' : '📅';
  const typeLabel = reminder.type === 'medication' ? 'Medication Timing' : 'Doctor Checkup';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
      <span style="font-weight: 700; color: var(--accent-primary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
        <span>${typeIcon}</span> ${typeLabel} Alert
      </span>
      <button style="border: none; background: transparent; cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; color: var(--text-secondary);" id="toast-close-${reminder.id}">×</button>
    </div>
    <div>
      <h4 style="font-size: 0.9rem; font-weight: 700; margin: 0; color: var(--text-primary);">${reminder.title}</h4>
      <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 4px 0 0 0;">${reminder.notes || 'No notes'}</p>
    </div>
    <div style="display: flex; gap: 8px; margin-top: 4px;">
      <button id="toast-complete-${reminder.id}" style="padding: 6px 12px; font-size: 0.7rem; background-color: var(--accent-success); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; height: auto;">
        Mark as Taken/Done
      </button>
      <button id="toast-snooze-${reminder.id}" style="padding: 6px 12px; font-size: 0.7rem; background-color: #f1f5f9; color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; height: auto;">
        Snooze
      </button>
    </div>
  `;

  container.appendChild(toast);

  // Close / Snooze handlers
  const closeBtn = toast.querySelector(`#toast-close-${reminder.id}`);
  const snoozeBtn = toast.querySelector(`#toast-snooze-${reminder.id}`);
  const completeBtn = toast.querySelector(`#toast-complete-${reminder.id}`);

  if (closeBtn) closeBtn.onclick = () => toast.remove();
  if (snoozeBtn) snoozeBtn.onclick = () => toast.remove();

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      reminder.completed = true;
      LocalStorageTool.updateReminder(reminder);

      const timeline = LocalStorageTool.getTimeline();
      const event = timeline.find(e => e.id === `time-${reminder.id}`);
      if (event) {
        event.title = `${reminder.type === 'medication' ? '💊 Medication' : '📅 Checkup'} (Taken): ${reminder.title}`;
        event.description = `Completed at ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}. Notes: ${reminder.notes || 'None'}`;
        event.data = reminder;
        LocalStorageTool.saveTimeline(timeline);
      }

      // Check if we are currently on timeline page and refresh if so
      if (window.location.hash === '#/timeline') {
        const mount = document.getElementById('app-view-mount');
        if (mount && window.TimelineViewInstance) {
          mount.innerHTML = window.TimelineViewInstance.render();
          window.TimelineViewInstance.afterRender();
        }
      } else {
        alert(`Reminder "${reminder.title}" marked as Completed!`);
      }

      // Refresh sidebar health score widget
      updateSidebarScore();
      toast.remove();
    });
  }
}

// Check reminders every 5 seconds
setInterval(() => {
  const reminders = LocalStorageTool.getReminders();
  const now = new Date();
  reminders.forEach(rem => {
    if (!rem.completed && !rem.notified && new Date(rem.datetime) <= now) {
      showReminderToast(rem);
      rem.notified = true;
      LocalStorageTool.updateReminder(rem);
    }
  });
}, 5000);
