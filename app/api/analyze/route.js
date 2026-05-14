// Cache simple en mémoire (se vide à chaque redéploiement)
const cache = new Map();

export async function POST(request) {
  try {
    const { job } = await request.json();

    if (!job || typeof job !== "string" || job.length > 200 || job.length < 2) {
      return Response.json({ error: "Métier invalide" }, { status: 400 });
    }

    const cacheKey = job.toLowerCase().trim();
    if (cache.has(cacheKey)) {
      return Response.json(cache.get(cacheKey));
    }

    const prompt = `Tu es un analyste stratégique spécialisé dans l'impact de l'IA générative sur les métiers. Tu rédiges pour quelqu'un qui exerce le métier suivant : "${job.trim()}".

Ton objectif : produire une analyse percutante, factuelle et actionnable. Le ton est celui d'un wake-up call constructif — sans complaisance sur la menace, mais résolument tourné vers l'action. Pas de blabla générique. Du concret, des outils nommés, des actions précises.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks), strictement à ce format :

{
  "metier_reformule": "intitulé professionnel propre (ex: 'Comptable en cabinet')",
  "score_menace": <entier de 1 à 10, où 1 = peu menacé et 10 = très fortement menacé>,
  "verdict_synthetique": "une phrase choc de 15-25 mots qui résume la situation",
  "taches_a_risque": [
    {"tache": "intitulé court d'une tâche", "niveau_automatisation": <0-100>, "explication": "1 phrase concrète sur QUI fait déjà ça avec l'IA aujourd'hui"}
  ],
  "taches_protegees": [
    {"tache": "intitulé court", "raison": "1 phrase sur pourquoi l'IA ne peut pas faire ça"}
  ],
  "horizon_temporel": {
    "deja_la": "ce qui est déjà automatisé aujourd'hui dans ce métier (1-2 phrases concrètes)",
    "court_terme": "ce qui va basculer dans les 1-2 ans (1-2 phrases)",
    "moyen_terme": "ce qui basculera dans 3-5 ans (1-2 phrases)"
  },
  "plan_action": [
    {"titre": "Action concrète et nommée", "description": "2-3 phrases sur quoi faire précisément, avec outils nommés (Claude, ChatGPT, Notion AI, n8n, Make, etc.)", "priorite": "haute|moyenne|basse"}
  ],
  "repositionnement": "2-3 phrases : vers quel rôle évoluer dans 2-3 ans pour devenir augmenté plutôt que remplacé. Très concret."
}

Règles impératives :
- 4 à 6 tâches à risque, 2 à 4 tâches protégées
- 4 à 5 actions dans le plan d'action, nomme des OUTILS RÉELS (Claude, ChatGPT, Perplexity, Notion AI, Make, n8n, Cursor, GitHub Copilot, Midjourney, ElevenLabs, etc. selon le métier)
- Sois SPÉCIFIQUE à ce métier précis, pas générique
- Si le métier saisi est vague ou farfelu, fais de ton mieux pour l'interpréter raisonnablement
- Réponds en français`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return Response.json({ error: "Erreur API" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    cache.set(cacheKey, parsed);
    return Response.json(parsed);
  } catch (err) {
    console.error("Route error:", err);
    return Response.json({ error: "Analyse échouée" }, { status: 500 });
  }
}
