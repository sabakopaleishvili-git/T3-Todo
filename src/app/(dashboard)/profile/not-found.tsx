import Link from "next/link";

const NotFoundProfile = () => {
  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-sm font-medium tracking-widest text-slate-500 uppercase dark:text-slate-400">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Profile not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The profile you are looking for does not exist or is unavailable.
        </p>
        <Link
          href="/tasks"
          className="mt-5 inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
        >
          Back to tasks
        </Link>
      </div>
    </section>
  );
};

export default NotFoundProfile;
