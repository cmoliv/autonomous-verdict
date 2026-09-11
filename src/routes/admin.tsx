import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Scale, LogOut, Loader2, AlertCircle } from "lucide-react";
import { useAuth, mockSignIn, mockSignOut } from "@/hooks/use-auth";
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

  return <AdminLayout email={auth.user.email ?? ""} />;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("adminpassword123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mockSignIn(email, password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    }
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

// ─── Admin Layout ──────────────────────────────────────────────────────────

function AdminLayout({ email }: { email: string }) {
  async function handleSignOut() {
    mockSignOut();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
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

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
