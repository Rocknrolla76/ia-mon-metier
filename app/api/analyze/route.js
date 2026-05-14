import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Cache mémoire simple (sera remplacé par Redis plus tard)
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function normalizeMetier(metier) {
  return metier.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

const SYSTEM_PROMPT = `Tu es un analyste senior spécialisé dans l'impact de l'IA sur les métiers. Tu rédiges pour des actifs français qui veulent un diagnostic lucide, ni alarmiste ni rassuriste, sur l'avenir de leur métier face à l'IA générative et à l'automatisation.

Ton style : ferme, factuel, élégant. Pas de langue de bois, pas de jargon technique. Tu parles à un humain qui prend une décision importante sur sa carrière.

Tu réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après, sans backticks markdown.`;

function buildUserPrompt(metier) {
  return `Métier à analyser : "${metier}"

Génère un diagnostic au format JSON strict avec la structure suivante :

{
  "metier_reformule": "Reformulation propre et précise du métier en 3-6 mots",

  "score_menace": <entier entre 0 et 100>,

  "palier": "<un des 5 paliers exacts : 'Métier résilient' | 'Évolution nécessaire' | 'Transformation profonde' | 'Risque élevé' | 'Menace existentielle'>",

  "verdict_synthetique": "Une phrase choc de 15-25 mots qui résume la situation. Doit être lucide, marquante, mémorable. Pas de cliché.",

  "radar_scores": {
    "automatisation_taches": <0-100, à quel point les tâches du métier sont automatisables>,
    "vitesse_changement": <0-100, à quel point la transformation est rapide>,
    "outils_disponibles": <0-100, maturité des outils IA pour ce métier aujourd'hui>,
    "concurrence_ia": <0-100, à quel point l'IA peut faire le travail en autonomie>,
    "barriere_humaine": <0-100, à quel point l'humain reste irremplaçable - SCORE INVERSÉ : 100 = très remplaçable, 0 = totalement irremplaçable>,
    "pression_marche": <0-100, pression économique pour adopter l'IA dans ce métier>
  },

  "taches_a_risque": [
    {
      "tache": "Description concrète de la tâche en 5-10 mots",
      "niveau_automatisation": <entier entre 0 et 100>
    }
  ],

  "horizon_temporel": {
    "deja_la": "Une seule phrase punchy (15-25 mots) sur ce qui est déjà automatisé/menacé aujourd'hui.",
    "un_a_deux_ans": "Une seule phrase punchy (15-25 mots) sur ce qui basculera dans 12-24 mois.",
    "trois_a_cinq_ans": "Une seule phrase punchy (15-25 mots) sur le visage probable du métier à 3-5 ans."
  },

  "plan_action_teaser": [
    {
      "numero": 1,
      "titre": "Titre court de l'action en 4-8 mots",
      "description": "Description concrète de l'action en 2-3 phrases. Reste général, NE NOMME PAS d'outils ou logiciels spécifiques. Parle de catégories ('un assistant IA conversationnel', 'un outil d'automatisation de workflows').",
      "priorite": "<haute | moyenne | basse>"
    }
  ],

  "repositionnement_teaser": "Une phrase qui amorce la stratégie de repositionnement à 2-3 ans, sans la révéler. Doit donner envie d'en savoir plus."
}

CONTRAINTES IMPORTANTES :
- "taches_a_risque" : exactement 4 à 6 éléments, triés par niveau_automatisation décroissant. PAS de champ "explication".
- "plan_action_teaser" : exactement 1 action (la plus impactante, c'est un teaser)
- NE JAMAIS nommer d'outils, logiciels ou marques (pas de Claude, ChatGPT, Notion, Make, n8n, Cursor, Zapier, etc.) — uniquement des catégories génériques
- "horizon_temporel" : chaque période = UNE SEULE phrase courte et incisive
- Score 0-100 calibré ainsi :
  * 0-29 : Métier résilient
  * 30-49 : Évolution nécessaire
  * 50-69 : Transformation profonde
  * 70-89 : Risque élevé
  * 90-100 : Menace existentielle
- Le palier doit correspondre exactement à la tranche du score
- "radar_scores" : les 6 valeurs doivent être cohérentes avec le score global. La moyenne approximative des 6 doit être proche du score_menace (à ±10 près).`;
}

export async function POST(request) {
  try {
    const { metier } = await request.json();

    if (!metier || typeof metier !== "string" || metier.trim().length < 2) {
      return Response.json({ error: "Métier invalide" }, { status: 400 });
    }

    if (metier.length > 200) {
      return Response.json(
        { error: "Métier trop long (200 caractères max)" },
        { status: 400 }
      );
    }

    const cacheKey = normalizeMetier(metier);
    const cached = getCached(cacheKey);
    if (cached) {
      return Response.json({ ...cached, cached: true });
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(metier),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
      throw new Error("Pas de réponse texte de l'API");
    }

    let parsed;
    try {
      const cleaned = textBlock.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Erreur parsing JSON:", e, textBlock.text);
      return Response.json(
        { error: "Réponse IA mal formée, réessayez" },
        { status: 502 }
      );
    }

    if (
      typeof parsed.score_menace !== "number" ||
      parsed.score_menace < 0 ||
      parsed.score_menace > 100
    ) {
      return Response.json(
        { error: "Score invalide dans la réponse IA" },
        { status: 502 }
      );
    }

    setCached(cacheKey, parsed);

    return Response.json({ ...parsed, cached: false });
  } catch (error) {
    console.error("Erreur API analyze:", error);
    return Response.json(
      { error: "Erreur serveur, réessayez dans un instant" },
      { status: 500 }
    );
  }
}
