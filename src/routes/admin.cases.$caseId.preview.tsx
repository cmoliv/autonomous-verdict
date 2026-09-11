import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAdminCase } from "@/lib/cases.functions";
import { TrialExperience } from "@/components/trial-experience";

export const Route = createFileRoute("/admin/cases/$caseId/preview")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Preview: ${loaderData.title} · Admin · Tribunal`
          : "Preview · Admin",
      },
    ],
  }),
  loader: async ({ params }) => {
    if (typeof window === "undefined") return null as any;
    try {
      return await getAdminCase({ data: { id: params.caseId } });
    } catch {
      throw notFound();
    }
  },
  component: PreviewPage,
});

function PreviewPage() {
  const data = Route.useLoaderData();
  if (!data) return null;
  return <TrialExperience data={data} preview />;
}
