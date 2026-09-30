/* ====== CONFIG ======
   Pegá acá la URL de la implementación web de Apps Script (termina en /exec). */
const APPS_SCRIPT_URL = "PEGAR_URL_DE_APPS_SCRIPT_AQUI";
/* ==================== */

const QUEUE_KEY = "gf_expo_pendientes";

function readQueue(){ try{ return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }catch(e){ return []; } }
function writeQueue(q){ try{ localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }catch(e){} }

function send(payload, timeoutMs){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 10000);
  // text/plain evita el preflight CORS; Apps Script lee el JSON desde e.postData.contents
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    signal: ctrl.signal
  }).then(r => r.json())
    .then(j => { clearTimeout(t); if(!j.ok) throw new Error(j.error || "error"); return j; })
    .catch(err => { clearTimeout(t); throw err; });
}

// Reintenta los leads que no pudieron enviarse (señal mala en el predio).
// El script deduplica por ID, así que reintentar nunca genera filas repetidas.
let flushing = false;
async function flushQueue(){
  if(flushing) return;
  const q = readQueue();
  if(!q.length || !navigator.onLine) return;
  flushing = true;
  const rest = [];
  for(const p of q){
    try{ await send(p, 12000); } catch(e){ rest.push(p); }
  }
  // Conserva también lo que se haya encolado mientras se reintentaba
  const nuevos = readQueue().filter(p => !q.some(x => x.id === p.id));
  writeQueue(rest.concat(nuevos));
  flushing = false;
}
window.addEventListener("online", flushQueue);
setInterval(flushQueue, 30000);
flushQueue();
