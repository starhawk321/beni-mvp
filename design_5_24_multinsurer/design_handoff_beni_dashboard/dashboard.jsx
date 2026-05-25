// Beni dashboard — desktop + mobile variants
// Navy bg + pastel cards + gradient accent direction

const fmtMoney = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMoneyD = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ----- shared data
const DATA = {
  user: "Sarthak",
  totals: { insPaid: 8420, oop: 1247, claims: 14 },
  plans: [
    {
      id: "medicare",
      carrier: "Medicare",
      plan: "Part A + Part B",
      memberId: "1EG4-TE5-MK72",
      bg: "#C7E5F2",            // light cyan pastel
      ink: "#0B2A3D",
      accent: "#5BA8FF",
      insPaid: 6200,
      oop: 847,
      claims: 8,
      deductible: { used: null, total: null, met: true },
      oopMax:     { used: 0,    total: 6700 },
    },
    {
      id: "cigna",
      carrier: "Cigna",
      plan: "PPO Plus",
      memberId: "U7244 81902 01",
      bg: "#FFC4BE",            // peach pastel
      ink: "#3D1612",
      accent: "#E55BB8",
      insPaid: 2220,
      oop: 400,
      claims: 6,
      deductible: { used: 1200, total: 3000, met: false },
      oopMax:     { used: 400,  total: 8150 },
    },
  ],
  forYou: [
    {
      kind: "deductible-met",
      title: "Your Medicare deductible is met.",
      body: "Preventive visits and most covered services run at 100% for the rest of the plan year.",
      cta: "See what's free now",
    },
    {
      kind: "claim-action",
      title: "Dr. Sarah Chen wants $135.",
      body: "Cigna processed it as patient responsibility on Aug 24. We can walk you through whether to dispute.",
      cta: "Review claim",
    },
  ],
  activity: [
    {
      provider: "Baptist Health",
      detail: "Outpatient procedure",
      payer: "Medicare",
      payerTone: "cyan",
      date: "Aug 31",
      insPaid: 1375.00,
      oop: 0,
    },
    {
      provider: "Dr. Sarah Chen",
      detail: "Office visit · specialist",
      payer: "Cigna PPO Plus",
      payerTone: "peach",
      date: "Aug 24",
      insPaid: 0,
      oop: 135.00,
    },
    {
      provider: "Walgreens",
      detail: "Prescription · refill",
      payer: "Medicare",
      payerTone: "cyan",
      date: "Aug 18",
      insPaid: 42.00,
      oop: 8.00,
    },
  ],
};

// ----- tiny shared atoms

const GradientWord = ({ children }) => (
  <span style={{
    background: "linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontStyle: "italic",
    fontFamily: "var(--font-display)",
    fontWeight: 400,
  }}>{children}</span>
);

const PayerTag = ({ tone, children }) => {
  const tones = {
    cyan:  { bg: "rgba(122,231,255,0.14)", fg: "#7AE7FF", dot: "#7AE7FF" },
    peach: { bg: "rgba(255,196,190,0.16)", fg: "#FFC4BE", dot: "#E55BB8" },
  }[tone] || { bg: "rgba(255,255,255,0.08)", fg: "#cfd6e2", dot: "#cfd6e2" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      height: 22, padding: "0 9px", borderRadius: 999,
      background: tones.bg, color: tones.fg,
      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 11, letterSpacing: "0.02em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: tones.dot }} />
      {children}
    </span>
  );
};

const MeterBar = ({ pct, track = "rgba(255,255,255,0.18)", fill = "currentColor" }) => (
  <div style={{ height: 4, background: track, borderRadius: 999, overflow: "hidden" }}>
    <div style={{ width: Math.min(100, Math.max(0, pct)) + "%", height: "100%", background: fill, borderRadius: 999 }} />
  </div>
);

// ----- HERO card — 3 stats horizontally on dark navy

const Hero = ({ width = "desktop" }) => {
  const isMobile = width === "mobile";
  const t = DATA.totals;
  return (
    <section style={{
      position: "relative",
      background: "#0F1A2C",
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? "26px 22px 24px" : "36px 40px 32px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* gradient blob accent */}
      <div aria-hidden style={{
        position: "absolute", right: isMobile ? -120 : -80, top: isMobile ? -160 : -200,
        width: isMobile ? 360 : 520, height: isMobile ? 360 : 520, borderRadius: 999,
        background: "radial-gradient(circle, rgba(155,91,255,0.55) 0%, rgba(229,91,184,0.32) 35%, transparent 70%)",
        filter: "blur(2px)", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", left: isMobile ? -80 : -40, bottom: isMobile ? -140 : -180,
        width: isMobile ? 280 : 380, height: isMobile ? 280 : 380, borderRadius: 999,
        background: "radial-gradient(circle, rgba(122,231,255,0.34) 0%, rgba(91,168,255,0.18) 40%, transparent 72%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative" }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
        }}>Plan year so far · 2026</div>

        <h1 style={{
          margin: "10px 0 0",
          fontFamily: "var(--font-sans)",
          fontSize: isMobile ? 30 : 42,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "#F4ECDE",
        }}>
          Hello, {DATA.user}.{" "}
          <span style={{ display: isMobile ? "block" : "inline" }}>
            Here's where your <GradientWord>coverage</GradientWord> stands.
          </span>
        </h1>

        <div style={{
          marginTop: isMobile ? 26 : 36,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: isMobile ? 18 : 0,
          ...(isMobile ? {} : { columnGap: 36 }),
        }}>
          <Stat
            label="Insurance paid"
            value={"$" + t.insPaid.toLocaleString("en-US")}
            sub="across 2 plans"
            sep={!isMobile}
            isMobile={isMobile}
            first
          />
          <Stat
            label="Out of pocket"
            value={"$" + t.oop.toLocaleString("en-US")}
            sub="14% of total cost"
            sep={!isMobile}
            isMobile={isMobile}
          />
          <Stat
            label="Claims"
            value={t.claims.toString()}
            sub="this plan year"
            sep={false}
            isMobile={isMobile}
            last
          />
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, sub, sep, isMobile, first, last }) => (
  <div style={{
    paddingLeft: !isMobile && !first ? 36 : 0,
    borderLeft: !isMobile && !first ? "1px solid rgba(255,255,255,0.10)" : "none",
    borderTop: isMobile && !first ? "1px solid rgba(255,255,255,0.08)" : "none",
    paddingTop: isMobile && !first ? 18 : 0,
  }}>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
      color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em",
    }}>{label}</div>
    <div style={{
      marginTop: 6,
      fontFamily: "var(--font-sans)", fontWeight: 700,
      fontSize: isMobile ? 40 : 46,
      letterSpacing: "-0.025em",
      color: "#FBF6EE",
      lineHeight: 1,
      fontVariantNumeric: "tabular-nums",
    }}>{value}</div>
    <div style={{
      marginTop: 8, fontFamily: "var(--font-sans)", fontSize: 13,
      color: "rgba(255,255,255,0.55)",
    }}>{sub}</div>
  </div>
);

// ----- FOR YOU

const ForYou = ({ isMobile }) => (
  <section>
    <SectionHeader title="For you" sub={DATA.forYou.length + " worth a look"} />
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? 12 : 16,
    }}>
      {DATA.forYou.map((it, i) => (
        <article key={i} style={{
          background: i === 0 ? "#D8CDF2" : "#FFC4BE",
          borderRadius: 20,
          padding: isMobile ? "20px 20px 18px" : "22px 24px 20px",
          color: "#1A0E2E",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: isMobile ? 17 : 18.5,
            letterSpacing: "-0.01em", lineHeight: 1.25,
          }}>{it.title}</div>
          <div style={{
            marginTop: 10, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45,
            color: "rgba(26,14,46,0.78)", textWrap: "pretty",
          }}>{it.body}</div>
          <button style={{
            marginTop: 16, height: 34, padding: "0 14px",
            borderRadius: 999, border: "1px solid rgba(26,14,46,0.18)",
            background: "rgba(255,255,255,0.55)", color: "#1A0E2E",
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
          }}>{it.cta} <span aria-hidden style={{ fontSize: 14 }}>→</span></button>
        </article>
      ))}
    </div>
  </section>
);

// ----- PLAN CARD

const PlanCard = ({ p, isMobile }) => {
  const dedPct = p.deductible.met ? 100 :
    Math.round((p.deductible.used / p.deductible.total) * 100);
  const oopPct = Math.round((p.oopMax.used / p.oopMax.total) * 100);
  return (
    <article style={{
      background: p.bg,
      color: p.ink,
      borderRadius: 22,
      padding: isMobile ? "22px 22px 20px" : "26px 26px 22px",
      position: "relative",
      overflow: "hidden",
    }}>
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: p.ink, opacity: 0.55,
          }}>{p.carrier}</div>
          <h3 style={{
            margin: "4px 0 0",
            fontFamily: "var(--font-sans)", fontWeight: 700,
            fontSize: isMobile ? 19 : 21, letterSpacing: "-0.01em",
            color: p.ink,
          }}>{p.plan}</h3>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: p.ink, opacity: 0.55, marginTop: 6,
        }}>{p.memberId}</div>
      </header>

      <div style={{
        marginTop: isMobile ? 18 : 22,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        <MiniStat ink={p.ink} label="Ins. paid" value={fmtMoney(p.insPaid)} />
        <MiniStat ink={p.ink} label="OOP"       value={fmtMoney(p.oop)} />
        <MiniStat ink={p.ink} label="Claims"    value={p.claims.toString()} />
      </div>

      <div style={{
        marginTop: 22, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <PlanMeter
          ink={p.ink} accent={p.accent}
          label="Deductible"
          right={p.deductible.met
            ? "Met"
            : fmtMoney(p.deductible.used) + " of " + fmtMoney(p.deductible.total)}
          pct={dedPct}
          status={p.deductible.met ? "met" : "default"}
        />
        <PlanMeter
          ink={p.ink} accent={p.accent}
          label="Out-of-pocket max"
          right={fmtMoney(p.oopMax.used) + " of " + fmtMoney(p.oopMax.total)}
          pct={oopPct}
        />
      </div>
    </article>
  );
};

const MiniStat = ({ ink, label, value }) => (
  <div>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.02em", color: ink, opacity: 0.6,
    }}>{label}</div>
    <div style={{
      marginTop: 4, fontFamily: "var(--font-sans)", fontWeight: 700,
      fontSize: 22, letterSpacing: "-0.015em", color: ink,
      fontVariantNumeric: "tabular-nums",
    }}>{value}</div>
  </div>
);

const PlanMeter = ({ ink, accent, label, right, pct, status }) => (
  <div>
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontFamily: "var(--font-sans)", fontSize: 12.5,
    }}>
      <span style={{ color: ink, opacity: 0.72, fontWeight: 600 }}>{label}</span>
      <span style={{
        color: ink, fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        opacity: status === "met" ? 1 : 0.9,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        {status === "met" && (
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: 999,
            background: accent,
          }} />
        )}
        {right}
      </span>
    </div>
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: "rgba(0,0,0,0.10)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          width: Math.min(100, pct) + "%", height: "100%",
          background: accent, borderRadius: 999,
        }} />
      </div>
    </div>
  </div>
);

// ----- YOUR PLANS

const YourPlans = ({ isMobile }) => (
  <section>
    <SectionHeader title="Your plans" sub="2 connected" actionLabel="Add a plan" />
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? 14 : 16,
    }}>
      {DATA.plans.map((p) => <PlanCard key={p.id} p={p} isMobile={isMobile} />)}
    </div>
  </section>
);

// ----- SPENDING POWER placeholder

const SpendingPower = ({ isMobile }) => (
  <section>
    <SectionHeader title="Spending power" sub="HSA · FSA" />
    <article style={{
      background: "#141E33",
      border: "1px dashed rgba(155,91,255,0.45)",
      borderRadius: 22,
      padding: isMobile ? "24px 22px" : "28px 30px",
      display: isMobile ? "block" : "flex",
      alignItems: "center", gap: 24,
      color: "#F4ECDE",
      position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", right: -60, top: -60,
        width: 220, height: 220, borderRadius: 999,
        background: "radial-gradient(circle, rgba(155,91,255,0.30) 0%, transparent 70%)",
      }} />
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: isMobile ? 22 : 26, color: "#F4ECDE", lineHeight: 1.2, letterSpacing: "-0.01em",
        }}>
          Soon — your HSA and FSA balances, side by side with your bills.
        </div>
        <p style={{
          margin: "10px 0 0", color: "rgba(244,236,222,0.66)",
          fontSize: 14, lineHeight: 1.5, maxWidth: 520,
        }}>
          We'll surface what's eligible, what's expiring, and which account to spend from. Connect an account to get on the early list.
        </p>
      </div>
      <div style={{ marginTop: isMobile ? 18 : 0, position: "relative", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{
          height: 40, padding: "0 18px", borderRadius: 999, border: 0,
          background: "linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)",
          color: "#0F1A2C", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13,
          cursor: "pointer",
        }}>Connect HSA</button>
        <button style={{
          height: 40, padding: "0 18px", borderRadius: 999,
          border: "1px solid rgba(244,236,222,0.18)",
          background: "transparent", color: "#F4ECDE",
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>Add FSA manually</button>
      </div>
    </article>
  </section>
);

// ----- RECENT ACTIVITY

const Activity = ({ isMobile }) => (
  <section>
    <SectionHeader title="Recent activity" sub="3 of 14 claims" actionLabel="See all claims" />
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {DATA.activity.map((c, i) => (
        <article key={i} style={{
          background: "#141E33",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: isMobile ? "16px 18px" : "18px 22px",
          display: isMobile ? "block" : "grid",
          gridTemplateColumns: isMobile ? "" : "1fr auto auto",
          gap: isMobile ? 12 : 28,
          alignItems: "center",
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
                color: "#F4ECDE", letterSpacing: "-0.005em",
              }}>{c.provider}</span>
              <PayerTag tone={c.payerTone}>{c.payer}</PayerTag>
            </div>
            <div style={{
              marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13,
              color: "rgba(244,236,222,0.55)",
            }}>{c.detail} · {c.date}</div>
          </div>

          <div style={{
            display: "flex", gap: isMobile ? 24 : 28,
            marginTop: isMobile ? 14 : 0,
            paddingTop: isMobile ? 14 : 0,
            borderTop: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <ActivityFig label="Ins. paid"
              value={c.insPaid === 0 ? "—" : fmtMoneyD(c.insPaid)}
              dim={c.insPaid === 0}
            />
            <ActivityFig label="OOP"
              value={c.oop === 0 ? "—" : fmtMoneyD(c.oop)}
              dim={c.oop === 0}
              accent={c.oop > 0}
            />
          </div>

          {!isMobile && (
            <button style={{
              width: 36, height: 36, borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "transparent", color: "#F4ECDE",
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, cursor: "pointer",
            }} aria-label="Open claim">→</button>
          )}
        </article>
      ))}
    </div>
  </section>
);

const ActivityFig = ({ label, value, dim, accent }) => (
  <div style={{ textAlign: "right", minWidth: 86 }}>
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.02em", color: "rgba(244,236,222,0.5)",
    }}>{label}</div>
    <div style={{
      marginTop: 3, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17,
      letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
      color: dim ? "rgba(244,236,222,0.35)" : (accent ? "#FFC4BE" : "#F4ECDE"),
    }}>{value}</div>
  </div>
);

// ----- SHARED CHROME

const SectionHeader = ({ title, sub, actionLabel }) => (
  <div style={{
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    marginBottom: 14, gap: 12,
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
      <h2 style={{
        margin: 0,
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20,
        letterSpacing: "-0.01em", color: "#F4ECDE",
      }}>{title}</h2>
      {sub && (
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 13,
          color: "rgba(244,236,222,0.45)",
        }}>{sub}</span>
      )}
    </div>
    {actionLabel && (
      <a href="#" style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
        color: "#7AE7FF", textDecoration: "none",
      }}>{actionLabel} →</a>
    )}
  </div>
);

const DesktopNav = () => (
  <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 0 28px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
      <a href="#" style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        textDecoration: "none",
        fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28,
        color: "#F4ECDE", letterSpacing: "-0.02em",
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8,
          background: "linear-gradient(135deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "#0F1A2C", fontFamily: "var(--font-sans)", fontWeight: 800, fontStyle: "normal",
          fontSize: 16,
        }}>+</span>
        beni
      </a>
      <nav style={{ display: "flex", gap: 4 }}>
        {[
          { t: "Home", active: true },
          { t: "Plans" },
          { t: "Claims" },
          { t: "Records" },
        ].map((it) => (
          <a key={it.t} href="#" style={{
            padding: "8px 16px", borderRadius: 999,
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
            color: it.active ? "#F4ECDE" : "rgba(244,236,222,0.55)",
            background: it.active ? "rgba(255,255,255,0.06)" : "transparent",
            textDecoration: "none",
          }}>{it.t}</a>
        ))}
      </nav>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="Search" style={navIconStyle}>⌕</button>
      <button aria-label="Notifications" style={navIconStyle}>◔</button>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: "linear-gradient(135deg, #FFC4BE 0%, #E55BB8 100%)",
        color: "#1A0E2E",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14,
      }}>S</div>
    </div>
  </header>
);

const navIconStyle = {
  width: 36, height: 36, borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "transparent", color: "#F4ECDE",
  fontSize: 16, cursor: "pointer",
};

const MobileNav = () => (
  <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 0 22px",
  }}>
    <a href="#" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      textDecoration: "none",
      fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24,
      color: "#F4ECDE", letterSpacing: "-0.02em",
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 7,
        background: "linear-gradient(135deg, #7AE7FF 0%, #5BA8FF 32%, #9B5BFF 65%, #E55BB8 100%)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#0F1A2C", fontFamily: "var(--font-sans)", fontWeight: 800, fontStyle: "normal",
        fontSize: 14,
      }}>+</span>
      beni
    </a>
    <div style={{ display: "flex", gap: 8 }}>
      <button aria-label="Search" style={{ ...navIconStyle, width: 34, height: 34 }}>⌕</button>
      <div style={{
        width: 34, height: 34, borderRadius: 999,
        background: "linear-gradient(135deg, #FFC4BE 0%, #E55BB8 100%)",
        color: "#1A0E2E",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13,
      }}>S</div>
    </div>
  </header>
);

const MobileTabBar = () => (
  <nav style={{
    marginTop: 28,
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
    background: "rgba(20,30,51,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: 6,
  }}>
    {[
      { t: "Home", active: true },
      { t: "Plans" },
      { t: "Claims" },
      { t: "You" },
    ].map((it) => (
      <a key={it.t} href="#" style={{
        textAlign: "center", padding: "10px 6px", borderRadius: 999,
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
        color: it.active ? "#0F1A2C" : "rgba(244,236,222,0.7)",
        background: it.active
          ? "linear-gradient(92deg, #7AE7FF 0%, #5BA8FF 35%, #9B5BFF 75%, #E55BB8 100%)"
          : "transparent",
        textDecoration: "none",
      }}>{it.t}</a>
    ))}
  </nav>
);

// ----- DASHBOARD COMPOSITION

const Dashboard = ({ variant }) => {
  const isMobile = variant === "mobile";
  return (
    <div style={{
      background: "#07101C",
      color: "#F4ECDE",
      fontFamily: "var(--font-sans)",
      width: "100%",
      minHeight: "100%",
      padding: isMobile ? "12px 18px 28px" : "20px 44px 48px",
      boxSizing: "border-box",
    }}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <main style={{ display: "flex", flexDirection: "column", gap: isMobile ? 28 : 36 }}>
        <Hero width={variant} />
        <ForYou isMobile={isMobile} />
        <YourPlans isMobile={isMobile} />
        <SpendingPower isMobile={isMobile} />
        <Activity isMobile={isMobile} />
      </main>
      {isMobile && <MobileTabBar />}
    </div>
  );
};

window.BeniDashboard = Dashboard;
