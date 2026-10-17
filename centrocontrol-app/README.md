# Goodly Control

Centro de control de la agencia de Goodly Fit: tareas del día, producción de piezas, cartera con salud por cliente, estrategia de 90 días, ángulos, revisión semanal y portal de ventas del cliente.

Stack: Next.js 15 + Prisma. Base de datos Postgres.

## Acceso

La app vive en **goodlyfit.app/centrocontrol** y pide usuario y contraseña.

- El usuario administrador (`nahuel`) se crea en el primer deploy con la contraseña inicial. Para cambiarla: variable `ADMIN_PASSWORD` en Vercel o `npm run usuario`.
- Más usuarios del equipo: `npm run usuario -- tomi "Tomi" contraseña-larga`
- Usuario para un cliente (solo ve su portal de ventas): `npm run usuario -- doup "DOUP!" contraseña-larga cliente doup`

## Publicar en Vercel (una sola vez)

1. El código vive en la carpeta `centrocontrol-app` del repo `GoodlyFit/goodly-fit-landing`.
2. En Vercel: **Add New → Project**, importar `goodly-fit-landing` con el nombre `goodly-control` y **Root Directory** `centrocontrol-app`.
3. En el proyecto: **Storage → Create Database → Neon (Postgres)** y conectarla. Eso crea `DATABASE_URL` solo.
4. **Deploy.** El build crea las tablas, carga los clientes si la base está vacía y crea el usuario administrador.
5. En la landing (`goodly-fit-landing`), el `vercel.json` reenvía `/centrocontrol` a `goodly-control.vercel.app`. Si el proyecto quedó con otro nombre, cambiar esa URL.

## Trabajar en tu computadora

Necesitás Node 20 o superior y una base Postgres (podés usar la misma de Neon o una rama de desarrollo).

```bash
cd ~/Code/goodly-control
cp variables-vercel.txt .env   # y agregá DATABASE_URL
npm install
npm run db:setup
npm run dev                  # http://localhost:3000/centrocontrol
```

## Comandos útiles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la app en modo desarrollo |
| `npm run db:setup` | Crea las tablas y carga los clientes (solo la primera vez) |
| `npm run usuario -- …` | Crea o cambia la contraseña de un usuario |
| `npm run db:reset` | **Borra todo** y vuelve a cargar los clientes desde cero |
| `npx prisma studio` | Abre un visor de la base para ver o corregir datos a mano |

## Cómo está armado

- `prisma/schema.prisma`: las tablas (clientes, piezas, pedidos, ventas, ángulos, revisiones, métricas mensuales, etc.).
- `prisma/seed.mjs`: la carga inicial de clientes. DOUP! viene con la radiografía completa: ficha, plan de 90 días, reglas, ángulos y totales de abril a octubre.
- `app/api/state`: devuelve todo el estado.
- `app/api/action`: recibe cada acción de la interfaz (mover una pieza, cargar una venta, guardar la puesta al día…) y la guarda.
- `public/app.js` y `public/app.css`: la interfaz.

