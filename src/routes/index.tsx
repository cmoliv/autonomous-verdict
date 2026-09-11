import { createFileRoute, Link } from "@tanstack/react-router";
import { listPublishedCases } from "@/lib/cases.functions";
import { FileLock2, Scale, Stamp } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tribunal dos Carros Autônomos — Investigation Files" },
      {
        name: "description",
        content:
          "Plataforma de julgamento acadêmico sobre decisões de veículos autônomos. Abra um dossiê e conduza o tribunal.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: cases = [] } = useQuery({
    queryKey: ["published-cases"],
    queryFn: () => listPublishedCases(),
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 paper-noise" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-3 border border-paper-edge bg-paper-dark px-4 py-2">
            <Scale className="size-4 text-bronze" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink-muted">
              Jurisdição: Tribunal Acadêmico
            </span>
          </div>

          <h1 className="font-display text-6xl uppercase leading-none text-ink sm:text-8xl">
            Tribunal dos
            <br />
            Carros Autônomos
          </h1>

          <div className="mx-auto my-7 h-px w-24 bg-ink/30" />

          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-muted">
            Autonomous Vehicle Investigation Files
          </p>
        </header>

        {/* Section title */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-paper-edge" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            Dossiês disponíveis — {cases.length} casos
          </span>
          <div className="h-px flex-1 bg-paper-edge" />
        </div>

        {/* Cases grid */}
        {cases.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {cases.map((c) => (
              <CaseDossier key={c.id} caseData={c} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-paper-edge pt-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
            Classificação restrita · Apenas para uso em ambiente controlado
          </p>
        </footer>
      </div>
    </main>
  );
}

type CaseRow = Awaited<ReturnType<typeof listPublishedCases>>[number];

function CaseDossier({ caseData }: { caseData: CaseRow }) {
  return (
    <Link
      to="/cases/$caseId"
      params={{ caseId: caseData.id }}
      className="group relative block"
    >
      {/* Folder tab */}
      <div
        className="absolute -top-[10px] left-8 h-[10px] w-24 border border-b-0 border-paper-edge"
        style={{ backgroundColor: "var(--folder)" }}
      />

      <article
        className="relative overflow-hidden border border-paper-edge shadow-dossier transition-shadow duration-300 group-hover:shadow-[0_8px_48px_oklch(0.18_0.025_60/30%)]"
        style={{ backgroundColor: "var(--paper)" }}
      >
        {/* Subtle noise */}
        <div className="pointer-events-none absolute inset-0 opacity-30 paper-noise" />

        {/* Left spine */}
        <div className="absolute bottom-0 left-0 top-0 w-[6px]" style={{ backgroundColor: "var(--folder)" }} />

        <div className="relative pl-8 pr-6 py-7">
          {/* Top bar: code + stamp */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-ink-muted">
                Processo nº
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-ink">
                {caseData.code}
              </p>
            </div>
            <div
              className="rotate-[-4deg] border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
              style={{ borderColor: "var(--stamp)", color: "var(--stamp)" }}
            >
              {caseData.is_final ? "Final" : "Confidential"}
            </div>
          </div>

          {/* Case number + title */}
          <div className="mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted">
              Caso {String(caseData.number).padStart(3, "0")}
            </span>
            <h2 className="mt-1 font-display text-3xl uppercase leading-none text-ink sm:text-4xl">
              {caseData.title}
            </h2>
            {caseData.subtitle && (
              <p className="mt-1.5 text-sm italic text-ink-muted">{caseData.subtitle}</p>
            )}
          </div>

          {/* Summary excerpt */}
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {caseData.summary}
          </p>

          {/* Meta row */}
          <div className="mt-6 flex items-center justify-between border-t border-paper-edge pt-4">
            <div className="flex items-center gap-1.5">
              <Stamp className="size-3 text-bronze" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                {"★".repeat(caseData.difficulty)}{"☆".repeat(5 - caseData.difficulty)}
              </span>
            </div>
            <span
              className="font-mono text-[9px] uppercase tracking-[0.3em] transition-colors duration-200 group-hover:text-ink"
              style={{ color: "var(--bronze)" }}
            >
              Abrir arquivo →
            </span>
          </div>
        </div>

        {/* Clip decoration */}
        <div
          className="absolute right-5 -top-3 h-6 w-3 rounded-sm border border-paper-edge"
          style={{ backgroundColor: "var(--paper-dark)" }}
        />
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center">
      <FileLock2 className="mx-auto mb-6 size-12 text-ink-muted/40" strokeWidth={1} />
      <p className="font-display text-3xl uppercase text-ink-muted">Nenhum caso publicado</p>
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-muted/60">
        Acesse o painel administrativo para cadastrar casos
      </p>
      <Link
        to="/admin"
        className="mt-8 inline-flex items-center gap-2 border border-ink/40 px-6 py-2 font-mono text-xs uppercase tracking-[0.25em] text-ink-muted transition-colors hover:bg-ink hover:text-paper"
      >
        → Admin
      </Link>
    </div>
  );
}
