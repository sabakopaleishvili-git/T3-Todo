import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "~/server/auth";
import ThemeToggle from "_components/ThemeToggle";

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
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/tasks"
              className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300"
            >
              TaskFlow
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Link href="/tasks" className="transition hover:text-blue-600">
                Tasks
              </Link>
              <Link href="/projects" className="transition hover:text-blue-600">
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-normal">
            <ThemeToggle />
            <Link href={`/profile/${session?.user.id}`}>
              <div className="flex items-center gap-2.5 rounded-full border border-slate-300 bg-white/80 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/70">
                <Image
                  src={session?.user.image ?? "/people.png"}
                  alt="User avatar"
                  width={30}
                  height={30}
                  className="rounded-full border border-slate-300 dark:border-slate-600"
                />
                <span className="max-w-[160px] truncate text-sm text-slate-700 sm:max-w-none dark:text-slate-300">
                  {session?.user.name ?? session?.user.email ?? "Logged in"}
                </span>
              </div>
            </Link>
            <Link
              href="/api/auth/signout"
              className="rounded-md border border-slate-300 bg-white/80 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/70"
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
