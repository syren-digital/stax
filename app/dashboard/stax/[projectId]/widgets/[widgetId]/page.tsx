import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmbedSnippet } from "@/components/dashboard/EmbedSnippet";
import { StyleEditor } from "@/components/dashboard/StyleEditor";
import { PreviewFrame } from "@/components/dashboard/PreviewFrame";

const TYPE_LABELS = {
  share_price_number: "Share Price",
  share_price_chart: "Price Chart",
  announcements: "Announcements",
};

interface Props {
  params: Promise<{ projectId: string; widgetId: string }>;
}

export default async function WidgetDetailPage({ params }: Props) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId, widgetId } = await params;
  const clerkOrgId = orgId ?? userId;

  const widget = await prisma.widget.findFirst({
    where: { id: widgetId, projectId, project: { organisation: { clerkOrgId } } },
    include: { project: true },
  });
  if (!widget) notFound();

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="pt-2 pb-2">
          <Link
            href={`/dashboard/stax/${projectId}`}
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            ← {widget.project.name}
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{widget.ticker}</h1>
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold"
              style={{ background: "rgba(181,249,120,0.12)", color: "var(--accent)" }}
            >
              {TYPE_LABELS[widget.type]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EmbedSnippet embedKey={widget.embedKey} widgetType={widget.type} />
          <StyleEditor
            projectId={projectId}
            widgetId={widgetId}
            widgetType={widget.type}
            initialPrimaryColor={widget.primaryColor}
            initialSecondaryColor={widget.secondaryColor}
            initialLabelColor={widget.labelColor}
            initialFontFamily={widget.fontFamily}
            initialChartRange={widget.chartRange}
          />
        </div>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>iFrame Preview</h2>
          <div className="glass overflow-hidden">
            <PreviewFrame src={`/widget/${widget.embedKey}`} widgetType={widget.type} />
          </div>
        </section>
      </div>
    </div>
  );
}
