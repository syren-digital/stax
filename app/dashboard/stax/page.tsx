import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ArrowRight, FolderKanban } from "lucide-react";
import { DeleteButton } from "@/components/dashboard/DeleteButton";

export default async function ProjectsPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkOrgId = orgId ?? userId;

  const projects = await prisma.project.findMany({
    where: { organisation: { clerkOrgId } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { widgets: true } } },
  });

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between pt-2 pb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Stax</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {projects.length} stax
            </p>
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

        {projects.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.1)" }}
            >
              <FolderKanban size={24} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text)" }}>No stax yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Create a Stax to start building widgets
            </p>
            <Link
              href="/dashboard/stax/new"
              className="mt-5 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold accent-glow"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              <Plus size={14} strokeWidth={2.5} /> New Stax
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="group relative">
                <Link
                  href={`/dashboard/stax/${project.id}`}
                  className="glass block p-6 transition-all hover:border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: "rgba(181,249,120,0.1)" }}
                    >
                      <FolderKanban size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
                    </div>
                    <ArrowRight
                      size={16}
                      strokeWidth={1.5}
                      className="opacity-0 transition-opacity group-hover:opacity-60"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold" style={{ color: "var(--text)" }}>{project.name}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                      {project._count.widgets} widget{project._count.widgets !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(project.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </Link>
                <DeleteButton
                  name={project.name}
                  deleteUrl={`/api/projects/${project.id}`}
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
