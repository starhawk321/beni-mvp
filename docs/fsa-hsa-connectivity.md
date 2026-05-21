# FSA/HSA/HRA Account Connectivity Research

Last updated: 2026-05-20

## Summary

The FSA/HSA connectivity market is fragmented. No single API covers everything. The practical recommendation for Beni is a phased approach: manual entry for MVP, then Plaid for HSA, then Finicity for FSA.

---

## Key Providers

### Plaid
- **Covers:** HSA (HealthEquity, Optum Bank, Fidelity, HSA Bank)
- **Does NOT cover:** FSA accounts
- **Data:** Balance + transaction history
- **Cost:** ~$1–2/user/month in production; free sandbox
- **Developer:** plaid.com/docs — sandbox available immediately
- **Best for:** HSA balance reads (~70% of all HSA accounts)

### Finicity (Mastercard)
- **Covers:** FSA, HSA, HRA, TSA — including WEX Benefits, McGriff, HealthEquity
- **Data:** Balance, transaction history (up to 24 months)
- **Cost:** B2B contract pricing
- **Developer:** Mastercard Open Banking platform
- **Best for:** FSA accounts (better coverage than Plaid for FSA)

### Finch
- **Covers:** HSA/FSA enrollment + deduction data from payroll systems (220+ integrations: Gusto, ADP, Rippling, etc.)
- **Does NOT cover:** Custodian account balances
- **Data:** Employer contributions, employee deductions per paycheck, enrollment status
- **Cost:** Contact sales; free sandbox
- **Best for:** "Your employer contributes $200/paycheck" — payroll-side data

### Alegeus / WealthCare
- **Covers:** FSA, HSA, HRA — full participant data
- **Data:** Balances, transactions, contributions, claims, eligible expenses
- **Access:** TPA/B2B partner only — not an open consumer API
- **Note:** WEX uses Alegeus as their backend

### Lynx
- **What it is:** API-first CDH platform for launching NEW HSA/FSA programs
- **Raised:** $27M (2025)
- **Use case:** If Beni wants to offer its own HSA/FSA product (not aggregate existing ones)
- **Sandbox:** Available at lynx-fh.com

### Elevate.ai
- **What it is:** B2B benefits administration — powers Gusto's HSA/FSA product (June 2025)
- **Not for:** Consumer apps reading existing account data

---

## The FSA Gap

Employer-sponsored FSAs through small TPAs (WEX, P&A Group, etc.) have **no clean read path** for consumer apps. Workarounds:
- **Silver** (withsilver.app) — receipt scanning + automatic claim filing
- **Burst** — post-purchase reimbursement automation ($3M seed, Feb 2026)
- **Flex** — merchant-side HSA/FSA payment acceptance (not balance reads)

---

## Recommended Roadmap for Beni

| Phase | Approach | Coverage | Cost |
|-------|----------|----------|------|
| **MVP** | Manual entry | 100% users | $0 |
| **Post-MVP** | Plaid for HSA | ~70% of HSA accounts | ~$1-2/user/mo |
| **Later** | + Finicity for FSA | Adds FSA for WEX users | B2B contract |
| **Later** | + Finch for contributions | Payroll deduction data | Contact sales |

---

## Account Types Reference

| Type | What it is | Who administers |
|------|-----------|----------------|
| **FSA** | Use-it-or-lose-it employer benefit, pre-tax | WEX, HealthEquity, P&A Group, Benefitfocus |
| **HSA** | Portable, interest-bearing, pre-tax | Optum Bank, HealthEquity, Fidelity, HSA Bank, Lively |
| **HRA** | Employer-funded, employer-controlled | Same as FSA admins |
| **LSA** | Lifestyle spending account, taxable | Forma, Elevate, newer platforms |
| **DCFSA** | Dependent care FSA | Same as FSA admins |

---

## Sources
- Plaid API docs + HealthEquity case study
- Finicity/Mastercard Open Banking
- Fintable coverage database
- Lynx, Elevate, Finch company sites
- Flex YC launch + Series A announcements
- Burst seed round (Feb 2026)
- Silver app (withsilver.app)
