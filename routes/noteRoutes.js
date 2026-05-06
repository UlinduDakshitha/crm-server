const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

// add note
router.post("/", protect, async (req, res) => {
  const note = new Note(req.body);
  await note.save();
  res.json(note);
});

// get notes for lead
router.get("/:leadId", protect, async (req, res) => {
  const notes = await Note.find({ leadId: req.params.leadId });
  res.json(notes);
});

module.exports = router;