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
