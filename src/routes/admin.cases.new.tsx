import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CaseForm } from "@/components/admin/case-form";
import { saveCase } from "@/lib/cases.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaseFormValues } from "@/lib/cases.schema";
import { toast } from "sonner";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/admin/cases/new")({
  head: () => ({ meta: [{ title: "Novo caso · Admin · Tribunal dos Carros Autônomos" }] }),
  component: NewCasePage,
});

function NewCasePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CaseFormValues) => saveCase({ data }),
    onSuccess: () => {
      toast.success("Caso criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      navigate({ to: "/admin" });
    },
    onError: (error) => {
      toast.error(`Erro ao criar caso: ${error.message}`);
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm mb-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Scale className="size-5 text-bronze" strokeWidth={1.5} />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Tribunal Admin
              </p>
              <p className="font-mono text-xs font-bold text-foreground">
                Novo Caso
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-8">
        <CaseForm 
          onSubmit={(data) => mutation.mutate(data)} 
          isSubmitting={mutation.isPending} 
        />
      </main>
    </div>
  );
}
