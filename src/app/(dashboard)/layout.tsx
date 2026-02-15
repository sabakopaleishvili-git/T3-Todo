import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/tasks" className="font-semibold hover:underline">
          Tasks
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src={session?.user.image ?? "/placeholder.svg"}
              alt="User avatar"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="text-sm text-white/80">
              {session?.user.name ?? session?.user.email ?? "Logged in"}
            </span>
          </div>
          <Link
            href="/api/auth/signout"
            className="rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
          >
            Sign out
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
