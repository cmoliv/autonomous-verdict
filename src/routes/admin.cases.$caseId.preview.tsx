import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedCase, listAllCases } from "@/lib/cases.functions";
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
    // Try published first, fall back to admin fetch (for drafts)
    try {
      return await getPublishedCase({ data: { id: params.caseId } });
    } catch {
      // Case might be a draft — we'll handle this properly in a future session
      // when we add an authenticated getCase server function
      throw notFound();
    }
  },
  component: PreviewPage,
});

function PreviewPage() {
  const data = Route.useLoaderData();
  return <TrialExperience data={data} preview />;
}
