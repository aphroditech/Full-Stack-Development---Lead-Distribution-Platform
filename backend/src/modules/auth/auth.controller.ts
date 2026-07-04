import type { RequestHandler } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/jwt";
import { HttpError } from "../../lib/http-error";

function publicUser(u: User) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Same message for unknown user and wrong password (avoid user enumeration).
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw HttpError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ token, user: publicUser(user) });
};

export const me: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw HttpError.unauthorized();
  res.json({ user: publicUser(user) });
};
