// Un solo endpoint para todas las acciones de la interfaz. Cada acción guarda y devuelve el estado completo.
import { db, hoy } from "@/lib/db";
import { getState } from "@/lib/state";
import { currentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

const CLIENT_FIELDS = {
  hace: "hace", noHace: "noHace", publico: "publico", oferta: "oferta", tono: "tono", reglas: "reglasProd",
  drive: "drive", meta: "metaId", video: "cuotaVideo", imagen: "cuotaImagen", nombre: "nombre", rubro: "rubro", zona: "zona",
  planTitulo: "planTitulo", planInicio: "planInicio", planFin: "planFin",
};
const touch = (clientId) => db.client.updateMany({ where: { id: clientId, NOT: { estado: "Sin cargar" } }, data: { actualizado: hoy() } });
const nota = (clientId, autor, texto) => db.note.create({ data: { clientId, fecha: hoy(), autor, texto } });

const handlers = {
  async "piece.move"({ id, etapa, nombreEtapa }, quien) {
    const p = await db.piece.findUniqueOrThrow({ where: { id } });
    if (p.etapa === etapa) return;
    await db.pieceEvent.create({ data: { pieceId: id, etapa: p.etapa, fecha: hoy(), autor: quien } });
    await db.piece.update({ where: { id }, data: { etapa, desde: hoy() } });
    await nota(p.clientId, quien, `${p.titulo}: pasó a ${(nombreEtapa || etapa).toLowerCase()}.`);
    await touch(p.clientId);
  },
  async "piece.update"({ id, titulo, angulo, ganchos, link, valor }) {
    const data = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (angulo !== undefined) data.angleId = angulo ? Number(angulo) : null;
    if (ganchos !== undefined) data.ganchos = Number(ganchos) || 0;
    if (link) data[{ guion: "linkGuion", crudos: "linkCrudos", final: "linkFinal" }[link]] = valor || "";
    await db.piece.update({ where: { id }, data });
  },
  async "piece.create"({ clientId, tipo, etapa, mes }, quien) {
    const n = await db.piece.count({ where: { clientId, tipo, mes } });
    const p = await db.piece.create({ data: { clientId, tipo, mes, etapa, desde: hoy(), titulo: `${tipo === "video" ? "Video" : "Imagen"} ${n + 1}` } });
    await touch(clientId);
    return { created: p.id };
  },
  async "request.create"({ clientId, texto, fuera }, quien) {
    await db.request.create({ data: { clientId, fecha: hoy(), texto, fuera: !!fuera } });
    await touch(clientId);
  },
  async "request.close"({ id }, quien) {
    const r = await db.request.update({ where: { id }, data: { ok: true } });
    await nota(r.clientId, quien, `Resuelto: ${r.texto}`);
    await touch(r.clientId);
  },
  async "note.create"({ clientId, texto }, quien) { await nota(clientId, quien, texto); await touch(clientId); },
  async "onboarding.next"({ clientId }, quien) {
    const steps = await db.onboardingStep.findMany({ where: { clientId }, orderBy: { orden: "asc" } });
    const i = steps.findIndex((s) => !s.ok);
    if (i < 0) return;
    await db.onboardingStep.update({ where: { id: steps[i].id }, data: { ok: true } });
    if (steps[i + 1]) await db.onboardingStep.update({ where: { id: steps[i + 1].id }, data: { desde: hoy() } });
    else await db.client.update({ where: { id: clientId }, data: { estado: "Activo" } });
    await nota(clientId, quien, `Onboarding: ${steps[i].nombre}.`);
    await touch(clientId);
  },
  async "sale.create"({ clientId, fecha, nombre, estado, plan, monto, anuncio }) {
    const conMonto = estado === "Compró" || estado === "Seña";
    await db.sale.create({ data: { clientId, fecha, nombre, estado, plan: conMonto ? plan || "" : "", monto: conMonto ? Number(monto) || 0 : 0, anuncio: anuncio || "No sabe" } });
  },
  async "sale.delete"({ id }) { await db.sale.delete({ where: { id } }); },
  async "angle.create"({ clientId, nombre, hipotesis }) { await db.angle.create({ data: { clientId, nombre, hipotesis: hipotesis || "", estado: "idea" } }); await touch(clientId); },
  async "angle.update"({ id, estado }) { await db.angle.update({ where: { id }, data: { estado } }); },
  async "review.create"({ clientId, decisiones }, quien) {
    await db.review.create({ data: { clientId, fecha: hoy(), autor: quien, decisiones: JSON.stringify(decisiones) } });
    await touch(clientId);
  },
  async "client.update"({ id, campo, valor }) {
    const col = CLIENT_FIELDS[campo];
    if (!col) throw new Error("Campo no editable: " + campo);
    await db.client.update({ where: { id }, data: { [col]: ["cuotaVideo", "cuotaImagen"].includes(col) ? Number(valor) || 0 : valor } });
  },
  async "metric.set"({ clientId, mes, campo, valor }) {
    const col = { inv: "inversion", conv: "conversaciones" }[campo];
    const v = col === "inversion" ? Number(valor) || 0 : Math.round(Number(valor) || 0);
    await db.monthMetric.upsert({ where: { clientId_mes: { clientId, mes } }, create: { clientId, mes, [col]: v }, update: { [col]: v } });
  },
  // Formulario de "Puesta al día"
  async "status.save"({ clientId, d, mes, etapasNombre }, quien) {
    const fecha = hoy();
    await db.client.update({ where: { id: clientId }, data: { estado: d.estado, revision: d.revision, cuotaVideo: d.cuota.video, cuotaImagen: d.cuota.imagen, actualizado: fecha } });
    if (d.estado === "Onboarding") {
      const steps = await db.onboardingStep.findMany({ where: { clientId }, orderBy: { orden: "asc" } });
      for (const [i, s] of steps.entries()) await db.onboardingStep.update({ where: { id: s.id }, data: { ok: !!d.onb[i] } });
      const nx = steps.find((s, i) => !d.onb[i]);
      if (nx && !nx.desde) await db.onboardingStep.update({ where: { id: nx.id }, data: { desde: fecha } });
    }
    if (d.estado === "Activo") {
      const keep = [];
      for (const tipo of ["video", "imagen"]) {
        for (const [i, r] of d[tipo].entries()) {
          const desde = new Date(fecha + "T12:00:00Z"); desde.setUTCDate(desde.getUTCDate() - (Number(r.dias) || 0));
          const data = { titulo: (r.titulo || "").trim() || `${tipo === "video" ? "Video" : "Imagen"} ${i + 1}`, angleId: r.angulo ? Number(r.angulo) : null, etapa: r.etapa, desde: desde.toISOString().slice(0, 10) };
          if (r.pid) {
            const p = await db.piece.findUnique({ where: { id: r.pid } });
            if (p && p.etapa !== r.etapa) await db.pieceEvent.create({ data: { pieceId: p.id, etapa: p.etapa, fecha, autor: quien } });
            await db.piece.update({ where: { id: r.pid }, data });
            keep.push(r.pid);
          } else {
            const p = await db.piece.create({ data: { clientId, mes, tipo, ...data } });
            keep.push(p.id);
          }
        }
      }
      await db.piece.deleteMany({ where: { clientId, mes, id: { notIn: keep } } });
    }
    for (const [campo, fuera] of [["dentro", false], ["fuera", true]])
      for (const t of (d[campo] || "").split("\n").map((x) => x.trim()).filter(Boolean))
        await db.request.create({ data: { clientId, fecha, texto: t, fuera } });
    await nota(clientId, quien, "Estado actualizado" + (d.nota ? ": " + d.nota : "."));
  },
};

const PERMITIDO_CLIENTE = new Set(["sale.create", "sale.delete"]);

export async function POST(req) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sesión vencida. Volvé a ingresar." }, { status: 401 });
  const { type, quien: _ignorado, ...payload } = await req.json();
  const h = handlers[type];
  if (!h) return Response.json({ error: `Acción desconocida: ${type}` }, { status: 400 });
  if (user.rol === "cliente") {
    if (!PERMITIDO_CLIENTE.has(type)) return Response.json({ error: "Sin permiso" }, { status: 403 });
    if (type === "sale.create" && payload.clientId !== user.clientId) return Response.json({ error: "Sin permiso" }, { status: 403 });
    if (type === "sale.delete") {
      const v = await db.sale.findUnique({ where: { id: payload.id } });
      if (!v || v.clientId !== user.clientId) return Response.json({ error: "Sin permiso" }, { status: 403 });
    }
  }
  try {
    const extra = (await h(payload, user.nombre)) || {};
    const s = await getState();
    if (user.rol === "cliente") s.clientes = s.clientes.filter((c) => c.id === user.clientId);
    return Response.json({ ...s, ...extra });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
