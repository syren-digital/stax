import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StickyHeader } from "@/components/dashboard/StickyHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <main>{children}</main>
    </div>
  );
}
