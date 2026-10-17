// Inicio de sesión: contraseñas con scrypt y sesión en una cookie firmada (HMAC con AUTH_SECRET).
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const BASE = "/centrocontrol";
const COOKIE = "gc_session";
const DIAS = 30;
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("Falta AUTH_SECRET (mínimo 32 caracteres)");
  return s;
};

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(pw, salt, 64).toString("hex");
}
export function checkPassword(pw, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

export function sessionCookie(userId) {
  const payload = Buffer.from(JSON.stringify({ u: userId, exp: Date.now() + DIAS * 864e5 })).toString("base64url");
  return {
    name: COOKIE, value: payload + "." + sign(payload),
    options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: BASE, maxAge: DIAS * 86400 },
  };
}
export const clearCookie = () => ({ name: COOKIE, value: "", options: { path: BASE, maxAge: 0 } });

export async function currentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const good = sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (Date.now() > exp) return null;
  return db.user.findUnique({ where: { id: u }, select: { id: true, usuario: true, nombre: true, rol: true, clientId: true } });
}
