import { redirect } from "next/navigation";
import { currentUser, BASE } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta · Goodly Control" };

const ERR = { actual: "La contraseña actual no es correcta.", corta: "La nueva contraseña tiene que tener al menos 10 caracteres.", distintas: "Las dos contraseñas nuevas no coinciden." };
export default async function Cuenta({ searchParams }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const q = await searchParams;
  return (
    <main className="login">
      <form className="login-card" method="post" action={`${BASE}/api/password`}>
        <div className="brand" style={{ padding: 0 }}><span className="wm">GOODLY FIT</span><span className="tag">{user.nombre}</span></div>
        <h1>Cambiar contraseña</h1>
        {q?.ok && <p className="login-ok">Listo. Tu contraseña nueva ya funciona.</p>}
        {q?.e && <p className="login-err">{ERR[q.e] || "No se pudo cambiar la contraseña."}</p>}
        <div className="field"><label htmlFor="actual">Contraseña actual</label><input id="actual" name="actual" type="password" autoComplete="current-password" required /></div>
        <div className="field"><label htmlFor="nueva">Nueva contraseña (mínimo 10 caracteres)</label><input id="nueva" name="nueva" type="password" autoComplete="new-password" minLength={10} required /></div>
        <div className="field"><label htmlFor="repetir">Repetí la nueva</label><input id="repetir" name="repetir" type="password" autoComplete="new-password" minLength={10} required /></div>
        <button className="btn primary" type="submit">Guardar</button>
        <a className="meta" href={BASE}>← Volver al centro de control</a>
      </form>
    </main>
  );
}
