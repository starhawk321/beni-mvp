// Beni — Activity page (full claims feed)

const { useState: useActivityState } = React;

const ActivityPage = ({ variant, theme = "dark" }) => {
  const isMobile = variant === "mobile";
  const [payerFilter, setPayerFilter] = useActivityState("all");
  const claims = window.BeniData.allClaims;

  const filtered = payerFilter === "all"
    ? claims
    : claims.filter((c) => c.payerTone === payerFilter);

  const totalIns = filtered.reduce((s, c) => s + c.insPaid, 0);
  const totalOop = filtered.reduce((s, c) => s + c.oop, 0);

  // Group by month
  const groups = {};
  filtered.forEach((c) => {
    (groups[c.monthLabel] = groups[c.monthLabel] || []).push(c);
  });
  const monthOrder = ["Aug", "Jul", "Jun", "May"];
  const monthFull = { Aug: "August 2026", Jul: "July 2026", Jun: "June 2026", May: "May 2026" };

  return (
    <window.BeniPageShell active="Activity" variant={variant} theme={theme}>
      <window.BeniPageTitle
        isMobile={isMobile}
        eyebrow={claims.length + " claims · plan year 2026"}
        title="Activity"
        sub="Every charge across every plan, sorted newest first. Filter by payer when you want to focus on one."
        right={!isMobile && <window.BeniPrimaryBtn kind="ghost">Export CSV</window.BeniPrimaryBtn>}
      />

      {/* Filters */}
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
      }}>
        <window.BeniFilterChip active={payerFilter === "all"} onClick={() => setPayerFilter("all")}>
          All · {claims.length}
        </window.BeniFilterChip>
        <window.BeniFilterChip tone="cyan" active={payerFilter === "cyan"} onClick={() => setPayerFilter("cyan")}>
          Medicare · {claims.filter((c) => c.payerTone === "cyan").length}
        </window.BeniFilterChip>
        <window.BeniFilterChip tone="peach" active={payerFilter === "peach"} onClick={() => setPayerFilter("peach")}>
          Cigna PPO Plus · {claims.filter((c) => c.payerTone === "peach").length}
        </window.BeniFilterChip>
        {!isMobile && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <window.BeniFilterChip>All types ▾</window.BeniFilterChip>
            <window.BeniFilterChip>2026 ▾</window.BeniFilterChip>
          </div>
        )}
      </div>

      {/* Spending totals strip */}
      <SpendingStrip isMobile={isMobile} payerFilter={payerFilter}
        count={filtered.length} totalIns={totalIns} totalOop={totalOop} />

      {/* Claims feed grouped by month */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {monthOrder.filter((m) => groups[m]).map((m) => (
          <div key={m} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MonthHeader label={monthFull[m]} count={groups[m].length} />
            {groups[m].map((c) => <ClaimRow key={c.id} c={c} isMobile={isMobile} />)}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: "40px 24px", textAlign: "center",
            background: "var(--bg-card)", border: "1px solid var(--hair)",
            borderRadius: 18, color: "var(--ink-dim)",
            fontFamily: "var(--font-sans)", fontSize: 14,
          }}>No claims matching this filter.</div>
        )}
      </div>
    </window.BeniPageShell>
  );
};

const SpendingStrip = ({ isMobile, payerFilter, count, totalIns, totalOop }) => {
  const payerLabel = payerFilter === "cyan" ? "Medicare" : payerFilter === "peach" ? "Cigna PPO Plus" : "all plans";
  return (
    <article style={{
      background: "var(--bg-stat)",
      border: "1px solid var(--bg-stat-border, rgba(255,255,255,0.06))",
      borderRadius: 22,
      padding: isMobile ? "22px 22px" : "28px 32px",
      position: "relative", overflow: "hidden",
      color: "#F4ECDE",
    }}>
      <div aria-hidden style={{
        position: "absolute", right: -100, top: -120,
        width: 360, height: 360, borderRadius: 999,
        background: "radial-gradient(circle, rgba(122,231,255,0.22) 0%, rgba(155,91,255,0.10) 40%, transparent 70%)",
      }} />
      <div style={{
        position: "relative",
        fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(244,236,222,0.55)",
      }}>Spending so far · {payerLabel}</div>

      <div style={{
        position: "relative",
        marginTop: 18,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap: isMobile ? 18 : 0,
      }}>
        <SpendStat first label="Insurance paid"
          value={"$" + totalIns.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          isMobile={isMobile} />
        <SpendStat label="You paid"
          value={"$" + totalOop.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          isMobile={isMobile} />
        <SpendStat label="Claims"
          value={count.toString()}
          isMobile={isMobile} />
      </div>
    </article>
  );
};

const SpendStat = ({ label, value, first, isMobile }) => (
  <div style={{
    paddingLeft: !isMobile && !first ? 32 : 0,
    borderLeft: !isMobile && !first ? "1px solid rgba(255,255,255,0.10)" : "none",
    borderTop: isMobile && !first ? "1px solid rgba(255,255,255,0.08)" : "none",
    paddingTop: isMobile && !first ? 16 : 0,
  }}>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
      color: "rgba(244,236,222,0.55)", letterSpacing: "0.02em",
    }}>{label}</div>
    <div style={{
      marginTop: 6, fontFamily: "var(--font-sans)", fontWeight: 700,
      fontSize: isMobile ? 32 : 38, letterSpacing: "-0.025em",
      color: "#FBF6EE", lineHeight: 1, fontVariantNumeric: "tabular-nums",
    }}>{value}</div>
  </div>
);

const MonthHeader = ({ label, count }) => (
  <div style={{
    display: "flex", alignItems: "baseline", gap: 12,
    margin: "4px 0 4px",
  }}>
    <span style={{
      fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22,
      color: "var(--ink)", letterSpacing: "-0.01em",
    }}>{label}</span>
    <span style={{
      fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-dim)",
    }}>{count} {count === 1 ? "claim" : "claims"}</span>
    <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    "processed": { fg: "var(--ink-soft)",  bg: "var(--chip-bg-active)", label: "Processed" },
    "you-paid":  { fg: "#E55BB8",          bg: "rgba(229,91,184,0.12)", label: "You paid" },
    "review":    { fg: "#9B5BFF",          bg: "rgba(155,91,255,0.16)", label: "In review" },
  };
  const s = map[status] || map.processed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 22, padding: "0 9px", borderRadius: 6,
      background: s.bg, color: s.fg,
      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 11, letterSpacing: "0.02em",
    }}>{s.label}</span>
  );
};

const ClaimRow = ({ c, isMobile }) => (
  <article style={{
    background: "var(--bg-card)",
    border: "1px solid var(--hair)",
    borderRadius: 16,
    padding: isMobile ? "16px 18px" : "18px 22px",
    display: isMobile ? "block" : "grid",
    gridTemplateColumns: isMobile ? "" : "minmax(0,1fr) 110px 110px 110px 36px",
    gap: isMobile ? 12 : 22, alignItems: "center",
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
          color: "var(--ink)", letterSpacing: "-0.005em",
        }}>{c.provider}</span>
        <window.BeniAtoms.PayerTag tone={c.payerTone}>{c.payer}</window.BeniAtoms.PayerTag>
        {isMobile && <StatusBadge status={c.status} />}
      </div>
      <div style={{
        marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--ink-mute)",
      }}>{c.detail} · {c.date}</div>
    </div>

    {isMobile ? (
      <div style={{
        marginTop: 14, paddingTop: 14,
        borderTop: "1px solid var(--hair)",
        display: "flex", gap: 24,
      }}>
        <Fig label="Ins. paid" value={c.insPaid === 0 ? "—" : "$" + c.insPaid.toFixed(2)} dim={c.insPaid === 0} />
        <Fig label="You paid"  value={c.oop    === 0 ? "—" : "$" + c.oop.toFixed(2)}    dim={c.oop    === 0} accent={c.oop > 0} />
      </div>
    ) : (
      <>
        <Fig label="Ins. paid" value={c.insPaid === 0 ? "—" : "$" + c.insPaid.toFixed(2)} dim={c.insPaid === 0} align="right" />
        <Fig label="You paid"  value={c.oop    === 0 ? "—" : "$" + c.oop.toFixed(2)}    dim={c.oop    === 0} accent={c.oop > 0} align="right" />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <StatusBadge status={c.status} />
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 999,
          border: "1px solid var(--hair-strong)",
          background: "transparent", color: "var(--ink)",
          fontSize: 16, cursor: "pointer",
        }} aria-label="Open claim">→</button>
      </>
    )}
  </article>
);

const Fig = ({ label, value, dim, accent, align }) => (
  <div style={{ textAlign: align || "left", minWidth: 86 }}>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.02em", color: "var(--ink-mute)",
    }}>{label}</div>
    <div style={{
      marginTop: 3, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17,
      letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
      color: dim ? "var(--ink-faint)" : (accent ? "var(--oop-accent)" : "var(--ink)"),
    }}>{value}</div>
  </div>
);

window.BeniActivityPage = ActivityPage;
