const express = require("express");
const cors = require("cors");

const reportRoutes = require("./routes/reportRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173"
      // Aquí posteriormente agregaremos
      // el dominio de tu frontend en Vercel
    ]
  })
);

// Parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Elite Marine Stabilizers API is running",
    status: "online"
  });
});

// Report routes
app.use("/api/reports", reportRoutes);

module.exports = app;