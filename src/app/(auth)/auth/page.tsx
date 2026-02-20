import Link from "next/link";
import ThemeToggle from "_components/ThemeToggle";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-slate-900 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-7 text-center shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/75">
        <p className="text-sm font-medium tracking-widest text-blue-600 uppercase dark:text-blue-300">
          TaskFlow
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Sign in to create tasks, assign them, and track progress.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/api/auth/signin?callbackUrl=/tasks"
            className="inline-block rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-block rounded-md border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
