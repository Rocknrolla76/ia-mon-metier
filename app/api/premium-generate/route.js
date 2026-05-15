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

const PREMIUM_PROMPT = `Tu es un consultant senior spécialisé dans l'impact de l'IA sur les métiers. Tu rédiges un rapport stratégique premium pour un professionnel qui veut comprendre précisément comment l'IA va transformer son métier et comment se repositionner pour rester indispensable.

Le rapport doit être ACTIONNABLE, SPÉCIFIQUE, et SANS LANGUE DE BOIS. Tu peux et tu DOIS nommer les outils concrets (Claude, ChatGPT, Gemini, Midjourney, n8n, Make, Notion AI, Cursor, etc.).

IMPORTANT : Sois DENSE et CONCIS. Pas de remplissage, pas de répétitions. Chaque phrase doit apporter de la valeur. Le lecteur paie 39€, il veut du concentré, pas de la dilution.

Métier à analyser : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown, avec cette structure exacte :

{
  "metier_reformule": "Reformulation claire et précise du métier",
  "score_menace": <entier 0-100>,
  "palier": "<'Métier résilient' | 'Évolution nécessaire' | 'Transformation profonde' | 'Risque élevé' | 'Menace existentielle'>",
  "verdict_synthetique": "Une phrase forte qui résume la situation (max 25 mots)",
  "diagnostic_approfondi": "3 paragraphes denses expliquant POURQUOI ce métier est dans cette situation. Cite des outils, des chiffres. Prose éditoriale.",
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
    // EXACTEMENT 5 tâches, triées par niveau_automatisation décroissant
  ],
  "taches_protegees": [
    {
      "tache": "Tâche qui résiste à l'IA",
      "raison": "Pourquoi elle résiste (1 phrase)"
    }
    // EXACTEMENT 3 tâches
  ],
  "actions_immediates": [
    {
      "titre": "Titre court actionnable (max 8 mots)",
      "description": "3-4 phrases concrètes avec outils nommés, étapes claires, résultat attendu.",
      "outils_recommandes": ["Outil 1", "Outil 2", "Outil 3"],
      "temps_investissement": "Ex: '2h/semaine pendant 1 mois'",
      "impact_attendu": "Ex: 'Gain de 30% sur le temps de production'"
    }
    // EXACTEMENT 5 actions
  ],
  "pivots_strategiques": [
    {
      "titre": "Nom du pivot",
      "description": "2-3 phrases : positionnement, cible, pourquoi défendable face à l'IA",
      "competences_a_developper": ["Compétence 1", "Compétence 2", "Compétence 3"],
      "potentiel_revenus": "Ex: '+30 à +50% sur 2 ans'",
      "difficulte": "Faible | Moyenne | Élevée"
    }
    // EXACTEMENT 3 pivots
  ],
  "roadmap_90_jours": {
    "jours_1_30": {
      "objectif": "Phrase courte sur l'objectif",
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
      "comment": "1 phrase : ressources concrètes (formations, plateformes nommées)"
    }
    // EXACTEMENT 4 compétences
  ],
  "metiers_emergents": [
    {
      "metier": "Nom du métier émergent",
      "description": "1 phrase sur ce qu'il fait",
      "transition_depuis_actuel": "1 phrase sur comment y passer"
    }
    // EXACTEMENT 3 métiers
  ],
  "mantra_final": "Phrase forte motivante (max 20 mots)"
}

CONTRAINTES :
- score_menace cohérent avec palier (0-25 résilient, 26-45 évolution, 46-65 transformation, 66-85 risque élevé, 86-100 existentiel)
- AUCUN texte hors JSON
- Français professionnel, ton direct
- Outils réels et actuels`;

function hashIp(ip) {
  return crypto.createHash("sha256").update(ip + (process.env.IP_SALT || "")).digest("hex").slice(0, 32);
}

export async function POST(request) {
  try {
    const { metier } = await request.json();

    if (!metier || typeof metier !== "string" || metier.trim().length < 2) {
      return Response.json({ error: "Métier invalide" }, { status: 400 });
    }

    const metierClean = metier.trim().slice(0, 200);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = hashIp(ip);

    // Appel Claude Sonnet 4.6 EN STREAMING (évite timeout sur la connexion)
    let raw = "";
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [
        {
          role: "user",
          content: PREMIUM_PROMPT.replace("{METIER}", metierClean),
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
        raw += event.delta.text;
      }
    }

    raw = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let rapport;
    try {
      rapport = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e.message, "Raw start:", raw.slice(0, 300), "Raw end:", raw.slice(-300));
      return Response.json({ error: "Erreur de génération du rapport. Réessaie." }, { status: 500 });
    }

    // Validation
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

    // Sauvegarde Supabase
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

    return Response.json({ purchase_id: insertData.id });
  } catch (error) {
    console.error("Premium generate error:", error);
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
