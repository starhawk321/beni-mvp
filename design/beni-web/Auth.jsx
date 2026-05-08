// ui_kits/beni-web/Auth.jsx
const { useState } = React;

const AuthShell = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-canvas)", padding: 24, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "url(../../assets/beni-pattern-blobs.svg)",
                  backgroundSize: "cover", opacity: 0.55, pointerEvents: "none" }} />
    <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "var(--bg-surface)",
                  borderRadius: 24, padding: 36, boxShadow: "var(--shadow-3)", border: "1px solid var(--beni-line)" }}>
      <div style={{ marginBottom: 28 }}>
        <Logo size={32} />
        <p style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22,
                    color: "var(--fg-2)", lineHeight: 1.2 }}>
          Understand your health insurance, finally.
        </p>
      </div>
      {children}
    </div>
  </div>
);

const LoginCard = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState("maya@example.com");
  const [password, setPassword] = useState("••••••••");
  return (
    <>
      <h2 className="t-h1" style={{ marginBottom: 20 }}>Welcome back</h2>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Button type="submit" size="lg" style={{ width: "100%", marginTop: 6 }}>Log in</Button>
      </form>
      <p style={{ marginTop: 22, textAlign: "center", fontSize: 14, color: "var(--fg-3)" }}>
        Don't have an account?{" "}
        <a onClick={onSwitch} style={{ color: "var(--action-primary)", fontWeight: 600, cursor: "pointer" }}>Sign up</a>
      </p>
    </>
  );
};

const SignupCard = ({ onSignup, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <h2 className="t-h1" style={{ marginBottom: 20 }}>Create your account</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSignup(email); }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <Field label="Password" hint="Min. 8 characters">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
        </Field>
        <Button type="submit" size="lg" style={{ width: "100%", marginTop: 6 }}>Create account</Button>
      </form>
      <p style={{ marginTop: 22, textAlign: "center", fontSize: 14, color: "var(--fg-3)" }}>
        Already have an account?{" "}
        <a onClick={onSwitch} style={{ color: "var(--action-primary)", fontWeight: 600, cursor: "pointer" }}>Log in</a>
      </p>
    </>
  );
};

const ConfirmCard = ({ email }) => (
  <div style={{ textAlign: "center" }}>
    <img src="../../assets/illus-care.svg" style={{ width: 140, margin: "8px auto 16px" }} />
    <h2 className="t-h1">Check your email</h2>
    <p className="t-body" style={{ marginTop: 8 }}>
      We sent a confirmation link to <strong style={{ color: "var(--fg-1)" }}>{email}</strong>. Click it to activate your account.
    </p>
  </div>
);

window.AuthShell = AuthShell;
window.LoginCard = LoginCard;
window.SignupCard = SignupCard;
window.ConfirmCard = ConfirmCard;
