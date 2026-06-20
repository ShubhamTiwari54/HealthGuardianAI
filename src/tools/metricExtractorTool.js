import { BIOMARKER_RANGES } from '../data/mockData.js';

export const MetricExtractorTool = {
  name: "Biomarker Metric Extractor",
  description: "NLP-based regular expression parser that extracts structured values from raw clinical text records.",

  extract(text) {
    const cleanText = text.replace(/\s+/g, ' ');
    const metrics = {};

    // 1. Check for standard blood pressure format (e.g., 120/80 or 138/88)
    const bpRegex = /(\d{2,3})\s*\/\s*(\d{2,3})\s*(?:mmHg)?/i;
    const bpMatch = bpRegex.exec(cleanText);
    if (bpMatch) {
      metrics.systolic = parseFloat(bpMatch[1]);
      metrics.diastolic = parseFloat(bpMatch[2]);
    }

    // 2. Define NLP Regex mappings for separate biomarkers
    const patterns = {
      hba1c: /(?:hba1c|glycated\s+hb|glycated\s+hemoglobin|a1c)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      ldl: /(?:ldl\s+cholesterol|ldl|bad\s+cholesterol)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      cholesterol: /(?:total\s+cholesterol|cholesterol\,\s*total|cholesterol\s+total|cholesterol)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      triglycerides: /(?:triglycerides|trig|trigs)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      tsh: /(?:tsh|thyrotropin|thyroid\s+stimulating\s+hormone)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      systolic: /(?:systolic|bp\s+sys|blood\s+pressure\s+sys)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i,
      diastolic: /(?:diastolic|bp\s+dia|blood\s+pressure\s+dia)\s*[\:\-\=\,\s]*\s*(\d+\.?\d*)/i
    };

    // Apply regex patterns if not already filled (e.g., by the blood pressure regex)
    Object.keys(patterns).forEach(key => {
      if (!metrics[key]) {
        const match = patterns[key].exec(cleanText);
        if (match) {
          metrics[key] = parseFloat(match[1]);
        }
      }
    });

    return metrics;
  },

  // Evaluates extracted values against our clinical reference ranges
  assessMetric(key, value) {
    const range = BIOMARKER_RANGES[key];
    if (!range) return { status: 'neutral', label: 'Unclassified' };

    // Safety check for TSH/etc. where bounds differ
    if (value >= range.normal.min && value <= range.normal.max) {
      return { status: 'good', label: 'Normal', rangeText: `${range.normal.min} - ${range.normal.max}` };
    } else if (range.warning && value >= range.warning.min && value <= range.warning.max) {
      return { status: 'warning', label: range.warning.label, rangeText: `${range.warning.min} - ${range.warning.max}` };
    } else if (range.danger && value >= range.danger.min) {
      return { status: 'danger', label: range.danger.label, rangeText: `> ${range.danger.min}` };
    } else {
      // Below normal range (e.g., low blood pressure or low TSH)
      return { status: 'warning', label: 'Low', rangeText: `< ${range.normal.min}` };
    }
  }
};
