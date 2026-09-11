import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Eye, FileText, Gavel, Maximize, Pause, Play, Scale, Timer, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CaseFileCover } from "@/components/case-file-cover";
import type { CaseFile, Evidence, Witness } from "@/lib/cases.functions";

type Phase = { kind: string; label: string; title: string; eyebrow: string; body?: string; evidence?: Evidence; witness?: Witness & { evidence_cards: CaseFile["witnesses"][number]["evidence_cards"] } };

function buildPhases(data: CaseFile): Phase[] {
  const phases: Phase[] = [
    { kind: "cover", label: "Arquivo", title: data.title, eyebrow: data.code },
    { kind: "incident", label: "Incidente", title: "Relatório do incidente", eyebrow: "Incident report", body: data.description },
    { kind: "decision", label: "Decisão", title: data.algorithm_title, eyebrow: "Algorithm decision", body: data.algorithm_description },
    { kind: "argument", label: "Acusação", title: "A acusação apresenta seus argumentos", eyebrow: "Accusation argues" },
    { kind: "argument-defense", label: "Defesa", title: "A defesa apresenta seus argumentos", eyebrow: "Defense argues" },
    ...data.evidence.map((evidence) => ({ kind: "evidence", label: `Evidência ${evidence.number}`, title: evidence.title, eyebrow: `Evidence #${String(evidence.number).padStart(2, "0")}`, body: evidence.description, evidence })),
  ];
  data.witnesses.forEach((witness) => {
    phases.push({ kind: "witness", label: `Testemunha ${witness.number}`, title: witness.name, eyebrow: "Witness statement", body: witness.mediator_intro ?? witness.description ?? undefined, witness });
    witness.evidence_cards.forEach((card) => phases.push({ kind: "card", label: "Descoberta", title: card.title, eyebrow: "New evidence discovered", body: card.content, witness }));
  });
  phases.push(
    { kind: "objection", label: "Objection", title: "OBJECTION!", eyebrow: "Contestação judicial" },
    { kind: "verdict", label: "Veredito", title: "O tribunal deve decidir", eyebrow: "The verdict", body: data.central_question },
    { kind: "score", label: "Placar", title: "Resultado do julgamento", eyebrow: "Score update" },
  );
  return phases;
}

export function TrialExperience({ data, preview = false }: { data: CaseFile; preview?: boolean }) {
  const phases = useMemo(() => buildPhases(data), [data]);
  const [index, setIndex] = useState(0);
  const [panel, setPanel] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(180);
  const [scores, setScores] = useState({ accusation: 0, defense: 0 });
  const phase = phases[index];

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "h") setPanel((value) => !value);
      if (event.key === "ArrowRight") setIndex((value) => Math.min(phases.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [phases.length]);

  useEffect(() => {
    if (paused || seconds <= 0 || phase.kind === "cover") return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [paused, seconds, phase.kind]);

  const next = () => { setIndex((value) => Math.min(phases.length - 1, value + 1)); setSeconds(180); };
  const previous = () => { setIndex((value) => Math.max(0, value - 1)); setSeconds(180); };
  if (phase.kind === "cover") return <main className="trial-stage min-h-screen px-4 py-10 sm:px-8"><CaseFileCover caseData={data} onOpen={next} /></main>;

  const isAccusation = phase.kind === "argument" || phase.kind === "objection";
  const isDefense = phase.kind === "argument-defense";
  return (
    <main className={`trial-stage relative flex min-h-screen flex-col overflow-hidden ${isAccusation ? "stage-accusation" : isDefense ? "stage-defense" : ""}`}>
      <header className="flex items-center justify-between border-b border-stage-line px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><Scale className="size-5 text-bronze" /><div><p className="font-mono text-[10px] uppercase text-stage-muted">Tribunal dos Carros Autônomos</p><p className="font-display text-sm uppercase">{data.code} · {data.title}</p></div></div>
        <div className="flex items-center gap-2">
          {preview && <span className="border border-bronze px-2 py-1 font-mono text-[10px] uppercase text-bronze">Preview</span>}
          <span className="hidden font-mono text-xs text-stage-muted sm:block">{index + 1} / {phases.length}</span>
          <Button variant="stageGhost" size="icon" aria-label="Tela cheia" onClick={() => document.documentElement.requestFullscreen?.()}><Maximize /></Button>
        </div>
      </header>
      <section className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-12">
        <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.24em] text-stage-muted">{phase.eyebrow}</div>
        <div className="w-full max-w-5xl text-center">
          {phase.kind === "incident" && <FileText className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "decision" && <Eye className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "witness" && <Users className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "verdict" && <Gavel className="mx-auto mb-7 size-14 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "objection" && <AlertTriangle className="mx-auto mb-7 size-16 text-accusation" />}
          {phase.kind === "card" && <div className="mx-auto mb-7 w-fit border border-bronze px-4 py-2 font-mono text-xs uppercase text-bronze">Processing evidence · Complete</div>}
          <h1 className={`font-display font-semibold uppercase leading-[0.95] ${phase.kind === "objection" ? "text-6xl text-accusation sm:text-8xl" : "text-4xl sm:text-7xl"}`}>{phase.title}</h1>
          {phase.body && <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-stage-muted sm:text-2xl">{phase.body}</p>}
          {phase.kind === "incident" && data.incident_data && <IncidentGrid data={data.incident_data} />}
          {phase.kind === "decision" && data.algorithm_justification && <details className="mx-auto mt-8 max-w-2xl border-t border-stage-line pt-5 text-left"><summary className="cursor-pointer font-mono text-xs uppercase text-bronze">Revelar justificativa conhecida</summary><p className="mt-4 text-stage-muted">{data.algorithm_justification}</p></details>}
          {phase.kind === "witness" && phase.witness?.video_path && <video className="mx-auto mt-8 max-h-[42vh] w-full max-w-3xl" controls src={phase.witness.video_path} />}
          {phase.kind === "witness" && !phase.witness?.video_path && <div className="mx-auto mt-8 flex h-40 max-w-2xl items-center justify-center border border-stage-line bg-stage-panel"><Play className="size-10 text-bronze" /><span className="ml-3 font-mono text-xs uppercase text-stage-muted">Registro audiovisual não anexado</span></div>}
          {phase.kind === "score" && <Scoreboard scores={scores} points={data.points} onScore={(side) => setScores((old) => ({ ...old, [side]: old[side] + data.points }))} />}
        </div>
      </section>
      <footer className="flex items-center justify-between border-t border-stage-line px-4 py-4 sm:px-8">
        <Button variant="stageGhost" onClick={previous} disabled={index === 0}><ArrowLeft /> Anterior</Button>
        <div className="flex items-center gap-2 font-mono text-sm text-stage-muted"><Timer className="size-4" />{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}<Button variant="stageGhost" size="icon" aria-label={paused ? "Continuar" : "Pausar"} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button></div>
        <Button variant="stage" onClick={next} disabled={index === phases.length - 1}>Próximo <ArrowRight /></Button>
      </footer>
      {panel && <aside className="absolute right-5 top-20 z-20 w-[min(360px,calc(100%-40px))] border border-bronze bg-stage-panel p-5 shadow-2xl"><p className="font-mono text-xs uppercase text-bronze">Presenter panel</p><p className="mt-4 text-sm text-stage-muted">Fase atual</p><p className="font-display text-xl uppercase">{phase.label}</p><p className="mt-4 text-sm text-stage-muted">Próximo</p><p>{phases[index + 1]?.label ?? "Fim da sessão"}</p><div className="mt-5 flex gap-2"><Button variant="stage" onClick={next}>Próximo</Button><Button variant="stageGhost" onClick={() => setPaused(!paused)}>{paused ? "Continuar" : "Pausar"}</Button></div></aside>}
    </main>
  );
}

function IncidentGrid({ data }: { data: NonNullable<CaseFile["incident_data"]> }) {
  const rows = [["Passageiros", data.passengers], ["Pedestres", data.pedestrians], ["Tempo para decisão", data.decision_time != null ? `${data.decision_time}s` : null], ["Velocidade", data.vehicle_speed != null ? `${data.vehicle_speed} km/h` : null], ["Sobrevivência", data.survival_probability != null ? `${data.survival_probability}%` : null], ["Condição", data.weather]];
  return <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 border-l border-t border-stage-line sm:grid-cols-3">{rows.filter(([, value]) => value != null).map(([label, value]) => <div key={String(label)} className="border-b border-r border-stage-line p-4 text-left"><p className="font-mono text-[10px] uppercase text-stage-muted">{label}</p><p className="mt-1 font-display text-xl uppercase">{value}</p></div>)}</div>;
}

function Scoreboard({ scores, points, onScore }: { scores: { accusation: number; defense: number }; points: number; onScore: (side: "accusation" | "defense") => void }) {
  return <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-px bg-stage-line"><button className="bg-stage-panel p-8 text-accusation" onClick={() => onScore("accusation")}><span className="font-mono text-xs uppercase">Acusação</span><strong className="mt-3 block font-display text-6xl">{scores.accusation}</strong><span className="text-xs">+ {points} {points === 1 ? "ponto" : "pontos"}</span></button><button className="bg-stage-panel p-8 text-defense" onClick={() => onScore("defense")}><span className="font-mono text-xs uppercase">Defesa</span><strong className="mt-3 block font-display text-6xl">{scores.defense}</strong><span className="text-xs">+ {points} {points === 1 ? "ponto" : "pontos"}</span></button></div>;
}
