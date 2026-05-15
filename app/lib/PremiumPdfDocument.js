import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Pas de Google Fonts (CORS sur serverless). On reste sur Helvetica par défaut, élégant en PDF.

const COLORS = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  accent: "#1e293b",
};

const scoreColor = (score) => {
  if (score < 26) return "#059669";
  if (score < 46) return "#2563eb";
  if (score < 66) return "#d97706";
  if (score < 86) return "#dc2626";
  return "#7f1d1d";
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: COLORS.body,
    lineHeight: 1.55,
  },
  badge: {
    fontSize: 8,
    letterSpacing: 2,
    color: COLORS.muted,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  h1: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 6,
  },
  date: { fontSize: 9, color: COLORS.muted, marginBottom: 32 },
  scoreBox: {
    backgroundColor: COLORS.ink,
    color: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 64,
    fontFamily: "Helvetica-Bold",
    color: "white",
  },
  scoreSlash: { fontSize: 14, color: "white", opacity: 0.7 },
  palier: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
    textAlign: "center",
  },
  verdict: {
    fontStyle: "italic",
    fontSize: 14,
    color: COLORS.ink,
    borderLeft: `3pt solid ${COLORS.ink}`,
    paddingLeft: 12,
    marginVertical: 16,
    lineHeight: 1.5,
  },
  h2: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 24,
    marginBottom: 12,
  },
  intro: {
    fontStyle: "italic",
    color: COLORS.muted,
    marginBottom: 14,
    fontSize: 10,
  },
  prose: { marginBottom: 10, lineHeight: 1.6 },
  card: {
    border: `1pt solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  taskTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: COLORS.ink, flex: 1 },
  taskHorizon: {
    fontSize: 8,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  progressBar: {
    height: 5,
    backgroundColor: COLORS.bg,
    borderRadius: 3,
    marginVertical: 6,
  },
  progressFill: { height: 5, borderRadius: 3 },
  taskExpl: { fontSize: 10, color: COLORS.body, lineHeight: 1.5 },
  protectedCard: {
    borderLeft: `3pt solid #10b981`,
    padding: 10,
    marginBottom: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 4,
  },
  protectedTitle: { fontFamily: "Helvetica-Bold", color: "#047857", fontSize: 11, marginBottom: 4 },
  actionCard: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottom: `1pt solid ${COLORS.border}`,
  },
  actionNum: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#cbd5e1",
    width: 40,
  },
  actionBody: { flex: 1 },
  actionTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, color: COLORS.ink, marginBottom: 6 },
  actionDesc: { fontSize: 10, lineHeight: 1.6, marginBottom: 8 },
  actionMeta: { fontSize: 9, color: COLORS.muted, marginTop: 4 },
  pivotCard: {
    borderTop: `3pt solid ${COLORS.ink}`,
    padding: 14,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 4,
  },
  pivotDiff: { fontSize: 8, letterSpacing: 1, color: COLORS.muted, marginBottom: 4 },
  pivotTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, color: COLORS.ink, marginBottom: 6 },
  pivotDesc: { fontSize: 10, lineHeight: 1.6, marginBottom: 8 },
  pivotSkills: { fontSize: 9, marginTop: 6 },
  roadmapPhase: {
    border: `1pt solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  roadmapHead: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  roadmapNum: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginRight: 12,
  },
  roadmapPhaseTitle: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  roadmapObj: { fontSize: 9, color: COLORS.muted },
  bullet: { fontSize: 10, marginBottom: 3 },
  finalBox: {
    backgroundColor: COLORS.ink,
    color: "white",
    padding: 32,
    borderRadius: 12,
    marginTop: 24,
    textAlign: "center",
  },
  mantra: {
    color: "white",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 1.5,
  },
  signature: {
    color: "#94a3b8",
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
    borderTop: `1pt solid ${COLORS.border}`,
    paddingTop: 8,
  },
});

export default function PremiumPdfDocument({ purchase }) {
  const r = purchase.rapport_premium;
  const dateStr = new Date(purchase.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Rapport premium · ${r.metier_reformule}`} author="sauvetonjob.fr">
      {/* Page 1 — Cover + Diagnostic */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.badge}>RAPPORT PREMIUM</Text>
        <Text style={styles.h1}>{r.metier_reformule}</Text>
        <Text style={styles.date}>Généré le {dateStr}</Text>

        <View style={[styles.scoreBox, { backgroundColor: scoreColor(r.score_menace) }]}>
          <Text style={styles.scoreNumber}>
            {r.score_menace}
            <Text style={styles.scoreSlash}> / 100</Text>
          </Text>
        </View>
        <Text style={styles.palier}>{r.palier.toUpperCase()}</Text>
        <Text style={styles.verdict}>« {r.verdict_synthetique} »</Text>

        <Text style={styles.h2}>Diagnostic approfondi</Text>
        {r.diagnostic_approfondi.split("\n").filter(Boolean).map((p, i) => (
          <Text key={i} style={styles.prose}>{p}</Text>
        ))}

        <Text style={styles.footer}>sauvetonjob.fr · Rapport confidentiel généré pour {r.metier_reformule}</Text>
      </Page>

      {/* Page 2 — Tâches exposées + protégées */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tâches exposées à l'IA</Text>
        {r.taches_exposees.map((t, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{t.tache}</Text>
              <Text style={styles.taskHorizon}>{t.horizon}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${t.niveau_automatisation}%`, backgroundColor: scoreColor(t.niveau_automatisation) }]} />
            </View>
            <Text style={styles.taskExpl}>{t.explication}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Tâches protégées — votre socle</Text>
        <Text style={styles.intro}>Ce que l'IA ne peut pas remplacer dans votre métier.</Text>
        {r.taches_protegees.map((t, i) => (
          <View key={i} style={styles.protectedCard}>
            <Text style={styles.protectedTitle}>✓ {t.tache}</Text>
            <Text style={styles.taskExpl}>{t.raison}</Text>
          </View>
        ))}

        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>

      {/* Page 3 — 5 actions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>5 actions immédiates</Text>
        <Text style={styles.intro}>Concrètes, à mettre en œuvre dans les 30 prochains jours.</Text>
        {r.actions_immediates.map((a, i) => (
          <View key={i} style={styles.actionCard} wrap={false}>
            <Text style={styles.actionNum}>{String(i + 1).padStart(2, "0")}</Text>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>{a.titre}</Text>
              <Text style={styles.actionDesc}>{a.description}</Text>
              <Text style={styles.actionMeta}><Text style={{ fontFamily: "Helvetica-Bold" }}>Outils : </Text>{a.outils_recommandes.join(", ")}</Text>
              <Text style={styles.actionMeta}><Text style={{ fontFamily: "Helvetica-Bold" }}>Temps : </Text>{a.temps_investissement}</Text>
              <Text style={styles.actionMeta}><Text style={{ fontFamily: "Helvetica-Bold" }}>Impact : </Text>{a.impact_attendu}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>

      {/* Page 4 — Pivots */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>3 pivots stratégiques</Text>
        <Text style={styles.intro}>Du plus accessible au plus ambitieux.</Text>
        {r.pivots_strategiques.map((p, i) => (
          <View key={i} style={styles.pivotCard} wrap={false}>
            <Text style={styles.pivotDiff}>DIFFICULTÉ : {p.difficulte.toUpperCase()}</Text>
            <Text style={styles.pivotTitle}>{p.titre}</Text>
            <Text style={styles.pivotDesc}>{p.description}</Text>
            <Text style={styles.pivotSkills}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>À développer : </Text>
              {p.competences_a_developper.join(" · ")}
            </Text>
            <Text style={styles.pivotSkills}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Potentiel revenus : </Text>
              {p.potentiel_revenus}
            </Text>
          </View>
        ))}
        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>

      {/* Page 5 — Roadmap */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Roadmap 90 jours</Text>
        {[
          { key: "jours_1_30", label: "Jours 1 → 30", num: "1" },
          { key: "jours_31_60", label: "Jours 31 → 60", num: "2" },
          { key: "jours_61_90", label: "Jours 61 → 90", num: "3" },
        ].map((phase) => (
          <View key={phase.key} style={styles.roadmapPhase} wrap={false}>
            <View style={styles.roadmapHead}>
              <Text style={styles.roadmapNum}>{phase.num}</Text>
              <View>
                <Text style={styles.roadmapPhaseTitle}>{phase.label}</Text>
                <Text style={styles.roadmapObj}>{r.roadmap_90_jours[phase.key].objectif}</Text>
              </View>
            </View>
            {r.roadmap_90_jours[phase.key].actions.map((a, j) => (
              <Text key={j} style={styles.bullet}>• {a}</Text>
            ))}
          </View>
        ))}
        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>

      {/* Page 6 — Compétences + métiers émergents + final */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Compétences à acquérir</Text>
        {r.competences_a_acquerir.map((c, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <Text style={styles.taskTitle}>{c.competence}</Text>
            <Text style={[styles.taskExpl, { marginTop: 4 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Pourquoi : </Text>{c.pourquoi}
            </Text>
            <Text style={styles.taskExpl}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Comment : </Text>{c.comment}
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>Métiers émergents accessibles</Text>
        {r.metiers_emergents.map((m, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <Text style={styles.taskTitle}>→ {m.metier}</Text>
            <Text style={[styles.taskExpl, { marginTop: 4 }]}>{m.description}</Text>
            <Text style={[styles.actionMeta, { marginTop: 6 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Transition : </Text>{m.transition_depuis_actuel}
            </Text>
          </View>
        ))}

        <View style={styles.finalBox}>
          <Text style={styles.mantra}>« {r.mantra_final} »</Text>
          <Text style={styles.signature}>SAUVETONJOB.FR</Text>
        </View>

        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>
    </Document>
  );
}
