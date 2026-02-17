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
    <div className="min-h-screen bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
      <header className="sticky top-0 z-10 mx-auto flex w-full flex-col gap-3 bg-white/10 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <Link href="/tasks" className="font-semibold hover:underline">
          Tasks
        </Link>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-normal">
          <div className="flex items-center gap-2">
            <Image
              src={session?.user.image ?? "/people.png"}
              alt="User avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="max-w-[160px] truncate text-sm text-white/80 sm:max-w-none">
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
