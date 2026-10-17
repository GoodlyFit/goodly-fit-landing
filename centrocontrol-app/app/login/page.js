import { redirect } from "next/navigation";
import { currentUser, BASE } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Ingresar · Goodly Control" };

export default async function Login({ searchParams }) {
  if (await currentUser()) redirect("/");
  const e = (await searchParams)?.e;
  return (
    <main className="login">
      <form className="login-card" method="post" action={`${BASE}/api/login`}>
        <div className="brand" style={{ padding: 0 }}>
          <span className="wm">GOODLY FIT</span><span className="tag">Centro de control</span>
        </div>
        <h1>Ingresá</h1>
        {e && <p className="login-err">{e === "bloqueado" ? "Demasiados intentos. Probá de nuevo en 15 minutos." : "Usuario o contraseña incorrectos."}</p>}
        <div className="field"><label htmlFor="usuario">Usuario</label><input id="usuario" name="usuario" autoComplete="username" required autoFocus /></div>
        <div className="field"><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="btn primary" type="submit">Ingresar</button>
      </form>
    </main>
  );
}
