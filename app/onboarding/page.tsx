import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  // Ensure the org row exists, then send them straight to the dashboard
  const clerkOrgId = orgId ?? userId;
  await prisma.organisation.upsert({
    where: { clerkOrgId },
    update: {},
    create: { clerkOrgId, name: clerkOrgId },
  });

  redirect("/dashboard");
}
