import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import PremiumPdfDocument from "../../lib/PremiumPdfDocument";

export const runtime = "nodejs";
export const maxDuration = 30;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { purchase_id, email } = await request.json();

    if (!purchase_id || !email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Données invalides" }, { status: 400 });
    }

    const { data: purchase, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("id", purchase_id)
      .single();

    if (error || !purchase) {
      return Response.json({ error: "Rapport introuvable" }, { status: 404 });
    }

    // Génération du PDF en buffer
    const pdfBuffer = await renderToBuffer(<PremiumPdfDocument purchase={purchase} />);
    const pdfBase64 = pdfBuffer.toString("base64");

    const safeName = (purchase.metier_reformule || "rapport")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);

    const r = purchase.rapport_premium;

    // Envoi via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: `Votre rapport premium · ${r.metier_reformule}`,
        html: buildEmailHtml(r, purchase.id),
        attachments: [
          {
            filename: `sauvetonjob-${safeName}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return Response.json({ error: "Erreur d'envoi email" }, { status: 500 });
    }

    // Mise à jour Supabase
    await supabase
      .from("purchases")
      .update({ email, email_sent_at: new Date().toISOString() })
      .eq("id", purchase_id);

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function buildEmailHtml(r, id) {
  const reportUrl = `https://sauvetonjob.fr/rapport/${id}`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Votre rapport premium</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:48px 40px 24px;">
          <div style="font-size:11px;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:16px;">RAPPORT PREMIUM</div>
          <h1 style="font-size:28px;margin:0 0 8px;line-height:1.2;color:#0f172a;font-weight:600;">${escapeHtml(r.metier_reformule)}</h1>
          <p style="color:#64748b;margin:0 0 24px;font-size:14px;">Votre diagnostic complet est prêt.</p>
        </td></tr>

        <tr><td style="padding:0 40px;">
          <div style="background:#0f172a;color:white;border-radius:12px;padding:28px;text-align:center;">
            <div style="font-size:56px;font-weight:700;line-height:1;">${r.score_menace}<span style="font-size:18px;opacity:0.7;"> / 100</span></div>
            <div style="font-size:11px;letter-spacing:1.5px;margin-top:8px;opacity:0.8;">${escapeHtml(r.palier).toUpperCase()}</div>
          </div>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <blockquote style="font-style:italic;font-size:18px;line-height:1.5;border-left:3px solid #0f172a;padding-left:16px;margin:0 0 24px;color:#1e293b;">« ${escapeHtml(r.verdict_synthetique)} »</blockquote>

          <p style="line-height:1.7;color:#334155;margin:0 0 24px;">
            Votre rapport complet est attaché à cet email au format PDF (6 pages).
            Vous y trouverez le diagnostic approfondi, vos 5 actions immédiates,
            3 pivots stratégiques et la roadmap 90 jours.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#0f172a;border-radius:8px;">
              <a href="${reportUrl}" style="display:inline-block;padding:14px 28px;color:white;text-decoration:none;font-weight:500;">Voir le rapport en ligne →</a>
            </td></tr>
          </table>

          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:24px 0 0;">
            Cet email a été envoyé suite à votre demande sur sauvetonjob.fr.
            Le PDF en pièce jointe est strictement confidentiel.
          </p>
        </td></tr>

        <tr><td style="padding:24px 40px 40px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;">SAUVETONJOB.FR</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}
