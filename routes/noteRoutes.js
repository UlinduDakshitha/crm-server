const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Lead = require("../models/Lead");
const protect = require("../middleware/authMiddleware");

// Add note to a lead
router.post("/", protect, async (req, res) => {
  try {
    const { leadId, content } = req.body;

    if (!leadId || !content) {
      return res.status(400).json({
        message: "Please provide leadId and content",
      });
    }

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const note = new Note({
      leadId,
      content,
      createdBy: req.user.id, // Assuming user info is set by protect middleware
    });

    await note.save();
    const populatedNote = await note.populate("createdBy", "name email");

    res.status(201).json(populatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error creating note" });
  }
});

// Get all notes for a specific lead
router.get("/lead/:leadId", protect, async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const notes = await Note.find({ leadId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(500).json({ message: err.message || "Error fetching notes" });
  }
});

// Get single note
router.get("/:noteId", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId).populate(
      "createdBy",
      "name email",
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: err.message || "Error fetching note" });
  }
});

// Update note
router.put("/:noteId", protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { content },
      { new: true, runValidators: true },
    ).populate("createdBy", "name email");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(400).json({ message: err.message || "Error updating note" });
  }
});

// Delete note
router.delete("/:noteId", protect, async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully", note });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: err.message || "Error deleting note" });
  }
});

module.exports = router;
