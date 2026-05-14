export const metadata = {
  title: "L'IA & Moi — Mon métier face à l'IA",
  description: "Diagnostic personnalisé : à quel point l'IA menace votre métier, et le plan pour devenir celui qui l'utilise au lieu de la subir.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
