// Beni — shared data for Plan, Health, Activity, Settings pages
// Reconciles to dashboard totals: Medicare 8 claims @ $6,200/$847, Cigna 6 @ $2,220/$400.

window.BeniData = window.BeniData || {};

// ---- Full claims feed (14 claims, plan year 2026)
window.BeniData.allClaims = [
  // Medicare (8)
  { id: "c14", provider: "Baptist Health",        type: "facility",    icon: "🏥", detail: "Outpatient procedure",       payer: "Medicare",       payerTone: "cyan",  date: "Aug 31, 2026", monthLabel: "Aug",  insPaid: 1375.00, oop:   0.00, status: "processed" },
  { id: "c13", provider: "Dr. Sarah Chen",        type: "doctor",      icon: "👤", detail: "Office visit · specialist",  payer: "Cigna PPO Plus", payerTone: "peach", date: "Aug 24, 2026", monthLabel: "Aug",  insPaid:    0.00, oop: 135.00, status: "you-paid" },
  { id: "c12", provider: "Walgreens",             type: "pharmacy",    icon: "℞", detail: "Prescription · refill",       payer: "Medicare",       payerTone: "cyan",  date: "Aug 18, 2026", monthLabel: "Aug",  insPaid:   42.00, oop:   8.00, status: "processed" },
  { id: "c11", provider: "Quest Diagnostics",     type: "lab",         icon: "🧪", detail: "Lab work · CBC + lipid",     payer: "Cigna PPO Plus", payerTone: "peach", date: "Aug 12, 2026", monthLabel: "Aug",  insPaid:  187.00, oop:   0.00, status: "processed" },
  { id: "c10", provider: "Baptist Health",        type: "imaging",     icon: "🩻", detail: "Imaging · MRI lumbar",       payer: "Medicare",       payerTone: "cyan",  date: "Aug 04, 2026", monthLabel: "Aug",  insPaid: 2580.00, oop:   0.00, status: "processed" },
  { id: "c09", provider: "Dr. Anthony Park",      type: "doctor",      icon: "👤", detail: "Office visit · primary care", payer: "Cigna PPO Plus", payerTone: "peach", date: "Jul 28, 2026", monthLabel: "Jul",  insPaid:  144.00, oop:  30.00, status: "processed" },
  { id: "c08", provider: "Walgreens",             type: "pharmacy",    icon: "℞", detail: "Prescription · refill",       payer: "Medicare",       payerTone: "cyan",  date: "Jul 20, 2026", monthLabel: "Jul",  insPaid:   35.00, oop:   8.00, status: "processed" },
  { id: "c07", provider: "Florida Heart Center",  type: "specialist",  icon: "👤", detail: "Cardiology consult",          payer: "Medicare",       payerTone: "cyan",  date: "Jul 14, 2026", monthLabel: "Jul",  insPaid:  620.00, oop: 245.00, status: "processed" },
  { id: "c06", provider: "Cigna Specialty Rx",    type: "pharmacy",    icon: "℞", detail: "Prescription · specialty",     payer: "Cigna PPO Plus", payerTone: "peach", date: "Jul 02, 2026", monthLabel: "Jul",  insPaid: 1640.00, oop:  60.00, status: "processed" },
  { id: "c05", provider: "Baptist Health",        type: "facility",    icon: "🏥", detail: "Outpatient follow-up",        payer: "Medicare",       payerTone: "cyan",  date: "Jun 24, 2026", monthLabel: "Jun",  insPaid:  810.00, oop: 324.00, status: "processed" },
  { id: "c04", provider: "Dr. Sarah Chen",        type: "doctor",      icon: "👤", detail: "Office visit · specialist",  payer: "Cigna PPO Plus", payerTone: "peach", date: "Jun 14, 2026", monthLabel: "Jun",  insPaid:  245.00, oop:  60.00, status: "processed" },
  { id: "c03", provider: "Walgreens",             type: "pharmacy",    icon: "℞", detail: "Prescription · refill",       payer: "Medicare",       payerTone: "cyan",  date: "May 30, 2026", monthLabel: "May",  insPaid:   44.00, oop:   8.00, status: "processed" },
  { id: "c02", provider: "Mercy Imaging",         type: "imaging",     icon: "🩻", detail: "Imaging · X-ray",            payer: "Cigna PPO Plus", payerTone: "peach", date: "May 18, 2026", monthLabel: "May",  insPaid:    4.00, oop: 115.00, status: "review" },
  { id: "c01", provider: "Baptist Health",        type: "facility",    icon: "🏥", detail: "Outpatient procedure",       payer: "Medicare",       payerTone: "cyan",  date: "May 02, 2026", monthLabel: "May",  insPaid:  694.00, oop: 254.00, status: "processed" },
];

// ---- Plan details (per-payer)
window.BeniData.plans = [
  {
    id: "medicare",
    carrier: "Medicare",
    plan: "Part A + Part B",
    type: "Federal · Original Medicare",
    memberId: "1EG4-TE5-MK72",
    group: null,
    effective: "Jan 1, 2026 — present",
    coverageEnd: "Dec 31, 2026",
    bg: "#C7E5F2", ink: "#0B2A3D", accent: "#5BA8FF",
    tone: "cyan",
    insPaid: 6200, oop: 847, claims: 8,
    deductible: { used: 240, total: 240, met: true, note: "Part B deductible cleared Mar 12" },
    oopMax:     { used: 0,   total: 6700, note: "Original Medicare has no annual OOP cap; figure shown is your Medigap supplement's" },
    network: "Any provider that accepts Medicare assignment",
    benefits: [
      {
        section: "Medical",
        rows: [
          { label: "Primary care visit",      cost: "$0",                sub: "after Part B deductible" },
          { label: "Specialist visit",        cost: "20% coinsurance",   sub: "of Medicare-approved amount" },
          { label: "Hospital inpatient",      cost: "$1,632 / stay",     sub: "Part A deductible per benefit period" },
          { label: "Lab work · preventive",   cost: "$0",                sub: "most preventive labs covered" },
          { label: "Imaging · diagnostic",    cost: "20% coinsurance",   sub: "after deductible" },
          { label: "Emergency room",          cost: "20% coinsurance",   sub: "after deductible" },
        ],
      },
      {
        section: "Pharmacy",
        rows: [
          { label: "Generic prescriptions",   cost: "Not covered",       sub: "consider adding Part D" },
        ],
      },
    ],
    documents: [
      { kind: "SBC", title: "Summary of Benefits 2026", date: "Updated Jan 2026", size: "412 KB" },
      { kind: "ANOC", title: "Annual Notice of Change", date: "Oct 15, 2025", size: "186 KB" },
    ],
  },
  {
    id: "cigna",
    carrier: "Cigna",
    plan: "PPO Plus",
    type: "Employer · PPO",
    memberId: "U7244 81902 01",
    group: "Group 4082991",
    effective: "Mar 14, 2024 — present",
    coverageEnd: "Dec 31, 2026",
    bg: "#FFC4BE", ink: "#3D1612", accent: "#E55BB8",
    tone: "peach",
    insPaid: 2220, oop: 400, claims: 6,
    deductible: { used: 1200, total: 3000, met: false, note: "$1,800 to go" },
    oopMax:     { used: 400, total: 8150, note: "Resets Jan 1" },
    network: "In & out-of-network covered · in-network preferred",
    benefits: [
      {
        section: "Medical",
        rows: [
          { label: "Primary care visit",      cost: "$30 copay",         sub: "in-network" },
          { label: "Specialist visit",        cost: "$60 copay",         sub: "in-network" },
          { label: "Hospital inpatient",      cost: "20% coinsurance",   sub: "after deductible, in-network" },
          { label: "Lab work",                cost: "20% coinsurance",   sub: "after deductible" },
          { label: "Imaging · diagnostic",    cost: "20% coinsurance",   sub: "prior auth for MRI/CT" },
          { label: "Emergency room",          cost: "$400 copay",        sub: "waived if admitted" },
        ],
      },
      {
        section: "Pharmacy",
        rows: [
          { label: "Generic (Tier 1)",        cost: "$20 copay",         sub: "30-day supply" },
          { label: "Preferred brand (Tier 2)", cost: "$60 copay",         sub: "30-day supply" },
          { label: "Specialty (Tier 4)",      cost: "$120 copay",        sub: "after deductible" },
        ],
      },
    ],
    documents: [
      { kind: "SBC", title: "Summary of Benefits 2026", date: "Updated Jan 2026", size: "318 KB" },
      { kind: "Plan", title: "Cigna PPO Plus — full plan booklet", date: "Mar 2024", size: "1.8 MB" },
    ],
  },
];

// ---- Health records (merged across payers)
window.BeniData.health = {
  conditions: [
    { name: "Type 2 diabetes mellitus", status: "Active",   onset: "Mar 2022", sources: ["cyan"],          code: "E11.9" },
    { name: "Essential hypertension",   status: "Active",   onset: "Sep 2018", sources: ["cyan", "peach"], code: "I10" },
    { name: "Lumbar disc displacement", status: "Active",   onset: "Aug 2026", sources: ["cyan"],          code: "M51.26" },
    { name: "Streptococcal pharyngitis", status: "Resolved", onset: "Nov 2024", sources: ["peach"],         code: "J02.0" },
  ],
  medications: [
    { name: "Metformin 500 mg",  dose: "1 tab twice daily, with meals", prescriber: "Dr. Anthony Park",   started: "Mar 2022", sources: ["peach"], status: "Active" },
    { name: "Lisinopril 10 mg",  dose: "1 tab daily, morning",          prescriber: "Dr. Anthony Park",   started: "Sep 2018", sources: ["peach"], status: "Active" },
    { name: "Atorvastatin 20 mg", dose: "1 tab daily, evening",         prescriber: "Florida Heart Center", started: "Jul 2026", sources: ["cyan"],  status: "Active" },
    { name: "Methotrexate 7.5 mg", dose: "Weekly, with folic acid",     prescriber: "Dr. Sarah Chen",     started: "Jan 2025", sources: ["peach"], status: "Active" },
  ],
  labs: [
    { name: "HbA1c",                value: "6.8 %",      range: "< 7.0 % goal",        date: "Aug 12, 2026", interp: "in-range",  sources: ["peach"] },
    { name: "LDL cholesterol",      value: "125 mg/dL",  range: "< 100 mg/dL",         date: "Aug 12, 2026", interp: "elevated",  sources: ["peach"] },
    { name: "Blood pressure",       value: "128 / 82",   range: "< 130 / 80",          date: "Jul 28, 2026", interp: "borderline", sources: ["peach"] },
    { name: "Estimated GFR",        value: "84 mL/min",  range: "> 60 mL/min",         date: "Aug 12, 2026", interp: "in-range",  sources: ["peach"] },
    { name: "Vitamin D, 25-OH",     value: "22 ng/mL",   range: "30 – 100 ng/mL",      date: "Aug 12, 2026", interp: "low",       sources: ["peach"] },
  ],
  immunizations: [
    { name: "Influenza vaccine",       date: "Oct 2025", sources: ["peach"] },
    { name: "COVID-19 booster",        date: "Sep 2024", sources: ["cyan"]  },
    { name: "Tdap (tetanus, diphtheria, pertussis)", date: "Mar 2021", sources: ["peach"] },
    { name: "Pneumococcal (PCV20)",    date: "Jan 2026", sources: ["cyan"]  },
  ],
};

// ---- Settings / account
window.BeniData.account = {
  name: "Sarthak Gupta",
  email: "gsarthak@vt.edu",
  memberSince: "May 2026",
  connections: [
    { id: "cms",   carrier: "Medicare",       label: "CMS · Original Medicare", status: "Active", lastSync: "2 hours ago" },
    { id: "cigna", carrier: "Cigna",          label: "Cigna PPO Plus · employer", status: "Active", lastSync: "yesterday" },
  ],
};
