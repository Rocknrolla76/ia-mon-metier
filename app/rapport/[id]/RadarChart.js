"use client";

const AXES = [
  { key: "automatisation_taches", label: "Automatisation des tâches", short: "Automatisation" },
  { key: "vitesse_changement", label: "Vitesse du changement", short: "Vitesse" },
  { key: "outils_disponibles", label: "Outils disponibles", short: "Outils" },
  { key: "concurrence_ia", label: "Concurrence IA directe", short: "Concurrence IA" },
  { key: "barriere_humaine", label: "Exposition humaine", short: "Exposition", invert: true },
  { key: "pression_marche", label: "Pression du marché", short: "Marché" },
];

export default function RadarChart({ scores }) {
  if (!scores) return null;

  const size = 420;
  const center = size / 2;
  const radius = 150;
  const labelRadius = radius + 38;

  // Normalise chaque axe : inverse barriere_humaine pour que TOUT pointe vers "menace"
  const values = AXES.map((axis) => {
    const raw = scores[axis.key] ?? 0;
    const value = axis.invert ? 100 - raw : raw;
    return { ...axis, value: Math.max(0, Math.min(100, value)) };
  });

  // Calcule les points du polygone et des labels
  const getPoint = (index, valuePct) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    const distance = (radius * valuePct) / 100;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  const getLabelPoint = (index) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * labelRadius,
      y: center + Math.sin(angle) * labelRadius,
      angle,
    };
  };

  // Polygone des valeurs
  const polygonPoints = values
    .map((v, i) => {
      const p = getPoint(i, v.value);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Grille concentrique (4 niveaux : 25, 50, 75, 100)
  const gridLevels = [25, 50, 75, 100];

  // Score moyen pour le centre
  const avgScore = Math.round(values.reduce((s, v) => s + v.value, 0) / values.length);

  return (
    <div className="radar-wrapper">
      <svg viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" className="radar-svg">
        {/* Grille concentrique */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={AXES.map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Axes (lignes radiales) */}
        {AXES.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Graduations (25, 50, 75) */}
        {[25, 50, 75].map((level) => (
          <text
            key={level}
            x={center + 4}
            y={center - (radius * level) / 100}
            fontSize="9"
            fill="#94a3b8"
            fontFamily="system-ui, sans-serif"
          >
            {level}
          </text>
        ))}

        {/* Polygone des valeurs */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          fillOpacity="0.35"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Gradient pour le remplissage */}
        <defs>
          <radialGradient id="radarGradient">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Points sur chaque axe */}
        {values.map((v, i) => {
          const p = getPoint(i, v.value);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#dc2626"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels avec valeurs */}
        {values.map((v, i) => {
          const lp = getLabelPoint(i);
          const isLeft = lp.x < center - 10;
          const isRight = lp.x > center + 10;
          const anchor = isLeft ? "end" : isRight ? "start" : "middle";

          return (
            <g key={`label-${i}`}>
              <text
                x={lp.x}
                y={lp.y - 6}
                fontSize="11"
                fontWeight="600"
                fill="#0f172a"
                textAnchor={anchor}
                fontFamily="system-ui, sans-serif"
              >
                {v.short}
              </text>
              <text
                x={lp.x}
                y={lp.y + 8}
                fontSize="13"
                fontWeight="700"
                fill="#dc2626"
                textAnchor={anchor}
                fontFamily="system-ui, sans-serif"
              >
                {v.value}
              </text>
            </g>
          );
        })}

        {/* Score moyen au centre */}
        <circle cx={center} cy={center} r="22" fill="#0f172a" />
        <text
          x={center}
          y={center + 5}
          fontSize="16"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          {avgScore}
        </text>
      </svg>

      <p className="radar-legend">
        Profil de risque sur 6 dimensions — plus la zone est étendue, plus la pression IA est forte sur votre métier.
      </p>
    </div>
  );
}
