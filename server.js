import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiService } from './src/server/services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup relative path directories for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Endpoints
// 1. Symptom Assessment
app.post('/api/symptom-analysis', async (req, res, next) => {
  const { symptoms } = req.body;
  if (!symptoms || !symptoms.trim()) {
    return res.status(400).json({ error: "Symptom description is required." });
  }

  try {
    const analysis = await GeminiService.analyzeSymptoms(symptoms);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// 2. Medical Report Extractor & Explanation
app.post('/api/report-analysis', async (req, res, next) => {
  const { reportText } = req.body;
  if (!reportText || !reportText.trim()) {
    return res.status(400).json({ error: "Medical report transcript is required." });
  }

  try {
    const analysis = await GeminiService.analyzeReport(reportText);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// 3. Synthesize Consultation Summary
app.post('/api/doctor-summary', async (req, res, next) => {
  const { reports, symptoms } = req.body;
  
  try {
    const summary = await GeminiService.generateDoctorSummary(reports || [], symptoms || []);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// Serve compiled static assets in production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Simple welcome root for development check
  app.get('/api', (req, res) => {
    res.json({ message: "HealthGuardian AI Server Active" });
  });
}

// Global error handler middleware (never leaks raw details to user)
app.use((err, req, res, next) => {
  console.error("Backend caught uncaught exception:", err);
  res.status(500).json({ 
    error: err.message || "Unable to complete health analysis. Please verify your connection and try again." 
  });
});

app.listen(PORT, () => {
  console.log(`[Server] HealthGuardian Express running on port ${PORT}`);
});
