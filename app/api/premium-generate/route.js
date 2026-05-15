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

const PROMPT_DIAGNOSTIC = `Tu es un consultant senior spécialisé dans l'impact de l'IA sur les métiers. Tu rédiges la PARTIE DIAGNOSTIC d'un rapport premium (39€).

Le rapport doit être ACTIONNABLE, SPÉCIFIQUE, SANS LANGUE DE BOIS. Tu DOIS nommer des outils concrets (Claude, ChatGPT, Gemini, Midjourney, n8n, Make, Notion AI, Cursor, etc.).

Sois DENSE et CONCIS. Chaque phrase doit apporter de la valeur.

Métier à analyser : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown :

{
  "metier_reformule": "Reformulation claire et précise du métier",
  "score_menace": <entier 0-100>,
  "palier": "<'Métier résilient' | 'Évolution nécessaire' | 'Transformation profonde' | 'Risque élevé' | 'Menace existentielle'>",
  "verdict_synthetique": "Une phrase forte qui résume la situation (max 25 mots)",
  "diagnostic_approfondi": "3 paragraphes denses (séparés par \\n) expliquant POURQUOI ce métier est dans cette situation. Cite des outils, des chiffres si pertinent. Prose éditoriale.",
  "radar_scores": {
    "automatisation_taches": <0-100>,
    "vitesse_changement": <0-100>,
    "outils_disponibles": <0-100>,
    "concurrence_ia": <0-100>,
    "barriere_humaine": <0-100>,
    "pression_marche": <0-100>
  },
  "taches_exposees": [
    {
      "tache": "Description précise",
      "niveau_automatisation": <0-100>,
      "explication": "2 phrases sur COMMENT l'IA la prend en charge, avec outils nommés",
      "horizon": "Déjà automatisable | 1-2 ans | 3-5 ans"
    }
  ],
  "taches_protegees": [
    {
      "tache": "Tâche qui résiste à l'IA",
      "raison": "Pourquoi elle résiste (1 phrase)"
    }
  ]
}

EXACTEMENT 5 taches_exposees triées par niveau_automatisation décroissant, EXACTEMENT 3 taches_protegees.

CONTRAINTES :
- score_menace cohérent avec palier (0-25 résilient, 26-45 évolution, 46-65 transformation, 66-85 risque élevé, 86-100 existentiel)
- AUCUN texte hors JSON
- Français professionnel, ton direct`;

const PROMPT_ACTION = `Tu es un consultant senior spécialisé dans l'impact de l'IA sur les métiers. Tu rédiges la PARTIE PLAN D'ACTION d'un rapport premium (39€).

Le plan doit être ULTRA-CONCRET, ACTIONNABLE, avec des outils nommés (Claude, ChatGPT, n8n, Make, Notion AI, Cursor, Midjourney, ElevenLabs, Perplexity, etc.) et des étapes claires.

Sois DENSE. Pas de remplissage. Chaque ligne doit avoir de la valeur.

Métier à analyser : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown :

{
  "actions_immediates": [
    {
      "titre": "Titre court actionnable (max 8 mots)",
      "description": "3-4 phrases concrètes avec outils nommés, étapes claires, résultat attendu.",
      "outils_recommandes": ["Outil 1", "Outil 2", "Outil 3"],
      "temps_investissement": "Ex: '2h/semaine pendant 1 mois'",
      "impact_attendu": "Ex: 'Gain de 30% sur le temps de production'"
    }
  ],
  "pivots_strategiques": [
    {
      "titre": "Nom du pivot",
      "description": "2-3 phrases : positionnement, cible, pourquoi défendable face à l'IA",
      "competences_a_developper": ["Compétence 1", "Compétence 2", "Compétence 3"],
      "potentiel_revenus": "Ex: '+30 à +50% sur 2 ans'",
      "difficulte": "Faible | Moyenne | Élevée"
    }
  ],
  "roadmap_90_jours": {
    "jours_1_30": {
      "objectif": "Phrase courte",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"]
    },
    "jours_31_60": {
      "objectif": "Phrase courte",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"]
    },
    "jours_61_90": {
      "objectif": "Phrase courte",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"]
    }
  },
  "competences_a_acquerir": [
    {
      "competence": "Nom",
      "pourquoi": "1 phrase",
      "comment": "1 phrase : ressources concrètes nommées"
    }
  ],
  "metiers_emergents": [
    {
      "metier": "Nom du métier",
      "description": "1 phrase",
      "transition_depuis_actuel": "1 phrase"
    }
  ],
  "mantra_final": "Phrase forte motivante (max 20 mots)"
}

EXACTEMENT 5 actions_immediates, 3 pivots_strategiques, 4 competences_a_acquerir, 3 metiers_emergents.

CONTRAINTES :
- AUCUN texte hors JSON
- Français professionnel, ton direct
- Outils réels et actuels`;

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

async function callClaude(prompt, metier, label) {
  const t0 = Date.now();
  console.log(`[${label}] START at ${new Date().toISOString()}`);

  let raw = "";
  let firstTokenTime = null;
  let deltaCount = 0;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 3500,
    messages: [
      {
        role: "user",
        content: prompt.replace("{METIER}", metier),
      },
    ],
  });

  console.log(`[${label}] stream created after ${Date.now() - t0}ms`);

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
      if (firstTokenTime === null) {
        firstTokenTime = Date.now() - t0;
        console.log(`[${label}] FIRST TOKEN at ${firstTokenTime}ms`);
      }
      raw += event.delta.text;
      deltaCount++;
    }
  }

  const totalTime = Date.now() - t0;
  console.log(`[${label}] DONE total=${totalTime}ms chars=${raw.length} deltas=${deltaCount}`);

  return cleanJsonResponse(raw);
}

export async function POST(request) {
  const tGlobal = Date.now();
  console.log(`[GLOBAL] POST received at ${new Date().toISOString()}`);

  try {
    const { metier } = await request.json();

    if (!metier || typeof metier !== "string" || metier.trim().length < 2) {
      return Response.json({ error: "Métier invalide" }, { status: 400 });
    }

    const metierClean = metier.trim().slice(0, 200);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = hashIp(ip);

    console.log(`[GLOBAL] Starting parallel calls for "${metierClean}" at ${Date.now() - tGlobal}ms`);

    // APPELS PARALLÈLES
    const [rawDiag, rawAction] = await Promise.all([
      callClaude(PROMPT_DIAGNOSTIC, metierClean, "DIAG"),
      callClaude(PROMPT_ACTION, metierClean, "ACTION"),
    ]);

    console.log(`[GLOBAL] Both calls done at ${Date.now() - tGlobal}ms`);

    let diagnostic, planAction;
    try {
      diagnostic = JSON.parse(rawDiag);
    } catch (e) {
      console.error("Diagnostic parse error:", e.message, "Raw:", rawDiag.slice(0, 400));
      return Response.json({ error: "Erreur (diagnostic). Réessaie." }, { status: 500 });
    }
    try {
      planAction = JSON.parse(rawAction);
    } catch (e) {
      console.error("Action parse error:", e.message, "Raw:", rawAction.slice(0, 400));
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
      rapport.pivots_strategiques.length < 2
    ) {
      console.error("Validation failed:", JSON.stringify(rapport).slice(0, 500));
      return Response.json({ error: "Rapport incomplet, réessaie." }, { status: 500 });
    }

    console.log(`[GLOBAL] Saving to Supabase at ${Date.now() - tGlobal}ms`);

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

    console.log(`[GLOBAL] DONE total=${Date.now() - tGlobal}ms purchase_id=${insertData.id}`);

    return Response.json({ purchase_id: insertData.id });
  } catch (error) {
    console.error(`[GLOBAL] Error at ${Date.now() - tGlobal}ms:`, error.message);
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
