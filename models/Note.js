const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Please add a lead ID"],
    },
    content: {
      type: String,
      required: [true, "Please add note content"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add creator"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Note", noteSchema);
