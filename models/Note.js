const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    leadId: String,
    content: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);