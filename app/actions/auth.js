"use server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./utils/prismaCl.js";
import { registerSchema, loginSchema } from "./types/authtypes.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";


export async function registerUser(data) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  });

  // --- generate token same as login ---
  const expiresIn = "1h";
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await prisma.userToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function loginUser(data) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "User not found" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid credentials" };

  const activeTokens = await prisma.userToken.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
  });

  if (activeTokens.length >= 3) {
    return { error: "Maximum sessions reached. Logout from other devices first." };
  }

  const expiresIn = "1h";
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });

   
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await prisma.userToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return { success: true, token };
}

export async function deleteToken(token) {
  try {
    const deleted = await prisma.userToken.deleteMany({
      where: { token },
    });

    if (deleted.count === 0) {
      return { error: "Token not found" };
    }

    return { success: true, message: "Token deleted successfully" };
  } catch (err) {
     return { error: "Failed to delete token" };
  }
}