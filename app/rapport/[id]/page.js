import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PremiumReportView from "./PremiumReportView";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await supabase.from("purchases").select("metier_reformule").eq("id", id).single();
  return {
    title: data ? `Rapport premium · ${data.metier_reformule}` : "Rapport premium",
    robots: { index: false, follow: false },
  };
}

export default async function RapportPremiumPage({ params }) {
  const { id } = await params;

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !purchase) return notFound();

  return <PremiumReportView purchase={purchase} />;
}
