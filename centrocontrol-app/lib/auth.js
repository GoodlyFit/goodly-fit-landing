// Inicio de sesión: contraseñas con scrypt y sesión en una cookie firmada (HMAC con AUTH_SECRET).
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const BASE = "/centrocontrol";
const COOKIE = "gc_session";
const DIAS = 30;
// Clave para firmar sesiones: AUTH_SECRET si está definida; si no, una clave aleatoria guardada en la base.
let _secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32 ? process.env.AUTH_SECRET : null;
async function secret() {
  if (_secret) return _secret;
  const row = await db.config.findUnique({ where: { clave: "auth_secret" } });
  if (row) return (_secret = row.valor);
  const valor = crypto.randomBytes(48).toString("base64url");
  await db.config.upsert({ where: { clave: "auth_secret" }, create: { clave: "auth_secret", valor }, update: {} });
  return (_secret = (await db.config.findUnique({ where: { clave: "auth_secret" } })).valor);
}

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
const sign = async (data) => crypto.createHmac("sha256", await secret()).update(data).digest("base64url");

export async function sessionCookie(userId) {
  const payload = Buffer.from(JSON.stringify({ u: userId, exp: Date.now() + DIAS * 864e5 })).toString("base64url");
  return {
    name: COOKIE, value: payload + "." + (await sign(payload)),
    options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: BASE, maxAge: DIAS * 86400 },
  };
}
export const clearCookie = () => ({ name: COOKIE, value: "", options: { path: BASE, maxAge: 0 } });

export async function currentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const good = await sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (Date.now() > exp) return null;
  return db.user.findUnique({ where: { id: u }, select: { id: true, usuario: true, nombre: true, rol: true, clientId: true } });
}
