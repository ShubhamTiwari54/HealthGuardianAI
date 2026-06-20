import { BaseAgent } from './baseAgent.js';
import { TrendAnalyzerTool } from '../tools/trendAnalyzerTool.js';
import { LocalStorageTool } from '../tools/localStorageTool.js';

export class InsightGenerationAgent extends BaseAgent {
  constructor() {
    super("Insight Generation Agent", "insight-generation-agent");
  }

  async run(latestReport) {
    this.start();
    this.log("Analyzing longitudinal clinical trends across all reports...");

    // Get all reports (assumes current report is already in the database or passed in)
    const reports = await this.executeTool(LocalStorageTool, "getReports");
    
    // Sort reports chronologically ascending for trend calculations
    const sortedReports = [...reports].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate score based on current report
    const scoreData = await this.executeTool(TrendAnalyzerTool, "calculateHealthScore", latestReport);
    this.log(`Aggregated Health Score calculated: ${scoreData.score}/100 (${scoreData.label})`);

    // Run detailed trend analysis
    const trends = await this.executeTool(TrendAnalyzerTool, "analyzeBiomarkerTrends", sortedReports);
    
    const insightsList = [];
    
    // Generate narrative clinical insights based on trends
    if (trends.hba1c) {
      const h = trends.hba1c;
      if (h.history.length > 1) {
        if (h.direction === "up") {
          insightsList.push({
            type: "warning",
            title: "Worsening Glycemic Regulation",
            text: `Your HbA1c is showing a steady upward trajectory, reaching ${h.latest}% from a prior ${h.history[h.history.length - 2].value}%. This indicates worsening blood sugar management, potentially transitioning further into prediabetic or diabetic ranges.`
          });
        } else if (h.direction === "down") {
          insightsList.push({
            type: "success",
            title: "Improved Blood Glucose Control",
            text: `Good progress! Your HbA1c has decreased to ${h.latest}%. This indicates that recent lifestyle or medical adjustments are effectively regulating average blood sugars.`
          });
        }
      } else {
        // Baseline
        if (h.latest >= 6.5) {
          insightsList.push({
            type: "danger",
            title: "Diabetic Glycemic Level",
            text: `Your current HbA1c of ${h.latest}% exceeds the clinical threshold for diabetes (6.5%). Medical monitoring and clinical guidance are highly recommended.`
          });
        } else if (h.latest >= 5.7) {
          insightsList.push({
            type: "warning",
            title: "Prediabetic HbA1c Level",
            text: `Your HbA1c of ${h.latest}% falls within the prediabetic range (5.7% - 6.4%). Early dietary and exercise interventions can halt progression.`
          });
        }
      }
    }

    if (trends.ldl || trends.cholesterol) {
      const ldlVal = trends.ldl ? trends.ldl.latest : null;
      const cholVal = trends.cholesterol ? trends.cholesterol.latest : null;
      
      const isLdlHigh = ldlVal >= 130;
      const isCholHigh = cholVal >= 200;

      if (trends.ldl && trends.ldl.history.length > 1 && trends.ldl.direction === "up") {
        insightsList.push({
          type: "warning",
          title: "Elevating Cardiovascular Lipid Risk",
          text: `Your LDL ('bad') cholesterol has risen by ${trends.ldl.percentage.toFixed(1)}% to ${ldlVal} mg/dL. Upward lipid trends increase the likelihood of arterial plaque buildups.`
        });
      } else if (isLdlHigh || isCholHigh) {
        insightsList.push({
          type: "warning",
          title: "Hyperlipidemia Warning",
          text: `Current lipid levels are elevated (LDL: ${ldlVal || 'N/A'} mg/dL, Total Cholesterol: ${cholVal || 'N/A'} mg/dL). Consuming healthy fats and regular exercise are recommended.`
        });
      }
    }

    if (trends.tsh) {
      const tsh = trends.tsh;
      if (tsh.latest > 4.0) {
        insightsList.push({
          type: "warning",
          title: "Hypothyroid Tendency",
          text: `Your TSH level is ${tsh.latest} uIU/mL, which exceeds the normal range. High TSH indicates an underactive thyroid (hypothyroidism), which can cause symptoms like persistent fatigue, weight gain, and cold intolerance.`
        });
      }
    }

    if (trends.systolic || trends.diastolic) {
      const sysVal = trends.systolic ? trends.systolic.latest : null;
      const diaVal = trends.diastolic ? trends.diastolic.latest : null;
      
      if ((sysVal && sysVal >= 130) || (diaVal && diaVal >= 85)) {
        insightsList.push({
          type: "warning",
          title: "Elevated Blood Pressure",
          text: `Your blood pressure readings (${sysVal || 'N/A'}/${diaVal || 'N/A'} mmHg) are tracking high. Standard limits are below 120/80 mmHg. Stress reduction, sodium control, and routine checks are advised.`
        });
      }
    }

    // Default insight if none generated
    if (insightsList.length === 0) {
      insightsList.push({
        type: "success",
        title: "Stable Metabolic Baseline",
        text: "Your biomarkers are currently stable. Continue with regular preventive checkups and a healthy lifestyle."
      });
    }

    this.log(`Generated ${insightsList.length} longitudinal clinical insights.`);

    const output = {
      healthScore: scoreData.score,
      scoreLabel: scoreData.label,
      scoreColor: scoreData.color,
      scoreCounts: scoreData.counts,
      trends,
      insights: insightsList
    };

    this.end(output);
    return output;
  }
}
