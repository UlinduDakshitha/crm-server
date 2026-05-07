 const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

const VALID_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

const VALID_SOURCES = [
  "Website",
  "Phone",
  "Email",
  "Referral",
  "Social Media",
  "Event",
  "Other",
];

function normalizeLead(lead) {
  if (!lead) return null;

  const obj = lead.toObject ? lead.toObject() : lead;

  return {
    ...obj,
    companyName: obj.companyName || obj.company || "",
    phoneNumber: obj.phoneNumber || obj.phone || "",
    leadSource: obj.leadSource || obj.source || "",
    estimatedDealValue: obj.estimatedDealValue ?? obj.value ?? 0,
    createdDate: obj.createdDate || obj.createdAt,
    lastUpdatedDate: obj.lastUpdatedDate || obj.updatedAt,
  };
}

router.get("/", protect, async (req, res) => {
  try {
    const { status, source, assignedSalesperson, search } = req.query;
    const filter = {};

    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (source && VALID_SOURCES.includes(source)) {
      filter.source = source;
    }

    if (assignedSalesperson) {
      filter.assignedSalesperson = assignedSalesperson;
    }

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

    res.json(leads.map(normalizeLead));
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedSalesperson",
      "_id name email",
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const notes = await Note.find({ leadId: req.params.id })
      .populate("createdBy", "_id name email")
      .sort({ createdAt: -1 });

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

router.post("/", protect, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const company = (req.body.company || req.body.companyName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const phone = (req.body.phone || req.body.phoneNumber || "").trim();
    const source = (req.body.source || req.body.leadSource || "").trim();
    const assignedSalesperson =
      (req.body.assignedSalesperson || req.body.salesperson || "").trim() || null;
    const status = VALID_STATUSES.includes(req.body.status)
      ? req.body.status
      : "New";
    const value = Number(req.body.value || req.body.estimatedDealValue || 0);

    if (!name || !company || !email || !phone || !source) {
      return res.status(400).json({
        message: "Please provide all required fields: name, company, email, phone, source",
        received: { name, company, email, phone, source },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        received: { email },
      });
    }

    if (!VALID_SOURCES.includes(source)) {
      return res.status(400).json({
        message: `Invalid source. Must be one of: ${VALID_SOURCES.join(", ")}`,
        received: { source },
      });
    }

    const leadData = {
      name,
      company,
      email,
      phone,
      source,
      status,
      value,
    };

    if (assignedSalesperson) {
      leadData.assignedSalesperson = assignedSalesperson;
    }

    const lead = await Lead.create(leadData);
    const populatedLead = await Lead.findById(lead._id).populate(
      "assignedSalesperson",
      "_id name email",
    );

    res.status(201).json(normalizeLead(populatedLead));
  } catch (err) {
    res.status(400).json({
      message: err.message || "Error creating lead",
      error: err.errors ? Object.values(err.errors).map((e) => e.message) : [],
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.companyName) updateData.company = updateData.companyName;
    if (updateData.phoneNumber) updateData.phone = updateData.phoneNumber;
    if (updateData.leadSource) updateData.source = updateData.leadSource;
    if (updateData.estimatedDealValue !== undefined) {
      updateData.value = Number(updateData.estimatedDealValue);
    }
    if (updateData.salesperson) {
      updateData.assignedSalesperson = updateData.salesperson;
    }

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

    res.json(normalizeLead(lead));
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(400).json({ message: err.message || "Error updating lead" });
  }
});

router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
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

    res.status(400).json({ message: err.message || "Error updating lead status" });
  }
});

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

router.post("/:leadId/notes", protect, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Please provide note content" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const note = await Note.create({
      leadId,
      content: content.trim(),
      createdBy: req.user?.id || null,
    });

    const populatedNote = await Note.findById(note._id).populate(
      "createdBy",
      "_id name email",
    );

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