// Beni — shared page chrome used by Plan / Health / Activity / Settings.
// Depends on window.BeniNav and window.BeniAtoms (from dashboard.jsx).

const PageShell = ({ active, variant, theme, onThemeChange, children }) => {
  const isMobile = variant === "mobile";
  return (
    <div data-theme={theme} style={{
      background: "var(--bg-page)",
      color: "var(--ink)",
      fontFamily: "var(--font-sans)",
      width: "100%", minHeight: "100%",
      padding: isMobile ? "12px 18px 28px" : "20px 44px 48px",
      boxSizing: "border-box",
    }}>
      {isMobile
        ? <window.BeniNav.MobileNav active={active} />
        : <window.BeniNav.DesktopNav active={active} />}
      <main style={{ display: "flex", flexDirection: "column", gap: isMobile ? 28 : 36 }}>
        {children}
      </main>
      {isMobile && <window.BeniNav.MobileTabBar active={active} />}
    </div>
  );
};

const PageTitle = ({ eyebrow, title, sub, isMobile, right }) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "flex-end",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 12 : 16,
  }}>
    <div style={{ minWidth: 0 }}>
      {eyebrow && (
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--ink-dim)",
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        margin: eyebrow ? "10px 0 0" : 0,
        fontFamily: "var(--font-sans)", fontWeight: 700,
        fontSize: isMobile ? 30 : 40,
        letterSpacing: "-0.02em", lineHeight: 1.1,
        color: "var(--ink)",
      }}>{title}</h1>
      {sub && (
        <p style={{
          margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: 15,
          color: "var(--ink-soft)", lineHeight: 1.5, maxWidth: 640,
          textWrap: "pretty",
        }}>{sub}</p>
      )}
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </div>
);

const PrimaryBtn = ({ children, kind = "ghost", onClick, danger }) => {
  const styles = {
    gradient: {
      background: "linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)",
      color: "#0F1A2C", border: 0,
    },
    ghost: {
      background: "transparent", color: "var(--ink)",
      border: "1px solid var(--btn-ghost-border)",
    },
    danger: {
      background: "transparent", color: "#E55BB8",
      border: "1px solid rgba(229,91,184,0.40)",
    },
  }[danger ? "danger" : kind];
  return (
    <button onClick={onClick} style={{
      height: 40, padding: "0 18px", borderRadius: 999,
      fontFamily: "var(--font-sans)", fontWeight: kind === "gradient" ? 700 : 600,
      fontSize: 13, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
      ...styles,
    }}>{children}</button>
  );
};

const FilterChip = ({ children, active, tone, onClick }) => (
  <button onClick={onClick} style={{
    height: 32, padding: "0 14px", borderRadius: 999,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
    border: "1px solid " + (active ? "var(--chip-border-active)" : "var(--chip-border)"),
    background: active ? "var(--chip-bg-active)" : "var(--chip-bg)",
    color: active ? "var(--chip-fg-active)" : "var(--chip-fg)",
    cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 8,
  }}>
    {tone && (
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: `var(--tag-${tone}-dot)`,
      }} />
    )}
    {children}
  </button>
);

const SettingsCard = ({ title, sub, action, children }) => (
  <section style={{
    background: "var(--bg-card)",
    border: "1px solid var(--hair)",
    borderRadius: 20,
  }}>
    {(title || action) && (
      <header style={{
        padding: "20px 24px 14px",
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: 12, borderBottom: "1px solid var(--hair)",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
            color: "var(--ink)", letterSpacing: "-0.005em",
          }}>{title}</div>
          {sub && (
            <div style={{
              marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13,
              color: "var(--ink-dim)",
            }}>{sub}</div>
          )}
        </div>
        {action}
      </header>
    )}
    <div>{children}</div>
  </section>
);

const Row = ({ label, value, action, last }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: last ? "none" : "1px solid var(--hair)",
    gap: 16,
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.10em", textTransform: "uppercase",
        color: "var(--ink-dim)",
      }}>{label}</div>
      {value && (
        <div style={{
          marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 14.5,
          color: "var(--ink)", fontWeight: 500,
        }}>{value}</div>
      )}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

Object.assign(window, {
  BeniPageShell: PageShell,
  BeniPageTitle: PageTitle,
  BeniPrimaryBtn: PrimaryBtn,
  BeniFilterChip: FilterChip,
  BeniSettingsCard: SettingsCard,
  BeniSettingsRow: Row,
});
