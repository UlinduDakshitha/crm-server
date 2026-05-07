const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const protect = require("../middleware/authMiddleware");

// GET all leads with filtering and search
// Query parameters:
// - status: filter by lead status (New, Contacted, Qualified, Proposal Sent, Won, Lost)
// - source: filter by lead source (Website, Phone, Email, Referral, Social Media, Event, Other)
// - assignedSalesperson: filter by assigned salesperson ID
// - search: search by lead name, company name, or email (case-insensitive)
router.get("/", protect, async (req, res) => {
  try {
    const { status, source, assignedSalesperson, search } = req.query;

    let filter = {};

    // Filter by status
    if (status) {
      const validStatuses = [
        "New",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Won",
        "Lost",
      ];
      if (validStatuses.includes(status)) {
        filter.status = status;
      }
    }

    // Filter by source
    if (source) {
      const validSources = [
        "Website",
        "Phone",
        "Email",
        "Referral",
        "Social Media",
        "Event",
        "Other",
      ];
      if (validSources.includes(source)) {
        filter.source = source;
      }
    }

    // Filter by assigned salesperson
    if (assignedSalesperson) {
      filter.assignedSalesperson = assignedSalesperson;
    }

    // Search by name, company, or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("assignedSalesperson", "_id name email")
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET single lead by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedSalesperson",
      "name email",
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// CREATE lead
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      source,
      assignedSalesperson,
      status,
      value,
    } = req.body;

    // Validate required fields
    if (!name || !company || !email || !phone || !source) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, company, email, phone, source",
      });
    }

    const lead = new Lead({
      name,
      company,
      email,
      phone,
      source,
      assignedSalesperson,
      status: status || "New",
      value: value || 0,
    });

    await lead.save();
    const populatedLead = await lead.populate(
      "assignedSalesperson",
      "name email",
    );

    res.status(201).json(populatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error creating lead" });
  }
});

// UPDATE lead
router.put("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedSalesperson", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(400).json({ message: err.message || "Error updating lead" });
  }
});

// UPDATE lead status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Please provide a status" });
    }

    const validStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Won",
      "Lost",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).populate("assignedSalesperson", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res
      .status(400)
      .json({ message: err.message || "Error updating lead status" });
  }
});

// DELETE lead
router.delete("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully", lead });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: err.message || "Error deleting lead" });
  }
});

module.exports = router;
