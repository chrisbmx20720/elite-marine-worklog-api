const pdfService = require("../services/pdfService");

const generatePDF = async (req, res) => {
  try {
    const reportData = req.body;

    await pdfService.generateReportPDF(reportData, res);
  } catch (error) {
    console.error("PDF generation error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error generating PDF",
        error: error.message
      });
    }
  }
};

module.exports = {
  generatePDF
};