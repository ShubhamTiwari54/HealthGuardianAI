import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Check key presence early
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. Check .env configuration.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to handle and format API errors into user-friendly notices
function handleGeminiError(error) {
  console.error("Gemini API Error Detail:", error);
  const errMsg = error.message || "";
  
  if (!genAI) {
    return new Error("The healthcare analysis server is not configured with a Gemini API Key. Please configure your .env variables.");
  }
  if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("invalid") || errMsg.includes("key")) {
    return new Error("The configured Gemini API key is invalid. Please check your credentials.");
  }
  if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("limit")) {
    return new Error("We are currently experiencing high request volumes. Please wait a moment and try again.");
  }
  if (errMsg.includes("network") || errMsg.includes("connect")) {
    return new Error("Connection to the health intelligence network failed. Please verify your connection.");
  }
  return new Error("An unexpected error occurred while analyzing your health data. Please try again.");
}

export const GeminiService = {
  // 1. Symptom Triage Analysis
  async analyzeSymptoms(symptoms) {
    if (!genAI) throw handleGeminiError(new Error("API key missing"));

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are a supportive, educational health intelligence assistant.
        Analyze the following symptom description: "${symptoms}".
        
        Generate a structured, clinical assessment of possible causes, common triggers, self-care suggestions, warning signs, and when to see a doctor.
        Use practical, human-friendly, empathetic language. Do NOT diagnose the patient or claim to identify diseases definitely. Avoid generic chatbot-style text. Provide detailed, helpful information.
        
        You MUST respond with a JSON object strictly matching this schema:
        {
          "possibleCauses": ["String describing possible cause 1", "String describing possible cause 2"],
          "commonTriggers": ["String describing trigger 1", "String describing trigger 2"],
          "selfCareSuggestions": ["String describing suggestion 1", "String describing suggestion 2"],
          "warningSigns": ["String describing warning sign 1", "String describing warning sign 2"],
          "whenToSeeDoctor": ["String describing condition 1", "String describing condition 2"],
          "disclaimer": "Informational educational disclaimer."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      if (!text || !text.trim()) {
        throw new Error("Empty response received from Gemini.");
      }

      return JSON.parse(text);
    } catch (error) {
      throw handleGeminiError(error);
    }
  },

  // 2. Medical Report Extraction & Explanation
  async analyzeReport(reportText) {
    if (!genAI) throw handleGeminiError(new Error("API key missing"));

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are a clinical report interpretation agent.
        Review this medical report text:
        "${reportText}"
        
        Extract the values of all health markers and generate a patient-friendly assessment containing:
        - Patient demographics if mentioned (name, age, gender).
        - A simple, supportive Summary.
        - Important findings (specifically listing which indicators are abnormal/out-of-bounds).
        - What it means (clear human translation of clinical meanings).
        - Possible Contributing Factors (purely educational).
        - Things to monitor.
        - Actionable discussion questions for their doctor.
        
        You MUST respond with a JSON object strictly matching this schema:
        {
          "patientName": "String (extracted patient name, or 'John Doe' if not found/unspecified)",
          "patientAge": "String or Number (extracted patient age, or 45 if not found/unspecified)",
          "patientGender": "String (extracted patient gender, or 'Male' if not found/unspecified)",
          "summary": "String",
          "importantFindings": ["String detail 1", "String detail 2"],
          "whatItMeans": ["String detail 1", "String detail 2"],
          "possibleCauses": ["String detail 1", "String detail 2"],
          "thingsToMonitor": ["String detail 1", "String detail 2"],
          "questionsForDoctor": ["String detail 1", "String detail 2"],
          "disclaimer": "Clinical informational disclaimer."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || !text.trim()) {
        throw new Error("Empty response received from Gemini.");
      }

      return JSON.parse(text);
    } catch (error) {
      throw handleGeminiError(error);
    }
  },

  // 3. Synthesize Doctor Consultation Guide
  async generateDoctorSummary(reports, symptoms) {
    if (!genAI) throw handleGeminiError(new Error("API key missing"));

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const reportsStr = JSON.stringify(reports);
      const symptomsStr = JSON.stringify(symptoms);

      const prompt = `
        You are a healthcare operations assistant preparing a patient consultation summary sheet.
        Review the patient's records:
        - Past lab reports metrics: ${reportsStr}
        - Symptoms logged timeline: ${symptomsStr}
        
        Synthesize these parameters chronologically. Identify key clinical findings, trend observations (e.g. LDL or HbA1c trending upwards), and compile an check-list of doctor visit questions.
        
        You MUST respond with a JSON object strictly matching this schema:
        {
          "summary": "Concise summary of the patient's health parameters",
          "observations": ["Key observation 1", "Key observation 2"],
          "doctorQuestions": ["Checklist question 1", "Checklist question 2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || !text.trim()) {
        throw new Error("Empty response received from Gemini.");
      }

      return JSON.parse(text);
    } catch (error) {
      throw handleGeminiError(error);
    }
  },

  // 4. Clinical AI Assistant Chat
  async askAssistant(question) {
    if (!genAI) throw handleGeminiError(new Error("API key missing"));

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
        You are a highly supportive, empathetic, and knowledgeable clinical health assistant for HealthGuardian AI.
        Answer the following health question/query from the user: "${question}".
        
        Guidelines:
        - Provide detailed, educational health details.
        - Emphasize that you are an AI assistant, not a doctor.
        - Maintain a highly professional, caring, and clinical tone.
        - Avoid diagnosing or giving direct treatment advice. Suggest asking their primary care provider (PCP) where relevant.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      if (!text || !text.trim()) {
        throw new Error("Empty response received from Gemini.");
      }

      return { response: text };
    } catch (error) {
      throw handleGeminiError(error);
    }
  }
};

