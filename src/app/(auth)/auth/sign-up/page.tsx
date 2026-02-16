"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

import Button from "_components/Button";
import Input from "_components/Input";

const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to create account.");
        return;
      }

      router.push("/auth?registered=1");
    } catch {
      setError("Unable to create account.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 text-center">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <p className="mt-2 text-white/80">
          Create an account to create tasks, assign them, and track progress.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" className="mt-3 w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        <p className="mt-2 text-white/80">
          Already have an account? <Link href="/auth">Sign In</Link>
        </p>
      </div>
    </main>
  );
};

export default SignUpPage;
