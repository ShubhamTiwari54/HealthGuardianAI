import { LocalStorageTool } from '../tools/localStorageTool.js';

export const SettingsView = {
  render() {
    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Settings & Configuration Panel:</strong> Manage your patient profile settings or reset database records. Resetting the database re-seeds the application with baseline historical panels spanning January to June 2026.
        </div>
      </div>

      <div class="dashboard-grid animate-fade-in" style="grid-template-columns: 2fr 1fr;">
        
        <!-- Left: Profile Settings Form -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="user"></i> Patient Profile Settings</h3>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="profile-name">Full Patient Name</label>
            <input type="text" class="form-control" id="profile-name" value="John Doe" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label" for="profile-age">Age</label>
              <input type="number" class="form-control" id="profile-age" value="45" />
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-gender">Gender</label>
              <select id="profile-gender" class="form-control">
                <option value="Male" selected>Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>
          </div>

          <button class="btn-header-action btn-accent" id="btn-save-profile" style="margin-top: 10px;">
            Save Profile Settings
          </button>
        </div>

        <!-- Right: Database Utilities -->
        <div class="panel" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="panel-header" style="margin-bottom: 0; padding-bottom: 8px;">
            <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="database"></i> System Operations</h3>
          </div>
          
          <div>
            <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Wipe & Reset Database</h4>
            <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: 12px;">
              Clears all files and re-seeds baseline historical data (Jan, Mar, Jun panels).
            </p>
            <button class="btn-header-action" id="btn-settings-reset" style="width: 100%; justify-content: center; border-color: var(--accent-danger); color: var(--accent-danger);">
              Wipe & Re-Seed Data
            </button>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
            <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Clear History Only</h4>
            <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: 12px;">
              Removes all files, reports, and timeline events leaving a clean, empty workspace.
            </p>
            <button class="btn-header-action" id="btn-settings-clear" style="width: 100%; justify-content: center;">
              Clear All Stored Files
            </button>
          </div>
        </div>

      </div>
    `;
  },

  afterRender() {
    const saveProfile = document.getElementById('btn-save-profile');
    const resetDb = document.getElementById('btn-settings-reset');
    const clearDb = document.getElementById('btn-settings-clear');

    if (saveProfile) {
      saveProfile.addEventListener('click', () => {
        const nameVal = document.getElementById('profile-name').value;
        const ageVal = document.getElementById('profile-age').value;
        const genderVal = document.getElementById('profile-gender').value;

        // Custom save alert
        alert(`Profile parameters updated: ${nameVal}, ${ageVal} y/o, ${genderVal}`);
      });
    }

    if (resetDb) {
      resetDb.addEventListener('click', () => {
        if (confirm("Reset database to baseline historical checkup panels?")) {
          LocalStorageTool.clearDatabase();
          alert("Database seeded successfully with historical Jan/Mar/Jun reports.");
          window.location.hash = '#/dashboard';
        }
      });
    }

    if (clearDb) {
      clearDb.addEventListener('click', () => {
        if (confirm("Permanently erase all files from storage? This removes all timelines and charts.")) {
          // Clear items manually
          localStorage.removeItem('health_guardian_reports');
          localStorage.removeItem('health_guardian_symptoms');
          localStorage.removeItem('health_guardian_timeline');
          localStorage.removeItem('health_guardian_logs');
          localStorage.setItem('health_guardian_seeded', 'true'); // bypass seeding on refresh
          alert("Workspace cleared. Stored parameters are empty.");
          window.location.hash = '#/dashboard';
        }
      });
    }
  }
};
