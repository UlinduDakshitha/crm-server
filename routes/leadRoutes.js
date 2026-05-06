const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const protect = require("../middleware/authMiddleware");

// GET all leads
router.get("/", protect, async (req, res) => {
  const leads = await Lead.find();
  res.json(leads);
});

// CREATE lead
router.post("/", protect, async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json(lead);
});

// UPDATE lead
router.put("/:id", protect, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(lead);
});

// DELETE lead
router.delete("/:id", protect, async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Lead deleted" });
});

module.exports = router;