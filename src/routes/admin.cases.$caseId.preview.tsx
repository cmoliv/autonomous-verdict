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
  return <TrialExperience data={data} preview />;
}
