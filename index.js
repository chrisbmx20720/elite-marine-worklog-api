const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = 5000;

// CORS
app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

// Parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Elite Marine Stabilizers API is running"
  });
});

// Report routes
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});