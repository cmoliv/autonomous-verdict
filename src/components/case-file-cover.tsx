import { FileLock2, Gauge, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCase } from "@/lib/cases.functions";

export function CaseFileCover({ caseData, onOpen }: { caseData: PublicCase; onOpen?: () => void }) {
  return (
    <article className="file-cover relative mx-auto w-full max-w-4xl overflow-hidden border border-paper-edge bg-paper text-ink shadow-dossier">
      <div className="paper-noise absolute inset-0 opacity-50" />
      <div className="relative grid min-h-[620px] grid-cols-[44px_1fr] sm:grid-cols-[64px_1fr]">
        <div className="border-r border-paper-edge bg-folder" />
        <div className="flex flex-col px-7 py-9 sm:px-14 sm:py-12">
          <div className="flex items-start justify-between gap-4 border-b border-ink/30 pb-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em]">Classificação restrita</p>
              <p className="mt-2 font-mono text-xs">PROCESSO {caseData.code}</p>
            </div>
            <div className="rotate-[-5deg] border-2 border-stamp px-3 py-1 font-mono text-xs font-bold uppercase text-stamp">Confidential</div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <FileLock2 className="mb-6 size-10 text-bronze" strokeWidth={1.5} />
            <p className="font-mono text-xs uppercase tracking-[0.34em]">Autonomous vehicle</p>
            <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-none sm:text-6xl">Investigation File</h1>
            <div className="my-7 h-px w-24 bg-ink/40" />
            <p className="font-mono text-sm uppercase tracking-[0.22em]">Case {String(caseData.number).padStart(3, "0")}</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold uppercase sm:text-5xl">{caseData.title}</h2>
            {caseData.subtitle && <p className="mt-3 text-base italic text-ink-muted sm:text-lg">{caseData.subtitle}</p>}
          </div>
          <div className="grid gap-5 border-t border-ink/30 pt-5 font-mono text-[11px] uppercase sm:grid-cols-3">
            <span className="flex items-center gap-2"><Stamp className="size-4" /> Status: sob análise</span>
            <span className="flex items-center gap-2"><Gauge className="size-4" /> Dificuldade: {"★".repeat(caseData.difficulty)}{"☆".repeat(5 - caseData.difficulty)}</span>
            <span>Jurisdição: tribunal acadêmico</span>
          </div>
          {onOpen && <Button variant="file" size="xl" className="mx-auto mt-8" onClick={onOpen}>Abrir arquivo</Button>}
        </div>
      </div>
    </article>
  );
}
