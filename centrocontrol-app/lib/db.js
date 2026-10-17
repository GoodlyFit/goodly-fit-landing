import { PrismaClient } from "@prisma/client";
const g = globalThis;
export const db = g.__db || new PrismaClient();
if (process.env.NODE_ENV !== "production") g.__db = db;
export const hoy = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Buenos_Aires" }).format(new Date());
