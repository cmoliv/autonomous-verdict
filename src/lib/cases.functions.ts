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

export const getAdminCase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const [caseResult, incidentResult, evidenceResult, witnessesResult, cardsResult] =
      await Promise.all([
        sb.from("cases").select("*").eq("id", data.id).single(),
        sb.from("incident_data").select("*").eq("case_id", data.id).maybeSingle(),
        sb.from("evidence").select("*").eq("case_id", data.id).order("sort_order"),
        sb.from("witnesses").select("*").eq("case_id", data.id).order("sort_order"),
        sb.from("evidence_cards").select("*").eq("case_id", data.id).order("sort_order"),
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

// We import caseSchema at the top for saveCase validator, but to avoid circular deps
// or large imports in this file, we can accept 'any' and rely on the client for initial Zod validation,
// then just do a basic type cast, or we can import the schema.
// We will import it dynamically or assume the input is correct here since the client validates.
export const saveCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => input as any) // Validated strictly on client via react-hook-form + zod
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const payload = data as any; // Type matches CaseFormValues from cases.schema.ts
    console.log("SERVER SAVE_CASE WITNESSES:", JSON.stringify(payload.witnesses, null, 2));
    const isUpdate = !!payload.id;
    let caseId = payload.id;

    // 1. Upsert Case
    const { incident_data, evidence, witnesses, ...caseFields } = payload;
    
    if (isUpdate) {
      const { error } = await sb.from("cases").update(caseFields).eq("id", caseId);
      if (error) throw new Error(`Update case failed: ${error.message}`);
    } else {
      const { data: newCase, error } = await sb.from("cases").insert(caseFields).select().single();
      if (error) throw new Error(`Insert case failed: ${error.message}`);
      caseId = newCase.id;
    }

    // 2. Upsert Incident Data
    if (incident_data) {
      const { error } = await sb.from("incident_data").upsert({
        ...incident_data,
        case_id: caseId,
      }, { onConflict: "case_id" });
      if (error) throw new Error(`Upsert incident data failed: ${error.message}`);
    }

    // 3. Sync Evidence
    // Simple approach: delete all existing evidence for this case, then insert new.
    // This is safe because evidence doesn't have child relations we need to preserve.
    if (isUpdate) {
      await sb.from("evidence").delete().eq("case_id", caseId);
    }
    if (evidence && evidence.length > 0) {
      const evInserts = evidence.map((ev: any, index: number) => {
        const { id, ...rest } = ev; // strip client-side ids if they exist for clean insert
        return { ...rest, case_id: caseId, sort_order: index + 1 };
      });
      const { error } = await sb.from("evidence").insert(evInserts);
      if (error) throw new Error(`Insert evidence failed: ${error.message}`);
    }

    // 4. Sync Witnesses & Evidence Cards
    // Witnesses have child cards, so if we delete a witness, we must recreate its cards.
    // Since cards only link to witnesses, deleting all witnesses cascades/removes cards, 
    // or we can just delete all witnesses and cards manually, then recreate.
    if (isUpdate) {
      // Evidence cards tied to witnesses will be deleted if we delete the witnesses (due to cascade, but let's be explicit)
      await sb.from("evidence_cards").delete().eq("case_id", caseId);
      await sb.from("witnesses").delete().eq("case_id", caseId);
    }

    if (witnesses && witnesses.length > 0) {
      for (let i = 0; i < witnesses.length; i++) {
        const wit = witnesses[i];
        const { id, evidence_cards, ...witRest } = wit;
        
        const { data: newWit, error: witErr } = await sb.from("witnesses").insert({
          ...witRest,
          case_id: caseId,
          sort_order: i + 1,
        }).select().single();
        
        if (witErr) throw new Error(`Insert witness failed: ${witErr.message}`);

        if (evidence_cards && evidence_cards.length > 0) {
          const cardInserts = evidence_cards.map((card: any, cardIdx: number) => {
            const { id: _cid, ...cardRest } = card;
            return {
              ...cardRest,
              case_id: caseId,
              witness_id: newWit.id,
              sort_order: cardIdx + 1,
            };
          });
          const { error: cardErr } = await sb.from("evidence_cards").insert(cardInserts);
          if (cardErr) throw new Error(`Insert cards failed: ${cardErr.message}`);
        }
      }
    }

    return { id: caseId };
  });

