import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewWidgetWizard } from "@/components/dashboard/NewWidgetWizard";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function NewWidgetPage({ params }: Props) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;
  const clerkOrgId = orgId ?? userId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, organisation: { clerkOrgId } },
  });
  if (!project) notFound();

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="pt-2 pb-2">
          <Link
            href={`/dashboard/stax/${projectId}`}
            className="text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            ← {project.name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>Add widget</h1>
        </div>
        <div className="glass p-8">
          <NewWidgetWizard projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
