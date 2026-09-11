import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type PublicCase = Database["public"]["Tables"]["cases"]["Row"];
export type IncidentData = Database["public"]["Tables"]["incident_data"]["Row"];
export type Evidence = Database["public"]["Tables"]["evidence"]["Row"];
export type Witness = Database["public"]["Tables"]["witnesses"]["Row"];
export type EvidenceCard = Database["public"]["Tables"]["evidence_cards"]["Row"];
export type CaseFile = PublicCase & {
  incident_data: IncidentData | null;
  evidence: Evidence[];
  witnesses: Array<Witness & { evidence_cards: EvidenceCard[] }>;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listPublishedCases = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("cases")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .order("number");
  if (error) throw new Error(error.message);
  return data;
});

export const getPublishedCase = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const client = publicClient();
    const [caseResult, incidentResult, evidenceResult, witnessesResult, cardsResult] =
      await Promise.all([
        client.from("cases").select("*").eq("id", data.id).eq("status", "published").single(),
        client.from("incident_data").select("*").eq("case_id", data.id).maybeSingle(),
        client.from("evidence").select("*").eq("case_id", data.id).order("sort_order"),
        client.from("witnesses").select("*").eq("case_id", data.id).order("sort_order"),
        client.from("evidence_cards").select("*").eq("case_id", data.id).order("sort_order"),
      ]);
    if (caseResult.error) throw new Error(caseResult.error.message);
    if (incidentResult.error) throw new Error(incidentResult.error.message);
    if (evidenceResult.error) throw new Error(evidenceResult.error.message);
    if (witnessesResult.error) throw new Error(witnessesResult.error.message);
    if (cardsResult.error) throw new Error(cardsResult.error.message);
    const cards = cardsResult.data ?? [];
    return {
      ...caseResult.data,
      incident_data: incidentResult.data,
      evidence: evidenceResult.data ?? [],
      witnesses: (witnessesResult.data ?? []).map((witness) => ({
        ...witness,
        evidence_cards: cards.filter((card) => card.witness_id === witness.id),
      })),
    } satisfies CaseFile;
  });
