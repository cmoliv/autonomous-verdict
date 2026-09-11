import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedCase } from "@/lib/cases.functions";
import { TrialExperience } from "@/components/trial-experience";

export const Route = createFileRoute("/cases/$caseId")({
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.code} — ${loaderData.title} · Tribunal dos Carros Autônomos` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.code} — ${loaderData.title}` },
          { property: "og:description", content: loaderData.summary },
        ]
      : [{ title: "Caso não encontrado · Tribunal dos Carros Autônomos" }],
  }),
  loader: async ({ params }) => {
    try {
      return await getPublishedCase({ data: { id: params.caseId } });
    } catch {
      throw notFound();
    }
  },
  component: CasePage,
  notFoundComponent: CaseNotFound,
});

function CasePage() {
  const data = Route.useLoaderData();
  return <TrialExperience data={data} />;
}

function CaseNotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--stage-bg)", color: "var(--stage-muted)" }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em]">Arquivo não encontrado</p>
      <h1
        className="mt-4 font-display text-6xl uppercase"
        style={{ color: "var(--accusation)" }}
      >
        CASE NOT FOUND
      </h1>
      <a
        href="/"
        className="mt-10 border px-6 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:text-white"
        style={{ borderColor: "var(--bronze)", color: "var(--bronze)" }}
      >
        ← Voltar aos dossiês
      </a>
    </div>
  );
}
