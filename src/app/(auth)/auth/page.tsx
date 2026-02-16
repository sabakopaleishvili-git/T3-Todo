import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 text-center">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-white/80">
          Sign in to create tasks, assign them, and track progress.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/api/auth/signin?callbackUrl=/tasks"
            className="mt-6 inline-block rounded-md bg-white/15 px-5 py-2.5 font-semibold hover:bg-white/25"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="mt-2 inline-block rounded-md bg-white/15 px-5 py-2.5 font-semibold hover:bg-white/25"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
