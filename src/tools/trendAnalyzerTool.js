import { BIOMARKER_RANGES } from '../data/mockData.js';
import { MetricExtractorTool } from './metricExtractorTool.js';

export const TrendAnalyzerTool = {
  name: "Health Trend Analyzer",
  description: "Computes statistical changes, slope trajectories, and determines patient clinical health scores based on aggregate report trends.",

  // Calculates health score based on the latest report's metrics
  calculateHealthScore(latestReport) {
    if (!latestReport || !latestReport.metrics || Object.keys(latestReport.metrics).length === 0) {
      return { score: 95, label: "Excellent", color: "var(--accent-emerald)" };
    }

    let score = 100;
    const metrics = latestReport.metrics;
    let counts = { normal: 0, warning: 0, danger: 0 };

    Object.keys(metrics).forEach(key => {
      const val = metrics[key];
      const assessment = MetricExtractorTool.assessMetric(key, val);
      
      if (assessment.status === 'warning') {
        score -= 8;
        counts.warning++;
      } else if (assessment.status === 'danger') {
        score -= 15;
        counts.danger++;
      } else {
        counts.normal++;
      }
    });

    // Constrain score between 30 and 100
    score = Math.max(30, Math.min(100, score));

    let label = "Excellent";
    let color = "var(--accent-emerald)";

    if (score < 60) {
      label = "Critical Concern";
      color = "var(--accent-red)";
    } else if (score < 80) {
      label = "Moderate Concern";
      color = "var(--accent-amber)";
    } else if (score < 90) {
      label = "Good";
      color = "var(--accent-blue)";
    }

    return { score, label, color, counts };
  },

  // Generates timeline data for each biomarker
  analyzeBiomarkerTrends(reports) {
    if (reports.length === 0) return {};

    // Sort reports chronologically ascending for trend calculations
    const sortedReports = [...reports].sort((a, b) => new Date(a.date) - new Date(b.date));
    const trends = {};

    // Initialize list of metrics to track
    const trackableKeys = Object.keys(BIOMARKER_RANGES);

    trackableKeys.forEach(key => {
      const history = [];
      
      sortedReports.forEach(rep => {
        if (rep.metrics && rep.metrics[key] !== undefined) {
          history.push({
            date: rep.date,
            value: rep.metrics[key],
            reportTitle: rep.title
          });
        }
      });

      if (history.length > 0) {
        const latest = history[history.length - 1].value;
        let delta = 0;
        let percentage = 0;
        let direction = "stable";
        let summaryText = "No historical comparison available.";

        if (history.length > 1) {
          const previous = history[history.length - 2].value;
          delta = latest - previous;
          percentage = (delta / previous) * 100;
          direction = delta > 0.01 ? "up" : (delta < -0.01 ? "down" : "stable");

          const timeframe = Math.round((new Date(history[history.length - 1].date) - new Date(history[history.length - 2].date)) / (1000 * 60 * 60 * 24 * 30.4));
          const directionWord = direction === "up" ? "increased" : (direction === "down" ? "decreased" : "remained stable");
          
          summaryText = `${directionWord} by ${Math.abs(percentage).toFixed(1)}% over the last ${timeframe || 1} month(s).`;
        }

        trends[key] = {
          history,
          latest,
          delta,
          percentage,
          direction,
          summaryText
        };
      }
    });

    return trends;
  }
};
