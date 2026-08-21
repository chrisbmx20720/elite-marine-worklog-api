const Report = require("../models/Report");

const createReport = async (reportData) => {
  const newReport = {
    id: Date.now().toString(),
    ...reportData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  reports.push(newReport);

  return newReport;
};

const getReports = async () => {
  return reports;
};

const getReportById = async (id) => {
  return reports.find((report) => report.id === id);
};

const updateReport = async (id, reportData) => {
  const reportIndex = reports.findIndex(
    (report) => report.id === id
  );

  if (reportIndex === -1) {
    return null;
  }

  reports[reportIndex] = {
    ...reports[reportIndex],
    ...reportData,
    updatedAt: new Date()
  };

  return reports[reportIndex];
};

const deleteReport = async (id) => {
  const reportIndex = reports.findIndex(
    (report) => report.id === id
  );

  if (reportIndex === -1) {
    return null;
  }

  const deletedReport = reports[reportIndex];

  reports.splice(reportIndex, 1);

  return deletedReport;
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
};