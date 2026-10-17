// Arma el estado completo con la forma que usa la interfaz (public/app.js).
import { db } from "./db";

export async function getState() {
  const rows = await db.client.findMany({
    orderBy: { orden: "asc" },
    include: {
      servicios: { orderBy: { orden: "asc" } }, kpis: { orderBy: { orden: "asc" } }, fases: { orderBy: { orden: "asc" } },
      reglas: { orderBy: { orden: "asc" } }, revisiones: { orderBy: { id: "desc" } }, angulos: { orderBy: { id: "asc" } },
      onboarding: { orderBy: { orden: "asc" } }, piezas: { orderBy: { id: "asc" }, include: { eventos: { orderBy: { id: "asc" } } } },
      pedidos: { orderBy: { id: "desc" } }, notas: { orderBy: { id: "desc" } }, ventas: { orderBy: { fecha: "desc" } }, metricas: true,
    },
  });
  return {
    clientes: rows.map((c) => ({
      id: c.id, nombre: c.nombre, rubro: c.rubro, zona: c.zona, estado: c.estado, actualizado: c.actualizado, revision: c.revision,
      cuota: { video: c.cuotaVideo, imagen: c.cuotaImagen }, drive: c.drive, meta: c.metaId, moneda: c.moneda, embudo: c.embudo,
      ficha: { hace: c.hace, noHace: c.noHace, publico: c.publico, oferta: c.oferta, tono: c.tono, reglas: c.reglasProd },
      plan: {
        titulo: c.planTitulo, inicio: c.planInicio, fin: c.planFin,
        kpis: c.kpis.map((k) => ({ id: k.id, n: k.nombre, base: k.base, obj: k.objetivo, act: k.actual, ok: k.enObjetivo })),
        fases: c.fases.map((f) => ({ id: f.id, n: f.nombre, d: f.desde, h: f.hasta, items: f.items ? f.items.split("\n").filter(Boolean) : [] })),
      },
      servicios: c.servicios.map((s) => ({ id: s.id, n: s.nombre, p: s.precio })),
      reglas: c.reglas.map((r) => ({ id: r.id, s: r.situacion, c: r.criterio, a: r.accion })),
      revisiones: c.revisiones.map((r) => ({ id: r.id, f: r.fecha, a: r.autor, dec: JSON.parse(r.decisiones || "[]") })),
      angulos: c.angulos.map((a) => ({ id: a.id, n: a.nombre, e: a.estado, h: a.hipotesis, k: a.aprendizaje })),
      onboarding: c.onboarding.map((o) => ({ id: o.id, n: o.nombre, ok: o.ok, r: o.responsable, desde: o.desde })),
      piezas: c.piezas.map((p) => ({
        id: p.id, mes: p.mes, tipo: p.tipo, titulo: p.titulo, angulo: p.angleId, etapa: p.etapa, desde: p.desde, ganchos: p.ganchos,
        links: { guion: p.linkGuion, crudos: p.linkCrudos, final: p.linkFinal }, hist: p.eventos.map((e) => ({ k: e.etapa, f: e.fecha, a: e.autor })),
      })),
      pedidos: c.pedidos.map((p) => ({ id: p.id, f: p.fecha, t: p.texto, fuera: p.fuera, ok: p.ok, r: p.responsable })),
      notas: c.notas.map((n) => ({ id: n.id, f: n.fecha, a: n.autor, t: n.texto })),
      ventas: c.ventas.map((v) => ({ id: v.id, fecha: v.fecha, nombre: v.nombre, estado: v.estado, plan: v.plan, monto: v.monto, anuncio: v.anuncio, obj: v.objecion })),
      metricas: Object.fromEntries(c.metricas.map((m) => [m.mes, { inv: m.inversion, conv: m.conversaciones, agendas: m.agendas, asist: m.asistencias, ventas: m.ventas, fact: m.facturacion }])),
    })),
  };
}
