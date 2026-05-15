import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const PROMPT_DIAGNOSTIC = `Tu rédiges la PARTIE DIAGNOSTIC d'un rapport premium (39€) sur l'impact de l'IA sur un métier.

Sois ACTIONNABLE, SPÉCIFIQUE, DENSE. Cite des outils concrets (Claude, ChatGPT, Gemini, n8n, Make, Notion AI, Cursor, etc.). Pas de remplissage.

Métier : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte ni backticks autour :

{
  "metier_reformule": "Reformulation claire du métier",
  "score_menace": <0-100>,
  "palier": "<'Métier résilient'|'Évolution nécessaire'|'Transformation profonde'|'Risque élevé'|'Menace existentielle'>",
  "verdict_synthetique": "Phrase forte qui résume (max 25 mots)",
  "diagnostic_approfondi": "2 paragraphes denses (séparés par \\n) sur POURQUOI ce métier est dans cette situation. Outils nommés. Chiffres si pertinent.",
  "radar_scores": {
    "automatisation_taches": <0-100>,
    "vitesse_changement": <0-100>,
    "outils_disponibles": <0-100>,
    "concurrence_ia": <0-100>,
    "barriere_humaine": <0-100>,
    "pression_marche": <0-100>
  },
  "taches_exposees": [
    { "tache": "Description précise", "niveau_automatisation": <0-100>, "explication": "2 phrases avec outils nommés", "horizon": "Déjà automatisable|1-2 ans|3-5 ans" }
  ],
  "taches_protegees": [
    { "tache": "Tâche résistante", "raison": "Pourquoi (1 phrase)" }
  ],
  "roadmap_90_jours": {
    "jours_1_30": { "objectif": "Phrase courte", "actions": ["Action 1", "Action 2", "Action 3", "Action 4"] },
    "jours_31_60": { "objectif": "Phrase courte", "actions": ["Action 1", "Action 2", "Action 3", "Action 4"] },
    "jours_61_90": { "objectif": "Phrase courte", "actions": ["Action 1", "Action 2", "Action 3", "Action 4"] }
  }
}

EXACTEMENT 5 taches_exposees triées par niveau_automatisation décroissant, EXACTEMENT 3 taches_protegees.

Cohérence score/palier : 0-25 résilient, 26-45 évolution, 46-65 transformation, 66-85 risque élevé, 86-100 existentiel.
AUCUN texte hors JSON. Français professionnel, ton direct.`;

const PROMPT_ACTION = `Tu rédiges la PARTIE PLAN D'ACTION d'un rapport premium (39€) sur l'impact de l'IA sur un métier.

ULTRA-CONCRET, DENSE. Outils nommés (Claude, ChatGPT, n8n, Make, Notion AI, Cursor, Midjourney, ElevenLabs, Perplexity, etc.). Pas de remplissage. Phrases courtes et percutantes.

Métier : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte ni backticks autour :

{
  "actions_immediates": [
    {
      "titre": "Titre court actionnable (max 8 mots)",
      "description": "2-3 phrases concrètes. Outils nommés. Étapes claires.",
      "outils_recommandes": ["Outil 1", "Outil 2", "Outil 3"],
      "temps_investissement": "Ex: '2h/sem pendant 1 mois'",
      "impact_attendu": "Ex: '-30% de temps sur les bilans'"
    }
  ],
  "pivots_strategiques": [
    {
      "titre": "Nom du pivot",
      "description": "2 phrases : positionnement, pourquoi défendable face à l'IA",
      "competences_a_developper": ["Compétence 1", "Compétence 2", "Compétence 3"],
      "potentiel_revenus": "Ex: '+30 à +50% sur 2 ans'",
      "difficulte": "Faible|Moyenne|Élevée"
    }
  ],
  "competences_a_acquerir": [
    { "competence": "Nom", "pourquoi": "1 phrase", "comment": "1 phrase avec ressources nommées" }
  ],
  "metiers_emergents": [
    { "metier": "Nom", "description": "1 phrase", "transition_depuis_actuel": "1 phrase" }
  ],
  "mantra_final": "Phrase forte motivante (max 20 mots)"
}

EXACTEMENT 5 actions_immediates, 3 pivots_strategiques, 4 competences_a_acquerir, 3 metiers_emergents.

AUCUN texte hors JSON. Français professionnel, ton direct. Outils réels.`;

function hashIp(ip) {
  return crypto
    .createHash("sha256")
    .update(ip + (process.env.IP_SALT || ""))
    .digest("hex")
    .slice(0, 32);
}

function cleanJsonResponse(raw) {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function callClaude(prompt, metier, label, maxTokens) {
  const t0 = Date.now();
  console.log(`[${label}] START`);

  let raw = "";
  let firstTokenTime = null;
  let deltaCount = 0;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt.replace("{METIER}", metier) }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
      if (firstTokenTime === null) firstTokenTime = Date.now() - t0;
      raw += event.delta.text;
      deltaCount++;
    }
  }

  console.log(`[${label}] DONE total=${Date.now() - t0}ms chars=${raw.length} firstToken=${firstTokenTime}ms`);
  return cleanJsonResponse(raw);
}

export async function POST(request) {
  const tGlobal = Date.now();
  console.log(`[GLOBAL] POST received`);

  try {
    const { metier } = await request.json();

    if (!metier || typeof metier !== "string" || metier.trim().length < 2) {
      return Response.json({ error: "Métier invalide" }, { status: 400 });
    }

    const metierClean = metier.trim().slice(0, 200);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = hashIp(ip);

    // 3000 tokens chacun, suffisant pour la nouvelle taille des prompts
    const [rawDiag, rawAction] = await Promise.all([
      callClaude(PROMPT_DIAGNOSTIC, metierClean, "DIAG", 3000),
      callClaude(PROMPT_ACTION, metierClean, "ACTION", 3000),
    ]);

    console.log(`[GLOBAL] Both done at ${Date.now() - tGlobal}ms`);

    let diagnostic, planAction;
    try {
      diagnostic = JSON.parse(rawDiag);
    } catch (e) {
      console.error("Diagnostic parse error:", e.message, "Raw end:", rawDiag.slice(-300));
      return Response.json({ error: "Erreur (diagnostic). Réessaie." }, { status: 500 });
    }
    try {
      planAction = JSON.parse(rawAction);
    } catch (e) {
      console.error("Action parse error:", e.message, "Raw end:", rawAction.slice(-300));
      return Response.json({ error: "Erreur (plan d'action). Réessaie." }, { status: 500 });
    }

    const rapport = { ...diagnostic, ...planAction };

    if (
      typeof rapport.score_menace !== "number" ||
      rapport.score_menace < 0 ||
      rapport.score_menace > 100 ||
      !Array.isArray(rapport.actions_immediates) ||
      rapport.actions_immediates.length < 3 ||
      !Array.isArray(rapport.pivots_strategiques) ||
      rapport.pivots_strategiques.length < 2 ||
      !rapport.roadmap_90_jours
    ) {
      console.error("Validation failed:", JSON.stringify(rapport).slice(0, 500));
      return Response.json({ error: "Rapport incomplet, réessaie." }, { status: 500 });
    }

    const { data: insertData, error: insertError } = await supabase
      .from("purchases")
      .insert({
        metier: metierClean,
        metier_reformule: rapport.metier_reformule,
        score_menace: rapport.score_menace,
        palier: rapport.palier,
        rapport_premium: rapport,
        status: "paid",
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return Response.json({ error: "Erreur de sauvegarde." }, { status: 500 });
    }

    console.log(`[GLOBAL] DONE total=${Date.now() - tGlobal}ms`);
    return Response.json({ purchase_id: insertData.id });
  } catch (error) {
    console.error(`[GLOBAL] Error at ${Date.now() - tGlobal}ms:`, error.message);
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
