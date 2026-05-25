// Beni — Plan detail page
// Multi-plan tab selector, then coverage status, deductible/OOP, benefits table, plan docs.

const { useState: usePlanState } = React;

const PlanPage = ({ variant, theme = "dark" }) => {
  const isMobile = variant === "mobile";
  const plans = window.BeniData.plans;
  const [selectedId, setSelectedId] = usePlanState(plans[0].id);
  const p = plans.find((x) => x.id === selectedId);

  return (
    <window.BeniPageShell active="Plan" variant={variant} theme={theme}>
      <window.BeniPageTitle
        isMobile={isMobile}
        eyebrow="Plan details"
        title="What's covered"
        sub="Each plan, on its own terms. Switch carriers to see how the rules change."
      />

      <PlanTabs plans={plans} selectedId={selectedId} onSelect={setSelectedId} isMobile={isMobile} />

      <CoverageStatusPill plan={p} isMobile={isMobile} />

      <ProgressPanel plan={p} isMobile={isMobile} />

      <BenefitsTable plan={p} isMobile={isMobile} />

      <PlanDocuments plan={p} isMobile={isMobile} />
    </window.BeniPageShell>
  );
};

// ----- Tabs

const PlanTabs = ({ plans, selectedId, onSelect, isMobile }) => (
  <div style={{
    display: "flex", gap: 8, flexWrap: "wrap",
    paddingBottom: 4,
    borderBottom: "1px solid var(--hair)",
  }}>
    {plans.map((p) => {
      const isActive = p.id === selectedId;
      return (
        <button key={p.id} onClick={() => onSelect(p.id)} style={{
          position: "relative",
          padding: isMobile ? "12px 14px 14px" : "14px 18px 16px",
          background: "transparent", border: 0, cursor: "pointer",
          fontFamily: "var(--font-sans)", textAlign: "left",
          color: isActive ? "var(--ink)" : "var(--ink-dim)",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", opacity: isActive ? 0.65 : 0.5,
          }}>{p.carrier}</span>
          <span style={{
            fontWeight: 700, fontSize: isMobile ? 16 : 18, letterSpacing: "-0.01em",
          }}>{p.plan}</span>
          {isActive && (
            <span style={{
              position: "absolute", left: 0, right: 0, bottom: -1, height: 3,
              background: p.accent, borderRadius: 999,
            }} />
          )}
        </button>
      );
    })}
  </div>
);

// ----- Coverage status pill

const CoverageStatusPill = ({ plan, isMobile }) => (
  <div style={{
    display: "flex", flexWrap: "wrap", alignItems: "center",
    gap: 10, marginTop: -8,
  }}>
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "8px 14px 8px 10px",
      background: "var(--bg-card)",
      border: "1px solid var(--hair)",
      borderRadius: 999,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999, background: plan.accent,
        boxShadow: `0 0 0 4px ${plan.accent}22`,
      }} />
      <span style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
        color: "var(--ink)",
      }}>Coverage active</span>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--ink-dim)",
      }}>through {plan.coverageEnd}</span>
    </div>
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 12,
      color: "var(--ink-dim)",
    }}>
      Member · {plan.memberId}{plan.group ? " · " + plan.group : ""}
    </div>
  </div>
);

// ----- Deductible & OOP progress panel

const ProgressPanel = ({ plan, isMobile }) => {
  const dedPct = plan.deductible.met ? 100 : Math.round((plan.deductible.used / plan.deductible.total) * 100);
  const oopPct = Math.round((plan.oopMax.used / plan.oopMax.total) * 100);
  return (
    <article style={{
      background: plan.bg, color: plan.ink, borderRadius: 24,
      padding: isMobile ? "24px 22px 22px" : "32px 32px 28px",
      position: "relative", overflow: "hidden",
    }}>
      <header style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 16,
        flexDirection: isMobile ? "column" : "row",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: plan.ink, opacity: 0.55,
          }}>{plan.carrier} · {plan.type}</div>
          <h2 style={{
            margin: "6px 0 0",
            fontFamily: "var(--font-sans)", fontWeight: 700,
            fontSize: isMobile ? 24 : 28,
            letterSpacing: "-0.02em", color: plan.ink, lineHeight: 1.1,
          }}>{plan.plan}</h2>
          <div style={{
            marginTop: 6, fontFamily: "var(--font-sans)", fontSize: 13,
            color: plan.ink, opacity: 0.6,
          }}>Effective {plan.effective}</div>
        </div>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 13,
          color: plan.ink, opacity: 0.65, lineHeight: 1.4,
          maxWidth: 280, textAlign: isMobile ? "left" : "right",
        }}>
          <strong style={{
            display: "block", textTransform: "uppercase", letterSpacing: "0.12em",
            fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 4,
          }}>Network</strong>
          {plan.network}
        </div>
      </header>

      <div style={{
        marginTop: isMobile ? 22 : 30,
        background: "rgba(255,255,255,0.46)",
        borderRadius: 18,
        padding: isMobile ? "20px 20px" : "26px 28px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 24 : 40,
      }}>
        <BigMeter plan={plan}
          label="Deductible"
          big={plan.deductible.met
            ? "Met"
            : "$" + plan.deductible.used.toLocaleString() + " of $" + plan.deductible.total.toLocaleString()}
          remaining={plan.deductible.met
            ? "$" + (plan.deductible.total || 0).toLocaleString() + " cleared"
            : "$" + (plan.deductible.total - plan.deductible.used).toLocaleString() + " to go"}
          note={plan.deductible.note}
          pct={plan.deductible.met ? 100 : Math.round((plan.deductible.used / plan.deductible.total) * 100)}
          met={plan.deductible.met}
        />
        <BigMeter plan={plan}
          label="Out-of-pocket max"
          big={"$" + plan.oopMax.used.toLocaleString() + " of $" + plan.oopMax.total.toLocaleString()}
          remaining={"$" + (plan.oopMax.total - plan.oopMax.used).toLocaleString() + " remaining"}
          note={plan.oopMax.note}
          pct={Math.round((plan.oopMax.used / plan.oopMax.total) * 100)}
        />
      </div>
    </article>
  );
};

const BigMeter = ({ plan, label, big, remaining, note, pct, met }) => (
  <div>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 8,
    }}>
      <span style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12.5,
        color: plan.ink, opacity: 0.72, letterSpacing: "0.04em", textTransform: "uppercase",
      }}>{label}</span>
      {met && (
        <span style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 15, color: plan.accent, letterSpacing: "-0.01em",
        }}>cleared</span>
      )}
    </div>
    <div style={{
      marginTop: 8,
      fontFamily: "var(--font-sans)", fontWeight: 700,
      fontSize: 28, letterSpacing: "-0.025em", color: plan.ink,
      fontVariantNumeric: "tabular-nums", lineHeight: 1.1,
    }}>{big}</div>
    <div style={{
      marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13,
      color: plan.ink, opacity: 0.6,
    }}>{remaining}</div>
    <div style={{ marginTop: 14 }}>
      <div style={{ height: 6, background: "rgba(0,0,0,0.10)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          width: Math.min(100, pct) + "%", height: "100%",
          background: plan.accent, borderRadius: 999,
        }} />
      </div>
    </div>
    {note && (
      <div style={{
        marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 12.5,
        color: plan.ink, opacity: 0.6, lineHeight: 1.45, textWrap: "pretty",
      }}>{note}</div>
    )}
  </div>
);

// ----- Benefits table

const BenefitsTable = ({ plan, isMobile }) => (
  <section>
    <window.BeniAtoms.SectionHeader
      title="Covered benefits"
      sub="Specific to this plan"
      actionLabel="Explain a term"
    />
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--hair)",
      borderRadius: 20,
      overflow: "hidden",
    }}>
      {plan.benefits.map((sect, si) => (
        <div key={sect.section} style={{
          borderTop: si === 0 ? "none" : "1px solid var(--hair)",
        }}>
          <div style={{
            padding: isMobile ? "16px 20px 8px" : "18px 26px 10px",
            display: "flex", alignItems: "baseline", gap: 12,
          }}>
            <span style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20,
              color: "var(--ink)", letterSpacing: "-0.01em",
            }}>{sect.section}</span>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 12,
              color: "var(--ink-dim)",
            }}>{sect.rows.length} {sect.rows.length === 1 ? "benefit" : "benefits"}</span>
          </div>
          {sect.rows.map((row, ri) => (
            <div key={ri} style={{
              padding: isMobile ? "14px 20px" : "16px 26px",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) auto",
              gap: isMobile ? 6 : 24,
              alignItems: "center",
              borderTop: "1px solid var(--hair)",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14.5,
                  color: "var(--ink)", letterSpacing: "-0.005em",
                }}>{row.label}</div>
                <div style={{
                  marginTop: 2, fontFamily: "var(--font-sans)", fontSize: 12.5,
                  color: "var(--ink-dim)",
                }}>{row.sub}</div>
              </div>
              <div style={{
                fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15,
                color: "var(--ink)", letterSpacing: "-0.005em",
                fontVariantNumeric: "tabular-nums",
                textAlign: isMobile ? "left" : "right",
              }}>{row.cost}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

// ----- Plan documents

const PlanDocuments = ({ plan, isMobile }) => (
  <section>
    <window.BeniAtoms.SectionHeader
      title="Plan documents"
      sub={plan.documents.length + " on file"}
      actionLabel="Request something"
    />
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 10,
    }}>
      {plan.documents.map((d, i) => (
        <article key={i} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--hair)",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 48, borderRadius: 8,
            background: plan.bg, color: plan.ink,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20,
            flexShrink: 0,
          }}>{d.kind === "SBC" ? "S" : d.kind === "ANOC" ? "A" : "P"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.10em", textTransform: "uppercase",
              color: "var(--ink-dim)",
            }}>{d.kind}</div>
            <div style={{
              marginTop: 2, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14.5,
              color: "var(--ink)", letterSpacing: "-0.005em",
            }}>{d.title}</div>
            <div style={{
              marginTop: 2, fontFamily: "var(--font-sans)", fontSize: 12.5,
              color: "var(--ink-dim)",
            }}>{d.date} · {d.size}</div>
          </div>
          <button aria-label="Download" style={{
            width: 36, height: 36, borderRadius: 999,
            border: "1px solid var(--hair-strong)",
            background: "transparent", color: "var(--ink)",
            fontSize: 14, cursor: "pointer",
          }}>↓</button>
        </article>
      ))}
    </div>
  </section>
);

window.BeniPlanPage = PlanPage;
