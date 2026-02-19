import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/75 p-7 text-center shadow-2xl backdrop-blur">
        <p className="text-sm font-medium tracking-widest text-blue-300 uppercase">
          TaskFlow
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-slate-400">
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
            className="inline-block rounded-md border border-slate-600 bg-slate-800/70 px-5 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
