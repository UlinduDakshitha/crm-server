const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

// Helper function to normalize lead response to match frontend expectations
const normalizeLead = (lead) => {
  if (!lead) return null;
  const leadObj = lead.toObject ? lead.toObject() : lead;
  return {
    ...leadObj,
    companyName: leadObj.company,
    phoneNumber: leadObj.phone,
    leadSource: leadObj.source,
    estimatedDealValue: leadObj.value,
    createdDate: leadObj.createdAt,
    lastUpdatedDate: leadObj.updatedAt,
  };
};

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

    // Normalize leads for frontend
    const normalizedLeads = leads.map(normalizeLead);

    res.json(normalizedLeads);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// GET single lead by ID with notes
router.get("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedSalesperson",
      "_id name email",
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Fetch notes for this lead
    const notes = await Note.find({ leadId: req.params.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Normalize lead and add notes
    const normalizedLead = normalizeLead(lead);
    normalizedLead.notes = notes.map((note) => ({
      ...note.toObject(),
      noteContent: note.content,
      createdDate: note.createdAt,
    }));

    res.json(normalizedLead);
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
    // Handle both field name formats from frontend
    const name = req.body.name?.trim();
    const company = (req.body.company || req.body.companyName)?.trim();
    const email = req.body.email?.trim();
    const phone = (req.body.phone || req.body.phoneNumber)?.trim();
    const source = (req.body.source || req.body.leadSource)?.trim();
    const assignedSalesperson =
      req.body.assignedSalesperson?.trim() || req.body.salesperson?.trim();
    const status = req.body.status || "New";
    const value = Number(req.body.value || req.body.estimatedDealValue || 0);

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
      status,
      value,
    });

    await lead.save();
    const populatedLead = await lead.populate(
      "assignedSalesperson",
      "_id name email",
    );

    // Return normalized response
    res.status(201).json(normalizeLead(populatedLead));
  } catch (err) {
    res.status(400).json({ message: err.message || "Error creating lead" });
  }
});

// UPDATE lead
router.put("/:id", protect, async (req, res) => {
  try {
    // Map frontend field names to backend field names
    const updateData = { ...req.body };

    // Handle field name mappings
    if (updateData.companyName) updateData.company = updateData.companyName;
    if (updateData.phoneNumber) updateData.phone = updateData.phoneNumber;
    if (updateData.leadSource) updateData.source = updateData.leadSource;
    if (updateData.estimatedDealValue !== undefined)
      updateData.value = Number(updateData.estimatedDealValue);
    if (updateData.salesperson)
      updateData.assignedSalesperson = updateData.salesperson;

    // Remove duplicate fields
    delete updateData.companyName;
    delete updateData.phoneNumber;
    delete updateData.leadSource;
    delete updateData.estimatedDealValue;
    delete updateData.salesperson;
    delete updateData.createdDate;
    delete updateData.lastUpdatedDate;
    delete updateData.notes;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("assignedSalesperson", "_id name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Return normalized response
    res.json(normalizeLead(lead));
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
    ).populate("assignedSalesperson", "_id name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(normalizeLead(lead));
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

    res.json({
      message: "Lead deleted successfully",
      lead: normalizeLead(lead),
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: err.message || "Error deleting lead" });
  }
});

// ADD note to lead (frontend compatible endpoint)
router.post("/:leadId/notes", protect, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { content, createdBy } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Please provide note content" });
    }

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const note = new Note({
      leadId,
      content,
      createdBy: req.user?.id || "unknown",
    });

    await note.save();
    const populatedNote = await note.populate("createdBy", "_id name email");

    res.status(201).json({
      ...populatedNote.toObject(),
      noteContent: populatedNote.content,
      createdDate: populatedNote.createdAt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Error adding note" });
  }
});

module.exports = router;
