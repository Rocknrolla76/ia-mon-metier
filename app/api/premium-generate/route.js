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

Le rapport doit être ACTIONNABLE, SPÉCIFIQUE, et SANS LANGUE DE BOIS. Tu peux et tu DOIS nommer les outils concrets (Claude, ChatGPT, Gemini, Midjourney, n8n, Make, Notion AI, Cursor, etc.), donner des chiffres réels, citer des exemples de personnes ou d'entreprises quand pertinent.

Métier à analyser : "{METIER}"

Renvoie UNIQUEMENT un JSON valide, sans texte avant ni après, sans backticks markdown, avec cette structure exacte :

{
  "metier_reformule": "Reformulation claire et précise du métier (ex: 'Comptable en cabinet d'expertise')",
  "score_menace": <entier entre 0 et 100>,
  "palier": "<l'un de : 'Métier résilient' | 'Évolution nécessaire' | 'Transformation profonde' | 'Risque élevé' | 'Menace existentielle'>",
  "verdict_synthetique": "Une phrase forte et marquante qui résume la situation (style citation magazine, max 25 mots)",
  "diagnostic_approfondi": "3 à 4 paragraphes de prose dense expliquant POURQUOI ce métier est dans cette situation. Cite des outils, des évolutions récentes, des chiffres. Pas de listes, prose éditoriale.",
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
      "tache": "Description précise de la tâche",
      "niveau_automatisation": <0-100>,
      "explication": "2-3 phrases sur COMMENT l'IA la prend en charge, avec outils nommés",
      "horizon": "Déjà automatisable | 1-2 ans | 3-5 ans"
    }
    // 5 à 7 tâches au total, triées par niveau_automatisation décroissant
  ],
  "taches_protegees": [
    {
      "tache": "Tâche qui résiste à l'IA",
      "raison": "Pourquoi elle résiste (jugement humain, relation, créativité contextuelle, responsabilité légale, etc.)"
    }
    // 3 à 5 tâches
  ],
  "actions_immediates": [
    {
      "titre": "Titre court et actionnable (max 8 mots)",
      "description": "Paragraphe de 4-6 phrases. Concret, avec outils nommés, étapes claires, résultat attendu.",
      "outils_recommandes": ["Outil 1", "Outil 2", "Outil 3"],
      "temps_investissement": "Ex: '2h/semaine pendant 1 mois'",
      "impact_attendu": "Ex: 'Gain de 30% sur le temps de production des bilans'"
    }
    // EXACTEMENT 5 actions, dans l'ordre logique de mise en œuvre
  ],
  "pivots_strategiques": [
    {
      "titre": "Nom du pivot (ex: 'Devenir conseiller stratégique augmenté')",
      "description": "3-4 phrases sur le positionnement, à qui ça s'adresse, pourquoi c'est défendable face à l'IA",
      "competences_a_developper": ["Compétence 1", "Compétence 2", "Compétence 3"],
      "potentiel_revenus": "Ex: '+30 à +50% sur 2 ans'",
      "difficulte": "Faible | Moyenne | Élevée"
    }
    // EXACTEMENT 3 pivots, du plus accessible au plus ambitieux
  ],
  "roadmap_90_jours": {
    "jours_1_30": {
      "objectif": "Phrase courte sur l'objectif du premier mois",
      "actions": ["Action concrète 1", "Action concrète 2", "Action concrète 3", "Action concrète 4"]
    },
    "jours_31_60": {
      "objectif": "Phrase courte sur l'objectif du deuxième mois",
      "actions": ["Action concrète 1", "Action concrète 2", "Action concrète 3", "Action concrète 4"]
    },
    "jours_61_90": {
      "objectif": "Phrase courte sur l'objectif du troisième mois",
      "actions": ["Action concrète 1", "Action concrète 2", "Action concrète 3", "Action concrète 4"]
    }
  },
  "competences_a_acquerir": [
    {
      "competence": "Nom de la compétence",
      "pourquoi": "1 phrase sur pourquoi c'est critique",
      "comment": "1-2 phrases : ressources concrètes (formations, certifs, plateformes nommées)"
    }
    // 4 à 6 compétences
  ],
  "metiers_emergents": [
    {
      "metier": "Nom du métier émergent connexe",
      "description": "1-2 phrases sur ce que fait ce métier",
      "transition_depuis_actuel": "1 phrase sur comment passer de votre métier actuel à celui-ci"
    }
    // 3 à 4 métiers émergents accessibles depuis le métier actuel
  ],
  "mantra_final": "Une phrase forte, motivante, qui clôt le rapport (style punchline, max 20 mots)"
}

CONTRAINTES STRICTES :
- score_menace cohérent avec palier (0-25 résilient, 26-45 évolution, 46-65 transformation, 66-85 risque élevé, 86-100 existentiel)
- AUCUN texte hors JSON, AUCUN backtick markdown
- Français professionnel, ton direct, zéro bullshit
- Cite des outils réels et actuels
- Si le métier est ambigu, prends l'acception la plus courante en France`;

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

    // Appel Claude Sonnet 4.6
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: PREMIUM_PROMPT.replace("{METIER}", metierClean),
        },
      ],
    });

    let raw = message.content[0].text.trim();
    // Nettoyage backticks au cas où
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let rapport;
    try {
      rapport = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e, "Raw:", raw.slice(0, 500));
      return Response.json({ error: "Erreur de génération du rapport. Réessaie." }, { status: 500 });
    }

    // Validation minimale
    if (
      typeof rapport.score_menace !== "number" ||
      rapport.score_menace < 0 ||
      rapport.score_menace > 100 ||
      !Array.isArray(rapport.actions_immediates) ||
      rapport.actions_immediates.length < 3 ||
      !Array.isArray(rapport.pivots_strategiques) ||
      rapport.pivots_strategiques.length < 2
    ) {
      console.error("Validation failed:", rapport);
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
        status: "paid", // simulé pour l'instant
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
