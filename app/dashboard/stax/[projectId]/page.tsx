import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/dashboard/DeleteButton";

const TYPE_LABELS = {
  share_price_number: "Share Price",
  share_price_chart: "Price Chart",
  announcements: "Announcements",
};

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;
  const clerkOrgId = orgId ?? userId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, organisation: { clerkOrgId } },
    include: {
      widgets: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between pt-2 pb-4">
          <div>
            <Link href="/dashboard/stax" className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: "var(--accent)" }}>
              ← Stax
            </Link>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>{project.name}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {project.widgets.length} widget{project.widgets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/dashboard/stax/${projectId}/widgets/new`}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 accent-glow"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            + Add widget
          </Link>
        </div>

        {project.widgets.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 text-center">
            <p className="font-semibold" style={{ color: "var(--text)" }}>No widgets yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Add a widget to start embedding data</p>
            <Link
              href={`/dashboard/stax/${projectId}/widgets/new`}
              className="mt-5 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold accent-glow"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              + Add widget
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {project.widgets.map((w) => (
              <div key={w.id} className="group relative">
                <Link
                  href={`/dashboard/stax/${projectId}/widgets/${w.id}`}
                  className="glass-sm block p-5 transition-all hover:border-white/20"
                >
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: "rgba(181,249,120,0.12)", color: "var(--accent)" }}
                  >
                    {TYPE_LABELS[w.type]}
                  </span>
                  <p className="mt-4 font-mono font-semibold" style={{ color: "var(--text)" }}>{w.ticker}</p>
                  <p className="mt-1 font-mono text-xs truncate" style={{ color: "var(--text-muted)" }}>{w.embedKey}</p>
                </Link>
                <DeleteButton
                  name={w.ticker}
                  deleteUrl={`/api/projects/${projectId}/widgets/${w.id}`}
                  className="absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-all hover:!opacity-100 group-hover:opacity-50"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
