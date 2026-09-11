import { z } from "zod";
import { Constants } from "@/integrations/supabase/types";

// Helper enums derived from Supabase types
const evidenceCategoryEnum = z.enum(Constants.public.Enums.evidence_category as unknown as [string, ...string[]]);
const evidenceImportanceEnum = z.enum(Constants.public.Enums.evidence_importance as unknown as [string, ...string[]]);
const evidenceReliabilityEnum = z.enum(Constants.public.Enums.evidence_reliability as unknown as [string, ...string[]]);
const caseStatusEnum = z.enum(Constants.public.Enums.case_status as unknown as [string, ...string[]]);

// E. Evidence Cards
export const evidenceCardSchema = z.object({
  id: z.string().uuid().optional(), // optional for new cards
  title: z.string().min(1, "Título obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  source: z.string().min(1, "Fonte obrigatória"),
  type: evidenceCategoryEnum,
  reliability: evidenceReliabilityEnum,
  auto_reveal: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

// E. Witnesses
export const witnessSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.number().int().min(1),
  name: z.string().min(1, "Nome obrigatório"),
  role: z.string().min(1, "Papel obrigatório"),
  description: z.string().nullable().optional(),
  mediator_intro: z.string().nullable().optional(),
  duration_seconds: z.number().int().nullable().optional(),
  video_path: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  evidence_cards: z.array(evidenceCardSchema).default([]),
});

// E. Evidence
export const evidenceSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.number().int().min(1),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
  category: evidenceCategoryEnum,
  importance: evidenceImportanceEnum.nullable().optional(),
  reveal_phase: z.string().default("intro"),
  image_path: z.string().nullable().optional(),
  document_path: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

// D. Incident Data
export const incidentDataSchema = z.object({
  passengers: z.number().int().nullable().optional(),
  pedestrians: z.number().int().nullable().optional(),
  decision_time: z.number().nullable().optional(), // seconds, e.g. 0.8
  vehicle_speed: z.number().nullable().optional(),
  survival_probability: z.number().nullable().optional(),
  survival_probabilities: z.array(z.object({
    decision: z.string().min(1, "Decisão obrigatória"),
    probability: z.string().min(1, "Probabilidade obrigatória")
  })).default([]),
  location: z.string().nullable().optional(),
  weather: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
});

// A, B, C. Case
export const caseSchema = z.object({
  id: z.string().uuid().optional(), // undefined for creation
  // A. Identificação
  number: z.number().int().min(1, "Número deve ser maior que 0"),
  code: z.string().min(1, "Código obrigatório (ex: AV-001)"),
  title: z.string().min(1, "Título obrigatório"),
  subtitle: z.string().nullable().optional(),
  difficulty: z.number().int().min(1).max(5).default(1),
  is_final: z.boolean().default(false),
  points: z.number().int().default(1),
  status: caseStatusEnum.default("draft"),
  sort_order: z.number().int().default(0),
  
  // B. Contexto
  summary: z.string().min(1, "Resumo obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
  central_question: z.string().min(1, "Questão central obrigatória"),
  
  // C. Decisão
  algorithm_title: z.string().min(1, "Título da decisão obrigatório"),
  algorithm_description: z.string().min(1, "Descrição da decisão obrigatória"),
  algorithm_justification: z.string().nullable().optional(),
  reveal_justification: z.boolean().default(false),

  // Relationships
  incident_data: incidentDataSchema.nullable().optional(),
  evidence: z.array(evidenceSchema).default([]),
  witnesses: z.array(witnessSchema).default([]),
});

export type CaseFormValues = z.infer<typeof caseSchema>;
