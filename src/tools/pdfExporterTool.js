export const PDFExporterTool = {
  name: "PDF Exporter Tool",
  description: "Triggers native print styling triggers to export consultation notes and summaries as PDF documents.",

  export(elementId) {
    const originalTitle = document.title;
    document.title = "HealthGuardian_AI_Doctor_Consultation_Notes";
    
    // Trigger native printing
    window.print();
    
    // Revert title
    document.title = originalTitle;
    return true;
  }
};
