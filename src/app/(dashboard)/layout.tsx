import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/tasks"
              className="text-lg font-semibold tracking-tight text-slate-100 transition hover:text-blue-300"
            >
              TaskFlow
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/tasks"
                className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
              >
                Tasks
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-normal">
            <div className="flex items-center gap-2.5 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1.5">
              <Image
                src={session?.user.image ?? "/people.png"}
                alt="User avatar"
                width={30}
                height={30}
                className="rounded-full border border-slate-600"
              />
              <span className="max-w-[160px] truncate text-sm text-slate-300 sm:max-w-none">
                {session?.user.name ?? session?.user.email ?? "Logged in"}
              </span>
            </div>
            <Link
              href="/api/auth/signout"
              className="rounded-md border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/70"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
