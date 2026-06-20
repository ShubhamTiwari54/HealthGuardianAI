import { BaseAgent } from './baseAgent.js';
import { LocalStorageTool } from '../tools/localStorageTool.js';

export class HealthMemoryAgent extends BaseAgent {
  constructor() {
    super("Health Memory Agent", "health-memory-agent");
  }

  async run(currentReport) {
    this.start();
    this.log("Retrieving historical patient record logs from Local Storage...");
    
    // Retrieve past reports
    const allReports = await this.executeTool(LocalStorageTool, "getReports");
    
    // Filter out the current report if it has already been added to local storage
    const pastReports = allReports.filter(rep => rep.id !== currentReport.id)
                                  .sort((a, b) => new Date(b.date) - new Date(a.date)); // descending (newest first)

    this.log(`Retrieved ${pastReports.length} historical reports from storage.`);

    const comparisons = {};
    const currentMetrics = currentReport.metrics || {};

    if (pastReports.length > 0) {
      const priorReport = pastReports[0]; // Immediately prior report
      this.log(`Comparing against previous report: "${priorReport.title}" (${priorReport.date})`);

      Object.keys(currentMetrics).forEach(key => {
        const currentVal = currentMetrics[key];
        
        // Find the latest occurrence of this metric in historical reports
        let priorVal = null;
        let priorDate = null;

        for (const rep of pastReports) {
          if (rep.metrics && rep.metrics[key] !== undefined) {
            priorVal = rep.metrics[key];
            priorDate = rep.date;
            break;
          }
        }

        if (priorVal !== null) {
          const delta = currentVal - priorVal;
          const pctChange = (delta / priorVal) * 100;
          const direction = delta > 0.01 ? "increased" : (delta < -0.01 ? "decreased" : "remained stable");

          comparisons[key] = {
            previousValue: priorVal,
            previousDate: priorDate,
            currentValue: currentVal,
            delta,
            pctChange,
            direction,
            text: `Prior level was ${priorVal} on ${priorDate}. Level has ${direction} by ${Math.abs(pctChange).toFixed(1)}%.`
          };
          
          this.log(`Memory Recall [${key}]: Previous=${priorVal}, Current=${currentVal} (${direction} ${Math.abs(pctChange).toFixed(1)}%)`);
        } else {
          comparisons[key] = {
            previousValue: null,
            text: "No historical records found for this biomarker."
          };
        }
      });
    } else {
      this.log("No historical reports found. This appears to be the baseline medical profile.");
      Object.keys(currentMetrics).forEach(key => {
        comparisons[key] = {
          previousValue: null,
          text: "No historical records found (Baseline profile established)."
        };
      });
    }

    const output = {
      historyCount: pastReports.length,
      previousReport: pastReports.length > 0 ? pastReports[0] : null,
      comparisons
    };

    this.end(output);
    return output;
  }
}
