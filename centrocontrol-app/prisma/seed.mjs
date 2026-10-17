// Carga inicial: los 12 clientes + DOUP!. No incluye estado operativo (piezas, pedidos, notas):
// eso se carga desde "Puesta al día". Correr con: npm run db:setup
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import crypto from "node:crypto";

const db = new PrismaClient();
const TC = 1550; // dólar oficial usado en la radiografía de DOUP!

const ONB = ["Reunión de inicio", "Accesos: cuenta publicitaria, Instagram, WhatsApp y Drive", "Ficha del cliente completa", "Estrategia de 90 días entregada", "Estrategia validada por el cliente"];
const ONB_RESP = ["", "Cliente", "", "", "Cliente"];
const REGLAS_BASE = [
  ["Corte de anuncio", "Costo por resultado > 2× el objetivo tras 7 días", "Pausar y anotar el aprendizaje del ángulo"],
  ["Escala", "ROAS ≥ 4× y costo por resultado en objetivo", "Subir 20% el presupuesto cada 4 días"],
  ["Fatiga", "Frecuencia semanal > 2 o CTR cae 30% vs su primera semana", "Rotar a una versión nueva del mismo ángulo"],
  ["Calidad", "Cruce semanal con las ventas cargadas por el cliente", "Priorizar el ángulo con más ventas, no el de menor costo"],
];

const clientes = [
  { id: "doup", nombre: "DOUP!", rubro: "Acrobacia, parkour y calistenia", zona: "Villa Crespo, CABA", revision: 5, embudo: true,
    hace: "Acrobacia de suelo y aérea, cama elástica, parkour, calistenia, parada de manos y danzas urbanas en una sede de gran escala. El precio está por encima de un gimnasio tradicional y la experiencia también.",
    noHace: "No es un gimnasio de máquinas. El precio no se comunica antes de la clase de prueba.",
    publico: "Adulto principiante de 25 a 38 años. Ex gimnasta que retoma una pasión de la infancia, con ingresos propios. Deportista que complementa otra actividad. Familias con hijos para las clases Kids. Temporadas fuertes: marzo-abril y julio-septiembre; diciembre y enero son los meses de menor demanda.",
    oferta: "El interesado escribe por WhatsApp, recibe preguntas de calificación y se lo invita a una clase de prueba. Al salir se presentan dos opciones, la segunda como recomendada. Seguimiento manual en uno o dos contactos. Cuatro vendedores en dos turnos; un bot toma la conversación si no hay respuesta humana en dos minutos.",
    tono: "Cercano y desafiante: no hace falta saber para venir.",
    reglasProd: "Videos verticales de 30 a 45 segundos, subtitulados, con tres ganchos.",
    planTitulo: "Misma facturación con la mitad de la inversión", planInicio: "2026-10-19", planFin: "2027-01-16",
    servicios: [["Pack 40 clases", 700000], ["Pack 10 clases", 200000], ["Suscripción mensual", 90000]],
    kpis: [["Inversión mensual (USD)", "2.043", "800 – 1.000", "", null], ["Facturación de alumnos nuevos", "$24,7M", "Nivel de septiembre", "", null], ["Costo por conversación (USD)", "1,40", "1,00 – 1,30", "", null], ["Pauta sobre facturación", "12,8%", "5% – 6,5%", "", null]],
    fases: [
      ["Testeo en frío", "2026-10-19", "2026-11-15", ["Lanzamiento de los tres videos nuevos", "Testeo de los dos videos grabados por DOUP!", "Retiro progresivo de los anuncios actuales", "Primera lectura de rendimiento por ángulo"]],
      ["Escala", "2026-11-16", "2026-12-15", ["Escala de los ganadores en frío", "Producción de los ángulos ganadores con creativos nuevos", "Activación de públicos personalizados", "Ángulo Kids orientado a padres"]],
      ["Consolidación", "2026-12-16", "2027-01-16", ["Inversión en el piso de USD 800 por temporada baja", "Mayor peso de públicos personalizados", "Producción del banco creativo para marzo", "Revisión de 90 días y plan del próximo trimestre"]],
    ],
    reglas: [
      ["Corte de gancho", "Retención a 3 s < 25% o CTR < 1,2% con 7 días de circulación", "Se reemplaza el gancho, se conserva el cuerpo del video"],
      ["Corte de anuncio", "Costo por conversación > USD 1,80 tras 14 días", "Se pausa y se registra el aprendizaje del ángulo"],
      ["Escala", "Costo por conversación ≤ USD 1,00 y agenda ≥ 25% de las conversaciones", "Pasa a escala con +20% cada 4 días, techo USD 1.000"],
      ["Fatiga", "Frecuencia semanal > 1,5 o CTR cae 30% frente a su primera semana", "Rotación a una nueva versión del mismo ángulo"],
      ["Calidad", "Cruce semanal con el tracker: agendas, asistencias, ventas y plan vendido", "Se prioriza el ángulo con más ventas cada 100 conversaciones, no el de menor costo"],
    ],
    angulos: [
      ["Aprende un truco", "fatigado", "Habilidad aspiracional con reducción del miedo: «Vení sin miedo».", "63% de la inversión total. Costo por conversación de USD 0,67 a 1,83 y CTR de 3,0% a 1,2%. Atrae al indeciso, que compra el plan de entrada."],
      ["Sin experiencia, con referente", "ganador", "Contención del miedo desde la voz del profesor: nadie llega sabiendo.", "Jose v2: USD 1,18 por conversación, estable. Mejora sobre v1 (USD 1,39)."],
      ["Comunidad", "ganador", "Cuando entrenás solo es más fácil abandonar.", "Gente copada v2: mejor costo de lanzamiento (USD 0,73). Único que habla de constancia y pertenencia, el argumento del Pack 40. Pausado el 15/09."],
      ["Sin barreras", "ganador", "No necesitás experiencia, solo animarte.", "No necesitas v1: costo plano cerca de USD 1,00 durante cinco meses."],
      ["El ex gimnasta", "testeo", "Adultos que hicieron gimnasia o acrobacia de chicos vuelven a hacerlo. Segmento de alta intención.", ""],
      ["El lugar", "testeo", "La escala del espacio (fosa, camas elásticas, pedana, aéreos) justifica el precio antes de que aparezca la pregunta.", ""],
      ["Prueba de progreso", "idea", "Mostrar un alumno real que logró la habilidad.", ""],
      ["Kids para padres", "idea", "Acro Kids convierte 49,3% de las agendas y Parkour Kids 46,9%, las tasas más altas del gimnasio. No tienen creativo propio.", ""],
      ["Formularios de contacto", "descartado", "Captar por formulario en lugar de conversación.", "USD 96 invertidos y un solo contacto: el público responde a la conversación directa."],
      ["Tráfico al perfil", "descartado", "Llevar visitas al perfil de Instagram.", "USD 419 en 13.107 visitas sin conversaciones atribuibles."],
      ["Optimización a compra por DM", "descartado", "Optimizar la campaña al evento de compra.", "USD 210 con diez eventos de compra: no alcanza volumen para que el algoritmo optimice."],
    ],
    piezas: [["video", "Volvé a hacer lo que hacías de chico", "El ex gimnasta"], ["video", "Esto no es un gimnasio", "El lugar"], ["video", "Aprendé algo nuevo", "Sin experiencia, con referente"]],
    metricas: [
      ["2026-04", 990, 1009, 330, 138, 117, 33.7e6], ["2026-05", 1351, 999, 272, 138, 70, 24.5e6], ["2026-06", 1765, 1266, 323, 195, 111, 30.5e6],
      ["2026-07", 1893, 1710, 255, 171, 72, 20.6e6], ["2026-08", 2331, 1784, 347, 231, 95, 25.6e6], ["2026-09", 2043, 1462, 270, 193, 93, 24.7e6], ["2026-10", 907, 573, 126, 81, 24, 6.3e6],
    ].map(([mes, usd, conv, ag, as, v, f]) => ({ mes, inversion: usd * TC, conversaciones: conv, agendas: ag, asistencias: as, ventas: v, facturacion: f })),
  },
  { id: "housefit", nombre: "House Fit", rubro: "Gimnasio", metaId: "550680997436634", revision: 1 },
  { id: "camilo", nombre: "Camilo Yanes", rubro: "Personal trainer · 2 gimnasios", zona: "Buenos Aires", metaId: "153306217", moneda: "USD", revision: 1,
    hace: "Entrenamiento personal en dos gimnasios propios y planes online.", oferta: "Embudo doble: WhatsApp con agente de IA para presencial y landing para planes digitales." },
  { id: "sifitness", nombre: "Si Fitness Gym", rubro: "Gimnasio", revision: 2 },
  { id: "cristina", nombre: "Cristina Barcala", revision: 2 },
  { id: "tiempo", nombre: "Tiempo Libre", rubro: "Gimnasio", metaId: "1027088952965308", revision: 3 },
  { id: "corpore", nombre: "Corpore", rubro: "Gimnasio", metaId: "1517467059358334", revision: 3 },
  { id: "moovon", nombre: "Moov On", rubro: "Biohacking circuit", revision: 4 },
  { id: "housenunez", nombre: "House Fit Núñez", rubro: "Gimnasio", zona: "Núñez, CABA", revision: 4 },
  { id: "termo", nombre: "Termo Fit", rubro: "Plantillas para dolor de pisada · itinerante", zona: "Río Cuarto, Rosario, San Luis", metaId: "807169328718785", revision: 5,
    hace: "Un profesional viaja por ciudades de Argentina, atiende pocos días, evalúa gratis y vende la plantilla en el momento. No vende plantillas: resuelve un dolor normalizado.",
    noHace: "No tiene local fijo; no vuelve a la ciudad hasta la próxima gira. No inventar urgencia: solo días y cupos reales de cada visita.",
    publico: "Río Cuarto: mujer 55-76, dolor por estar parada. Rosario: adultos 55+ y jóvenes 20-25 activos. San Luis: adultos 40-55, dolor por trabajar o caminar mucho.",
    oferta: "Evaluación gratuita + plantilla. B2B: alianza con kinesiólogos y gimnasios que ceden horas vacías y ganan por paciente atendido.",
    tono: "Cercano, exclusividad territorial: no está siempre en tu ciudad.",
    servicios: [["Evaluación + plantilla", 90000]],
    angulos: [["Dolor articular general", "ganador", "Resolver un dolor que la gente ya normalizó.", "Siempre tuvo mejor costo por resultado que el deportivo o el infanto-juvenil."], ["Deportivo e infanto-juvenil", "descartado", "", "Solo como testeo acotado, nunca como eje."]] },
  { id: "mark", nombre: "Mark Training Club", rubro: "Gimnasio · fútbol y wellness", metaId: "3182376732152374", revision: 5,
    hace: "Dos líneas: entrenamiento para fútbol y área wellness. Atiende con agente de IA por WhatsApp.",
    oferta: "Campañas a WhatsApp separadas por línea. En el CRM los leads se etiquetan Training Fútbol, Wellness Deporte o Wellness General." },
  { id: "axel", nombre: "Axel", revision: 1 },
  { id: "mateo", nombre: "Mateo", rubro: "Programa 1-1 high ticket · mujeres", zona: "Online", metaId: "2005792346890827", revision: 2, embudo: true,
    hace: "Programa de acompañamiento 1 a 1. Venta por llamada después de la conversación por DM.", publico: "Mujeres profesionales y emprendedoras.",
    oferta: "DM → agenda de llamada → asistencia → cierre. Se califica por profesión antes de agendar.",
    metricas: [["2026-01", 669054, 1118], ["2026-02", 703883, 1222], ["2026-03", 704626, 922], ["2026-04", 745029, 856], ["2026-05", 745610, 778], ["2026-06", 504525, 601], ["2026-07", 380000, 476], ["2026-08", 714000, 752], ["2026-09", 559576, 573], ["2026-10", 405029, 682]].map(([mes, inversion, conversaciones]) => ({ mes, inversion, conversaciones })) },
];

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
