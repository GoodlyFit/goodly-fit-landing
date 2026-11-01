// Administración de usuarios (solo administradores). Las contraseñas se generan acá y se muestran una sola vez.
import { db } from "@/lib/db";
import { currentUser, hashPassword, generarPassword } from "@/lib/auth";
export const dynamic = "force-dynamic";

const lista = () => db.user.findMany({ orderBy: [{ rol: "desc" }, { nombre: "asc" }], select: { id: true, usuario: true, nombre: true, rol: true, clientId: true, admin: true } });
const json = (d, status = 200) => Response.json(d, { status, headers: { "Cache-Control": "no-store" } });

async function admin() {
  const u = await currentUser();
  return u && u.admin && u.rol === "equipo" ? u : null;
}

export async function GET() {
  if (!(await admin())) return json({ error: "Sin permiso" }, 403);
  const clientes = await db.client.findMany({ orderBy: { orden: "asc" }, select: { id: true, nombre: true } });
  return json({ usuarios: await lista(), clientes });
}

export async function POST(req) {
  const yo = await admin();
  if (!yo) return json({ error: "Sin permiso" }, 403);
  const { accion, id, usuario, nombre, rol, clientId } = await req.json();
  try {
    if (accion === "crear") {
      const u = String(usuario || "").trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,30}$/.test(u)) return json({ error: "El usuario tiene que tener entre 3 y 30 caracteres: letras, números, punto, guion." }, 400);
      if (!String(nombre || "").trim()) return json({ error: "Falta el nombre." }, 400);
      const r = rol === "cliente" ? "cliente" : "equipo";
      if (r === "cliente" && !(await db.client.findUnique({ where: { id: String(clientId || "") } }))) return json({ error: "Elegí el cliente." }, 400);
      if (await db.user.findUnique({ where: { usuario: u } })) return json({ error: "Ese usuario ya existe." }, 400);
      const pw = generarPassword();
      await db.user.create({ data: { usuario: u, nombre: String(nombre).trim(), rol: r, clientId: r === "cliente" ? clientId : null, passHash: hashPassword(pw) } });
      return json({ usuarios: await lista(), credencial: { usuario: u, pw } });
    }
    const obj = await db.user.findUnique({ where: { id: Number(id) } });
    if (!obj) return json({ error: "No existe ese usuario." }, 404);
    if (obj.id === yo.id) return json({ error: "Tu propio usuario se cambia desde “Cambiar contraseña”." }, 400);
    if (accion === "reset") {
      const pw = generarPassword();
      await db.user.update({ where: { id: obj.id }, data: { passHash: hashPassword(pw) } });
      return json({ usuarios: await lista(), credencial: { usuario: obj.usuario, pw } });
    }
    if (accion === "borrar") {
      await db.user.delete({ where: { id: obj.id } });
      return json({ usuarios: await lista() });
    }
    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "No se pudo guardar." }, 500);
  }
}
