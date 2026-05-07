// Frontend Utility: Place this in your utils/leads.js or create a new file

// Add this to your leads utility file to normalize API responses
export const normalizeLead = (lead) => {
  if (!lead) return null;
  return {
    ...lead,
    // These fields map API field names to frontend field names
    // The backend returns: company, phone, source, value, createdAt, updatedAt
    // Frontend expects: companyName, phoneNumber, leadSource, estimatedDealValue, createdDate, lastUpdatedDate
    companyName: lead.company || lead.companyName,
    phoneNumber: lead.phone || lead.phoneNumber,
    leadSource: lead.source || lead.leadSource,
    estimatedDealValue:
      lead.value !== undefined ? lead.value : lead.estimatedDealValue,
    createdDate: lead.createdAt || lead.createdDate,
    lastUpdatedDate: lead.updatedAt || lead.lastUpdatedDate,
    notes: lead.notes || [],
  };
};

// Add these constants if not already in your leads.js
export const leadSources = [
  "Website",
  "Phone",
  "Email",
  "Referral",
  "Social Media",
  "Event",
  "Other",
];

export const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export const statusStyles = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  Qualified: "bg-green-100 text-green-700",
  "Proposal Sent": "bg-amber-100 text-amber-700",
  Won: "bg-emerald-100 text-emerald-700",
  Lost: "bg-rose-100 text-rose-700",
};

export const emptyLeadForm = () => ({
  name: "",
  companyName: "",
  email: "",
  phoneNumber: "",
  leadSource: "Website",
  assignedSalesperson: "",
  status: "New",
  estimatedDealValue: "",
});

export const formatCurrency = (value) => {
  if (!value || value === 0) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};
