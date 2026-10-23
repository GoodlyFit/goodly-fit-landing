// Carga inicial de clientes. No incluye estado operativo (piezas, pedidos, notas):
// eso se carga desde "Puesta al día". Correr con: npm run db:setup
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import crypto from "node:crypto";

const db = new PrismaClient();

const ONB = ["Reunión de inicio", "Accesos: cuenta publicitaria, Instagram, WhatsApp y Drive", "Ficha del cliente completa", "Estrategia de 90 días entregada", "Estrategia validada por el cliente"];
const ONB_RESP = ["", "Cliente", "", "", "Cliente"];
const REGLAS_BASE = [
  ["Corte de anuncio", "Costo por resultado > 2× el objetivo tras 7 días", "Pausar y anotar el aprendizaje del ángulo"],
  ["Escala", "ROAS ≥ 4× y costo por resultado en objetivo", "Subir 20% el presupuesto cada 4 días"],
  ["Fatiga", "Frecuencia semanal > 2 o CTR cae 30% vs su primera semana", "Rotar a una versión nueva del mismo ángulo"],
  ["Calidad", "Cruce semanal con las ventas cargadas por el cliente", "Priorizar el ángulo con más ventas, no el de menor costo"],
];

// Los datos de los clientes viven en prisma/clientes.privado.mjs (fuera del repositorio).
// La base de producción ya está cargada; este archivo solo hace falta para recargar desde cero.
const privado = new URL("./clientes.privado.mjs", import.meta.url);
const clientes = existsSync(privado) ? (await import(privado.href)).clientes : [];

const hoy = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Buenos_Aires" }).format(new Date());

const hashPassword = (pw) => { const salt = crypto.randomBytes(16).toString("hex"); return salt + ":" + crypto.scryptSync(pw, salt, 64).toString("hex"); };

// Usuario administrador "nahuel". Con ADMIN_PASSWORD se fuerza esa contraseña en cada deploy; sin ella se usa la inicial.
async function admin() {
  const usuario = (process.env.ADMIN_USER || "nahuel").trim().toLowerCase(), pw = process.env.ADMIN_PASSWORD || "";
  const nombre = process.env.ADMIN_NAME || "Nahuel";
  // Sin ADMIN_PASSWORD: se crea solo la primera vez con la contraseña inicial (guardada como hash, nunca en texto).
  if (!pw) {
    if (await db.user.findUnique({ where: { usuario } })) return console.log(`Usuario ${usuario} ya existe.`);
    await db.user.create({ data: { usuario, nombre, rol: "equipo", passHash: "a7dd53808577e0263c6c26cbbe7f5fe4:1f4d403c6359f7cc631885d88f5c32137435c59f22cfe5d88fd13aa8fdef3ee22229958aece2e924f507581e44205724ba99146c989c4aa47860c8f8f43d8e4f" } });
    return console.log(`Usuario ${usuario} creado con la contraseña inicial.`);
  }
  await db.user.upsert({ where: { usuario }, create: { usuario, nombre, passHash: hashPassword(pw), rol: "equipo" }, update: { nombre, passHash: hashPassword(pw) } });
  console.log(`Usuario ${usuario} listo.`);
}

async function main() {
  await admin();
  if (process.argv.includes("--si-vacia") && (await db.client.count()) > 0) return console.log("La base ya tiene clientes: no se recarga.");
  await db.client.deleteMany();
  // Datos de leads: archivo local fuera del repositorio (no se publica).
  const archivo = new URL("./mateo-leads.json", import.meta.url);
  const mateo = existsSync(archivo) ? JSON.parse(readFileSync(archivo, "utf8")) : [];
  for (const [i, c] of clientes.entries()) {
    const { servicios = [], kpis = [], fases = [], reglas, angulos = [], piezas = [], metricas = [], ...datos } = c;
    await db.client.create({ data: {
      ...datos, orden: i,
      servicios: { create: servicios.map(([nombre, precio], orden) => ({ nombre, precio, orden })) },
      kpis: { create: kpis.map(([nombre, base, objetivo, actual, enObjetivo], orden) => ({ nombre, base, objetivo, actual, enObjetivo, orden })) },
      fases: { create: fases.map(([nombre, desde, hasta, items], orden) => ({ nombre, desde, hasta, items: items.join("\n"), orden })) },
      reglas: { create: (reglas || REGLAS_BASE).map(([situacion, criterio, accion], orden) => ({ situacion, criterio, accion, orden })) },
      angulos: { create: angulos.map(([nombre, estado, hipotesis, aprendizaje]) => ({ nombre, estado, hipotesis, aprendizaje })) },
      onboarding: { create: ONB.map((nombre, orden) => ({ nombre, orden, responsable: ONB_RESP[orden] })) },
      metricas: { create: metricas },
    } });
    // piezas planificadas (quedan para confirmar en "Puesta al día")
    for (const [tipo, titulo, ang] of piezas) {
      const a = await db.angle.findFirst({ where: { clientId: c.id, nombre: ang } });
      await db.piece.create({ data: { clientId: c.id, mes: hoy.slice(0, 7), tipo, titulo, angleId: a?.id, etapa: "guion", desde: hoy } });
    }
  }
  // historial de leads de Mateo (tracker MGB 2026), nombres con inicial del apellido
  const creativos = [...new Set(mateo.map((l) => l[4]))].filter((x) => x !== "Sin dato" && x !== "Otro");
  await db.angle.createMany({ data: creativos.map((nombre) => ({ clientId: "mateo", nombre, estado: "revisar" })) });
  await db.sale.createMany({ data: mateo.map(([fecha, nombre, estado, monto, anuncio, objecion]) => ({ clientId: "mateo", fecha, nombre, estado, monto, plan: monto ? "Programa 1-1" : "", anuncio, objecion })) });
  console.log(`Listo: ${clientes.length} clientes cargados.`);
}

main().finally(() => db.$disconnect());
