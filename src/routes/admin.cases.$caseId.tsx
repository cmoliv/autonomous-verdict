import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { CaseForm } from "@/components/admin/case-form";
import { getAdminCase, saveCase } from "@/lib/cases.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaseFormValues } from "@/lib/cases.schema";
import { toast } from "sonner";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/admin/cases/$caseId")({
  head: ({ loaderData }) => ({ 
    meta: [{ title: `Editar ${loaderData?.code ?? "Caso"} · Admin · Tribunal` }] 
  }),
  loader: async ({ params }) => {
    if (typeof window === "undefined") return null as any;
    try {
      return await getAdminCase({ data: { id: params.caseId } });
    } catch {
      throw notFound();
    }
  },
  component: EditCasePage,
});

function EditCasePage() {
  const caseData = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CaseFormValues) => saveCase({ data }),
    onSuccess: () => {
      toast.success("Caso atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      navigate({ to: "/admin" });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar caso: ${error.message}`);
    },
  });

  if (!caseData) return null;

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
                Editando Caso: {caseData.code}
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
          initialData={caseData}
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
        />
      </main>
    </div>
  );
}
