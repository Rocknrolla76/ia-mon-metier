import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
  green: "#047857",
  greenBg: "#ecfdf5",
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
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.5,
  },
  // Header de page (badge + titre + date)
  badge: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: COLORS.muted,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  h1: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  date: { fontSize: 9, color: COLORS.muted, marginBottom: 20 },

  // Score box
  scoreBox: {
    color: "white",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    color: "white",
    lineHeight: 1,
  },
  scoreSlash: { fontSize: 12, color: "white", opacity: 0.7 },
  palier: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  verdict: {
    fontStyle: "italic",
    fontSize: 12,
    color: COLORS.ink,
    borderLeft: `3pt solid ${COLORS.ink}`,
    paddingLeft: 10,
    marginVertical: 12,
    lineHeight: 1.4,
  },

  // Sections
  h2: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 18,
    marginBottom: 8,
  },
  intro: {
    fontStyle: "italic",
    color: COLORS.muted,
    marginBottom: 10,
    fontSize: 9,
  },
  prose: { marginBottom: 6, lineHeight: 1.55, fontSize: 10 },

  // Cards génériques
  card: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
  },

  // Tâches exposées
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: COLORS.ink, flex: 1, paddingRight: 8 },
  taskHorizon: {
    fontSize: 7,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.bg,
    borderRadius: 2,
    marginVertical: 4,
  },
  progressFill: { height: 4, borderRadius: 2 },
  taskExpl: { fontSize: 9, color: COLORS.body, lineHeight: 1.45 },

  // Tâches protégées
  protectedCard: {
    borderLeft: `2pt solid #10b981`,
    paddingLeft: 8,
    paddingVertical: 6,
    paddingRight: 8,
    marginBottom: 5,
    backgroundColor: COLORS.greenBg,
    borderRadius: 2,
  },
  protectedTitle: { fontFamily: "Helvetica-Bold", color: COLORS.green, fontSize: 10, marginBottom: 2 },

  // Actions
  actionCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: `0.5pt solid ${COLORS.border}`,
  },
  actionNum: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#cbd5e1",
    width: 28,
  },
  actionBody: { flex: 1 },
  actionTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: COLORS.ink, marginBottom: 4 },
  actionDesc: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 4 },
  actionMeta: { fontSize: 8.5, color: COLORS.muted, marginTop: 2 },

  // Pivots
  pivotCard: {
    borderTop: `2pt solid ${COLORS.ink}`,
    padding: 10,
    marginBottom: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 3,
  },
  pivotDiff: { fontSize: 7, letterSpacing: 1, color: COLORS.muted, marginBottom: 3 },
  pivotTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: COLORS.ink, marginBottom: 4 },
  pivotDesc: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 5 },
  pivotMeta: { fontSize: 9, marginTop: 3 },

  // Roadmap
  roadmapPhase: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
  },
  roadmapHead: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  roadmapNum: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginRight: 10,
    width: 16,
  },
  roadmapPhaseTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  roadmapObj: { fontSize: 8.5, color: COLORS.muted },
  bullet: { fontSize: 9, marginBottom: 2, lineHeight: 1.45 },

  // Bloc final
  finalBox: {
    backgroundColor: COLORS.ink,
    color: "white",
    padding: 24,
    borderRadius: 10,
    marginTop: 18,
  },
  mantra: {
    color: "white",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 1.5,
  },
  signature: {
    color: "#94a3b8",
    fontSize: 7,
    letterSpacing: 2,
    marginTop: 12,
    textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 48,
    right: 48,
    fontSize: 7,
    color: COLORS.muted,
    textAlign: "center",
    borderTop: `0.5pt solid ${COLORS.border}`,
    paddingTop: 6,
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

      {/* ========== PAGE 1 : Cover + Diagnostic + Tâches exposées ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.badge}>RAPPORT PREMIUM</Text>
        <Text style={styles.h1}>{r.metier_reformule}</Text>
        <Text style={styles.date}>Généré le {dateStr}</Text>

        <View style={[styles.scoreBox, { backgroundColor: scoreColor(r.score_menace) }]} wrap={false}>
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

        <Text style={styles.h2}>Tâches exposées à l'IA</Text>
        {r.taches_exposees.map((t, i) => (
          <View key={i} style={styles.card} wrap={false}>
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

        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>

      {/* ========== PAGE 2 : Tâches protégées + 5 actions ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tâches protégées — votre socle</Text>
        <Text style={styles.intro}>Ce que l'IA ne peut pas remplacer dans votre métier.</Text>
        {r.taches_protegees.map((t, i) => (
          <View key={i} style={styles.protectedCard} wrap={false}>
            <Text style={styles.protectedTitle}>✓ {t.tache}</Text>
            <Text style={styles.taskExpl}>{t.raison}</Text>
          </View>
        ))}

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

      {/* ========== PAGE 3 : Pivots + Roadmap ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>3 pivots stratégiques</Text>
        <Text style={styles.intro}>Du plus accessible au plus ambitieux.</Text>
        {r.pivots_strategiques.map((p, i) => (
          <View key={i} style={styles.pivotCard} wrap={false}>
            <Text style={styles.pivotDiff}>DIFFICULTÉ : {p.difficulte.toUpperCase()}</Text>
            <Text style={styles.pivotTitle}>{p.titre}</Text>
            <Text style={styles.pivotDesc}>{p.description}</Text>
            <Text style={styles.pivotMeta}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>À développer : </Text>
              {p.competences_a_developper.join(" · ")}
            </Text>
            <Text style={styles.pivotMeta}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Potentiel revenus : </Text>
              {p.potentiel_revenus}
            </Text>
          </View>
        ))}

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

      {/* ========== PAGE 4 : Compétences + Métiers émergents + Mantra final ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Compétences à acquérir</Text>
        {r.competences_a_acquerir.map((c, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <Text style={styles.actionTitle}>{c.competence}</Text>
            <Text style={[styles.taskExpl, { marginTop: 3 }]}>
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
            <Text style={styles.actionTitle}>→ {m.metier}</Text>
            <Text style={[styles.taskExpl, { marginTop: 3 }]}>{m.description}</Text>
            <Text style={[styles.actionMeta, { marginTop: 4 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Transition : </Text>{m.transition_depuis_actuel}
            </Text>
          </View>
        ))}

        <View style={styles.finalBox} wrap={false}>
          <Text style={styles.mantra}>« {r.mantra_final} »</Text>
          <Text style={styles.signature}>SAUVETONJOB.FR</Text>
        </View>

        <Text style={styles.footer}>sauvetonjob.fr · {r.metier_reformule}</Text>
      </Page>
    </Document>
  );
}
