const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a lead name"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Please add a company name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    source: {
      type: String,
      required: [true, "Please add a lead source"],
      enum: [
        "Website",
        "Phone",
        "Email",
        "Referral",
        "Social Media",
        "Event",
        "Other",
      ],
    },
    assignedSalesperson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"],
      default: "New",
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
