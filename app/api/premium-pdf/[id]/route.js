import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import PremiumPdfDocument from "../../../lib/PremiumPdfDocument";

export const runtime = "nodejs";
export const maxDuration = 30;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function GET(request, { params }) {
  const { id } = await params;

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !purchase) {
    return Response.json({ error: "Rapport introuvable" }, { status: 404 });
  }

  try {
    const buffer = await renderToBuffer(<PremiumPdfDocument purchase={purchase} />);

    const safeName = (purchase.metier_reformule || "rapport")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sauvetonjob-${safeName}.pdf"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("PDF render error:", err);
    return Response.json({ error: "Erreur de génération PDF" }, { status: 500 });
  }
}
