import { DEMO_REPORTS } from '../data/mockData.js';

const STORAGE_KEYS = {
  REPORTS: 'health_guardian_reports',
  SYMPTOMS: 'health_guardian_symptoms',
  TIMELINE: 'health_guardian_timeline',
  LOGS: 'health_guardian_logs',
  IS_SEEDED: 'health_guardian_seeded'
};

export const LocalStorageTool = {
  name: "LocalStorage Database Tool",
  description: "Handles browser session storage persistence for reports, logs, and user timeline profiles.",

  // Seeds data if not already seeded
  seedDatabase(force = false) {
    const isSeeded = localStorage.getItem(STORAGE_KEYS.IS_SEEDED);
    if (!isSeeded || force) {
      this.saveReports(DEMO_REPORTS);
      this.saveSymptoms([]);
      
      // Initialize timeline with seeded reports
      const timeline = DEMO_REPORTS.map(rep => ({
        id: `time-${rep.id}`,
        date: rep.date,
        type: 'report',
        title: rep.title,
        description: `Uploaded ${rep.type}. Extracted ${Object.keys(rep.metrics).length} metrics.`,
        data: rep
      }));
      this.saveTimeline(timeline);
      this.saveLogs([]);
      localStorage.setItem(STORAGE_KEYS.IS_SEEDED, 'true');
      return true;
    }
    return false;
  },

  getReports() {
    this.seedDatabase();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  },

  saveReports(reports) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  addReport(report) {
    const reports = this.getReports();
    reports.push(report);
    this.saveReports(reports);
    
    // Add to timeline
    this.addTimelineEvent({
      id: `time-${report.id}`,
      date: report.date,
      type: 'report',
      title: report.title,
      description: `Uploaded ${report.type}. Extracted ${Object.keys(report.metrics).length} metrics.`,
      data: report
    });
  },

  getSymptoms() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SYMPTOMS)) || [];
  },

  saveSymptoms(symptoms) {
    localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(symptoms));
  },

  addSymptom(symptomRecord) {
    const symptoms = this.getSymptoms();
    symptoms.push(symptomRecord);
    this.saveSymptoms(symptoms);
    
    // Add to timeline
    this.addTimelineEvent({
      id: `time-${symptomRecord.id}`,
      date: symptomRecord.date,
      type: 'symptom',
      title: "Symptom Assessment",
      description: `Assessed symptom. Severity: ${symptomRecord.severity}`,
      data: symptomRecord
    });
  },

  getTimeline() {
    this.seedDatabase();
    // Sort timeline chronologically descending
    const timeline = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMELINE)) || [];
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
  },

  saveTimeline(timeline) {
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
  },

  addTimelineEvent(event) {
    const timeline = this.getTimeline();
    timeline.push(event);
    this.saveTimeline(timeline);
  },

  getLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  },

  saveLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  addLog(log) {
    const logs = this.getLogs();
    // Keep max 200 logs
    if (logs.length > 200) logs.shift();
    logs.push(log);
    this.saveLogs(logs);
  },

  clearDatabase() {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.SYMPTOMS);
    localStorage.removeItem(STORAGE_KEYS.TIMELINE);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.IS_SEEDED);
    this.seedDatabase(true);
  }
};
