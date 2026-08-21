const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

const PORT = process.env.PORT || 3000;

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("<h1>Elite Marine Stabilizers WorkLog API</h1>");
});

// Rutas
app.use("/api/reports", require("./routes/reportRoutes"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Elite Marine WorkLog API running on port ${PORT}`);
});

module.exports = app;