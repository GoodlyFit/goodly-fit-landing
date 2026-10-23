import { db } from "@/lib/db";
import { currentUser, checkPassword, hashPassword, BASE } from "@/lib/auth";
export const dynamic = "force-dynamic";

const volver = (q) => new Response(null, { status: 303, headers: { Location: `${BASE}/cuenta${q}` } });
export async function POST(req) {
  const user = await currentUser();
  if (!user) return new Response(null, { status: 303, headers: { Location: `${BASE}/login` } });
  const f = await req.formData();
  const actual = String(f.get("actual") || ""), nueva = String(f.get("nueva") || ""), repetir = String(f.get("repetir") || "");
  const u = await db.user.findUnique({ where: { id: user.id } });
  if (!checkPassword(actual, u.passHash)) return volver("?e=actual");
  if (nueva.length < 10) return volver("?e=corta");
  if (nueva !== repetir) return volver("?e=distintas");
  await db.user.update({ where: { id: user.id }, data: { passHash: hashPassword(nueva) } });
  return volver("?ok=1");
}
