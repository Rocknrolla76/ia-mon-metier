"use client";

import React, { useState } from "react";

export default function App() {
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!job.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: job.trim() }),
      });

      if (!response.ok) {
        throw new Error("Erreur de l'API");
      }

      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);
      setReport(parsed);
    } catch (err) {
      console.error(err);
      setError("Désolé, l'analyse a échoué. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReport(null);
    setJob("");
    setError(null);
  };

  const scoreColor = (s) => {
    if (s <= 3) return "#3d6b4a";
    if (s <= 6) return "#b8862c";
    return "#b8312c";
  };

  const scoreLabel = (s) => {
    if (s <= 3) return "Menace contenue";
    if (s <= 6) return "Transformation majeure";
    return "Menace critique";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f1ea",
        fontFamily: "'Geist', -apple-system, sans-serif",
        color: "#1a1a1a",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Geist:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .fade-in { animation: fadeUp 0.6s ease-out both; }
        .slide-in { animation: slideIn 0.5s ease-out both; }
        .grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
          opacity: 0.08; pointer-events: none; z-index: 1;
        }
        .bar-fill { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div className="grain"></div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: "920px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <header style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "16px", marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.02em" }}>
            L'IA & Moi
          </div>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#666" }}>
            Édition 2026 · N°1
          </div>
        </header>

        {!report && !loading && (
          <div className="fade-in">
            <div style={{ marginBottom: "56px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b8312c", marginBottom: "20px", fontWeight: 600 }}>
                Diagnostic personnalisé
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: "clamp(40px, 7vw, 72px)",
                lineHeight: "0.98",
                letterSpacing: "-0.03em",
                margin: "0 0 32px",
              }}>
                À quel point l'IA<br/>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>menace-t-elle</em><br/>
                votre métier ?
              </h1>
              <p style={{ fontSize: "18px", lineHeight: "1.6", maxWidth: "580px", color: "#3a3a3a", margin: "0" }}>
                Pendant que la majorité attend de voir, une minorité prend de l'avance.
                En 30 secondes, découvrez les tâches que l'IA est en train d'absorber dans votre profession —
                et le plan concret pour devenir celui qui l'utilise au lieu de la subir.
              </p>
            </div>

            <div style={{
              background: "#fff",
              border: "1px solid #1a1a1a",
              padding: "40px",
              boxShadow: "8px 8px 0 #1a1a1a",
            }}>
              <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px", fontWeight: 600 }}>
                Votre métier
              </label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="Ex : graphiste, avocat fiscaliste, chef de projet marketing…"
                style={{
                  width: "100%",
                  fontSize: "24px",
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  padding: "12px 0",
                  border: "none",
                  borderBottom: "2px solid #1a1a1a",
                  background: "transparent",
                  outline: "none",
                  marginBottom: "32px",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={analyze}
                disabled={loading || !job.trim()}
                style={{
                  background: loading || !job.trim() ? "#999" : "#1a1a1a",
                  color: "#f4f1ea",
                  border: "none",
                  padding: "18px 36px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: loading || !job.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "transform 0.2s",
                }}
              >
                {loading ? "Analyse en cours…" : "Lancer le diagnostic →"}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: "24px", padding: "16px", background: "#fbe9e7", border: "1px solid #b8312c", color: "#b8312c" }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px", paddingTop: "32px", borderTop: "1px solid #d4cfc4" }}>
              {[
                { n: "01", t: "Diagnostic spécifique", d: "Analyse adaptée à votre métier précis" },
                { n: "02", t: "Plan d'action concret", d: "Des outils nommés, pas de blabla" },
                { n: "03", t: "Stratégie de repositionnement", d: "Comment évoluer dans 2-3 ans" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "32px", fontWeight: 300, color: "#b8312c", marginBottom: "8px" }}>{item.n}</div>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{item.t}</div>
                  <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>{item.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="fade-in" style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="bar-fill" style={{ fontFamily: "'Fraunces', serif", fontSize: "32px", fontWeight: 400, fontStyle: "italic" }}>
              Analyse en cours…
            </div>
            <div style={{ marginTop: "16px", color: "#666", fontSize: "14px" }}>
              Décortique les tâches de "{job}" face à l'IA générative
            </div>
          </div>
        )}

        {report && (
          <div className="fade-in">
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#666", marginBottom: "8px" }}>
              Diagnostic IA · {report.metier_reformule}
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "32px", flexWrap: "wrap", marginBottom: "16px", paddingBottom: "32px", borderBottom: "1px solid #1a1a1a" }}>
              <div>
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "clamp(120px, 22vw, 200px)",
                  fontWeight: 500,
                  lineHeight: "0.85",
                  color: scoreColor(report.score_menace),
                  letterSpacing: "-0.05em",
                }}>
                  {report.score_menace}
                  <span style={{ fontSize: "0.3em", color: "#999", fontWeight: 300 }}>/10</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "240px", paddingBottom: "16px" }}>
                <div style={{
                  display: "inline-block",
                  background: scoreColor(report.score_menace),
                  color: "#fff",
                  padding: "4px 12px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}>
                  {scoreLabel(report.score_menace)}
                </div>
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "clamp(22px, 2.5vw, 28px)",
                  fontWeight: 500,
                  lineHeight: "1.3",
                  fontStyle: "italic",
                }}>
                  "{report.verdict_synthetique}"
                </div>
              </div>
            </div>

            <section style={{ marginTop: "64px" }}>
              <SectionTitle num="01" title="Ce que l'IA absorbe / ce qui vous reste" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "32px" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b8312c", marginBottom: "16px", fontWeight: 600 }}>
                    ⚠ Tâches en zone rouge
                  </div>
                  {report.taches_a_risque.map((t, i) => (
                    <div key={i} className="slide-in" style={{ marginBottom: "24px", animationDelay: `${i * 0.08}s` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <div style={{ fontWeight: 600, fontSize: "15px" }}>{t.tache}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", color: "#b8312c", fontWeight: 500 }}>{t.niveau_automatisation}%</div>
                      </div>
                      <div style={{ height: "3px", background: "#e5dfd2", marginBottom: "8px" }}>
                        <div style={{ height: "100%", background: "#b8312c", width: `${t.niveau_automatisation}%` }}></div>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>{t.explication}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#3d6b4a", marginBottom: "16px", fontWeight: 600 }}>
                    ✓ Votre forteresse
                  </div>
                  {report.taches_protegees.map((t, i) => (
                    <div key={i} className="slide-in" style={{ marginBottom: "20px", padding: "16px", background: "#fff", borderLeft: "3px solid #3d6b4a", animationDelay: `${i * 0.08}s` }}>
                      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>{t.tache}</div>
                      <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>{t.raison}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ marginTop: "80px" }}>
              <SectionTitle num="02" title="La ligne du temps" />
              <div style={{ marginTop: "32px", borderTop: "2px solid #1a1a1a" }}>
                {[
                  { label: "Déjà là", color: "#b8312c", content: report.horizon_temporel.deja_la },
                  { label: "1 — 2 ans", color: "#b8862c", content: report.horizon_temporel.court_terme },
                  { label: "3 — 5 ans", color: "#3d6b4a", content: report.horizon_temporel.moyen_terme },
                ].map((h, i) => (
                  <div key={i} className="slide-in" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", padding: "24px 0", borderBottom: "1px solid #d4cfc4", animationDelay: `${i * 0.1}s` }}>
                    <div>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: h.color, marginBottom: "8px" }}></div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 500 }}>{h.label}</div>
                    </div>
                    <div style={{ fontSize: "15px", lineHeight: "1.6" }}>{h.content}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: "80px" }}>
              <SectionTitle num="03" title="Votre plan d'action" />
              <div style={{ marginTop: "32px" }}>
                {report.plan_action.map((a, i) => (
                  <div key={i} className="slide-in" style={{
                    background: "#fff",
                    border: "1px solid #1a1a1a",
                    padding: "24px 28px",
                    marginBottom: "16px",
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    gap: "20px",
                    alignItems: "start",
                    animationDelay: `${i * 0.1}s`,
                  }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: "42px", fontWeight: 400, color: "#b8312c", lineHeight: "1" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "17px", marginBottom: "6px" }}>{a.titre}</div>
                      <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.6" }}>{a.description}</div>
                    </div>
                    <div style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      padding: "4px 10px",
                      background: a.priorite === "haute" ? "#b8312c" : a.priorite === "moyenne" ? "#b8862c" : "#666",
                      color: "#fff",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}>
                      {a.priorite}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: "80px", padding: "48px", background: "#1a1a1a", color: "#f4f1ea" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b8862c", marginBottom: "16px", fontWeight: 600 }}>
                Horizon 2-3 ans
              </div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400, fontStyle: "italic", lineHeight: "1.2", margin: "0 0 24px" }}>
                Vers où vous repositionner ?
              </h2>
              <p style={{ fontSize: "18px", lineHeight: "1.7", margin: 0 }}>
                {report.repositionnement}
              </p>
            </section>

            <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid #1a1a1a", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", color: "#666" }}>
                Mon métier est menacé à <strong style={{ color: scoreColor(report.score_menace) }}>{report.score_menace}/10</strong> — partagez le diagnostic.
              </div>
              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  color: "#1a1a1a",
                  border: "1px solid #1a1a1a",
                  padding: "14px 28px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Tester un autre métier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ num, title }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "20px", borderBottom: "1px solid #d4cfc4", paddingBottom: "12px" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "14px", color: "#b8312c", fontWeight: 600, letterSpacing: "0.1em" }}>
        {num}
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "clamp(26px, 3.5vw, 36px)",
        fontWeight: 500,
        margin: 0,
        letterSpacing: "-0.02em",
      }}>
        {title}
      </h2>
    </div>
  );
}
