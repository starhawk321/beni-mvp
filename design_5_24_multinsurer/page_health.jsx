// Beni — Health records page
// Pulled-from-insurers clinical record, merged across payers, never stored.

const HealthPage = ({ variant, theme = "dark" }) => {
  const isMobile = variant === "mobile";
  const h = window.BeniData.health;

  return (
    <window.BeniPageShell active="Health" variant={variant} theme={theme}>
      <window.BeniPageTitle
        isMobile={isMobile}
        eyebrow="Your record"
        title="Health records"
        sub="Pulled directly from your insurers. Béni reads — never stores — your clinical data."
        right={!isMobile && <PrivacyBadge />}
      />
      {isMobile && <div><PrivacyBadge /></div>}

      <SourcesLegend />

      <HealthSection
        title="Conditions"
        sub={h.conditions.length + " on record"}
        rows={h.conditions}
        renderRow={(c) => <ConditionRow c={c} isMobile={isMobile} />}
        emptyHint="No conditions reported."
      />

      <HealthSection
        title="Medications"
        sub={h.medications.length + " active"}
        rows={h.medications}
        renderRow={(m) => <MedicationRow m={m} isMobile={isMobile} />}
        emptyHint="No medications reported."
      />

      <HealthSection
        title="Lab results"
        sub={"Latest · Aug 12, 2026"}
        rows={h.labs}
        renderRow={(l) => <LabRow l={l} isMobile={isMobile} />}
        emptyHint="No labs reported."
      />

      <HealthSection
        title="Immunizations"
        sub={h.immunizations.length + " on record"}
        rows={h.immunizations}
        renderRow={(v) => <ImmunizationRow v={v} isMobile={isMobile} />}
        emptyHint="No immunizations reported."
      />
    </window.BeniPageShell>
  );
};

// ----- Privacy badge (uses gradient briefly)

const PrivacyBadge = () => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "10px 16px 10px 12px",
    background: "var(--bg-card)",
    border: "1px solid var(--hair)",
    borderRadius: 999,
    fontFamily: "var(--font-sans)",
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: 999,
      background: "linear-gradient(135deg, #7AE7FF 0%, #9B5BFF 60%, #E55BB8 100%)",
    }} />
    <span style={{
      fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
    }}>Never stored</span>
    <span style={{
      fontSize: 12.5, color: "var(--ink-dim)",
    }}>· read fresh from your insurers</span>
  </div>
);

// ----- Sources legend

const SourcesLegend = () => (
  <div style={{
    display: "flex", gap: 16, flexWrap: "wrap",
    fontFamily: "var(--font-sans)", fontSize: 12.5,
    color: "var(--ink-dim)",
    alignItems: "center",
  }}>
    <span>Reported by</span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--tag-cyan-dot)" }} />
      Medicare
    </span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--tag-peach-dot)" }} />
      Cigna PPO Plus
    </span>
    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-dim)" }}>
      Last refresh · 2 hours ago
    </span>
  </div>
);

// ----- Section wrapper

const HealthSection = ({ title, sub, rows, renderRow, emptyHint }) => (
  <section>
    <window.BeniAtoms.SectionHeader title={title} sub={sub} />
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--hair)",
      borderRadius: 20,
      overflow: "hidden",
    }}>
      {rows.length === 0
        ? <div style={{ padding: "24px", color: "var(--ink-dim)" }}>{emptyHint}</div>
        : rows.map((r, i) => (
          <div key={i} style={{
            borderTop: i === 0 ? "none" : "1px solid var(--hair)",
          }}>{renderRow(r)}</div>
        ))}
    </div>
  </section>
);

// ----- Row variants

const SourceDots = ({ sources }) => (
  <span style={{ display: "inline-flex", gap: 3 }}>
    {sources.map((s, i) => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: 999,
        background: `var(--tag-${s}-dot)`,
      }} />
    ))}
  </span>
);

const ConditionRow = ({ c, isMobile }) => {
  const isResolved = c.status === "Resolved";
  return (
    <div style={{
      padding: isMobile ? "16px 20px" : "18px 26px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) 140px 110px 36px",
      gap: isMobile ? 6 : 24, alignItems: "center",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
            color: "var(--ink)", letterSpacing: "-0.005em",
            opacity: isResolved ? 0.55 : 1,
            textDecoration: isResolved ? "line-through" : "none",
          }}>{c.name}</span>
          <SourceDots sources={c.sources} />
        </div>
        <div style={{
          marginTop: 3, fontFamily: "var(--font-mono)", fontSize: 11.5,
          color: "var(--ink-dim)",
        }}>ICD-10 · {c.code}</div>
      </div>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-soft)",
        marginTop: isMobile ? 4 : 0,
      }}>Onset {c.onset}</div>
      <div style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12.5,
        letterSpacing: "0.02em",
        color: isResolved ? "var(--ink-dim)" : "var(--ink)",
        textAlign: isMobile ? "left" : "right",
        marginTop: isMobile ? 4 : 0,
      }}>{c.status}</div>
      {!isMobile && (
        <button aria-label="Open" style={{
          width: 36, height: 36, borderRadius: 999,
          border: "1px solid var(--hair-strong)",
          background: "transparent", color: "var(--ink)",
          fontSize: 14, cursor: "pointer",
        }}>→</button>
      )}
    </div>
  );
};

const MedicationRow = ({ m, isMobile }) => (
  <div style={{
    padding: isMobile ? "16px 20px" : "18px 26px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.4fr) minmax(0,1fr) 140px 36px",
    gap: isMobile ? 8 : 24, alignItems: "center",
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
          color: "var(--ink)", letterSpacing: "-0.005em",
        }}>{m.name}</span>
        <SourceDots sources={m.sources} />
      </div>
      <div style={{
        marginTop: 3, fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--ink-soft)", textWrap: "pretty",
      }}>{m.dose}</div>
    </div>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-soft)",
    }}>
      <span style={{ color: "var(--ink-dim)" }}>Prescribed by </span>
      {m.prescriber}
    </div>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-soft)",
      textAlign: isMobile ? "left" : "right",
    }}>Started {m.started}</div>
    {!isMobile && (
      <button aria-label="Open" style={{
        width: 36, height: 36, borderRadius: 999,
        border: "1px solid var(--hair-strong)",
        background: "transparent", color: "var(--ink)",
        fontSize: 14, cursor: "pointer",
      }}>→</button>
    )}
  </div>
);

const LabRow = ({ l, isMobile }) => {
  const interpColor = {
    "in-range":   "var(--ink-soft)",
    "elevated":   "#E55BB8",
    "low":        "#FFC4BE",
    "borderline": "#9B5BFF",
  }[l.interp] || "var(--ink-soft)";
  return (
    <div style={{
      padding: isMobile ? "16px 20px" : "18px 26px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.4fr) 140px 160px 100px",
      gap: isMobile ? 6 : 20, alignItems: "center",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
            color: "var(--ink)", letterSpacing: "-0.005em",
          }}>{l.name}</span>
          <SourceDots sources={l.sources} />
        </div>
        <div style={{
          marginTop: 3, fontFamily: "var(--font-sans)", fontSize: 12.5,
          color: "var(--ink-dim)",
        }}>Reference range · {l.range}</div>
      </div>
      <div style={{
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18,
        color: "var(--ink)", letterSpacing: "-0.015em",
        fontVariantNumeric: "tabular-nums",
      }}>{l.value}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15,
        color: interpColor, letterSpacing: "-0.01em",
        textTransform: "lowercase",
      }}>{l.interp}</div>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-soft)",
        textAlign: isMobile ? "left" : "right",
      }}>{l.date}</div>
    </div>
  );
};

const ImmunizationRow = ({ v, isMobile }) => (
  <div style={{
    padding: isMobile ? "16px 20px" : "18px 26px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) auto",
    gap: isMobile ? 6 : 20, alignItems: "center",
  }}>
    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15,
        color: "var(--ink)",
      }}>{v.name}</span>
      <SourceDots sources={v.sources} />
    </div>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-soft)",
      textAlign: isMobile ? "left" : "right",
    }}>{v.date}</div>
  </div>
);

window.BeniHealthPage = HealthPage;
