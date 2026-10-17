import { getState } from "@/lib/state";
import { currentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sesión vencida" }, { status: 401 });
  const s = await getState();
  if (user.rol === "cliente") s.clientes = s.clientes.filter((c) => c.id === user.clientId);
  return Response.json(s);
}
