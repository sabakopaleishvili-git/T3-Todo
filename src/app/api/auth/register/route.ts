import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  password: z.string().min(8).max(72),
});

const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists for this email." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await db.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 },
    );
  }
}
