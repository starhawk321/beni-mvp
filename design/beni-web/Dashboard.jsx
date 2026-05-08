// ui_kits/beni-web/Dashboard.jsx
const { useState: useStateD } = React;

const TopBar = ({ user, onLogout }) => (
  <header style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--beni-line)",
                    padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 5 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <Logo size={26} />
      <nav style={{ display: "flex", gap: 4 }}>
        {["Overview", "Accounts", "Claims", "Records"].map((t, i) => (
          <a key={t} href="#" style={{ padding: "8px 14px", borderRadius: 999,
                fontSize: 14, fontWeight: 600,
                color: i === 0 ? "var(--fg-1)" : "var(--fg-3)",
                background: i === 0 ? "var(--beni-cream)" : "transparent",
                textDecoration: "none" }}>{t}</a>
        ))}
      </nav>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--beni-line)",
                       background: "#fff", cursor: "pointer", fontSize: 16 }}>🔔</button>
      <div onClick={onLogout} title="Log out" style={{ width: 40, height: 40, borderRadius: 999,
              background: "var(--beni-coral)", color: "var(--fg-1)", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, cursor: "pointer" }}>{user[0]}</div>
    </div>
  </header>
);

const HeroBalance = () => (
  <div style={{ background: "var(--beni-navy)", borderRadius: 28, padding: "32px 36px", color: "#FFE9CF",
                position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -100, top: -80, width: 360, height: 360, borderRadius: 999,
                  background: "radial-gradient(circle, #FFA199 0%, transparent 70%)", opacity: 0.55 }} />
    <div style={{ position: "absolute", right: 60, bottom: -120, width: 240, height: 240, borderRadius: 999,
                  background: "radial-gradient(circle, #FFFF99 0%, transparent 65%)", opacity: 0.35 }} />
    <div style={{ position: "relative" }}>
      <div className="t-overline" style={{ color: "#FFC799" }}>Total benefits balance</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 64,
                      letterSpacing: "-0.02em", color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>$8,956.70</div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px",
                       background: "rgba(255,231,194,.18)", color: "#FFC799", borderRadius: 999,
                       fontWeight: 600, fontSize: 13 }}>↗ +$340 this month</span>
      </div>
      <p style={{ marginTop: 10, color: "#cfd9e6", maxWidth: 520, fontSize: 15 }}>
        Across 6 accounts. You've used 38% of this year's pre-tax dollars — you're on track.
      </p>
    </div>
  </div>
);

const AccountCard = ({ name, kind, chipLabel, balance, used, total, accent, label }) => {
  const pct = Math.round((used / total) * 100);
  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "20px 22px", border: "1px solid var(--beni-line)",
                  boxShadow: "var(--shadow-1)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: accent }} />
      <div style={{ marginLeft: 12, display: "flex", justifyContent: "flex-end" }}>
        <Chip tone={kind}>{chipLabel}</Chip>
      </div>
      <div style={{ marginLeft: 12, marginTop: 8 }}>
        <div className="t-overline" style={{ color: "var(--fg-3)" }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "var(--fg-1)", marginTop: 2 }}>{name}</div>
      </div>
      <div style={{ marginLeft: 12, marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 32, color: "var(--fg-1)",
                      letterSpacing: "-0.015em", fontVariantNumeric: "tabular-nums" }}>${fmt(balance)}</div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>${fmtInt(used)} of ${fmtInt(total)} used</div>
        <div style={{ height: 6, background: "#f3ede1", borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: accent, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
};

const ClaimsFeed = () => {
  const items = [
    { ico: "⚕︎", icoBg: "#dff0f8", icoFg: "#0586C3", title: "CVS MinuteClinic", sub: "Mar 14 · Approved · FSA", amt: -48.0, pos: false, badge: null },
    { ico: "⏱", icoBg: "#fdecd1", icoFg: "#b56a16", title: "Dr. Patel · annual cleaning", sub: "Mar 11 · Pending claim · Dental", amt: -120.0, pos: false, badge: "Pending" },
    { ico: "↻", icoBg: "#e3f1e7", icoFg: "#2f7d4f", title: "Reimbursement received", sub: "Mar 8 · Vanguard · HSA", amt: 210.0, pos: true, badge: null },
    { ico: "⚕︎", icoBg: "#dff0f8", icoFg: "#0586C3", title: "Quest Diagnostics", sub: "Mar 4 · Processed · Medical", amt: -22.5, pos: false, badge: null },
    { ico: "▤", icoBg: "#ece6fb", icoFg: "#5a3eb0", title: "Warby Parker", sub: "Feb 28 · Approved · Vision", amt: -195.0, pos: false, badge: null },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--beni-line)", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--beni-line)" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "var(--fg-1)" }}>Recent activity</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>Last 30 days · 5 of 24</div>
        </div>
        <a href="#" style={{ color: "var(--action-primary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>See all →</a>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px",
                              borderBottom: i < items.length - 1 ? "1px solid var(--beni-line)" : "none" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: it.icoBg, color: it.icoFg,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{it.ico}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--fg-1)" }}>{it.title}</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{it.sub}</div>
          </div>
          {it.badge && <Badge tone="warning">{it.badge}</Badge>}
          <div style={{ fontWeight: 700, fontSize: 16, fontVariantNumeric: "tabular-nums",
                        color: it.pos ? "#2f7d4f" : "var(--fg-1)" }}>
            {it.pos ? "+" : "−"}${Math.abs(it.amt).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

const TodaySidebar = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ background: "var(--beni-cream)", borderRadius: 20, padding: 22, border: "1px solid var(--beni-line)" }}>
      <div className="t-overline" style={{ color: "var(--fg-3)" }}>Today</div>
      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, lineHeight: 1.15,
                    margin: "6px 0 12px", letterSpacing: "-0.01em", color: "var(--fg-1)" }}>
        Three things are<br/>ready for you.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { color: "#FFA199", title: "Send a receipt", sub: "for your March 11 dental visit" },
          { color: "#FFC799", title: "Use $1,842 in FSA", sub: "before December 31" },
          { color: "#FFFF99", title: "Annual physical due", sub: "covered 100% on your plan" },
        ].map((it, i) => (
          <a href="#" key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                background: "#fff", borderRadius: 12, textDecoration: "none", border: "1px solid var(--beni-line)" }}>
            <div style={{ width: 8, height: 32, borderRadius: 4, background: it.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>{it.title}</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 1 }}>{it.sub}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "var(--fg-3)", fontSize: 18 }}>›</div>
          </a>
        ))}
      </div>
    </div>

    <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "1px solid var(--beni-line)" }}>
      <div className="t-overline" style={{ color: "var(--fg-3)" }}>Plan</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--fg-1)", marginTop: 4 }}>Aetna PPO · 4502-A</div>
      <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 8, lineHeight: 1.5 }}>
        $1,240 of $3,000 deductible used. Out-of-pocket cap $5,500. Renews Jan 1, 2027.
      </div>
      <Button variant="secondary" size="sm" style={{ marginTop: 14 }}>View plan details →</Button>
    </div>
  </div>
);

const Dashboard = ({ user, onLogout }) => (
  <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
    <TopBar user={user} onLogout={onLogout} />
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="t-overline" style={{ color: "var(--fg-3)" }}>Tuesday, May 5</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44,
                     margin: "4px 0 0", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          Hello, {user}.
        </h1>
      </div>

      <HeroBalance />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 24, marginTop: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 className="t-h2">Your accounts</h2>
              <a href="#" style={{ color: "var(--action-primary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Manage →</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <AccountCard label="FSA · Healthcare" name="Flexible spending" kind="fsa" chipLabel="FSA" balance={1842.50} used={2300} total={3300} accent="#FFA199" />
              <AccountCard label="HSA" name="Fidelity HSA" kind="hsa" chipLabel="HSA" balance={6114.20} used={1086} total={4150} accent="#FFC799" />
              <AccountCard label="Vision" name="VSP Choice" kind="vision" chipLabel="VISION" balance={250} used={0} total={250} accent="#6A4FBE" />
              <AccountCard label="Dental" name="Cigna Dental DPPO" kind="sky" chipLabel="DENTAL" balance={1500} used={195} total={1500} accent="#0586C3" />
            </div>
          </div>
          <ClaimsFeed />
        </div>
        <TodaySidebar />
      </div>
    </main>
  </div>
);

window.Dashboard = Dashboard;
