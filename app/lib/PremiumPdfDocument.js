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
    paddingTop: 44,
    paddingBottom: 52,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.55,
  },

  // En-tête de page (présent sur chaque page sauf la 1ère, en haut)
  pageHeader: {
    borderBottom: `0.5pt solid ${COLORS.border}`,
    paddingBottom: 10,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageHeaderBadge: {
    fontSize: 7,
    letterSpacing: 1.5,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
  },
  pageHeaderMetier: {
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
  },

  // PAGE 1 - Cover
  coverBadge: {
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.muted,
    marginBottom: 12,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 6,
    lineHeight: 1.2,
  },
  coverDate: { fontSize: 9, color: COLORS.muted, marginBottom: 26 },
  scoreBox: {
    color: "white",
    paddingVertical: 26,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 60,
    fontFamily: "Helvetica-Bold",
    color: "white",
    lineHeight: 1,
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
    lineHeight: 1.45,
  },

  // Titres de section
  h2: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 4,
  },
  sectionNumber: {
    fontSize: 8,
    letterSpacing: 2,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  intro: {
    fontStyle: "italic",
    color: COLORS.muted,
    marginBottom: 14,
    fontSize: 10,
    lineHeight: 1.55,
  },
  prose: { marginBottom: 8, lineHeight: 1.6, fontSize: 10.5 },

  // Cards génériques
  card: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 5,
    padding: 11,
    marginBottom: 8,
  },

  // Tâches exposées
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  taskTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLORS.ink,
    flex: 1,
    paddingRight: 8,
  },
  taskHorizon: {
    fontSize: 7.5,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontFamily: "Helvetica-Bold",
  },
  progressBar: {
    height: 5,
    backgroundColor: COLORS.bg,
    borderRadius: 2.5,
    marginVertical: 6,
  },
  progressFill: { height: 5, borderRadius: 2.5 },
  taskExpl: { fontSize: 9.5, color: COLORS.body, lineHeight: 1.55 },

  // Tâches protégées
  protectedIntro: {
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.65,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottom: `0.5pt solid ${COLORS.border}`,
  },
  protectedCard: {
    borderLeft: `2.5pt solid #10b981`,
    paddingLeft: 12,
    paddingVertical: 10,
    paddingRight: 12,
    marginBottom: 10,
    backgroundColor: COLORS.greenBg,
    borderRadius: 3,
  },
  protectedTitle: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.green,
    fontSize: 11,
    marginBottom: 5,
  },
  protectedReason: { fontSize: 9.5, color: COLORS.body, lineHeight: 1.55, marginBottom: 6 },
  protectedAdvice: {
    fontSize: 9.5,
    color: "#065f46",
    lineHeight: 1.55,
    marginTop: 4,
    paddingTop: 6,
    borderTop: `0.5pt dashed #a7f3d0`,
  },
  protectedConclusion: {
    marginTop: 16,
    padding: 14,
    backgroundColor: COLORS.ink,
    borderRadius: 8,
    color: "white",
  },
  protectedConclusionText: {
    color: "white",
    fontStyle: "italic",
    fontSize: 10,
    lineHeight: 1.6,
  },

  // Actions
  actionCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: `0.5pt solid ${COLORS.border}`,
  },
  actionNum: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#cbd5e1",
    width: 30,
    lineHeight: 1,
  },
  actionBody: { flex: 1 },
  actionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11.5,
    color: COLORS.ink,
    marginBottom: 4,
  },
  actionDesc: { fontSize: 9.5, lineHeight: 1.55, marginBottom: 5 },
  actionMeta: { fontSize: 9, color: COLORS.muted, marginTop: 2, lineHeight: 1.45 },

  // Pivots
  pivotCard: {
    borderTop: `2.5pt solid ${COLORS.ink}`,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 4,
  },
  pivotDiff: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: COLORS.muted,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  pivotTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.ink,
    marginBottom: 5,
  },
  pivotDesc: { fontSize: 9.5, lineHeight: 1.55, marginBottom: 6 },
  pivotMeta: { fontSize: 9, marginTop: 3, lineHeight: 1.5 },

  // Roadmap
  roadmapPhase: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  roadmapHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: `0.5pt solid ${COLORS.border}`,
  },
  roadmapNum: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginRight: 14,
    width: 24,
  },
  roadmapPhaseTitle: { fontFamily: "Helvetica-Bold", fontSize: 11.5 },
  roadmapObj: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  bullet: { fontSize: 9.5, marginBottom: 4, lineHeight: 1.55 },

  // Compétences
  competenceCard: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 5,
    padding: 11,
    marginBottom: 10,
  },
  competenceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11.5,
    color: COLORS.ink,
    marginBottom: 5,
  },

  // Métiers émergents
  emergingCard: {
    border: `0.5pt solid ${COLORS.border}`,
    borderRadius: 5,
    padding: 12,
    marginBottom: 11,
    backgroundColor: COLORS.bg,
  },
  emergingTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.ink,
    marginBottom: 5,
  },
  emergingDesc: { fontSize: 9.5, color: COLORS.body, lineHeight: 1.55, marginBottom: 6 },
  emergingTransition: {
    fontSize: 9,
    color: COLORS.muted,
    fontStyle: "italic",
    paddingTop: 6,
    borderTop: `0.5pt dashed ${COLORS.border}`,
  },

  // Bloc final
  finalBox: {
    backgroundColor: COLORS.ink,
    color: "white",
    padding: 28,
    borderRadius: 12,
    marginTop: 22,
  },
  mantra: {
    color: "white",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 1.5,
  },
  signature: {
    color: "#94a3b8",
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 14,
    textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 52,
    right: 52,
    fontSize: 7.5,
    color: COLORS.muted,
    textAlign: "center",
    borderTop: `0.5pt solid ${COLORS.border}`,
    paddingTop: 6,
  },
  footerPageNum: {
    position: "absolute",
    bottom: 20,
    right: 52,
    fontSize: 7.5,
    color: COLORS.muted,
  },
});

// Composant en-tête répété
const PageHeader = ({ section, metier }) => (
  <View style={styles.pageHeader}>
    <Text style={styles.pageHeaderBadge}>RAPPORT PREMIUM · {section}</Text>
    <Text style={styles.pageHeaderMetier}>{metier}</Text>
  </View>
);

// Composant footer répété
const PageFooter = ({ metier, pageNumber, totalPages }) => (
  <>
    <Text style={styles.footer}>sauvetonjob.fr · {metier}</Text>
    <Text style={styles.footerPageNum}>{pageNumber} / {totalPages}</Text>
  </>
);

export default function PremiumPdfDocument({ purchase }) {
  const r = purchase.rapport_premium;
  const dateStr = new Date(purchase.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const totalPages = 8;

  return (
    <Document title={`Rapport premium · ${r.metier_reformule}`} author="sauvetonjob.fr">

      {/* ========== PAGE 1 : Cover + Diagnostic ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.coverBadge}>RAPPORT PREMIUM</Text>
        <Text style={styles.coverTitle}>{r.metier_reformule}</Text>
        <Text style={styles.coverDate}>Généré le {dateStr}</Text>

        <View style={[styles.scoreBox, { backgroundColor: scoreColor(r.score_menace) }]} wrap={false}>
          <Text style={styles.scoreNumber}>
            {r.score_menace}
            <Text style={styles.scoreSlash}> / 100</Text>
          </Text>
        </View>
        <Text style={styles.palier}>{r.palier.toUpperCase()}</Text>
        <Text style={styles.verdict}>« {r.verdict_synthetique} »</Text>

        <Text style={styles.sectionNumber}>01 · DIAGNOSTIC</Text>
        <Text style={styles.h2}>Pourquoi ce métier est dans cette situation</Text>
        <View style={{ marginTop: 10 }}>
          {r.diagnostic_approfondi.split("\n").filter(Boolean).map((p, i) => (
            <Text key={i} style={styles.prose}>{p}</Text>
          ))}
        </View>

        <PageFooter metier={r.metier_reformule} pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 2 : Tâches exposées ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="TÂCHES EXPOSÉES" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>02 · CARTOGRAPHIE DES RISQUES</Text>
        <Text style={styles.h2}>Tâches exposées à l'IA</Text>
        <Text style={styles.intro}>
          Voici les 5 tâches de votre métier les plus susceptibles d'être automatisées, classées par niveau d'exposition décroissant. Le pourcentage indique le degré auquel l'IA peut déjà ou pourra bientôt prendre en charge ces activités.
        </Text>

        {r.taches_exposees.map((t, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{t.tache}</Text>
              <Text style={styles.taskHorizon}>{t.horizon}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${t.niveau_automatisation}%`, backgroundColor: scoreColor(t.niveau_automatisation) },
                ]}
              />
            </View>
            <Text style={styles.taskExpl}>{t.explication}</Text>
          </View>
        ))}

        <PageFooter metier={r.metier_reformule} pageNumber={2} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 3 : Tâches protégées ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="TÂCHES PROTÉGÉES" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>03 · VOTRE SOCLE</Text>
        <Text style={styles.h2}>Tâches protégées — votre avantage durable</Text>

        {r.taches_protegees_intro && (
          <Text style={styles.protectedIntro}>{r.taches_protegees_intro}</Text>
        )}

        {r.taches_protegees.map((t, i) => (
          <View key={i} style={styles.protectedCard} wrap={false}>
            <Text style={styles.protectedTitle}>✓ {t.tache}</Text>
            <Text style={styles.protectedReason}>{t.raison}</Text>
            {t.conseil_valorisation && (
              <Text style={styles.protectedAdvice}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Comment la valoriser : </Text>
                {t.conseil_valorisation}
              </Text>
            )}
          </View>
        ))}

        {r.taches_protegees_conclusion && (
          <View style={styles.protectedConclusion} wrap={false}>
            <Text style={styles.protectedConclusionText}>
              « {r.taches_protegees_conclusion} »
            </Text>
          </View>
        )}

        <PageFooter metier={r.metier_reformule} pageNumber={3} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 4 : 5 actions immédiates ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="PLAN D'ACTION" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>04 · MISE EN ŒUVRE</Text>
        <Text style={styles.h2}>5 actions immédiates</Text>
        <Text style={styles.intro}>
          À mettre en œuvre dans les 30 prochains jours, dans l'ordre indiqué. Chaque action est calibrée pour produire un résultat tangible sans bouleverser votre activité.
        </Text>

        {r.actions_immediates.map((a, i) => (
          <View key={i} style={styles.actionCard} wrap={false}>
            <Text style={styles.actionNum}>{String(i + 1).padStart(2, "0")}</Text>
            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>{a.titre}</Text>
              <Text style={styles.actionDesc}>{a.description}</Text>
              <Text style={styles.actionMeta}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Outils : </Text>
                {a.outils_recommandes.join(", ")}
              </Text>
              <Text style={styles.actionMeta}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Temps : </Text>
                {a.temps_investissement}
                <Text style={{ fontFamily: "Helvetica-Bold" }}>   ·   Impact : </Text>
                {a.impact_attendu}
              </Text>
            </View>
          </View>
        ))}

        <PageFooter metier={r.metier_reformule} pageNumber={4} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 5 : 3 pivots stratégiques ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="PIVOTS STRATÉGIQUES" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>05 · TRANSFORMATION</Text>
        <Text style={styles.h2}>3 pivots stratégiques</Text>
        <Text style={styles.intro}>
          Trois orientations possibles pour faire évoluer votre rôle vers des positions difficilement remplaçables par l'IA. Classés du plus accessible au plus ambitieux.
        </Text>

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

        <PageFooter metier={r.metier_reformule} pageNumber={5} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 6 : Roadmap 90 jours ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="ROADMAP" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>06 · EXÉCUTION</Text>
        <Text style={styles.h2}>Roadmap 90 jours</Text>
        <Text style={styles.intro}>
          Un parcours progressif en 3 phases pour transformer durablement votre pratique. Chaque mois construit sur le précédent ; ne sautez aucune étape.
        </Text>

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

        <PageFooter metier={r.metier_reformule} pageNumber={6} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 7 : Compétences à acquérir ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="COMPÉTENCES" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>07 · MONTÉE EN COMPÉTENCE</Text>
        <Text style={styles.h2}>Compétences à acquérir</Text>
        <Text style={styles.intro}>
          Les 4 compétences clés à développer pour rester pertinent et augmenter votre valeur sur le marché. Chaque entrée précise pourquoi elle compte et comment l'acquérir concrètement.
        </Text>

        {r.competences_a_acquerir.map((c, i) => (
          <View key={i} style={styles.competenceCard} wrap={false}>
            <Text style={styles.competenceTitle}>{c.competence}</Text>
            <Text style={[styles.taskExpl, { marginTop: 4 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Pourquoi : </Text>
              {c.pourquoi}
            </Text>
            <Text style={[styles.taskExpl, { marginTop: 4 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Comment : </Text>
              {c.comment}
            </Text>
          </View>
        ))}

        <PageFooter metier={r.metier_reformule} pageNumber={7} totalPages={totalPages} />
      </Page>

      {/* ========== PAGE 8 : Métiers émergents + Mantra final ========== */}
      <Page size="A4" style={styles.page}>
        <PageHeader section="OUVERTURES" metier={r.metier_reformule} />

        <Text style={styles.sectionNumber}>08 · NOUVELLES VOIES</Text>
        <Text style={styles.h2}>Métiers émergents accessibles</Text>
        <Text style={styles.intro}>
          Trois pistes connexes qui valorisent votre expérience actuelle et offrent un meilleur positionnement face à la vague IA. À considérer si une reconversion partielle vous tente.
        </Text>

        {r.metiers_emergents.map((m, i) => (
          <View key={i} style={styles.emergingCard} wrap={false}>
            <Text style={styles.emergingTitle}>→ {m.metier}</Text>
            <Text style={styles.emergingDesc}>{m.description}</Text>
            <Text style={styles.emergingTransition}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Transition depuis votre métier actuel : </Text>
              {m.transition_depuis_actuel}
            </Text>
          </View>
        ))}

        <View style={styles.finalBox} wrap={false}>
          <Text style={styles.mantra}>« {r.mantra_final} »</Text>
          <Text style={styles.signature}>SAUVETONJOB.FR</Text>
        </View>

        <PageFooter metier={r.metier_reformule} pageNumber={8} totalPages={totalPages} />
      </Page>
    </Document>
  );
}
