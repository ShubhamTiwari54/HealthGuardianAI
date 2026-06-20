import { LocalStorageTool } from './tools/localStorageTool.js';
import { Router } from './ui/router.js';

// Views
import { DashboardView } from './ui/dashboardView.js';
import { ReportWorkspaceView } from './ui/reportWorkspaceView.js';
import { SymptomWorkspaceView } from './ui/symptomWorkspaceView.js';
import { TrendsView } from './ui/trendsView.js';
import { TimelineView } from './ui/timelineView.js';
import { DoctorCenterView } from './ui/doctorCenterView.js';
import { SettingsView } from './ui/settingsView.js';

// 1. Seed database with baseline data
LocalStorageTool.seedDatabase();

// 2. Register Views in Hashing Router
Router.register('#/dashboard', DashboardView);
Router.register('#/reports', ReportWorkspaceView);
Router.register('#/symptoms', SymptomWorkspaceView);
Router.register('#/trends', TrendsView);
Router.register('#/timeline', TimelineView);
Router.register('#/doctor', DoctorCenterView);
Router.register('#/settings', SettingsView);

// 3. Update header title dynamically on hash change
const updateHeaderTitle = () => {
  const hash = window.location.hash || '#/dashboard';
  const headerTitle = document.getElementById('header-page-title');
  
  if (headerTitle) {
    switch(hash) {
      case '#/dashboard':
        headerTitle.textContent = "Health Intelligence Dashboard";
        break;
      case '#/reports':
        headerTitle.textContent = "Upload & Ingest Medical Report";
        break;
      case '#/symptoms':
        headerTitle.textContent = "Symptom Assessment Workspace";
        break;
      case '#/trends':
        headerTitle.textContent = "Longitudinal Health Trends";
        break;
      case '#/timeline':
        headerTitle.textContent = "Patient Health Timeline";
        break;
      case '#/doctor':
        headerTitle.textContent = "Doctor Summary Center";
        break;
      case '#/settings':
        headerTitle.textContent = "System Settings & Profile";
        break;
      default:
        headerTitle.textContent = "HealthGuardian AI";
    }
  }
};

window.addEventListener('hashchange', updateHeaderTitle);
window.addEventListener('load', updateHeaderTitle);

// 4. Initialize Router
Router.init('app-view-mount');

// 5. Expose TimelineView globally for background refresh callbacks
window.TimelineViewInstance = TimelineView;

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
  toast.style.borderLeft = '4px solid var(--accent-amber)';
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
      <button id="toast-complete-${reminder.id}" style="padding: 6px 12px; font-size: 0.7rem; background-color: var(--accent-emerald); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; height: auto;">
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
