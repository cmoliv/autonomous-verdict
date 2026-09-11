import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Eye, FileText, Gavel, Maximize, Pause, Play, Scale, Timer, Users, ZoomIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CaseFileCover } from "@/components/case-file-cover";
import { VideoPlayer } from "@/components/video-player";
import type { CaseFile, Evidence, Witness } from "@/lib/cases.functions";
import { playSound } from "@/lib/audio";

type Phase = { kind: string; label: string; title: string; eyebrow: string; body?: string; evidence?: Evidence; witness?: Witness & { evidence_cards: CaseFile["witnesses"][number]["evidence_cards"] } };

function buildPhases(data: CaseFile): Phase[] {
  const phases: Phase[] = [
    { kind: "cover", label: "Arquivo", title: data.title, eyebrow: data.code },
    { kind: "incident", label: "Incidente", title: "Relatório do incidente", eyebrow: "Relatório de Incidente", body: data.description },
    { kind: "decision", label: "Decisão", title: data.algorithm_title, eyebrow: "Decisão do Algoritmo", body: data.algorithm_description },
    { kind: "argument", label: "Acusação", title: "A acusação apresenta seus argumentos", eyebrow: "Argumentação da Acusação" },
    { kind: "argument-defense", label: "Defesa", title: "A defesa apresenta seus argumentos", eyebrow: "Argumentação da Defesa" },
    ...data.evidence.map((evidence) => ({ kind: "evidence", label: `Evidência ${evidence.number}`, title: evidence.title, eyebrow: `Evidência #${String(evidence.number).padStart(2, "0")}`, body: evidence.description, evidence })),
  ];
  data.witnesses.forEach((witness) => {
    phases.push({ kind: "witness", label: `Testemunha ${witness.number}`, title: witness.name, eyebrow: "Depoimento da Testemunha", body: witness.mediator_intro ?? witness.description ?? undefined, witness });
    witness.evidence_cards.forEach((card) => phases.push({ kind: "card", label: "Descoberta", title: card.title, eyebrow: "Nova evidência descoberta", body: card.content, witness }));
  });
  phases.push(
    { kind: "objection", label: "Embate", title: "EMBATE!", eyebrow: "Argumentação livre" },
    { kind: "verdict", label: "Veredito", title: "O juiz deve decidir", eyebrow: "O veredito", body: data.central_question },
    { kind: "score", label: "Placar", title: "Resultado do julgamento", eyebrow: "Atualização de Placar" },
  );
  return phases;
}

export function TrialExperience({ data, preview = false }: { data: CaseFile; preview?: boolean }) {
  const phases = useMemo(() => buildPhases(data), [data]);
  const [index, setIndex] = useState(0);
  const [panel, setPanel] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(180);
  const [scores, setScores] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("autonomous_verdict_session_scores");
      if (stored) return JSON.parse(stored);
    }
    return { accusation: 0, defense: 0 };
  });
  const [scored, setScored] = useState(false);
  const [caseWinner, setCaseWinner] = useState<"accusation" | "defense" | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showCaseWinnerModal, setShowCaseWinnerModal] = useState(false);
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

  useEffect(() => {
    if (seconds === 0 && phase.kind !== "cover") {
      playSound("alert", 0.6);
    }
  }, [seconds, phase.kind]);

  useEffect(() => {
    if (phase.kind === "objection") {
      playSound("objection", 0.8);
    } else if (phase.kind !== "cover") {
      playSound("slide", 0.3);
    }
  }, [index, phase.kind]);

  const next = () => { 
    setIndex((value) => Math.min(phases.length - 1, value + 1)); 
    setSeconds(180); 
  };
  const previous = () => { 
    setIndex((value) => Math.max(0, value - 1)); 
    setSeconds(180); 
  };
  if (phase.kind === "cover") return <main className="trial-stage min-h-screen px-4 py-10 sm:px-8"><CaseFileCover caseData={data} onOpen={next} /></main>;

  const isAccusation = phase.kind === "argument" || phase.kind === "objection";
  const isDefense = phase.kind === "argument-defense";
  return (
    <main className={`trial-stage relative flex min-h-screen flex-col overflow-hidden ${isAccusation ? "stage-accusation" : isDefense ? "stage-defense" : ""} ${phase.kind === "objection" ? "animate-red-flash animate-shake-mild" : ""}`}>
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
        <div key={`phase-${index}`} className="w-full max-w-5xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          {phase.kind === "incident" && <FileText className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "decision" && <Eye className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "witness" && <Users className="mx-auto mb-7 size-12 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "verdict" && <Gavel className="mx-auto mb-7 size-14 text-bronze" strokeWidth={1.25} />}
          {phase.kind === "objection" && <AlertTriangle className="mx-auto mb-7 size-20 text-accusation animate-in zoom-in-50 duration-300" />}
          {phase.kind === "card" ? (
            <EvidenceCardReveal title={phase.title} body={phase.body} />
          ) : (
            <>
              <h1 className={`font-display font-semibold uppercase leading-[0.95] ${phase.kind === "objection" ? "text-7xl text-accusation sm:text-9xl animate-in zoom-in-75 duration-300" : "text-4xl sm:text-7xl"}`}>{phase.title}</h1>
              
              {phase.evidence?.image_path && (
                <div className="mx-auto mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="group relative overflow-hidden border border-bronze/30 bg-stage-panel p-2 transition-all hover:border-bronze hover:shadow-[0_0_20px_rgba(186,142,83,0.2)]">
                        <img src={phase.evidence.image_path} alt={phase.title} className="max-h-56 object-contain transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <ZoomIn className="size-10 text-white" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-fit border-none bg-transparent p-0 shadow-none sm:max-w-6xl">
                      <img src={phase.evidence.image_path} alt={phase.title} className="max-h-[90vh] w-auto object-contain" />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {phase.evidence?.document_path && (
                <div className="mx-auto mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-3 border border-bronze/30 bg-stage-panel px-8 py-5 text-bronze transition-all hover:bg-bronze hover:text-stage-bg hover:shadow-[0_0_20px_rgba(186,142,83,0.3)]">
                        <FileText className="size-6" />
                        <span className="font-mono text-sm uppercase tracking-widest">Visualizar Documento</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="h-[85vh] max-w-5xl bg-stage-bg p-0 border-bronze/30 sm:h-[90vh]">
                      <iframe src={phase.evidence.document_path} className="h-full w-full border-0" title={phase.title} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {phase.body && <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-stage-muted sm:text-2xl animate-in fade-in duration-700 delay-300 fill-mode-both">{phase.body}</p>}
            </>
          )}
          {phase.kind === "incident" && data.incident_data && <IncidentGrid data={data.incident_data} />}
          {phase.kind === "decision" && data.algorithm_justification && <details className="mx-auto mt-8 max-w-2xl border-t border-stage-line pt-5 text-left"><summary className="cursor-pointer font-mono text-xs uppercase text-bronze">Revelar justificativa conhecida</summary><p className="mt-4 text-stage-muted">{data.algorithm_justification}</p></details>}
          {phase.kind === "witness" && phase.witness?.video_path && (
            <VideoPlayer 
              className="mx-auto mt-8 aspect-video w-full max-w-3xl sm:max-h-[50vh]" 
              src={phase.witness.video_path} 
              onEnded={() => {
                if (phases[index + 1]?.kind === "card") {
                  next();
                }
              }}
            />
          )}
          {phase.kind === "witness" && !phase.witness?.video_path && <div className="mx-auto mt-8 flex h-40 max-w-2xl items-center justify-center border border-stage-line bg-stage-panel"><Play className="size-10 text-bronze" /><span className="ml-3 font-mono text-xs uppercase text-stage-muted">Registro audiovisual não anexado</span></div>}
          {phase.kind === "score" && <Scoreboard scores={scores} points={data.points} disabled={scored} onScore={(side) => {
            if (scored) return;
            setScored(true);
            setCaseWinner(side);
            const newScores = { ...scores, [side]: scores[side] + data.points };
            setScores(newScores);
            localStorage.setItem("autonomous_verdict_session_scores", JSON.stringify(newScores));
          }} />}
        </div>
      </section>
      <footer className="flex items-center justify-between border-t border-stage-line px-4 py-4 sm:px-8">
        <Button variant="stageGhost" onClick={previous} disabled={index === 0}><ArrowLeft /> Anterior</Button>
        <div className="flex items-center gap-2 font-mono text-sm text-stage-muted"><Timer className="size-4" />{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}<Button variant="stageGhost" size="icon" aria-label={paused ? "Continuar" : "Pausar"} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button></div>
        {index === phases.length - 1 ? (
          <Button variant="stage" onClick={() => {
            const finished = JSON.parse(localStorage.getItem("autonomous_verdict_finished_cases") || "[]");
            if (!finished.includes(data.id)) {
              finished.push(data.id);
              localStorage.setItem("autonomous_verdict_finished_cases", JSON.stringify(finished));
            }
            if (data.is_final) {
              setShowWinnerModal(true);
            } else {
              setShowCaseWinnerModal(true);
              setTimeout(() => {
                window.location.href = "/";
              }, 4000);
            }
          }}>Encerrar Caso <ArrowRight /></Button>
        ) : (
          <Button variant="stage" onClick={next}>Próximo <ArrowRight /></Button>
        )}
      </footer>
      {panel && <aside className="absolute right-5 top-20 z-20 w-[min(360px,calc(100%-40px))] border border-bronze bg-stage-panel p-5 shadow-2xl"><p className="font-mono text-xs uppercase text-bronze">Painel do Apresentador</p><p className="mt-4 text-sm text-stage-muted">Fase atual</p><p className="font-display text-xl uppercase">{phase.label}</p><p className="mt-4 text-sm text-stage-muted">Próximo</p><p>{phases[index + 1]?.label ?? "Fim da sessão"}</p><div className="mt-5 flex gap-2"><Button variant="stage" onClick={next}>Próximo</Button><Button variant="stageGhost" onClick={() => setPaused(!paused)}>{paused ? "Continuar" : "Pausar"}</Button></div></aside>}

      {showWinnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="w-full max-w-2xl border border-bronze bg-stage-panel p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <h2 className="font-mono text-sm uppercase tracking-widest text-bronze">Veredito Final da Sessão</h2>
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className={`flex flex-col items-center ${scores.accusation > scores.defense ? "scale-110 text-accusation" : scores.defense > scores.accusation ? "opacity-50 grayscale" : "text-accusation"}`}>
                <span className="font-display text-6xl">{scores.accusation}</span>
                <span className="font-mono text-xs uppercase mt-2">Acusação</span>
              </div>
              <div className="text-stage-muted font-display text-3xl">X</div>
              <div className={`flex flex-col items-center ${scores.defense > scores.accusation ? "scale-110 text-defense" : scores.accusation > scores.defense ? "opacity-50 grayscale" : "text-defense"}`}>
                <span className="font-display text-6xl">{scores.defense}</span>
                <span className="font-mono text-xs uppercase mt-2">Defesa</span>
              </div>
            </div>
            <div className="mt-10 font-display text-4xl uppercase">
              {scores.accusation > scores.defense ? (
                <span className="text-accusation">A Acusação Venceu</span>
              ) : scores.defense > scores.accusation ? (
                <span className="text-defense">A Defesa Venceu</span>
              ) : (
                <span className="text-stage-muted">Empate</span>
              )}
            </div>
            <div className="mt-10 flex justify-center gap-4">
              <Button variant="stageGhost" onClick={() => setShowWinnerModal(false)}>Fechar</Button>
              <Button variant="stage" onClick={() => {
                localStorage.removeItem("autonomous_verdict_session_scores");
                window.location.href = "/";
              }}>Encerrar Sessão</Button>
            </div>
          </div>
        </div>
      )}

      {showCaseWinnerModal && !showWinnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="w-full max-w-2xl border border-bronze bg-stage-panel p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <h2 className="font-mono text-sm uppercase tracking-widest text-bronze">Veredito do Caso</h2>
            <div className="mt-10 font-display text-4xl uppercase">
              {caseWinner === "accusation" ? (
                <span className="text-accusation">A Acusação Venceu o Caso</span>
              ) : caseWinner === "defense" ? (
                <span className="text-defense">A Defesa Venceu o Caso</span>
              ) : (
                <span className="text-stage-muted">Nenhum Veredito</span>
              )}
            </div>
            <p className="mt-6 font-mono text-xs uppercase text-stage-muted tracking-widest animate-pulse">
              Retornando aos dossiês...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function IncidentGrid({ data }: { data: NonNullable<CaseFile["incident_data"]> }) {
  const rows = [
    ["Passageiros", data.passengers], 
    ["Pedestres", data.pedestrians], 
    ["Tempo para decisão", data.decision_time != null ? `${data.decision_time}s` : null], 
    ["Velocidade", data.vehicle_speed != null ? `${data.vehicle_speed} km/h` : null], 
    ...(data.survival_probability != null ? [["Sobrevivência (Legado)", `${data.survival_probability}%`]] : []),
    ["Condição", data.weather]
  ];
  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <div className="grid grid-cols-2 border-l border-t border-stage-line sm:grid-cols-3">
        {rows.filter(([, value]) => value != null).map(([label, value]) => (
          <div key={String(label)} className="border-b border-r border-stage-line p-4 text-left">
            <p className="font-mono text-[10px] uppercase text-stage-muted">{label}</p>
            <p className="mt-1 font-display text-xl uppercase">{value}</p>
          </div>
        ))}
      </div>
      
      {data.survival_probabilities && data.survival_probabilities.length > 0 && (
        <div className="mt-6 border border-stage-line bg-stage-panel/30">
          <div className="border-b border-stage-line p-3">
            <p className="font-mono text-xs uppercase text-bronze text-center tracking-widest">Cenários de Sobrevivência</p>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stage-line">
            {data.survival_probabilities.map((prob, i) => (
              <div key={i} className="p-4 text-left">
                <p className="font-mono text-[10px] uppercase text-stage-muted">{prob.decision}</p>
                <p className="mt-1 font-display text-2xl text-bronze">{prob.probability}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Scoreboard({ scores, points, onScore, disabled }: { scores: { accusation: number; defense: number }; points: number; onScore: (side: "accusation" | "defense") => void; disabled?: boolean }) {
  return <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-px bg-stage-line"><button className="bg-stage-panel p-8 text-accusation disabled:opacity-50 disabled:cursor-not-allowed transition-opacity" disabled={disabled} onClick={() => onScore("accusation")}><span className="font-mono text-xs uppercase">Acusação</span><strong className="mt-3 block font-display text-6xl">{scores.accusation}</strong><span className="text-xs">+ {points} {points === 1 ? "ponto" : "pontos"}</span></button><button className="bg-stage-panel p-8 text-defense disabled:opacity-50 disabled:cursor-not-allowed transition-opacity" disabled={disabled} onClick={() => onScore("defense")}><span className="font-mono text-xs uppercase">Defesa</span><strong className="mt-3 block font-display text-6xl">{scores.defense}</strong><span className="text-xs">+ {points} {points === 1 ? "ponto" : "pontos"}</span></button></div>;
}

function EvidenceCardReveal({ title, body }: { title: string; body?: string }) {
  const [status, setStatus] = useState<"processing" | "revealed">("processing");
  
  useEffect(() => {
    setStatus("processing");
    const timer = setTimeout(() => setStatus("revealed"), 3000);
    return () => clearTimeout(timer);
  }, [title, body]);

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-10 fade-in duration-300">
        <div className="relative overflow-hidden border border-bronze/30 bg-stage-panel px-12 py-16 shadow-[0_0_40px_rgba(186,142,83,0.1)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-bronze/50 shadow-[0_0_10px_2px_rgba(186,142,83,0.5)] animate-[pulse_1.5s_infinite]"></div>
          <div className="text-bronze mb-6 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Sistema analisando depoimento
          </div>
          <div className="text-3xl sm:text-5xl font-display uppercase tracking-widest text-foreground/80">
            Processando Evidência
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
      <div className="mx-auto mb-7 w-fit border border-bronze bg-bronze/10 px-4 py-2 font-mono text-xs uppercase text-bronze shadow-[0_0_15px_rgba(186,142,83,0.3)]">
        Nova Evidência Descoberta
      </div>
      <h1 className="font-display font-semibold uppercase leading-[0.95] text-4xl sm:text-7xl text-bronze">
        {title}
      </h1>
      {body && (
        <div className="mx-auto mt-8 max-w-3xl border-l-4 border-bronze bg-stage-panel p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <p className="text-lg leading-relaxed text-stage-muted sm:text-2xl font-mono">
            "{body}"
          </p>
        </div>
      )}
    </div>
  );
}
