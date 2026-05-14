import Anthropic from "@anthropic-ai/sdk";
 
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
 
// Cache mémoire simple (sera remplacé par Redis plus tard)
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
 
function normalizeMetier(metier) {
  return metier
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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
 
Génère un diagnostic complet au format JSON strict avec la structure suivante :
 
{
  "metier_reformule": "Reformulation propre et précise du métier en 3-6 mots (ex: 'Comptable en cabinet d'expertise')",
  
  "score_menace": <entier entre 0 et 100>,
  
  "palier": "<un des 5 paliers exacts : 'Métier résilient' | 'Évolution nécessaire' | 'Transformation profonde' | 'Risque élevé' | 'Menace existentielle'>",
  
  "verdict_synthetique": "Une phrase choc de 15-25 mots qui résume la situation. Doit être lucide, marquante, mémorable. Pas de cliché, pas de 'l'IA va transformer votre métier'.",
  
  "taches_a_risque": [
    {
      "tache": "Description concrète de la tâche en 5-10 mots",
      "niveau_automatisation": <entier entre 0 et 100, pourcentage automatisable d'ici 3 ans>,
      "explication": "Une phrase précise sur le pourquoi (sans nommer d'outils spécifiques)"
    }
  ],
  
  "taches_protegees": [
    {
      "tache": "Description concrète de la tâche en 5-10 mots",
      "raison": "Pourquoi cette tâche résiste à l'IA, en une phrase"
    }
  ],
  
  "horizon_temporel": {
    "deja_la": "Ce qui est déjà automatisé/menacé aujourd'hui dans ce métier. 2-3 phrases concrètes.",
    "un_a_deux_ans": "Ce qui basculera dans les 12-24 prochains mois. 2-3 phrases concrètes.",
    "trois_a_cinq_ans": "Le visage probable du métier à 3-5 ans. 2-3 phrases."
  },
  
  "plan_action_teaser": [
    {
      "numero": 1,
      "titre": "Titre court de l'action en 4-8 mots",
      "description": "Description concrète de l'action en 2-3 phrases. Reste général, NE NOMME PAS d'outils ou de logiciels spécifiques. Parle de catégories ('un assistant IA conversationnel', 'un outil d'automatisation de workflows', 'une plateforme d'analyse de données').",
      "priorite": "<haute | moyenne | basse>"
    }
  ],
  
  "repositionnement_teaser": "Une phrase qui amorce la stratégie de repositionnement à 2-3 ans, sans la révéler. Doit donner envie d'en savoir plus. Ex: 'Votre meilleur atout réside dans X, et c'est précisément là qu'il faut investir.'"
}
 
CONTRAINTES IMPORTANTES :
- "taches_a_risque" : exactement 4 à 6 éléments, triés par niveau_automatisation décroissant
- "taches_protegees" : exactement 2 à 4 éléments
- "plan_action_teaser" : exactement 2 actions (les plus impactantes, c'est un teaser)
- NE JAMAIS nommer d'outils, logiciels ou marques (pas de Claude, ChatGPT, Notion, Make, n8n, Cursor, Zapier, etc.) — uniquement des catégories génériques
- Score 0-100 calibré ainsi :
  * 0-29 : Métier résilient (artisanat de précision, métiers du soin direct, créativité incarnée)
  * 30-49 : Évolution nécessaire (le métier change mais survit avec adaptation)
  * 50-69 : Transformation profonde (le périmètre du métier va significativement bouger)
  * 70-89 : Risque élevé (la majorité des tâches actuelles sont automatisables)
  * 90-100 : Menace existentielle (le métier sous sa forme actuelle a peu d'avenir)
- Le palier doit correspondre exactement à la tranche du score
- Le verdict_synthetique doit être lucide : pas de "rassurez-vous", pas de "l'IA est une opportunité", ni l'inverse. Du factuel direct.`;
}
 
export async function POST(request) {
  try {
    const { metier } = await request.json();
 
    if (!metier || typeof metier !== "string" || metier.trim().length < 2) {
      return Response.json(
        { error: "Métier invalide" },
        { status: 400 }
      );
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
      // Nettoyage défensif au cas où le modèle aurait ajouté des backticks
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
 
    // Validation minimale
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
