const express = require("express");
const cors = require("cors");

const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Elite Marine WorkLog API",
    status: "online"
  });
});

module.exports = app;