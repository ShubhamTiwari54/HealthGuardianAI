import { LocalStorageTool } from '../tools/localStorageTool.js';
import { AgentOrchestrator } from '../core/agentOrchestrator.js';
import { DEMO_SYMPTOMS } from '../data/mockData.js';

export const SymptomWorkspaceView = {
  render() {
    const symptoms = LocalStorageTool.getSymptoms().sort((a, b) => new Date(b.date) - new Date(a.date));
    const activeSymptom = symptoms[0] || null;

    return `
      <!-- Core Value Proposition Banner -->
      <div class="val-prop-alert animate-fade-in">
        <i data-lucide="info" style="width: 20px; height: 20px;"></i>
        <div class="val-prop-alert-text">
          <strong>Longitudinal Health Tracking:</strong> Log symptom episodes in your profile timeline. HealthGuardian AI records these occurrences, allowing you and your physician to track chronologically whether symptom episodes are increasing in severity or frequency over time.
        </div>
      </div>

      <div class="workspace-container animate-fade-in">
        
        <!-- Left Column: Intake Questionnaire -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <div class="panel">
            <div class="panel-header">
              <h2 class="panel-title"><i data-lucide="activity"></i> Symptom Check Panel</h2>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="symptom-input-text">Describe your current symptoms in detail:</label>
              <textarea class="form-control" id="symptom-input-text" placeholder="e.g. For the past two days, I have had a red pimple on my cheek. It is slightly raised but not painful..."></textarea>
            </div>

            <div style="display: flex; gap: 12px;">
              <button class="btn-header-action btn-accent" id="btn-submit-symptoms" style="flex: 1; justify-content: center;">
                Analyze Symptoms <i data-lucide="play" style="width: 14px; height: 14px; margin-left: 6px;"></i>
              </button>
            </div>

            <!-- Loader / Progress Bar -->
            <div id="symptom-progress-card" style="display: none; margin-top: 20px; background: rgba(37, 99, 235, 0.02); border: 1px solid rgba(37, 99, 235, 0.15); padding: 16px; border-radius: var(--radius-md);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-primary);" id="symptom-progress-label">Evaluating symptoms...</span>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);" id="symptom-percentage-label">0%</span>
              </div>
              <div class="progress-container">
                <div class="progress-bar" id="symptom-bar-fill"></div>
              </div>
            </div>

            <!-- Test Cases presets -->
            <div class="demo-selector-box">
              <div class="demo-title">Judge Evaluation: Presets</div>
              <p class="text-secondary" style="font-size: 0.75rem; margin-bottom: 12px; line-height: 1.4;">
                Select a preset clinical case study to simulate symptom analysis:
              </p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn-demo" id="btn-sym-case-1" style="text-align: left; padding: 12px;">
                  <strong>1. Face Spot / Skin Blemish</strong>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">"I have a red pimple on my cheek..."</div>
                </button>
                <button class="btn-demo" id="btn-sym-case-2" style="text-align: left; padding: 12px;">
                  <strong>2. Metabolic Signs (Thirst & Urination)</strong>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">"I wake up at night to urinate, feel constant thirst..."</div>
                </button>
                <button class="btn-demo" id="btn-sym-case-3" style="text-align: left; padding: 12px;">
                  <strong>3. Acute Chest Tightness</strong>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">"Sudden crushing chest pressure, arm radiation..."</div>
                </button>
              </div>
            </div>
          </div>

          <!-- Symptom History Log -->
          <div class="panel">
            <div class="panel-header" style="margin-bottom: 16px; padding-bottom: 8px;">
              <h3 class="panel-title" style="font-size: 0.95rem;"><i data-lucide="history"></i> Triage History Log</h3>
            </div>
            ${symptoms.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
                ${symptoms.map(sym => `
                  <div class="symptom-history-item" data-id="${sym.id}" style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background-color 0.2s;">
                    <div style="flex: 1; min-width: 0; padding-right: 12px;">
                      <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">"${sym.symptomText}"</h4>
                      <p class="text-secondary" style="font-size: 0.75rem; margin-top: 2px;">${sym.date}</p>
                    </div>
                    <span class="badge ${sym.severity === 'Critical Warning' ? 'danger' : (sym.severity === 'Moderate Concern' ? 'warning' : 'good')}" style="font-size: 0.65rem; padding: 2px 6px;">
                      ${sym.severity}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">
                No symptoms recorded in database.
              </div>
            `}
          </div>

        </div>

        <!-- Right Column: Assessment Results -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <div class="panel" id="symptom-results-panel">
            <div class="panel-header">
              <h2 class="panel-title"><i data-lucide="shield-check"></i> Health Assessment Summary</h2>
              <span class="text-secondary" id="symptom-results-meta" style="font-size: 0.8rem;">
                ${activeSymptom ? `Assessed on ${activeSymptom.date}` : 'No active evaluation'}
              </span>
            </div>

            <div id="symptom-results-container">
              ${activeSymptom ? this.buildSymptomResultsHTML(activeSymptom) : `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <i data-lucide="stethoscope" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--border-color);"></i>
                  <p style="font-size: 0.85rem;">Input symptom descriptions or select a preset case to generate an assessment.</p>
                </div>
              `}
            </div>
          </div>

        </div>

      </div>
    `;
  },

  buildSymptomResultsHTML(symptom) {
    const isCritical = symptom.severity === 'Critical Warning' || symptom.severity === 'Emergency';
    
    return `
      <!-- Triage Urgency Callout -->
      ${isCritical ? `
        <div class="symptom-warning-card" style="margin-bottom: 24px; border-left: 4px solid var(--accent-danger);">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            ⚠️ URGENT MEDICAL ADVISORY
          </div>
          <p>${symptom.urgency}</p>
        </div>
      ` : `
        <div style="background-color: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.1); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
          <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 4px;">Triage Urgency Advice</div>
          <p style="font-size: 0.9rem; line-height: 1.4; color: var(--text-primary); font-weight: 500;">${symptom.urgency}</p>
        </div>
      `}

      <!-- Severity Badging -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 20px;">
        <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">Triage Urgency:</span>
        <span class="badge ${isCritical ? 'danger' : (symptom.severity === 'Moderate Concern' ? 'warning' : 'good')}" style="font-size: 0.85rem; padding: 4px 12px;">
          ${symptom.severity}
        </span>
      </div>

      <!-- Possible Causes -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Possible Causes</h4>
        <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          ${(symptom.possibleCauses || []).map(cause => `<li style="margin-bottom: 4px;">${cause}</li>`).join('')}
        </ul>
      </div>

      <!-- Common Triggers -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Common Triggers</h4>
        <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          ${(symptom.commonTriggers || []).map(trig => `<li style="margin-bottom: 4px;">${trig}</li>`).join('')}
        </ul>
      </div>

      <!-- Self-Care Suggestions -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Self-Care Suggestions</h4>
        <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          ${(symptom.selfCareSuggestions || []).map(sug => `<li style="margin-bottom: 4px;">${sug}</li>`).join('')}
        </ul>
      </div>

      <!-- Warning Signs -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Warning Signs</h4>
        <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
          ${(symptom.warningSigns || []).map(sign => `<li style="margin-bottom: 4px;">${sign}</li>`).join('')}
        </ul>
      </div>

      <!-- When to See a Doctor -->
      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">When To See A Doctor</h4>
        <ul style="padding-left: 18px; color: var(--accent-primary); font-size: 0.85rem; line-height: 1.5;">
          ${(symptom.whenToSeeDoctor || []).map(doc => `<li style="margin-bottom: 4px; font-weight: 500;">${doc}</li>`).join('')}
        </ul>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer-box" style="margin-top: 20px;">
        <strong>Educational Disclaimer:</strong> ${symptom.disclaimer}
      </div>
    `;
  },

  afterRender() {
    const textInput = document.getElementById('symptom-input-text');
    const submitBtn = document.getElementById('btn-submit-symptoms');
    
    const progressCard = document.getElementById('symptom-progress-card');
    const progressLabel = document.getElementById('symptom-progress-label');
    const percentageLabel = document.getElementById('symptom-percentage-label');
    const barFill = document.getElementById('symptom-bar-fill');
    
    const resultsContainer = document.getElementById('symptom-results-container');
    const resultsMeta = document.getElementById('symptom-results-meta');

    const triggerOrchestration = async (textVal) => {
      if (!textVal.trim()) {
        alert("Please describe symptoms first.");
        return;
      }

      progressCard.style.display = "block";
      progressLabel.textContent = "Analyzing symptoms cluster...";
      percentageLabel.textContent = "0%";
      barFill.style.width = "0%";

      try {
        const results = await AgentOrchestrator.processSymptoms(textVal, (prog) => {
          if (progressLabel && percentageLabel && barFill) {
            progressLabel.textContent = prog.stage;
            percentageLabel.textContent = `${prog.percent}%`;
            barFill.style.width = `${prog.percent}%`;
          }
        });

        setTimeout(() => {
          progressCard.style.display = "none";
          
          if (resultsContainer && resultsMeta) {
            resultsContainer.innerHTML = this.buildSymptomResultsHTML(results.symptomAssessment);
            resultsMeta.textContent = `Assessed on ${results.symptomAssessment.date}`;
          }

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }, 800);

      } catch (err) {
        progressCard.style.display = "none";
        alert("Symptom analysis failed: " + err.message);
      }
    };

    if (submitBtn && textInput) {
      submitBtn.addEventListener('click', () => {
        triggerOrchestration(textInput.value);
      });
    }

    // Preset Cases clicks
    const sym1 = document.getElementById('btn-sym-case-1');
    const sym2 = document.getElementById('btn-sym-case-2');
    const sym3 = document.getElementById('btn-sym-case-3');

    if (sym1) {
      sym1.addEventListener('click', () => {
        const text = "For the past two days, I have had a red pimple on my cheek. It is slightly raised but not painful.";
        textInput.value = text;
        triggerOrchestration(text);
      });
    }

    if (sym2) {
      sym2.addEventListener('click', () => {
        const text = DEMO_SYMPTOMS[0].text; // Thirst / Urination
        textInput.value = text;
        triggerOrchestration(text);
      });
    }

    if (sym3) {
      sym3.addEventListener('click', () => {
        const text = DEMO_SYMPTOMS[1].text; // Chest pain radiation
        textInput.value = text;
        triggerOrchestration(text);
      });
    }

    // Log History list clicks
    document.querySelectorAll('.symptom-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const symId = item.getAttribute('data-id');
        const symptom = LocalStorageTool.getSymptoms().find(s => s.id === symId);
        if (symptom && resultsContainer && resultsMeta) {
          resultsContainer.innerHTML = this.buildSymptomResultsHTML(symptom);
          resultsMeta.textContent = `Assessed on ${symptom.date}`;
        }
      });
    });
  }
};
