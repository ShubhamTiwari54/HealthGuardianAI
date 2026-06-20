// Reference ranges and metadata for health biomarkers
export const BIOMARKER_RANGES = {
  hba1c: {
    name: "HbA1c (Glycated Hemoglobin)",
    unit: "%",
    normal: { min: 4.0, max: 5.6 },
    warning: { min: 5.7, max: 6.4, label: "Prediabetes" },
    danger: { min: 6.5, max: 20.0, label: "Diabetes" },
    description: "Average blood sugar levels over the past 3 months."
  },
  ldl: {
    name: "LDL Cholesterol",
    unit: "mg/dL",
    normal: { min: 0, max: 99 },
    warning: { min: 100, max: 159, label: "Borderline High" },
    danger: { min: 160, max: 500, label: "High Risk" },
    description: "Often called 'bad' cholesterol. High levels lead to plaque buildup in arteries."
  },
  cholesterol: {
    name: "Total Cholesterol",
    unit: "mg/dL",
    normal: { min: 100, max: 199 },
    warning: { min: 200, max: 239, label: "Borderline High" },
    danger: { min: 240, max: 600, label: "High" },
    description: "Total amount of cholesterol in your blood."
  },
  triglycerides: {
    name: "Triglycerides",
    unit: "mg/dL",
    normal: { min: 0, max: 149 },
    warning: { min: 150, max: 199, label: "Borderline High" },
    danger: { min: 200, max: 1000, label: "High" },
    description: "A type of fat (lipid) found in your blood."
  },
  tsh: {
    name: "TSH (Thyroid Stimulating Hormone)",
    unit: "uIU/mL",
    normal: { min: 0.4, max: 4.0 },
    warning: { min: 4.1, max: 9.9, label: "Subclinical Hypothyroidism" },
    danger: { min: 10.0, max: 100.0, label: "Hypothyroidism" },
    description: "Hormone that controls your thyroid gland. High values indicate underactive thyroid."
  },
  systolic: {
    name: "Systolic Blood Pressure",
    unit: "mmHg",
    normal: { min: 90, max: 120 },
    warning: { min: 121, max: 139, label: "Prehypertension" },
    danger: { min: 140, max: 300, label: "Hypertension" },
    description: "Pressure in arteries when the heart beats."
  },
  diastolic: {
    name: "Diastolic Blood Pressure",
    unit: "mmHg",
    normal: { min: 60, max: 80 },
    warning: { min: 81, max: 89, label: "Prehypertension" },
    danger: { min: 90, max: 200, label: "Hypertension" },
    description: "Pressure in arteries between heartbeats."
  }
};

// Historical report timelines to simulate patient progress
export const DEMO_REPORTS = [
  {
    id: "rep-001",
    date: "2026-01-10",
    title: "Routine Health Screening",
    type: "Blood Panel",
    metrics: {
      hba1c: 6.4,
      ldl: 125,
      cholesterol: 205,
      triglycerides: 155,
      systolic: 122,
      diastolic: 81
    },
    rawText: `
      METROPOLITAN CLINICAL LABORATORY
      DATE: Jan 10, 2026 | PATIENT: J. Doe
      -----------------------------------------------
      TEST                  RESULT      REFERENCE RANGE
      Glycated Hb (HbA1c)   6.4 %       4.0 - 5.6 %       (HIGH)
      Cholesterol, Total    205 mg/dL   100 - 199 mg/dL   (HIGH)
      LDL Cholesterol       125 mg/dL   0 - 99 mg/dL      (HIGH)
      Triglycerides         155 mg/dL   0 - 149 mg/dL     (HIGH)
      Blood Pressure (Sys)  122 mmHg    90 - 120 mmHg     (BORDERLINE)
      Blood Pressure (Dia)  81 mmHg     60 - 80 mmHg      (BORDERLINE)
      -----------------------------------------------
      Notes: Mild elevation of glucose and lipid values. Consider dietary modifications.
    `
  },
  {
    id: "rep-002",
    date: "2026-03-15",
    title: "Metabolic Follow-Up",
    type: "Blood Panel",
    metrics: {
      hba1c: 6.6,
      ldl: 142,
      cholesterol: 220,
      triglycerides: 175,
      systolic: 130,
      diastolic: 84
    },
    rawText: `
      METROPOLITAN CLINICAL LABORATORY
      DATE: Mar 15, 2026 | PATIENT: J. Doe
      -----------------------------------------------
      TEST                  RESULT      REFERENCE RANGE
      Glycated Hb (HbA1c)   6.6 %       4.0 - 5.6 %       (ALERT: DIABETIC RANGE)
      Cholesterol, Total    220 mg/dL   100 - 199 mg/dL   (HIGH)
      LDL Cholesterol       142 mg/dL   0 - 99 mg/dL      (HIGH)
      Triglycerides         175 mg/dL   0 - 149 mg/dL     (HIGH)
      Blood Pressure (Sys)  130 mmHg    90 - 120 mmHg     (ELEVATED)
      Blood Pressure (Dia)  84 mmHg     60 - 80 mmHg      (ELEVATED)
      -----------------------------------------------
      Notes: Patient reports difficulty maintaining diet. Lipids and HbA1c continue to rise.
    `
  },
  {
    id: "rep-003",
    date: "2026-06-18",
    title: "Comprehensive Health Panel",
    type: "Blood Panel",
    metrics: {
      hba1c: 6.8,
      ldl: 158,
      cholesterol: 238,
      triglycerides: 195,
      systolic: 138,
      diastolic: 88
    },
    rawText: `
      METROPOLITAN CLINICAL LABORATORY
      DATE: Jun 18, 2026 | PATIENT: J. Doe
      -----------------------------------------------
      TEST                  RESULT      REFERENCE RANGE
      Glycated Hb (HbA1c)   6.8 %       4.0 - 5.6 %       (CRITICAL DIABETIC)
      Cholesterol, Total    238 mg/dL   100 - 199 mg/dL   (HIGH ACCELERATED)
      LDL Cholesterol       158 mg/dL   0 - 99 mg/dL      (HIGH)
      Triglycerides         195 mg/dL   0 - 149 mg/dL     (HIGH)
      Blood Pressure (Sys)  138 mmHg    90 - 120 mmHg     (PREHYPERTENSION)
      Blood Pressure (Dia)  88 mmHg     60 - 80 mmHg      (PREHYPERTENSION)
      -----------------------------------------------
      Notes: Accelerated progression. Pharmacological intervention recommended if lifestyle changes fail.
    `
  }
];

// Sample symptom profiles
export const DEMO_SYMPTOMS = [
  {
    name: "Metabolic / Pre-Diabetic Indicators (Moderate Risk)",
    text: "I have been feeling very fatigued lately and notice I am constantly thirsty. I wake up 2-3 times at night to urinate. Additionally, I sometimes experience a slight tingling or numbness in my toes.",
    expectedAnalysis: {
      possibleConditions: [
        { name: "Type 2 Diabetes Mellitus", probability: "High", reasoning: "Polyuria (frequent urination), polydipsia (excessive thirst), fatigue, and peripheral neuropathy (tingling toes) are classic presentation markers." },
        { name: "Peripheral Neuropathy", probability: "Moderate", reasoning: "Numbness/tingling in the lower extremities indicates potential early-stage nerve distress linked to elevated blood glucose." }
      ],
      severity: "Moderate",
      safetyAlert: "Tingling in toes and constant thirst are warning signs of progressive hyperglycemia. Requires clinical evaluation and lab checks.",
      urgency: "Schedule an appointment with a primary care physician in the next 1-2 weeks."
    }
  },
  {
    name: "Acute Chest Pain (EMERGENCY CODE RED)",
    text: "I have sudden, crushing pain in the center of my chest that feels like a heavy weight. The pain is radiating down my left arm and up to my jaw. I am feeling short of breath, dizzy, and breaking out in a cold sweat.",
    expectedAnalysis: {
      possibleConditions: [
        { name: "Acute Coronary Syndrome (Myocardial Infarction)", probability: "Critical", reasoning: "Classic crushing retrosternal chest pain radiating to left arm/jaw, associated with dyspnea, diaphoresis (cold sweats), and lightheadedness." },
        { name: "Angina Pectoris", probability: "High", reasoning: "Ischemic heart muscle discomfort resulting from arterial narrowing." }
      ],
      severity: "Emergency",
      safetyAlert: "CRITICAL ALERT: Chest pain radiating to the left arm and jaw, accompanied by shortness of breath and cold sweat, is a highly indicative presentation of a Heart Attack (Myocardial Infarction).",
      urgency: "IMMEDIATE EMERGENCY ACTION REQUIRED. Call emergency services (e.g., 911) or proceed immediately to the nearest emergency department. DO NOT drive yourself."
    }
  },
  {
    name: "Mild Respiratory Symptoms (Low Risk)",
    text: "I have had a mild dry cough and a slightly stuffy nose for the last three days. I feel a bit tired, but my appetite is fine and I don't have any shortness of breath or chest pain. My thermometer reads 99.1°F.",
    expectedAnalysis: {
      possibleConditions: [
        { name: "Viral Upper Respiratory Tract Infection (Common Cold)", probability: "High", reasoning: "Acute mild cough, nasal congestion, low-grade temperature (99.1°F), and mild fatigue." },
        { name: "Allergic Rhinitis", probability: "Moderate", reasoning: "Dry cough and stuffy nose can be triggered by seasonal allergens." }
      ],
      severity: "Low",
      safetyAlert: "Low risk. Normal presentation of common cold or mild respiratory allergy.",
      urgency: "Self-care, rest, hydration, and over-the-counter symptomatic relief. Monitor symptoms; consult if they worsen or persist past 10 days."
    }
  }
];
