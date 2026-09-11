import { z } from "zod";

export type PublicCase = {
  id: string;
  number: number;
  code: string;
  title: string;
  subtitle?: string | null;
  difficulty: number;
  is_final: boolean;
  points: number;
  status: "draft" | "published";
  sort_order: number;
  summary: string;
  description: string;
  central_question: string;
  algorithm_title: string;
  algorithm_description: string;
  algorithm_justification?: string | null;
  reveal_justification: boolean;
  created_at?: string;
  updated_at?: string;
};

export type IncidentData = {
  case_id?: string;
  passengers?: number | null;
  pedestrians?: number | null;
  decision_time?: number | null;
  vehicle_speed?: number | null;
  survival_probability?: number | null;
  survival_probabilities?: { decision: string; probability: string }[];
  location?: string | null;
  weather?: string | null;
  visibility?: string | null;
};

export type Evidence = {
  id: string;
  case_id?: string;
  number: number;
  title: string;
  description: string;
  category: string;
  importance?: string | null;
  reveal_phase: string;
  image_path?: string | null;
  document_path?: string | null;
  sort_order: number;
};

export type EvidenceCard = {
  id: string;
  case_id?: string;
  witness_id?: string;
  title: string;
  content: string;
  source: string;
  type: string;
  reliability: string;
  auto_reveal: boolean;
  sort_order: number;
};

export type Witness = {
  id: string;
  case_id?: string;
  number: number;
  name: string;
  role: string;
  description?: string | null;
  mediator_intro?: string | null;
  duration_seconds?: number | null;
  video_path?: string | null;
  sort_order: number;
};

export type CaseFile = PublicCase & {
  incident_data: IncidentData | null;
  evidence: Evidence[];
  witnesses: Array<Witness & { evidence_cards: EvidenceCard[] }>;
};

// ─── Local Storage DB ────────────────────────────────────────────────────────

const STORAGE_KEY = "autonomous_verdict_cases";

function getCases(): CaseFile[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seed = [SEED_AV001];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  const parsed = JSON.parse(stored) as CaseFile[];
  
  // Migration for early seed data that used invalid UUIDs
  let mutated = false;
  parsed.forEach(c => {
    c.evidence?.forEach(e => {
      if (e.id === "ev-1") { e.id = "c3a8c1f0-281b-4d7a-8b82-965d06497f5b"; mutated = true; }
    });
    c.witnesses?.forEach(w => {
      if (w.id === "wit-1") { w.id = "6e5b41cf-5047-4952-bc66-3d726b2b4d9a"; mutated = true; }
      w.evidence_cards?.forEach(card => {
        if (card.id === "card-1") { card.id = "f8a05c36-7c77-4b71-92ea-2849e7b2bb6e"; mutated = true; }
      });
    });
  });
  if (mutated) saveCases(parsed);
  return parsed;
}

function saveCases(cases: CaseFile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function listPublishedCases() {
  const cases = getCases();
  return cases.filter((c) => c.status === "published").sort((a, b) => a.sort_order - b.sort_order || a.number - b.number);
}

export async function getPublishedCase({ data }: { data: { id: string } }) {
  const cases = getCases();
  const c = cases.find((c) => c.id === data.id && c.status === "published");
  if (!c) throw new Error("Case not found or not published");
  return c;
}

export async function listAllCases() {
  const cases = getCases();
  return cases.sort((a, b) => a.sort_order - b.sort_order || a.number - b.number);
}

export async function getAdminCase({ data }: { data: { id: string } }) {
  const cases = getCases();
  const c = cases.find((c) => c.id === data.id);
  if (!c) throw new Error("Case not found");
  return c;
}

export async function deleteCaseById({ data }: { data: { id: string } }) {
  let cases = getCases();
  cases = cases.filter(c => c.id !== data.id);
  saveCases(cases);
  return { success: true };
}

export async function toggleCaseStatus({ data }: { data: { id: string; status: "draft" | "published" } }) {
  const cases = getCases();
  const c = cases.find(c => c.id === data.id);
  if (c) {
    c.status = data.status;
    saveCases(cases);
  }
  return { success: true };
}

export async function duplicateCaseById({ data }: { data: { id: string } }) {
  const cases = getCases();
  const original = cases.find(c => c.id === data.id);
  if (!original) throw new Error("Case not found");

  const nextNumber = Math.max(0, ...cases.map(c => c.number)) + 1;
  const newId = crypto.randomUUID();

  // Deep clone
  const newCase: CaseFile = JSON.parse(JSON.stringify(original));
  newCase.id = newId;
  newCase.number = nextNumber;
  newCase.code = `AV-${String(nextNumber).padStart(3, "0")}`;
  newCase.title = `${original.title} (cópia)`;
  newCase.status = "draft";
  newCase.sort_order = nextNumber;
  
  // Re-id children
  newCase.evidence.forEach(e => e.id = crypto.randomUUID());
  newCase.witnesses.forEach(w => {
    w.id = crypto.randomUUID();
    w.evidence_cards.forEach(card => card.id = crypto.randomUUID());
  });

  cases.push(newCase);
  saveCases(cases);
  return { id: newId };
}

export async function saveCase({ data: payload }: { data: any }) {
  const cases = getCases();
  const isUpdate = !!payload.id;
  const caseId = payload.id || crypto.randomUUID();

  const newCase: CaseFile = {
    ...payload,
    id: caseId,
    incident_data: payload.incident_data || null,
    evidence: payload.evidence?.map((e: any, idx: number) => ({ ...e, id: e.id || crypto.randomUUID(), sort_order: idx + 1 })) || [],
    witnesses: payload.witnesses?.map((w: any, idx: number) => ({
      ...w,
      id: w.id || crypto.randomUUID(),
      sort_order: idx + 1,
      evidence_cards: w.evidence_cards?.map((c: any, cidx: number) => ({ ...c, id: c.id || crypto.randomUUID(), sort_order: cidx + 1 })) || []
    })) || []
  };

  if (isUpdate) {
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx !== -1) cases[idx] = newCase;
  } else {
    cases.push(newCase);
  }

  saveCases(cases);
  return { id: caseId };
}

// ─── Export / Import ─────────────────────────────────────────────────────────

export function exportCasesToFile() {
  const cases = getCases();
  const blob = new Blob([JSON.stringify(cases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `autonomous_verdict_cases_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Delay revocation to ensure the download starts before the URL is invalidated
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function importCasesMerge(jsonData: string) {
  try {
    const imported = JSON.parse(jsonData) as CaseFile[];
    if (!Array.isArray(imported)) throw new Error("Invalid format: not an array");
    
    const cases = getCases();
    for (const inc of imported) {
      if (!inc.id || !inc.code) continue; // Basic validation
      const idx = cases.findIndex(c => c.id === inc.id);
      if (idx !== -1) {
        cases[idx] = inc;
      } else {
        cases.push(inc);
      }
    }
    saveCases(cases);
    return true;
  } catch (err) {
    console.error("Import failed:", err);
    return false;
  }
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_AV001: CaseFile = {
  id: "40780681-1ea6-4b59-ad3b-51b47c43f14a",
  number: 1,
  code: "AV-001",
  title: "O Desvio",
  subtitle: "Decisão autônoma em cenário de colisão inevitável",
  difficulty: 1,
  is_final: false,
  points: 1,
  status: "published",
  sort_order: 1,
  summary: "O veículo autônomo desviou de pedestres na via e colidiu, vitimando o passageiro.",
  description: "Um veículo da marca Titan X, operando em modo 100% autônomo, identificou 3 pedestres atravessando irregularmente a via. O algoritmo desviou o veículo em 0.8 segundos para evitar atropelamento, resultando em colisão com um poste. A probabilidade calculada de sobrevivência do passageiro era de 45%, enquanto a de atropelamento fatal múltiplo era de 92%.",
  central_question: "O veículo agiu corretamente ao sacrificar o passageiro em prol de terceiros não-autorizados na via?",
  algorithm_title: "Priorização Utilitarista de Danos Globais",
  algorithm_description: "Algoritmo de contingência avalia massa, trajetória e impacto cinético para minimizar fatalidades totais.",
  algorithm_justification: "Diretriz interna 4.2.1: Em caso de acidente iminente sem rota segura, priorizar a trajetória que resulte no menor número absoluto de baixas humanas, independentemente do status legal de ocupação (passageiro vs. terceiro).",
  reveal_justification: true,
  incident_data: {
    passengers: 1,
    pedestrians: 3,
    decision_time: 0.8,
    vehicle_speed: 68,
    survival_probability: 45,
    survival_probabilities: [
      { decision: "Manter trajetória", probability: "45% passageiro / 10% pedestres" },
      { decision: "Desviar (poste)", probability: "45% passageiro / 92% pedestres mortos" }
    ],
    location: "Avenida Marginal (trecho chuvoso)",
    weather: "Chuva intensa",
    visibility: "Baixa"
  },
  evidence: [
    {
      id: "c3a8c1f0-281b-4d7a-8b82-965d06497f5b",
      number: 1,
      title: "Câmera Frontal",
      description: "Vídeo do painel no momento do acidente.",
      category: "documentary",
      reveal_phase: "intro",
      sort_order: 1
    }
  ],
  witnesses: [
    {
      id: "6e5b41cf-5047-4952-bc66-3d726b2b4d9a",
      number: 1,
      name: "Engenheiro Sênior de IA",
      role: "Especialista Técnico",
      description: "Engenheiro responsável pelo módulo de ética da Titan X.",
      duration_seconds: 45,
      video_path: "/media/witnesses/opt_testemunha1_caso2.mp4",
      sort_order: 1,
      evidence_cards: [
        {
          id: "f8a05c36-7c77-4b71-92ea-2849e7b2bb6e",
          title: "Hardcode de Vulnerabilidade",
          content: "O código-fonte revela que o peso negativo atribuído a pedestres (vulneráveis) é 3x maior que o peso de passageiros (protegidos por airbags).",
          source: "Repositório Git Titan X",
          type: "digital",
          reliability: "high",
          auto_reveal: true,
          sort_order: 1
        }
      ]
    }
  ]
};
