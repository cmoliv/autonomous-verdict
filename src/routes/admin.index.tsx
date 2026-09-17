import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileLock2,
  Plus,
  Eye,
  Pencil,
  Copy,
  Trash2,
  BookOpen,
  FileText,
  Loader2,
  AlertCircle,
  Download,
  Upload,
  Copy as CopyIcon,
  Check,
  RefreshCcw,
} from "lucide-react";
import { 
  listAllCases, 
  deleteCaseById, 
  duplicateCaseById, 
  toggleCaseStatus,
  importCasesMerge,
  resetToDefaultCases
} from "@/lib/cases.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: () => listAllCases(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCaseById({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setConfirmDelete(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateCaseById({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cases"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" }) =>
      toggleCaseStatus({ data: { id, status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cases"] }),
  });

  const publishedCount = cases.filter((c) => c.status === "published").length;
  const draftCount = cases.filter((c) => c.status === "draft").length;

  return (
    <>
      {/* Stats row */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total de casos" value={cases.length} icon={FileText} />
        <StatCard label="Publicados" value={publishedCount} icon={BookOpen} accent="bronze" />
        <StatCard label="Rascunhos" value={draftCount} icon={FileLock2} className="col-span-2 sm:col-span-1" />
      </div>

      {/* Cases table header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Casos ({cases.length})
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            id="import-cases"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                const content = event.target?.result as string;
                const success = importCasesMerge(content);
                if (success) {
                  queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
                  alert("Casos importados com sucesso!");
                } else {
                  alert("Erro ao importar casos. Verifique o formato do arquivo.");
                }
              };
              reader.readAsText(file);
              e.target.value = ""; // reset
            }}
          />
          <Dialog onOpenChange={(open) => { if (!open) setCopied(false); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="size-3.5" />
                Exportar JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-paper">
              <DialogHeader>
                <DialogTitle className="font-mono text-xs uppercase tracking-widest text-ink">
                  Exportar Casos (JSON)
                </DialogTitle>
              </DialogHeader>
              <div className="relative mt-4">
                <textarea
                  readOnly
                  className="h-[60vh] w-full resize-none rounded-sm border border-paper-edge bg-paper-dark p-4 font-mono text-xs text-ink focus:outline-none"
                  value={JSON.stringify(cases, null, 2)}
                />
                <Button
                  size="sm"
                  className="absolute right-4 top-4 gap-1.5 bg-ink text-paper hover:bg-ink-muted"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(cases, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => document.getElementById("import-cases")?.click()}>
            <Upload className="size-3.5" />
            Importar
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 hover:bg-bronze hover:text-white" onClick={() => {
            if (confirm("Deseja recarregar os casos padrão do cases.json? Casos com IDs existentes serão substituídos pelos do arquivo.")) {
              resetToDefaultCases();
              queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
              queryClient.invalidateQueries({ queryKey: ["published-cases"] });
              alert("Casos padrão de cases.json recarregados com sucesso!");
            }
          }}>
            <RefreshCcw className="size-3.5" />
            Restaurar Casos Padrão
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={() => {
            if (confirm("Tem certeza que deseja zerar o progresso dos casos e o placar da sessão ativa?")) {
              localStorage.removeItem("autonomous_verdict_session_scores");
              localStorage.removeItem("autonomous_verdict_finished_cases");
              alert("Progresso e placar zerados com sucesso.");
            }
          }}>
            <RefreshCcw className="size-3.5" />
            Resetar Progresso
          </Button>
          <Link to="/admin/cases/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Novo caso
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          Erro ao carregar casos. Verifique sua autenticação.
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Cases list */}
      {!isLoading && !error && (
        <div className="rounded-md border border-border">
          {/* Table header */}
          <div className="hidden border-b border-border bg-muted/30 px-4 py-2.5 sm:grid sm:grid-cols-[2rem_1fr_6rem_5rem_5rem_5rem_1fr] sm:gap-4">
            {["#", "Título", "Dificuldade", "Evidências", "Testemunhas", "Status", "Ações"].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          {cases.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Nenhum caso cadastrado ainda.{" "}
              <Link to="/admin/cases/new" className="underline hover:text-foreground">
                Criar o primeiro caso
              </Link>
            </div>
          )}

          {cases.map((c, i) => {
            const evidenceCount = (c.evidence as unknown as { count: number }[])?.[0]?.count ?? 0;
            const witnessCount = (c.witnesses as unknown as { count: number }[])?.[0]?.count ?? 0;
            const isDeleting = deleteMutation.isPending && confirmDelete === c.id;
            const isDuplicating = duplicateMutation.isPending;

            return (
              <div
                key={c.id}
                className={cn(
                  "group grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-4 last:border-0 transition-colors hover:bg-muted/20",
                  "sm:grid-cols-[2rem_1fr_6rem_5rem_5rem_5rem_1fr] sm:items-center sm:gap-4",
                )}
              >
                {/* Number */}
                <span className="hidden font-mono text-sm text-muted-foreground sm:block">
                  {String(c.number).padStart(2, "0")}
                </span>

                {/* Title block */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground sm:hidden">
                      {String(c.number).padStart(2, "0")} ·
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {c.code}
                    </span>
                    {c.is_final && (
                      <span className="rounded-sm bg-bronze/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-bronze">
                        Final
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{c.title}</p>
                  {c.subtitle && (
                    <p className="text-xs text-muted-foreground italic">{c.subtitle}</p>
                  )}
                </div>

                {/* Difficulty */}
                <span className="hidden text-sm sm:block">
                  {"★".repeat(c.difficulty)}{"☆".repeat(5 - c.difficulty)}
                </span>

                {/* Evidence count */}
                <span className="hidden font-mono text-sm text-muted-foreground sm:block">
                  {evidenceCount}
                </span>

                {/* Witness count */}
                <span className="hidden font-mono text-sm text-muted-foreground sm:block">
                  {witnessCount}
                </span>

                {/* Status badge + toggle */}
                <div className="hidden sm:block">
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: c.id,
                        status: c.status === "published" ? "draft" : "published",
                      })
                    }
                    disabled={toggleMutation.isPending}
                    className={cn(
                      "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                      c.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-500"
                        : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600",
                    )}
                  >
                    {c.status === "published" ? "Publicado" : "Rascunho"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Preview */}
                  <Link to="/admin/cases/$caseId/preview" params={{ caseId: c.id }}>
                    <ActionBtn title="Visualizar" icon={Eye} />
                  </Link>
                  {/* Edit */}
                  <Link to="/admin/cases/$caseId" params={{ caseId: c.id }}>
                    <ActionBtn title="Editar" icon={Pencil} />
                  </Link>
                  {/* Duplicate */}
                  <ActionBtn
                    title="Duplicar"
                    icon={isDuplicating ? Loader2 : Copy}
                    disabled={isDuplicating}
                    onClick={() => duplicateMutation.mutate(c.id)}
                    iconClass={isDuplicating ? "animate-spin" : undefined}
                  />
                  {/* Delete */}
                  {confirmDelete === c.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        disabled={isDeleting}
                        className="rounded-sm bg-destructive px-2 py-1 font-mono text-[10px] uppercase text-destructive-foreground transition-colors hover:bg-destructive/80"
                      >
                        {isDeleting ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-sm px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:bg-muted"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <ActionBtn
                      title="Excluir"
                      icon={Trash2}
                      onClick={() => setConfirmDelete(c.id)}
                      className="hover:text-destructive hover:border-destructive/30"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  className,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: "bronze";
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("size-4", accent === "bronze" ? "text-bronze" : "text-muted-foreground")} strokeWidth={1.5} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={cn("font-display text-4xl", accent === "bronze" ? "text-bronze" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function ActionBtn({
  title,
  icon: Icon,
  onClick,
  disabled,
  className,
  iconClass,
}: {
  title: string;
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  iconClass?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-40",
        className,
      )}
    >
      <Icon className={cn("size-3.5", iconClass)} />
    </button>
  );
}
