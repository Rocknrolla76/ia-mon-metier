"use client";

import { useState, useRef, useEffect } from "react";

const [generatingPremium, setGeneratingPremium] = useState(false);

const handleSimulatePurchase = async () => {
  if (!metier) return; // metier = state qui contient le métier saisi
  setGeneratingPremium(true);
  try {
    const res = await fetch("/api/premium-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metier }),
    });
    const data = await res.json();
    if (data.purchase_id) {
      window.location.href = `/rapport/${data.purchase_id}`;
    } else {
      alert("Erreur de génération. Réessaie.");
    }
  } catch {
    alert("Erreur réseau. Réessaie.");
  } finally {
    setGeneratingPremium(false);
  }
};


export default function Home() {
  const [metier, setMetier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!metier.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metier: metier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Hero
        metier={metier}
        setMetier={setMetier}
        loading={loading}
        onSubmit={handleSubmit}
        hasResult={!!result}
      />
      {error && <ErrorMessage message={error} />}
      {result && (
        <div ref={resultRef}>
          <Report data={result} />
        </div>
      )}
      <Footer />
    </main>
  );
}

function Hero({ metier, setMetier, loading, onSubmit, hasResult }) {
  return (
    <section className="hero-bg" style={{ paddingBottom: hasResult ? "80px" : "120px" }}>
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
              fontFamily: "var(--font-fraunces)",
            }}
          >
            IA
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            L'IA & Moi
          </span>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          padding: "60px 24px 0",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
        }}
      >
        <div className="fade-up">
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              background: "rgba(15, 23, 42, 0.04)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "32px",
            }}
          >
            Diagnostic gratuit en 30 secondes
          </span>
        </div>

        <h1
          className="fade-up-delay-1"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            color: "var(--text-primary)",
          }}
        >
          L'IA va-t-elle{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--hero-accent-from) 0%, var(--hero-accent-via) 50%, var(--hero-accent-to) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            remplacer
          </span>
          <br />
          votre métier ?
        </h1>

        <p
          className="fade-up-delay-2"
          style={{
            fontSize: "clamp(17px, 2vw, 20px)",
            color: "var(--text-secondary)",
            maxWidth: "580px",
            margin: "0 auto 48px",
            lineHeight: 1.5,
          }}
        >
          Saisissez votre métier, recevez un diagnostic lucide et un plan
          d'action concret pour reprendre la main.
        </p>

        <form
          onSubmit={onSubmit}
          className="fade-up-delay-2"
          style={{
            display: "flex",
            gap: "12px",
            maxWidth: "520px",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            value={metier}
            onChange={(e) => setMetier(e.target.value)}
            placeholder="Ex : comptable, graphiste, professeur…"
            disabled={loading}
            style={{
              flex: "1 1 280px",
              minWidth: "0",
              padding: "14px 20px",
              fontSize: "16px",
              background: "white",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              outline: "none",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--text-primary)";
              e.target.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-subtle)";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
            }}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={loading || !metier.trim()}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Spinner /> Analyse en cours…
              </>
            ) : (
              <>
                Analyser mon métier <ArrowRight />
              </>
            )}
          </button>
        </form>

        {!hasResult && (
          <p
            className="fade-up-delay-2"
            style={{
              marginTop: "32px",
              fontSize: "13px",
              color: "var(--text-tertiary)",
            }}
          >
            Aucune inscription. Aucune carte bancaire. Juste un diagnostic.
          </p>
        )}
      </div>
    </section>
  );
}

function ErrorMessage({ message }) {
  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "0 auto",
        padding: "16px 20px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        color: "#991b1b",
        fontSize: "14px",
      }}
    >
      {message}
    </div>
  );
}

function Report({ data }) {
  const palierColor = getPalierGradient(data.palier);

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "0 24px 120px",
      }}
    >
      <ScoreSection
        score={data.score_menace}
        palier={data.palier}
        verdict={data.verdict_synthetique}
        metier={data.metier_reformule}
        gradient={palierColor}
      />

      <TachesSection risque={data.taches_a_risque} />

      <HorizonSection horizon={data.horizon_temporel} />

      <PlanActionSection actions={data.plan_action_teaser} />

      <RepositionnementTeaser teaser={data.repositionnement_teaser} />

      <PremiumCTA metier={data.metier_reformule} />
    </div>
  );
}

function ScoreSection({ score, palier, verdict, metier, gradient }) {
  return (
    <section
      style={{ padding: "80px 0 60px", textAlign: "center" }}
      className="fade-up"
    >
      <p
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "16px",
        }}
      >
        Diagnostic — {metier}
      </p>

      <div
        style={{
          fontSize: "clamp(140px, 22vw, 240px)",
          fontWeight: 300,
          lineHeight: 0.9,
          fontFamily: "var(--font-fraunces)",
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.04em",
          margin: "16px 0",
        }}
      >
        {score}
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-tertiary)",
          marginBottom: "32px",
        }}
      >
        sur 100 — score de menace IA
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "8px 20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "32px",
        }}
      >
        {palier}
      </div>

      <p
        className="verdict"
        style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          color: "var(--text-primary)",
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        « {verdict} »
      </p>
    </section>
  );
}

function TachesSection({ risque }) {
  return (
    <section style={{ padding: "60px 0" }} className="fade-up">
      <SectionTitle number="01" title="Tâches les plus exposées" />

      <div className="card">
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#dc2626",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "20px",
          }}
        >
          ⚠ Niveau d'automatisation
        </h3>
        {risque.map((t, i) => (
          <div
            key={i}
            style={{
              padding: i === 0 ? "0 0 18px" : "18px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "16px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {t.tache}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#dc2626",
                  whiteSpace: "nowrap",
                }}
              >
                {t.niveau_automatisation}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${t.niveau_automatisation}%`,
                  background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "16px 20px",
          background: "var(--bg-elevated)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Le rapport complet identifie aussi <strong>les tâches protégées</strong> où
          vous gardez un avantage durable, et celles à <strong>valoriser dès maintenant</strong>.
        </p>
      </div>
    </section>
  );
}

function HorizonSection({ horizon }) {
  const periods = [
    { label: "Déjà là", key: "deja_la", color: "#dc2626" },
    { label: "1 à 2 ans", key: "un_a_deux_ans", color: "#f59e0b" },
    { label: "3 à 5 ans", key: "trois_a_cinq_ans", color: "#3b82f6" },
  ];

  return (
    <section style={{ padding: "60px 0" }} className="fade-up">
      <SectionTitle number="02" title="Horizon temporel" />

      <div className="card">
        {periods.map((p, i) => (
          <div
            key={p.key}
            style={{
              padding: i === 0 ? "0 0 20px" : "20px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: p.color,
                  marginBottom: "8px",
                }}
              />
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {p.label}
              </p>
            </div>
            <p
              style={{
                fontSize: "16px",
                color: "var(--text-primary)",
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              {horizon[p.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanActionSection({ actions }) {
  return (
    <section style={{ padding: "60px 0" }} className="fade-up">
      <SectionTitle number="03" title="Première action à enclencher" />

      {actions.map((a) => (
        <div
          key={a.numero}
          className="card"
          style={{ marginBottom: "16px", position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 300,
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-fraunces)",
                lineHeight: 1,
              }}
            >
              {String(a.numero).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {a.titre}
                </h3>
                <PriorityBadge priority={a.priorite} />
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
            }}
          >
            {a.description}
          </p>
        </div>
      ))}

      <div
        style={{
          marginTop: "24px",
          padding: "20px 24px",
          background: "var(--bg-elevated)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          + 4 autres actions détaillées avec <strong>outils précis</strong> et{" "}
          <strong>prompts prêts à l'emploi</strong>
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
          }}
        >
          dans le rapport complet ↓
        </p>
      </div>
    </section>
  );
}

function RepositionnementTeaser({ teaser }) {
  return (
    <section style={{ padding: "60px 0" }} className="fade-up">
      <SectionTitle number="04" title="Repositionnement stratégique 2-3 ans" />

      <div className="card locked-section" style={{ minHeight: "280px" }}>
        <div className="locked-content">
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            {teaser}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-tertiary)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            Pivot 1 — Spécialisation verticale dans les domaines où l'expertise
            humaine reste irremplaçable, en s'appuyant sur les outils d'IA comme
            multiplicateurs de productivité...
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-tertiary)",
              lineHeight: 1.6,
              fontStyle: "italic",
              marginTop: "12px",
            }}
          >
            Pivot 2 — Évolution vers un rôle de superviseur des outils IA dans
            votre domaine, avec un positionnement de garant de la qualité et de
            l'éthique...
          </p>
        </div>
        <div className="locked-overlay">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🔒
            </div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              Stratégie complète dans le rapport premium
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                maxWidth: "400px",
              }}
            >
              3 pivots de repositionnement détaillés, adaptés à votre métier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumCTA({ metier }) {
  return (
    <section style={{ padding: "60px 0 0" }} className="fade-up">
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "20px",
          padding: "48px 40px",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "16px",
            position: "relative",
          }}
        >
          Rapport complet — {metier}
        </p>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: "20px",
            position: "relative",
          }}
        >
          Le plan d'action complet pour
          <br />
          reprendre la main sur votre métier.
        </h2>

        <p
          style={{
            fontSize: "16px",
            color: "#cbd5e1",
            maxWidth: "520px",
            margin: "0 auto 32px",
            lineHeight: 1.6,
            position: "relative",
          }}
        >
          5 actions concrètes avec outils nommés, 3 pivots stratégiques
          détaillés, tâches protégées identifiées, roadmap 90 jours.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "28px",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              fontFamily: "var(--font-fraunces)",
              letterSpacing: "-0.02em",
            }}
          >
            39€
          </span>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
            paiement unique
          </span>
        </div>

        <button
          className="btn-primary"
          style={{
            background: "white",
            color: "#0f172a",
            position: "relative",
            fontSize: "16px",
            padding: "16px 32px",
          }}
          onClick={handleSimulatePurchase}
          disabled={generatingPremium}
        >
            {generatingPremium ? "Génération du rapport…" : "Recevoir le rapport complet · 39€"}
        </button>

        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "#64748b",
            position: "relative",
          }}
        >
          PDF téléchargeable • Reçu par email en 2 min
        </p>
      </div>
    </section>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-tertiary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {number}
        </span>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const config = {
    haute: { bg: "#fef2f2", color: "#991b1b", label: "Priorité haute" },
    moyenne: { bg: "#fef9c3", color: "#854d0e", label: "Priorité moyenne" },
    basse: { bg: "#f0fdf4", color: "#166534", label: "Priorité basse" },
  };
  const c = config[priority] || config.moyenne;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 10px",
        background: c.bg,
        color: c.color,
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {c.label}
    </span>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "14px",
        height: "14px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    />
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "32px 24px",
        textAlign: "center",
        background: "var(--bg-card)",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-tertiary)",
        }}
      >
        L'IA & Moi — Diagnostic métier face à l'IA · 2026
      </p>
    </footer>
  );
}

function getPalierGradient(palier) {
  const map = {
    "Métier résilient":
      "linear-gradient(135deg, var(--score-resilient-from) 0%, var(--score-resilient-to) 100%)",
    "Évolution nécessaire":
      "linear-gradient(135deg, var(--score-evolution-from) 0%, var(--score-evolution-to) 100%)",
    "Transformation profonde":
      "linear-gradient(135deg, var(--score-transformation-from) 0%, var(--score-transformation-to) 100%)",
    "Risque élevé":
      "linear-gradient(135deg, var(--score-risque-from) 0%, var(--score-risque-to) 100%)",
    "Menace existentielle":
      "linear-gradient(135deg, var(--score-existentielle-from) 0%, var(--score-existentielle-to) 100%)",
  };
  return (
    map[palier] ||
    "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)"
  );
}
