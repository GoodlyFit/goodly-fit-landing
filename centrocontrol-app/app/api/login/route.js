import { db } from "@/lib/db";
import { checkPassword, sessionCookie, BASE } from "@/lib/auth";
export const dynamic = "force-dynamic";

const intentos = new Map(); // freno simple contra fuerza bruta, por IP
export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const reg = intentos.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - reg.t > 15 * 60e3) { reg.n = 0; reg.t = Date.now(); }
  const form = await req.formData();
  const usuario = String(form.get("usuario") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  // Location relativo: así funciona igual detrás del dominio goodlyfit.app
  const back = (q) => new Response(null, { status: 303, headers: { Location: `${BASE}/login${q}` } });
  if (reg.n >= 10) return back("?e=bloqueado");
  const user = usuario && (await db.user.findUnique({ where: { usuario } }));
  if (!user || !checkPassword(password, user.passHash)) { reg.n++; intentos.set(ip, reg); return back("?e=1"); }
  intentos.delete(ip);
  const c = sessionCookie(user.id);
  const headers = new Headers({ Location: BASE });
  headers.append("Set-Cookie", `${c.name}=${c.value}; Path=${c.options.path}; Max-Age=${c.options.maxAge}; HttpOnly; SameSite=Lax${c.options.secure ? "; Secure" : ""}`);
  return new Response(null, { status: 303, headers });
}
