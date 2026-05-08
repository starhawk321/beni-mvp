// ui_kits/beni-web/Onboarding.jsx
const INSURERS = [
  { id: "aetna",   name: "Aetna",                color: "#7B2D8E", initials: "Aᴇ", recommended: true },
  { id: "cigna",   name: "Cigna",                color: "#FF7A00", initials: "Ci", recommended: true },
  { id: "uhc",     name: "UnitedHealthcare",     color: "#002677", initials: "U",  recommended: false },
  { id: "anthem",  name: "Anthem · Blue Cross",  color: "#005EB8", initials: "Aɴ", recommended: false },
  { id: "humana",  name: "Humana",               color: "#5C9A1B", initials: "H",  recommended: false },
];

const OnboardingScreen = ({ onConnect, onSkip }) => {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
      <header style={{ borderBottom: "1px solid var(--beni-line)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--fg-3)" }}>
          <span>Step 1 of 3</span>
          <div style={{ width: 80, height: 4, background: "#e8e3d8", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: "33%", height: "100%", background: "var(--beni-sky)" }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <span className="t-overline" style={{ color: "var(--beni-sky)" }}>Connect insurance</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 48, margin: "8px 0 12px",
                       lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--fg-1)" }}>
            Pick your insurer.<br/>We'll do the rest.
          </h1>
          <p className="t-body" style={{ maxWidth: 520 }}>
            We'll securely link your plan using the same login you use on your insurer's site —
            no need to dig out your insurance card. <a href="#" style={{ color: "var(--action-primary)", fontWeight: 600 }}>How is this safe?</a>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {INSURERS.map((ins) => (
            <button key={ins.id} onClick={() => onConnect(ins)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#fff",
                             border: "1px solid var(--beni-line)", borderRadius: 16, cursor: "pointer", textAlign: "left",
                             transition: "all var(--dur-2)", position: "relative" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--beni-navy)"; e.currentTarget.style.boxShadow = "var(--shadow-2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--beni-line)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: ins.color, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{ins.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--fg-1)" }}>{ins.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>FHIR · SMART on FHIR</div>
              </div>
              {ins.recommended && <Badge tone="positive">Recommended</Badge>}
            </button>
          ))}
        </div>

        <button onClick={onSkip} style={{ background: "transparent", border: 0, color: "var(--fg-3)", cursor: "pointer",
                              fontSize: 14, padding: "12px 0", fontWeight: 500 }}>
          My insurer isn't here →
        </button>

        <div style={{ marginTop: 40, padding: 18, background: "var(--beni-sky-12)", borderRadius: 14,
                      display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--beni-sky)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>i</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>Read-only access</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>
              Beni can see your plan, claims, and benefits. We can't change anything on your insurer's side.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

window.OnboardingScreen = OnboardingScreen;
