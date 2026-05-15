"use client";

import RadarChart from "./RadarChart";

import { useState } from "react";

export default function PremiumReportView({ purchase }) {
  const r = purchase.rapport_premium;
  const [downloading, setDownloading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null); // 'sending' | 'success' | 'error'

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      window.location.href = `/api/premium-pdf/${purchase.id}`;
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("error");
      return;
    }
    setEmailStatus("sending");
    try {
      const res = await fetch(`/api/premium-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase_id: purchase.id, email }),
      });
      if (!res.ok) throw new Error();
      setEmailStatus("success");
    } catch {
      setEmailStatus("error");
    }
  };

  const scoreGradient = (score) => {
    if (score < 26) return "linear-gradient(135deg, #10b981, #059669)";
    if (score < 46) return "linear-gradient(135deg, #3b82f6, #2563eb)";
    if (score < 66) return "linear-gradient(135deg, #f59e0b, #d97706)";
    if (score < 86) return "linear-gradient(135deg, #ef4444, #dc2626)";
    return "linear-gradient(135deg, #991b1b, #7f1d1d)";
  };

  return (
    <main className="premium-page">
      <header className="premium-header">
        <div className="premium-header-inner">
          <span className="premium-badge">RAPPORT PREMIUM</span>
          <h1 className="premium-metier">{r.metier_reformule}</h1>
          <p className="premium-date">
            Généré le {new Date(purchase.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="premium-actions">
            <button onClick={handleDownloadPdf} className="btn-primary" disabled={downloading}>
              {downloading ? "Préparation…" : "📄 Télécharger en PDF"}
            </button>
            <button onClick={() => setEmailModalOpen(true)} className="btn-secondary">
              📧 Recevoir par email
            </button>
          </div>
        </div>
      </header>

      <section className="premium-section">
        <div className="score-block" style={{ background: scoreGradient(r.score_menace) }}>
          <div className="score-number">{r.score_menace}</div>
          <div className="score-label">/ 100</div>
        </div>
        <div className="palier-tag">{r.palier}</div>
        <blockquote className="verdict">« {r.verdict_synthetique} »</blockquote>
      </section>

      <section className="premium-section">
        <h2>Diagnostic approfondi</h2>
        {r.diagnostic_approfondi.split("\n").filter(Boolean).map((p, i) => (
          <p key={i} className="prose">{p}</p>
        ))}
      </section>

      {r.radar_scores && (
        <section className="premium-section">
          <h2>Cartographie du risque IA</h2>
          <p className="section-intro">Six dimensions évaluées entre 0 et 100. Plus la valeur est haute, plus la pression IA est forte sur cet axe.</p>
          <RadarChart scores={r.radar_scores} />
        </section>
      )}

      <section className="premium-section">
        <h2>Tâches exposées à l'IA</h2>
        <div className="tasks-list">
          {r.taches_exposees.map((t, i) => (
            <div key={i} className="task-card">
              <div className="task-header">
                <h3>{t.tache}</h3>
                <span className="task-horizon">{t.horizon}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${t.niveau_automatisation}%` }} />
              </div>
              <p className="task-explanation">{t.explication}</p>
            </div>
          ))}
        </div>
      </section>

    

      <section className="premium-section">
        <h2>Tâches protégées — votre socle</h2>
        <p className="section-intro">Ce que l'IA ne peut pas remplacer (pour l'instant) dans votre métier.</p>
        <div className="protected-list">
          {r.taches_protegees.map((t, i) => (
            <div key={i} className="protected-card">
              <h3>✓ {t.tache}</h3>
              <p>{t.raison}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <h2>5 actions immédiates</h2>
        <p className="section-intro">Concrètes, à mettre en œuvre dans les 30 prochains jours.</p>
        {r.actions_immediates.map((a, i) => (
          <div key={i} className="action-card">
            <div className="action-number">{String(i + 1).padStart(2, "0")}</div>
            <div className="action-body">
              <h3>{a.titre}</h3>
              <p>{a.description}</p>
              <div className="action-meta">
                <div><strong>Outils :</strong> {a.outils_recommandes.join(", ")}</div>
                <div><strong>Temps :</strong> {a.temps_investissement}</div>
                <div><strong>Impact :</strong> {a.impact_attendu}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="premium-section">
        <h2>3 pivots stratégiques</h2>
        <p className="section-intro">Du plus accessible au plus ambitieux. Chacun rend votre rôle plus difficile à remplacer.</p>
        <div className="pivots-grid">
          {r.pivots_strategiques.map((p, i) => (
            <div key={i} className="pivot-card">
              <span className="pivot-difficulty">Difficulté : {p.difficulte}</span>
              <h3>{p.titre}</h3>
              <p>{p.description}</p>
              <div className="pivot-skills">
                <strong>À développer :</strong>
                <ul>{p.competences_a_developper.map((c, j) => <li key={j}>{c}</li>)}</ul>
              </div>
              <div className="pivot-revenue"><strong>Potentiel revenus :</strong> {p.potentiel_revenus}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <h2>Roadmap 90 jours</h2>
        <div className="roadmap">
          {[
            { key: "jours_1_30", label: "Jours 1 → 30" },
            { key: "jours_31_60", label: "Jours 31 → 60" },
            { key: "jours_61_90", label: "Jours 61 → 90" },
          ].map((phase, i) => (
            <div key={phase.key} className="roadmap-phase">
              <div className="roadmap-phase-header">
                <span className="roadmap-num">{i + 1}</span>
                <div>
                  <h3>{phase.label}</h3>
                  <p>{r.roadmap_90_jours[phase.key].objectif}</p>
                </div>
              </div>
              <ul>
                {r.roadmap_90_jours[phase.key].actions.map((a, j) => <li key={j}>{a}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <h2>Compétences à acquérir</h2>
        <div className="skills-list">
          {r.competences_a_acquerir.map((c, i) => (
            <div key={i} className="skill-card">
              <h3>{c.competence}</h3>
              <p><strong>Pourquoi :</strong> {c.pourquoi}</p>
              <p><strong>Comment :</strong> {c.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <h2>Métiers émergents accessibles</h2>
        <p className="section-intro">Des pistes connexes qui valorisent votre expérience actuelle.</p>
        <div className="emerging-list">
          {r.metiers_emergents.map((m, i) => (
            <div key={i} className="emerging-card">
              <h3>→ {m.metier}</h3>
              <p>{m.description}</p>
              <p className="emerging-transition"><strong>Transition :</strong> {m.transition_depuis_actuel}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-final">
        <blockquote>« {r.mantra_final} »</blockquote>
        <p className="signature">— sauvetonjob.fr</p>
      </section>

      {emailModalOpen && (
        <div className="modal-overlay" onClick={() => setEmailModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEmailModalOpen(false)}>×</button>
            <h3>Recevoir votre rapport par email</h3>
            <p>On vous envoie le PDF complet à cette adresse.</p>
            <input
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailStatus === "sending" || emailStatus === "success"}
            />
            {emailStatus === "error" && <p className="error-msg">Adresse invalide ou erreur d'envoi.</p>}
            {emailStatus === "success" ? (
              <p className="success-msg">✓ Email envoyé ! Vérifiez votre boîte (et les spams).</p>
            ) : (
              <button onClick={handleSendEmail} disabled={emailStatus === "sending"} className="btn-primary">
                {emailStatus === "sending" ? "Envoi…" : "Envoyer"}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
