import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

// ─── Public server functions ──────────────────────────────────────────────────

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
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
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

// ─── Admin server functions (require authentication) ─────────────────────────

export const listAllCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cases")
      .select("*, evidence(count), witnesses(count)")
      .order("sort_order")
      .order("number");
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteCaseById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("cases").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const toggleCaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ id: z.string().uuid(), status: z.enum(["draft", "published"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("cases")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const duplicateCaseById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;

    // 1. Fetch original case with all relations
    const [caseRes, incidentRes, evidenceRes, witnessesRes, cardsRes] = await Promise.all([
      sb.from("cases").select("*").eq("id", data.id).single(),
      sb.from("incident_data").select("*").eq("case_id", data.id).maybeSingle(),
      sb.from("evidence").select("*").eq("case_id", data.id).order("sort_order"),
      sb.from("witnesses").select("*").eq("case_id", data.id).order("sort_order"),
      sb.from("evidence_cards").select("*").eq("case_id", data.id).order("sort_order"),
    ]);
    if (caseRes.error) throw new Error(caseRes.error.message);
    const original = caseRes.data;

    // 2. Find next available number
    const { data: maxRow } = await sb
      .from("cases")
      .select("number")
      .order("number", { ascending: false })
      .limit(1)
      .single();
    const nextNumber = (maxRow?.number ?? 0) + 1;

    // 3. Insert duplicated case as draft
    const { id: _id, created_at, updated_at, ...caseFields } = original;
    const { data: newCase, error: insertError } = await sb
      .from("cases")
      .insert({
        ...caseFields,
        number: nextNumber,
        code: `AV-${String(nextNumber).padStart(3, "0")}`,
        title: `${original.title} (cópia)`,
        status: "draft",
        sort_order: nextNumber,
      })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);

    // 4. Duplicate incident data
    if (incidentRes.data) {
      const { case_id: _cid, created_at: _ca, updated_at: _ua, ...incidentFields } = incidentRes.data;
      await sb.from("incident_data").insert({ ...incidentFields, case_id: newCase.id });
    }

    // 5. Duplicate evidence
    if (evidenceRes.data && evidenceRes.data.length > 0) {
      const evidenceInserts = evidenceRes.data.map(({ id: _eid, case_id: _cid, created_at: _ca, updated_at: _ua, ...fields }) => ({
        ...fields,
        case_id: newCase.id,
      }));
      await sb.from("evidence").insert(evidenceInserts);
    }

    // 6. Duplicate witnesses + evidence_cards
    if (witnessesRes.data && witnessesRes.data.length > 0) {
      for (const witness of witnessesRes.data) {
        const { id: origWitnessId, case_id: _cid, created_at: _ca, updated_at: _ua, ...witnessFields } = witness;
        const { data: newWitness, error: wErr } = await sb
          .from("witnesses")
          .insert({ ...witnessFields, case_id: newCase.id })
          .select()
          .single();
        if (wErr) throw new Error(wErr.message);

        const witnessCards = (cardsRes.data ?? []).filter((c) => c.witness_id === origWitnessId);
        if (witnessCards.length > 0) {
          const cardInserts = witnessCards.map(({ id: _cid2, case_id: _ccid, witness_id: _wid, created_at: _ca2, updated_at: _ua2, ...cardFields }) => ({
            ...cardFields,
            case_id: newCase.id,
            witness_id: newWitness.id,
          }));
          await sb.from("evidence_cards").insert(cardInserts);
        }
      }
    }

    return { id: newCase.id };
  });

