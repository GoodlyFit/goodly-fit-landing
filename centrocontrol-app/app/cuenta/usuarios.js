"use client";
import { useEffect, useState } from "react";

const API = "/centrocontrol/api/usuarios";
const ACCESO = "https://www.goodlyfit.app/centrocontrol";

export default function Usuarios() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [cred, setCred] = useState(null);
  const [f, setF] = useState({ usuario: "", nombre: "", rol: "equipo", clientId: "" });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { fetch(API).then((r) => r.json()).then((x) => (x.error ? setErr(x.error) : setD(x))); }, []);

  async function enviar(body) {
    setErr("");
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const x = await r.json();
    if (x.error) return setErr(x.error), false;
    setD((o) => ({ ...o, usuarios: x.usuarios }));
    if (x.credencial) { setCred(x.credencial); setCopiado(false); }
    return true;
  }
  const crear = async (e) => { e.preventDefault(); if (await enviar({ accion: "crear", ...f })) setF({ usuario: "", nombre: "", rol: "equipo", clientId: "" }); };
  const texto = cred && `Tu acceso al centro de control de Goodly Fit:\n${ACCESO}\nUsuario: ${cred.usuario}\nContraseña: ${cred.pw}\n\nCuando entres, cambiala desde "Cambiar contraseña".`;
  const copiar = () => navigator.clipboard?.writeText(texto).then(() => setCopiado(true));
  const nombreCliente = (id) => d?.clientes.find((c) => c.id === id)?.nombre || id;

  if (!d) return <section className="login-card wide">{err ? <p className="login-err">{err}</p> : <p className="meta">Cargando usuarios…</p>}</section>;
  return (
    <section className="login-card wide">
      <h1>Usuarios</h1>
      <p className="meta" style={{ marginTop: -6 }}>El equipo ve todo el centro de control. Un cliente solo ve su portal: carga ventas y ve sus métricas.</p>
      {cred && (
        <div className="cred">
          <strong>Usuario {cred.usuario} listo.</strong> Esta contraseña se muestra una sola vez: copiala y mandásela por WhatsApp.
          <pre>{texto}</pre>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn sm" onClick={copiar}>{copiado ? "Copiado" : "Copiar mensaje"}</button>
            <button type="button" className="btn sm ghost" onClick={() => setCred(null)}>Ya lo mandé</button>
          </div>
        </div>
      )}
      {err && <p className="login-err">{err}</p>}
      <ul className="ulist">
        {d.usuarios.map((u) => (
          <li key={u.id}>
            <div className="grow"><b>{u.nombre}</b><span className="meta">{u.usuario} · {u.rol === "cliente" ? `Cliente: ${nombreCliente(u.clientId)}` : u.admin ? "Equipo · administrador" : "Equipo"}</span></div>
            {!u.admin && <>
              <button type="button" className="btn sm" onClick={() => confirm(`¿Generar una contraseña nueva para ${u.nombre}? La actual deja de funcionar.`) && enviar({ accion: "reset", id: u.id })}>Nueva contraseña</button>
              <button type="button" className="btn sm ghost" onClick={() => confirm(`¿Borrar el usuario ${u.usuario}? Pierde el acceso.`) && enviar({ accion: "borrar", id: u.id })}>Borrar</button>
            </>}
          </li>
        ))}
      </ul>
      <form onSubmit={crear} className="fields" style={{ marginTop: 8 }}>
        <div className="field"><label htmlFor="un">Nombre</label><input id="un" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej.: Tomi" required /></div>
        <div className="field"><label htmlFor="uu">Usuario para entrar</label><input id="uu" value={f.usuario} onChange={(e) => setF({ ...f, usuario: e.target.value.toLowerCase().replace(/\s/g, "") })} placeholder="Ej.: tomi" autoComplete="off" required /></div>
        <div className="field"><label htmlFor="ur">Tipo de acceso</label>
          <select id="ur" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}><option value="equipo">Equipo</option><option value="cliente">Cliente</option></select></div>
        {f.rol === "cliente" && <div className="field"><label htmlFor="uc">Cliente</label>
          <select id="uc" value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })} required><option value="">Elegir</option>{d.clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>}
        <div className="field full"><button className="btn primary" type="submit" style={{ alignSelf: "flex-start" }}>Crear usuario</button></div>
      </form>
    </section>
  );
}
