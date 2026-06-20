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
        
        <!-- Left: AI Configuration & Customizations -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="sliders"></i> Platform Preference Configurations</h3>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">AI Engine Interpretation Tone</h4>
              <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: 10px;">
                Customize the communication tone used by the AI agents when explaining blood panels and symptoms:
              </p>
              <select id="setting-ai-tone" class="form-control" style="width: 100%;">
                <option value="Empathetic" selected>Empathetic & Supportive (Default)</option>
                <option value="Clinical">Strictly Clinical & Objective</option>
                <option value="Action-Oriented">Action-Oriented & Direct</option>
              </select>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Biomarker Alert Threshold Limits</h4>
              <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: 10px;">
                Toggle alarm limits. Standard uses conventional diagnostic bounds; preventative flags warnings early to encourage baseline improvements:
              </p>
              <select id="setting-alert-bounds" class="form-control" style="width: 100%;">
                <option value="Standard" selected>Standard Clinical Ranges (Default)</option>
                <option value="Preventative">Preventative / Early-Warning Ranges</option>
              </select>
            </div>

            <div>
              <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Data Security & Session Policies</h4>
              <p class="text-secondary" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: 10px;">
                Manage privacy bounds for stored timelines, OCR extractions, and timelines:
              </p>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="checkbox" id="setting-encrypt" checked style="width: 16px; height: 16px;" />
                  Encrypt Local Timeline Logs in Browser Storage
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="checkbox" id="setting-autoclear" style="width: 16px; height: 16px;" />
                  Automatically Wipe Stored Reports on Browser Tab Close
                </label>
              </div>
            </div>
          </div>

          <button class="btn-header-action btn-accent" id="btn-save-settings" style="margin-top: 24px; width: 100%; justify-content: center;">
            <i data-lucide="check"></i> Save Settings Configuration
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
    const saveSettings = document.getElementById('btn-save-settings');
    const resetDb = document.getElementById('btn-settings-reset');
    const clearDb = document.getElementById('btn-settings-clear');

    // Load saved preferences if available
    const savedPrefs = JSON.parse(localStorage.getItem('health_guardian_prefs'));
    if (savedPrefs) {
      if (document.getElementById('setting-ai-tone')) document.getElementById('setting-ai-tone').value = savedPrefs.tone;
      if (document.getElementById('setting-alert-bounds')) document.getElementById('setting-alert-bounds').value = savedPrefs.bounds;
      if (document.getElementById('setting-encrypt')) document.getElementById('setting-encrypt').checked = savedPrefs.encrypt;
      if (document.getElementById('setting-autoclear')) document.getElementById('setting-autoclear').checked = savedPrefs.autoclear;
    }

    if (saveSettings) {
      saveSettings.addEventListener('click', () => {
        const toneVal = document.getElementById('setting-ai-tone').value;
        const boundsVal = document.getElementById('setting-alert-bounds').value;
        const encryptVal = document.getElementById('setting-encrypt').checked;
        const autoclearVal = document.getElementById('setting-autoclear').checked;

        const prefs = { tone: toneVal, bounds: boundsVal, encrypt: encryptVal, autoclear: autoclearVal };
        localStorage.setItem('health_guardian_prefs', JSON.stringify(prefs));

        alert(`System configurations saved successfully!\n- Tone: ${toneVal}\n- Alert Limits: ${boundsVal}\n- Local Storage Encryption: ${encryptVal ? 'Enabled' : 'Disabled'}`);
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
