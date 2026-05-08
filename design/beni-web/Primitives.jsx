// ui_kits/beni-web/Primitives.jsx
// Shared primitives: Button, Field, Chip, Badge, Card, Toast, Logo.

const { useState } = React;

const Logo = ({ size = 28 }) => (
  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <img src="../../assets/beni-mark.svg" alt="" style={{ width: size, height: size }} />
    <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: size * 1.05, color: "var(--fg-1)", letterSpacing: "-0.02em" }}>beni</span>
  </a>
);

const Button = ({ variant = "primary", size = "md", children, onClick, type = "button", disabled, style, ...rest }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: size === "sm" ? 36 : size === "lg" ? 52 : 44,
    padding: size === "sm" ? "0 14px" : size === "lg" ? "0 26px" : "0 20px",
    borderRadius: 999, border: 0, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)", fontWeight: 600,
    fontSize: size === "sm" ? 13 : 15,
    transition: "background var(--dur-2) var(--ease-standard), transform var(--dur-1)",
    opacity: disabled ? 0.55 : 1,
  };
  const variants = {
    primary:   { background: "var(--action-primary)", color: "#FFE9CF" },
    secondary: { background: "var(--bg-surface)", color: "var(--fg-1)", border: "1px solid var(--beni-line-strong)" },
    ghost:     { background: "transparent", color: "var(--action-primary)" },
    danger:    { background: "#b3322a", color: "#fff" },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
            style={{ ...base, ...variants[variant], ...style }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "")}
            {...rest}>
      {children}
    </button>
  );
};

const Field = ({ label, hint, error, children }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--fg-2)" }}>{label}</span>}
    {children}
    {error && <span style={{ fontSize: 12, color: "#b3322a" }}>{error}</span>}
    {!error && hint && <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{hint}</span>}
  </label>
);

const Input = ({ error, style, ...props }) => (
  <input
    {...props}
    style={{
      height: 46, padding: "0 14px", borderRadius: 12,
      border: `1px solid ${error ? "#b3322a" : "var(--beni-line-strong)"}`,
      background: "#fff", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500,
      color: "var(--fg-1)", outline: "none",
      transition: "border-color var(--dur-2), box-shadow var(--dur-2)",
      ...style,
    }}
    onFocus={(e) => { e.target.style.borderColor = "var(--beni-sky)"; e.target.style.boxShadow = "var(--shadow-focus)"; }}
    onBlur={(e) => { e.target.style.borderColor = error ? "#b3322a" : "var(--beni-line-strong)"; e.target.style.boxShadow = "none"; }}
  />
);

const Chip = ({ tone = "navy", children, dot = true }) => {
  const tones = {
    navy:   ["#e0e9f3", "#004383"],
    sky:    ["#dff0f8", "#0586C3"],
    vision: ["#ece6fb", "#5a3eb0"],
    fsa:    ["#ffe2dd", "#a4423a"],
    hsa:    ["#ffeedd", "#a36129"],
    life:   ["#fff7c2", "#7a6320"],
  };
  const [bg, fg] = tones[tone] || tones.navy;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: 999,
                   background: bg, color: fg, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em" }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: fg }} />}
      {children}
    </span>
  );
};

const Badge = ({ tone = "info", children }) => {
  const tones = {
    positive: ["#e3f1e7", "#2f7d4f"],
    warning:  ["#fdecd1", "#b56a16"],
    critical: ["#fde0dd", "#b3322a"],
    info:     ["#dff0f8", "#0586C3"],
    new:      ["#FFFF99", "#0D1B2A"],
  };
  const [bg, fg] = tones[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 22, padding: "0 8px",
                   borderRadius: 6, background: bg, color: fg, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 11,
                   letterSpacing: ".04em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
};

const Card = ({ children, style, padded = true, tone = "paper" }) => {
  const tones = {
    paper: { background: "var(--bg-surface)", border: "1px solid var(--beni-line)" },
    navy:  { background: "var(--bg-navy)", color: "var(--fg-on-navy)" },
    cream: { background: "var(--bg-canvas)", border: "1px solid var(--beni-line)" },
  };
  return (
    <div style={{ borderRadius: 20, boxShadow: "var(--shadow-2)", padding: padded ? 22 : 0, ...tones[tone], ...style }}>
      {children}
    </div>
  );
};

window.Logo = Logo;
window.Button = Button;
window.Field = Field;
window.Input = Input;
window.Chip = Chip;
window.Badge = Badge;
window.Card = Card;
