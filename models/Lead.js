const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    company: String,
    email: String,
    phone: String,
    source: String,
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"],
      default: "New",
    },
    value: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);