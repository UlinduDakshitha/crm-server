const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const protect = require("../middleware/authMiddleware");

// GET all leads
 router.get("/", protect, async (req, res) => {
  try {
    const { status, source, search } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
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