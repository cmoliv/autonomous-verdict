import { createFileRoute, Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/admin/cases/new")({
  head: () => ({ meta: [{ title: "Novo caso · Admin · Tribunal dos Carros Autônomos" }] }),
  component: NewCasePlaceholder,
});

function NewCasePlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Construction className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <div className="text-center">
        <h1 className="font-display text-4xl uppercase text-foreground">Em Desenvolvimento</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Formulário de novo caso · Em breve
        </p>
      </div>
      <Link
        to="/admin"
        className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Voltar ao painel
      </Link>
    </div>
  );
}
