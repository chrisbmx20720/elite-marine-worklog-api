const express = require("express");
const cors = require("cors");

const reportRoutes = require("./routes/reportRoutes");

console.log("reportRoutes:", reportRoutes);
console.log("typeof reportRoutes:", typeof reportRoutes);

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Elite Marine Stabilizers API is running"
  });
});

app.use("/api/reports", reportRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;