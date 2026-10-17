// Crea o actualiza un usuario.
// Equipo:  npm run usuario -- tomi "Tomi" contraseña
// Cliente: npm run usuario -- doup "DOUP!" contraseña cliente doup
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
const [usuario, nombre, pw, rol = "equipo", clientId = null] = process.argv.slice(2);
if (!usuario || !nombre || !pw) { console.log('Uso: npm run usuario -- <usuario> "<Nombre>" <contraseña> [equipo|cliente] [id-del-cliente]'); process.exit(1); }
if (pw.length < 10) { console.log("La contraseña tiene que tener al menos 10 caracteres."); process.exit(1); }
const salt = crypto.randomBytes(16).toString("hex");
const passHash = salt + ":" + crypto.scryptSync(pw, salt, 64).toString("hex");
const db = new PrismaClient();
const u = usuario.toLowerCase();
await db.user.upsert({ where: { usuario: u }, create: { usuario: u, nombre, passHash, rol, clientId }, update: { nombre, passHash, rol, clientId } });
console.log(`Usuario ${u} (${rol}${clientId ? " · " + clientId : ""}) listo.`);
await db.$disconnect();
