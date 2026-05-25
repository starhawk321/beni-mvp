// Beni — Settings page (with working theme toggle)

const { useState: useSettingsState } = React;

const SettingsPage = ({ variant, theme: initialTheme = "dark" }) => {
  const isMobile = variant === "mobile";
  const [theme, setTheme] = useSettingsState(initialTheme);
  const acc = window.BeniData.account;

  return (
    <window.BeniPageShell active="Settings" variant={variant} theme={theme}>
      <window.BeniPageTitle
        isMobile={isMobile}
        eyebrow="Account"
        title="Settings"
        sub="Connections, appearance, the small print. Béni's settings stay short on purpose."
      />

      {/* Account info */}
      <window.BeniSettingsCard title="Profile">
        <window.BeniSettingsRow label="Name" value={acc.name} />
        <window.BeniSettingsRow label="Email" value={acc.email}
          action={<TextBtn>Change</TextBtn>} />
        <window.BeniSettingsRow label="Member since" value={acc.memberSince} last />
      </window.BeniSettingsCard>

      {/* Connected insurers */}
      <window.BeniSettingsCard
        title="Connected insurers"
        sub={acc.connections.length + " active · synced fresh every hour"}
        action={<TextBtn>+ Add another</TextBtn>}
      >
        {acc.connections.map((c, i) => (
          <ConnectionRow key={c.id} c={c} last={i === acc.connections.length - 1} isMobile={isMobile} />
        ))}
      </window.BeniSettingsCard>

      {/* Appearance — working theme toggle */}
      <window.BeniSettingsCard
        title="Appearance"
        sub="Béni's two faces — pick whichever matches the time of day."
      >
        <div style={{ padding: "20px 24px" }}>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </window.BeniSettingsCard>

      {/* Notifications */}
      <window.BeniSettingsCard title="Notifications">
        <ToggleRow label="Claim filed" sub="Email me when a new claim posts to any plan" defaultOn />
        <ToggleRow label="Patient responsibility" sub="When you owe money — once we know" defaultOn />
        <ToggleRow label="Plan year reminders" sub="Open enrollment, FSA deadlines, deductible resets" defaultOn />
        <ToggleRow label="Product news" sub="Occasional emails about what we ship" defaultOn={false} last />
      </window.BeniSettingsCard>

      {/* Legal */}
      <window.BeniSettingsCard title="Legal & privacy">
        <window.BeniSettingsRow label="Privacy policy"
          value="What we read, what we never store, what we keep."
          action={<TextBtn>View →</TextBtn>} />
        <window.BeniSettingsRow label="Terms of service" value="The fine print, in plainer English."
          action={<TextBtn>View →</TextBtn>} />
        <window.BeniSettingsRow label="Download my data"
          value="A copy of everything we hold for your account."
          action={<TextBtn>Request →</TextBtn>} last />
      </window.BeniSettingsCard>

      {/* Session */}
      <window.BeniSettingsCard title="Session">
        <window.BeniSettingsRow
          label="Signed in as"
          value={acc.email}
          action={<window.BeniPrimaryBtn kind="ghost">Sign out</window.BeniPrimaryBtn>}
          last
        />
      </window.BeniSettingsCard>

      {/* Danger zone */}
      <DangerZone />
    </window.BeniPageShell>
  );
};

const TextBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: 0, cursor: "pointer", padding: 0,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
    color: "var(--link)", textDecoration: "none",
  }}>{children}</button>
);

const ConnectionRow = ({ c, last, isMobile }) => (
  <div style={{
    padding: "18px 24px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) auto auto",
    gap: isMobile ? 10 : 16,
    alignItems: "center",
    borderBottom: last ? "none" : "1px solid var(--hair)",
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
          color: "var(--ink)", letterSpacing: "-0.005em",
        }}>{c.carrier}</span>
        <window.BeniAtoms.PayerTag tone={c.id === "cms" ? "cyan" : "peach"}>{c.label}</window.BeniAtoms.PayerTag>
      </div>
      <div style={{
        marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 12.5,
        color: "var(--ink-dim)",
      }}>Last synced {c.lastSync}</div>
    </div>
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 12px 6px 10px",
      background: "rgba(122,231,255,0.10)",
      borderRadius: 999,
      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12,
      color: "#5BA8FF",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: "#5BA8FF",
        boxShadow: "0 0 0 3px rgba(91,168,255,0.18)",
      }} />
      Active
    </div>
    <button style={{
      height: 34, padding: "0 14px", borderRadius: 999,
      border: "1px solid var(--btn-ghost-border)",
      background: "transparent", color: "var(--ink)",
      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
      cursor: "pointer",
    }}>Disconnect</button>
  </div>
);

// ----- Theme toggle (segmented control + tiny preview swatches)

const ThemeToggle = ({ theme, onChange }) => (
  <div style={{
    display: "flex", gap: 12, alignItems: "stretch",
    flexWrap: "wrap",
  }}>
    {[
      { id: "dark",  label: "Dark",  sub: "Night-shift navy",  swatches: ["#07101C", "#0F1A2C", "#FFC4BE"] },
      { id: "light", label: "Light", sub: "Daytime cream",     swatches: ["#F4EBDA", "#FFFFFF", "#9B5BFF"] },
    ].map((opt) => {
      const isActive = opt.id === theme;
      return (
        <button key={opt.id} onClick={() => onChange(opt.id)} style={{
          flex: 1, minWidth: 200,
          background: isActive ? "var(--chip-bg-active)" : "transparent",
          border: "1px solid " + (isActive ? "var(--chip-border-active)" : "var(--hair-strong)"),
          borderRadius: 16, padding: "16px 18px",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 14,
          transition: "background 140ms ease, border-color 140ms ease",
        }}>
          <div style={{
            width: 64, height: 44, borderRadius: 10,
            background: opt.swatches[0],
            border: "1px solid rgba(255,255,255,0.06)",
            position: "relative", flexShrink: 0,
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", left: 8, top: 8,
              width: 22, height: 14, borderRadius: 4,
              background: opt.swatches[1],
            }} />
            <div style={{
              position: "absolute", right: 8, bottom: 8,
              width: 28, height: 14, borderRadius: 4,
              background: opt.swatches[2],
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15,
              color: "var(--ink)",
            }}>{opt.label}</div>
            <div style={{
              marginTop: 3, fontFamily: "var(--font-sans)", fontSize: 12.5,
              color: "var(--ink-dim)",
            }}>{opt.sub}</div>
          </div>
          <div style={{
            width: 18, height: 18, borderRadius: 999,
            border: "2px solid " + (isActive ? "currentColor" : "var(--hair-strong)"),
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: isActive ? "var(--ink)" : "transparent",
            flexShrink: 0,
          }}>
            {isActive && (
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: "currentColor",
              }} />
            )}
          </div>
        </button>
      );
    })}
  </div>
);

// ----- Toggle row (used for notifications)

const ToggleRow = ({ label, sub, defaultOn, last }) => {
  const [on, setOn] = useSettingsState(!!defaultOn);
  return (
    <div style={{
      padding: "16px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16,
      borderBottom: last ? "none" : "1px solid var(--hair)",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14.5,
          color: "var(--ink)",
        }}>{label}</div>
        {sub && (
          <div style={{
            marginTop: 3, fontFamily: "var(--font-sans)", fontSize: 12.5,
            color: "var(--ink-dim)", lineHeight: 1.4, textWrap: "pretty",
          }}>{sub}</div>
        )}
      </div>
      <button onClick={() => setOn(!on)} aria-pressed={on} style={{
        width: 44, height: 26, borderRadius: 999,
        border: 0, padding: 0, cursor: "pointer",
        background: on
          ? "linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)"
          : "var(--hair-strong)",
        position: "relative",
        transition: "background 160ms ease",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 3, left: on ? 21 : 3,
          width: 20, height: 20, borderRadius: 999,
          background: "#FBF6EE",
          boxShadow: "0 1px 3px rgba(7,16,28,0.3)",
          transition: "left 160ms ease",
        }} />
      </button>
    </div>
  );
};

// ----- Danger zone

const DangerZone = () => (
  <section style={{
    background: "transparent",
    border: "1px dashed rgba(229,91,184,0.35)",
    borderRadius: 20,
    padding: "20px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, flexWrap: "wrap",
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15,
        color: "var(--ink)",
      }}>Delete account</div>
      <div style={{
        marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--ink-dim)", lineHeight: 1.45, maxWidth: 560,
        textWrap: "pretty",
      }}>Disconnects every insurer, erases your profile, and forgets we ever met. Can't be undone.</div>
    </div>
    <window.BeniPrimaryBtn danger>Delete account →</window.BeniPrimaryBtn>
  </section>
);

window.BeniSettingsPage = SettingsPage;
