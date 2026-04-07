import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderKanban, LayoutGrid, Plus, ArrowRight, Activity } from "lucide-react";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkOrgId = orgId ?? userId;

  const [projectCount, widgetCount, recentProjects] = await Promise.all([
    prisma.project.count({ where: { organisation: { clerkOrgId } } }),
    prisma.widget.count({ where: { project: { organisation: { clerkOrgId } } } }),
    prisma.project.findMany({
      where: { organisation: { clerkOrgId } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { widgets: true } } },
    }),
  ]);

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page title */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your investor widgets overview</p>
          </div>
          <Link
            href="/dashboard/stax/new"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 accent-glow"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Stax
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4">

          {/* Stat — Projects */}
          <div className="glass col-span-4 p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(181,249,120,0.12)" }}
              >
                <FolderKanban size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
              </div>
              <Link
                href="/dashboard/stax"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10"
                style={{ color: "var(--text-muted)" }}
              >
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
            <div>
              <p className="text-4xl font-bold" style={{ color: "var(--text)" }}>{projectCount}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Stax</p>
            </div>
          </div>

          {/* Stat — Widgets */}
          <div className="glass col-span-4 p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(181,249,120,0.12)" }}
              >
                <LayoutGrid size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold" style={{ color: "var(--text)" }}>{widgetCount}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Widgets</p>
            </div>
          </div>

          {/* CTA — Quick start */}
          <div
            className="glass col-span-4 p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            style={{ borderColor: "rgba(181,249,120,0.25)" }}
          >
            {/* Glow orb */}
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
              style={{ background: "rgba(181,249,120,0.18)" }}
            />
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.12)" }}
            >
              <Activity size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Get started</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Create a Stax and add your first widget
              </p>
              <Link
                href="/dashboard/stax/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                <Plus size={12} strokeWidth={2.5} /> New Stax
              </Link>
            </div>
          </div>

          {/* Recent projects — wide card */}
          <div className="glass col-span-12 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Recent Stax
              </h2>
              <Link
                href="/dashboard/stax"
                className="flex items-center gap-1 text-xs font-medium transition-all hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                View all <ArrowRight size={12} strokeWidth={2} />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No stax yet.</p>
                <Link
                  href="/dashboard/stax/new"
                  className="mt-3 inline-block text-sm font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  Create your first Stax →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/stax/${p.id}`}
                    className="glass-sm group p-4 transition-all hover:border-white/20"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {p.name}
                      </p>
                      <ArrowRight
                        size={14}
                        strokeWidth={1.5}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: "var(--accent)" }}
                      />
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {p._count.widgets} widget{p._count.widgets !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
