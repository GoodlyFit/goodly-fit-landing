import { BASE } from "@/lib/auth";
export async function POST() {
  return new Response(null, { status: 303, headers: { Location: `${BASE}/login`, "Set-Cookie": `gc_session=; Path=${BASE}; Max-Age=0` } });
}
