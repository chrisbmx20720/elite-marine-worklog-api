const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.post("/pdf", reportController.generatePDF);

module.exports = router;