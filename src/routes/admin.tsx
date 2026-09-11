import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileLock2,
  LogOut,
  Plus,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Scale,
  BookOpen,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listAllCases, deleteCaseById, duplicateCaseById, toggleCaseStatus } from "@/lib/cases.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Tribunal dos Carros Autônomos" }],
  }),
  component: AdminPage,
});

// ─── Top-level page: delegates to Login or Dashboard ─────────────────────────

function AdminPage() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return <LoginScreen />;
  }

  return <AdminDashboard email={auth.user.email ?? ""} />;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credenciais inválidas. Verifique e-mail e senha.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--paper)" }}>
      {/* Paper noise */}
      <div className="pointer-events-none fixed inset-0 opacity-30 paper-noise" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <Scale className="mx-auto mb-5 size-8 text-bronze" strokeWidth={1.5} />
          <h1 className="font-display text-4xl uppercase text-ink">Tribunal Admin</h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            Acesso restrito
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="border border-paper-edge bg-paper p-8 shadow-dossier"
        >
          <div className="mb-5">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-paper-edge bg-paper px-3 py-2.5 font-mono text-sm text-ink outline-none ring-0 transition-colors focus:border-ink placeholder:text-ink-muted/50"
              placeholder="admin@exemplo.com"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-paper-edge bg-paper px-3 py-2.5 font-mono text-sm text-ink outline-none ring-0 transition-colors focus:border-ink"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 border border-stamp/40 bg-stamp/5 px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0 text-stamp" />
              <p className="font-mono text-xs text-stamp">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-xs uppercase tracking-[0.25em] text-paper transition-colors hover:bg-ink/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted hover:text-ink">
            ← Voltar ao tribunal
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const publishedCount = cases.filter((c) => c.status === "published").length;
  const draftCount = cases.filter((c) => c.status === "draft").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Scale className="size-5 text-bronze" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Tribunal dos Carros Autônomos
              </p>
              <p className="font-mono text-xs font-bold text-foreground">
                Administrative Control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
              {email}
            </span>
            <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Tribunal →
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        {/* Stats row */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total de casos" value={cases.length} icon={FileText} />
          <StatCard label="Publicados" value={publishedCount} icon={BookOpen} accent="bronze" />
          <StatCard label="Rascunhos" value={draftCount} icon={FileLock2} className="col-span-2 sm:col-span-1" />
        </div>

        {/* Cases table header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Casos ({cases.length})
          </h2>
          <Link to="/admin/cases/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Novo caso
            </Button>
          </Link>
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
      </main>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
