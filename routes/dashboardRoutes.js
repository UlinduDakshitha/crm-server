const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    const newLeads = await Lead.countDocuments({ status: "New" });
    const qualifiedLeads = await Lead.countDocuments({ status: "Qualified" });
    const wonLeads = await Lead.countDocuments({ status: "Won" });
    const lostLeads = await Lead.countDocuments({ status: "Lost" });

    const allLeads = await Lead.find();

    const totalValue = allLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    const wonValue = allLeads
      .filter((lead) => lead.status === "Won")
      .reduce((sum, lead) => sum + (lead.value || 0), 0);

    res.json({
      totalLeads,
      newLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalValue,
      wonValue,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;