const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: true,
      trim: true
    },

    boatName: {
      type: String,
      required: true,
      trim: true
    },

    serialNumber: {
      type: String,
      required: true,
      trim: true
    },

    laborDescription: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;