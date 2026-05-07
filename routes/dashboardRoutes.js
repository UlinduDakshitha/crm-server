const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: "New" });
    const contactedLeads = await Lead.countDocuments({ status: "Contacted" });
    const qualifiedLeads = await Lead.countDocuments({ status: "Qualified" });
    const proposalLeads = await Lead.countDocuments({
      status: "Proposal Sent",
    });
    const wonLeads = await Lead.countDocuments({ status: "Won" });
    const lostLeads = await Lead.countDocuments({ status: "Lost" });

    const allLeads = await Lead.find();

    // Calculate total estimated deal value
    const totalValue = allLeads.reduce(
      (sum, lead) => sum + (lead.value || 0),
      0,
    );

    // Calculate total value of won deals
    const wonValue = allLeads
      .filter((lead) => lead.status === "Won")
      .reduce((sum, lead) => sum + (lead.value || 0), 0);

    // Calculate average deal value
    const averageValue = totalLeads > 0 ? totalValue / totalLeads : 0;

    // Get conversion rate
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // Get recent notes count
    const totalNotes = await Note.countDocuments();

    res.json({
      summary: {
        totalLeads,
        totalNotes,
        conversionRate: conversionRate.toFixed(2),
      },
      leadsByStatus: {
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        proposalSent: proposalLeads,
        won: wonLeads,
        lost: lostLeads,
      },
      dealValue: {
        totalEstimatedValue: totalValue,
        totalWonValue: wonValue,
        averageDealValue: averageValue.toFixed(2),
        wonValuePercentage:
          totalValue > 0 ? ((wonValue / totalValue) * 100).toFixed(2) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
