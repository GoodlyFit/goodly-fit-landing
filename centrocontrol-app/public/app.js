
const HOY=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Buenos_Aires"}).format(new Date()), MES=HOY.slice(0,7);
const MESES=(()=>{const n=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];const o={};let [y,mm]=MES.split("-").map(Number);const ks=[];for(let i=0;i<12;i++){ks.unshift(`${y}-${String(mm).padStart(2,"0")}`);mm--;if(!mm){mm=12;y--}}ks.forEach(k=>o[k]=n[+k.slice(5)-1]);return o})();
const DIAS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const EQUIPO=["Nahuel","Tomi"];
const ETAPAS={
  video:[
    {k:"angulo",n:"Definir ángulo",r:"Nahuel",sla:2},{k:"guion",n:"Guion",r:"Tomi",sla:2},{k:"okguion",n:"Revisión de guion",r:"Nahuel",sla:1},
    {k:"grabacion",n:"Grabación",r:"Cliente",sla:5},{k:"crudos",n:"Revisión de crudos",r:"Tomi",sla:1},
    {k:"edicion",n:"Edición",r:"Editor",sla:3},{k:"revision",n:"Control final",r:"Tomi",sla:1},
    {k:"aprobacion",n:"Aprobación del cliente",r:"Cliente",sla:2},{k:"subida",n:"Subir a campañas",r:"Tomi",sla:1},{k:"aire",n:"Al aire",r:"",sla:99}],
  imagen:[
    {k:"brief",n:"Brief",r:"Tomi",sla:1},{k:"diseno",n:"Diseño con IA",r:"Tomi",sla:2},
    {k:"okdiseno",n:"Revisión",r:"Nahuel",sla:1},{k:"aprobacion",n:"Aprobación del cliente",r:"Cliente",sla:2},{k:"subida",n:"Subir a campañas",r:"Tomi",sla:1},{k:"aire",n:"Al aire",r:"",sla:99}]
};
const ONB=["Reunión de inicio","Accesos: cuenta publicitaria, Instagram, WhatsApp y Drive","Ficha del cliente completa","Estrategia de 90 días entregada","Estrategia validada por el cliente"];
const DO_TEXT={angulo:"Definir el ángulo del video",subida:"Subir los creativos a las campañas",guion:"Escribir el guion",okguion:"Revisar y aprobar el guion",grabacion:"Seguir al cliente para que grabe",crudos:"Revisar crudos contra el guion",edicion:"Seguir al editor",revision:"Controlar el video editado",aprobacion:"Seguir al cliente para el OK",brief:"Armar el brief de la imagen",diseno:"Generar la imagen con IA",okdiseno:"Revisar la imagen"};

/* ---------- datos de ejemplo ---------- */
const ad=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
let PID=1;
function pz(tipo,titulo,ang,etapa,dias,extra={}){return Object.assign({id:PID++,mes:MES,tipo,titulo,angulo:ang,etapa,desde:ad(HOY,-dias),hist:[],links:{guion:"",crudos:"",final:""},ganchos:tipo==="video"?3:0},extra)}
/* ---------- estado ---------- */
const BASE=window.GC_BASE||"";const USER=window.GC_USER||{nombre:"Equipo",rol:"equipo"};
let S={clientes:[],quien:USER.rol==="cliente"?"cliente:"+USER.clientId:(()=>{try{return localStorage.getItem("goodly-quien")||(EQUIPO.includes(USER.nombre)?USER.nombre:"Tomi")}catch(e){return "Tomi"}})()};
const save=()=>{};
let R={view:"hoy",id:null,tab:"resumen",tipo:"todos",fcli:"todos",mes:MES,pieza:null};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money=n=>"$ "+Math.round(n||0).toLocaleString("es-AR");
const mshort=n=>n>=1e6?"$ "+(n/1e6).toLocaleString("es-AR",{maximumFractionDigits:1})+" M":money(n);
const fdate=d=>{if(!d)return"";const[y,m,dd]=d.split("-");return `${+dd}/${+m}`};
const days=(a,b=HOY)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
const cli=id=>S.clientes.find(c=>c.id===id);
const ini=n=>n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g,"").split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||n.slice(0,2).toUpperCase();
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("on"),1800)}
const ICONS={alert:'<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z"/>',trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',film:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 3v18M17 3v18M3 12h18"/>',check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',coin:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2m0 8v2"/>',cal:'<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>'};
const ico=(k,c="")=>`<div class="ic ${c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg></div>`;
const etapa=p=>ETAPAS[p.tipo].find(e=>e.k===p.etapa);
const respDe=p=>etapa(p).r;
function lateState(p){const e=etapa(p);if(p.etapa==="aire")return"";const d=days(p.desde);return d>e.sla?"late":d===e.sla?"near":""}
function piezasMes(c,mes=MES){return c.piezas.filter(p=>p.mes===mes)}

/* ---------- métricas ---------- */
function resumen(c,mes){
  const v=c.ventas.filter(x=>x.fecha.startsWith(mes));const m=c.metricas[mes]||{};
  if(m.ventas!=null){ // totales importados + registros cargados después
    const vv=v.filter(x=>x.estado==="Compró");const inv=+m.inv||0;const nv=m.ventas+vv.length;const f=(+m.fact||0)+vv.reduce((s,x)=>s+(+x.monto||0),0);
    return {inv,conv:+m.conv||0,agendas:(m.agendas||0)+v.length,asist:(m.asist||0)+v.filter(x=>x.estado!=="No asistió").length,ventas:nv,fact:f,roas:inv?f/inv:null,cpv:nv&&inv?inv/nv:null,ticket:nv?f/nv:null,embudo:true,agg:true}}
  const ventas=v.filter(x=>x.estado==="Compró");const fact=ventas.reduce((a,x)=>a+(+x.monto||0),0);
  const agendas=v.length, asist=v.filter(x=>x.estado!=="No asistió").length;
  return {inv:+m.inv||0,conv:+m.conv||0,agendas,asist,ventas:ventas.length,fact,roas:m.inv?fact/m.inv:null,cpv:ventas.length&&m.inv?m.inv/ventas.length:null,ticket:ventas.length?fact/ventas.length:null,embudo:!!c.embudo||c.ventas.some(x=>x.estado!=="Compró")};
}
function salud(c){
  if(c.estado==="Sin cargar")return {score:null,nivel:"none",partes:[{n:"Estado",v:0,why:"Estado sin cargar",c:"bad"}]};
  if(c.estado==="Onboarding"){const pend=c.onboarding.find(x=>!x.ok);const d=pend&&pend.desde?days(pend.desde):0;
    const s=d>7?35:70;return {score:s,nivel:s<50?"bad":"warn",partes:[{n:"Onboarding",v:s,why:pend?`${pend.n} pendiente hace ${d} días`:"Completo"}]};}
  const r=resumen(c,MES);
  if(!c.ventas.length&&!Object.keys(c.metricas).length)return {score:null,nivel:"none",partes:[{n:"Rendimiento",v:0,why:"Sin datos de ventas ni inversión",c:"bad"}]};
  const rend=r.roas===null?50:Math.min(100,Math.round(r.roas/4*80));
  const ps=piezasMes(c);const late=ps.filter(p=>lateState(p)==="late");
  const entregas=ps.length?Math.max(0,100-late.filter(p=>!["Cliente"].includes(respDe(p))).length*30):60;
  const espCli=ps.filter(p=>respDe(p)==="Cliente").map(p=>days(p.desde));const maxCli=espCli.length?Math.max(...espCli):0;
  const resp=Math.max(0,100-Math.max(0,maxCli-2)*15);
  const ult=c.ventas.map(v=>v.fecha).sort().pop();const dd=ult?days(ult):99;
  const datos=dd<=3?100:dd<=7?70:dd<=14?40:10;
  const score=Math.round(rend*.4+entregas*.25+resp*.2+datos*.15);
  const nv=x=>x>=70?"":x>=45?"warn":"bad";
  return {score,nivel:score>=70?"ok":score>=50?"warn":"bad",partes:[
    {n:"Rendimiento",v:rend,why:r.roas===null?"Sin datos":`ROAS ${r.roas.toFixed(1)}× sobre 4×`,c:nv(rend)},
    {n:"Entregas del equipo",v:entregas,why:late.length?`${late.length} pieza atrasada`:"Al día",c:nv(entregas)},
    {n:"Respuesta del cliente",v:resp,why:maxCli?`Espera más larga: ${maxCli} días`:"Sin esperas",c:nv(resp)},
    {n:"Carga de ventas",v:datos,why:ult?(dd===0?"Cargó hoy":`Última carga hace ${dd} día${dd===1?"":"s"}`):"Nunca cargó",c:nv(datos)}]};
}
function alta(c){
  const f=c.ficha;const items=[
    {n:"Ficha del negocio",ok:!!(f.hace&&f.publico&&f.oferta),tab:"ficha"},{n:"Servicios y precios",ok:c.servicios.length>0,tab:"ficha"},
    {n:"Cuenta publicitaria vinculada",ok:!!c.meta,tab:"ficha"},{n:"Carpeta de Drive",ok:!!c.drive,tab:"ficha"},
    {n:"Plan de 90 días",ok:!!c.plan.titulo,tab:"estrategia"},{n:"Ángulos clasificados",ok:c.angulos.length>0&&!c.angulos.some(a=>a.e==="revisar"),tab:"angulos"},
    {n:"Historial de ventas",ok:c.ventas.length>0,tab:"resultados"},{n:"Inversión de Meta por mes",ok:Object.keys(c.metricas).length>0,tab:"resultados"}];
  return {items,pct:Math.round(items.filter(x=>x.ok).length/items.length*100)};
}
function faseActual(c){const f=c.plan.fases.findIndex(x=>HOY>=x.d&&HOY<=x.h);return f}
function diaPlan(c){if(!c.plan.inicio)return null;const tot=days(c.plan.inicio,c.plan.fin);const d=days(c.plan.inicio);return {d:Math.max(0,d),tot,pct:Math.max(0,Math.min(100,d/tot*100)),antes:d<0,faltan:-d}}

/* ---------- tareas ---------- */
function tareas(persona){
  const t=[];
  S.clientes.forEach(c=>{
    if(c.estado==="Sin cargar"){if(persona==="Tomi")t.push({tipo:"puesta",c,txt:"Cargar el estado del cliente",sub:"Todavía no se cargó",d:1,sla:0});return}
    {const fr=frescura(c);if(fr.d>VIEJO&&persona==="Tomi")t.push({tipo:"puesta",c,txt:"Actualizar el estado",sub:`Sin novedades: ${fr.txt.toLowerCase()}`,d:fr.d,sla:VIEJO});}
    c.piezas.filter(p=>p.etapa!=="aire").forEach(p=>{const e=etapa(p);const d=days(p.desde);
      if(e.r===persona)t.push({tipo:"hacer",c,p,txt:DO_TEXT[p.etapa],sub:`${p.titulo}`,d,sla:e.sla});
      else if((e.r==="Cliente"||e.r==="Editor")&&persona==="Tomi")t.push({tipo:"seguir",c,p,txt:DO_TEXT[p.etapa],sub:`${p.titulo} · lo tiene ${e.r==="Cliente"?"el cliente":"el editor"}`,d,sla:e.sla});});
    if(c.estado==="Activo"&&new Date(HOY+"T12:00:00").getDay()===c.revision){const hecha=c.revisiones.some(r=>r.f===HOY);if(!hecha&&(persona==="Nahuel"||persona==="Tomi"))t.push({tipo:"revision",c,txt:"Revisión semanal de la cuenta",sub:`${c.reglas.length} reglas de decisión`,d:0,sla:1});}
    c.pedidos.filter(p=>!p.ok&&p.r===persona).forEach(p=>t.push({tipo:"pedido",c,ped:p,txt:p.t,sub:p.fuera?"Fuera del servicio":"Pedido del cliente",d:days(p.f),sla:3}));
    if(c.estado==="Activo"&&persona==="Tomi"){const a=alta(c);if(a.pct<100)t.push({tipo:"alta",c,txt:"Completar el alta",sub:"Falta: "+a.items.filter(x=>!x.ok).map(x=>x.n.toLowerCase()).join(", "),d:0,sla:9,pct:a.pct});const ult=c.ventas.map(v=>v.fecha).sort().pop();const dd=ult?days(ult):99;if(ult&&dd>7)t.push({tipo:"seguir",c,txt:"Pedirle al cliente que cargue las ventas",sub:`Última carga hace ${dd} días`,d:dd,sla:7});}
    if(c.estado==="Onboarding"){c.onboarding.filter(x=>!x.ok&&x.r==="Cliente").forEach(x=>{if(persona==="Tomi")t.push({tipo:"seguir",c,txt:x.n,sub:"Onboarding · lo tiene el cliente",d:days(x.desde),sla:3})});
      const nx=c.onboarding.find(x=>!x.ok&&!x.r);if(nx&&persona==="Nahuel")t.push({tipo:"hacer",c,txt:nx.n,sub:"Onboarding",d:0,sla:3});}
  });
  return t.sort((a,b)=>(b.d-b.sla)-(a.d-a.sla));
}


/* ---------- puesta al día ---------- */
const VIEJO=7;
function frescura(c){if(!c.actualizado)return{txt:"Nunca",d:99,cls:"bad"};const d=days(c.actualizado);return{txt:d===0?"Hoy":d===1?"Ayer":`Hace ${d} días`,d,cls:d>VIEJO?"bad":d>3?"warn":"ok"}}
function pendientesPuesta(){return S.clientes.filter(c=>c.estado==="Sin cargar"||frescura(c).d>VIEJO)}
function touch(c){if(c&&c.estado!=="Sin cargar")c.actualizado=HOY}
function vPuesta(){
  const cs=S.clientes;const sin=cs.filter(c=>c.estado==="Sin cargar").length;const vie=cs.filter(c=>c.estado!=="Sin cargar"&&frescura(c).d>VIEJO).length;
  const nx=pendientesPuesta()[0];
  return `<div class="head"><div><h1>Puesta al día <span class="ac">· ${sin+vie} pendientes</span></h1>
   <p class="sub">Cargá el estado real de cada cliente en un solo formulario: en qué etapa está el servicio, dónde está cada pieza del mes y qué quedó pendiente. Después el sistema se mantiene solo: cada vez que alguien mueve una pieza o cierra un pedido, el cliente queda al día.</p></div>
   ${nx?`<button class="btn primary" data-cargar="${nx.id}">Empezar por ${esc(nx.nombre)}</button>`:""}</div>
  <div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))">
   <div class="stat">${ico("inbox","bad")}<b>${sin}</b><span>clientes sin cargar</span></div>
   <div class="stat">${ico("clock","warn")}<b>${vie}</b><span>sin novedades hace más de ${VIEJO} días</span></div>
   <div class="stat">${ico("check","ok")}<b>${cs.length-sin-vie}</b><span>al día</span></div></div>
  <section class="panel"><div class="tbl-wrap"><table><thead><tr><th>Cliente</th><th>Estado del servicio</th><th>Última actualización</th><th>Piezas del mes cargadas</th><th>Alta</th><th></th></tr></thead><tbody>
  ${cs.slice().sort((a,b)=>frescura(b).d-frescura(a).d).map(c=>{const f=frescura(c);const a=alta(c);const ps=piezasMes(c);
    return `<tr><td><div class="cname"><span class="av">${ini(c.nombre)}</span><div>${esc(c.nombre)}<small>${esc(c.rubro||"Sin rubro")}</small></div></div></td>
     <td><span class="pill ${c.estado==="Sin cargar"?"bad":c.estado==="Activo"?"ok":"info"}">${c.estado}</span></td>
     <td><span class="pill ${f.cls}">${f.txt}</span></td><td class="meta">${c.estado==="Activo"?`${ps.length} de ${c.cuota.video+c.cuota.imagen}`:"—"}</td>
     <td class="meta">${a.pct}%</td><td style="text-align:right"><button class="btn sm ${c.estado==="Sin cargar"||f.d>VIEJO?"primary":""}" data-cargar="${c.id}">${c.estado==="Sin cargar"?"Cargar estado":"Actualizar"}</button></td></tr>`}).join("")}
  </tbody></table></div></section>`;
}
function draftDe(c){
  if(R.draft&&R.draft.id===c.id)return R.draft;
  const filas=t=>{const ps=piezasMes(c).filter(p=>p.tipo===t);const n=Math.max(c.cuota[t],ps.length);
    return Array.from({length:n},(_,i)=>ps[i]?{pid:ps[i].id,titulo:ps[i].titulo,angulo:ps[i].angulo||"",etapa:ps[i].etapa,dias:days(ps[i].desde)}:{pid:null,titulo:"",angulo:"",etapa:ETAPAS[t][0].k,dias:0})};
  return R.draft={id:c.id,estado:c.estado==="Sin cargar"?"Activo":c.estado,onb:c.onboarding.map(x=>x.ok),video:filas("video"),imagen:filas("imagen"),cuota:{...c.cuota},revision:c.revision,dentro:"",fuera:"",nota:""};
}
function leerDraft(f){
  const d=R.draft;const fd=new FormData(f);
  d.estado=fd.get("estado")||d.estado;d.onb=d.onb.map((_,i)=>fd.get("onb"+i)==="on");d.revision=+fd.get("revision");
  ["dentro","fuera","nota"].forEach(k=>d[k]=fd.get(k)||"");
  ["video","imagen"].forEach(t=>{d[t].forEach((r,i)=>{if(fd.has(`${t}-titulo-${i}`)){r.titulo=fd.get(`${t}-titulo-${i}`);r.angulo=fd.get(`${t}-ang-${i}`);r.etapa=fd.get(`${t}-etapa-${i}`);r.dias=+fd.get(`${t}-dias-${i}`)||0}});
    const n=+fd.get(`cuota-${t}`);if(!isNaN(n)&&fd.has(`cuota-${t}`)){d.cuota[t]=Math.max(0,Math.min(12,n));while(d[t].length<d.cuota[t])d[t].push({pid:null,titulo:"",angulo:"",etapa:ETAPAS[t][0].k,dias:0});while(d[t].length>d.cuota[t]&&!d[t][d[t].length-1].pid)d[t].pop()}});
}
function vCargar(c){
  const d=draftDe(c);const f=frescura(c);
  const fila=(t,r,i)=>`<div class="wz-row"><span class="kind ${t}">${t} ${i+1}</span>
    <input name="${t}-titulo-${i}" value="${esc(r.titulo)}" placeholder="${t==="video"?"Título o idea del video":"Idea de la imagen"}" aria-label="Título ${t} ${i+1}">
    <select name="${t}-ang-${i}" aria-label="Ángulo ${t} ${i+1}"><option value="">Sin ángulo</option>${c.angulos.map(a=>`<option value="${a.id}" ${a.id==r.angulo?"selected":""}>${esc(a.n)}</option>`).join("")}</select>
    <select name="${t}-etapa-${i}" aria-label="Etapa ${t} ${i+1}">${ETAPAS[t].map(e=>`<option value="${e.k}" ${e.k===r.etapa?"selected":""}>${e.n}${e.r?" · "+e.r:""}</option>`).join("")}</select>
    <label class="wz-dias"><input type="number" min="0" name="${t}-dias-${i}" value="${r.dias}" aria-label="Días en la etapa"> días ahí</label></div>`;
  return `<button class="back" data-go="puesta">← Puesta al día</button>
  <div class="head"><div style="display:flex;gap:16px;align-items:center"><span class="av" style="width:56px;height:56px;border-radius:18px;font-size:17px">${ini(c.nombre)}</span>
   <div><h3>Cargar estado</h3><h1 style="margin-top:4px">${esc(c.nombre)}</h1></div></div><span class="pill ${f.cls}">Última actualización: ${f.txt.toLowerCase()}</span></div>
  <form class="wz" data-form="cargar" data-cid="${c.id}">
   <section class="panel"><div class="wz-h"><span class="wz-n">1</span><div><h2>¿En qué etapa del servicio está?</h2><p class="sub" style="margin:2px 0 0">Onboarding hasta que la estrategia esté validada. Activo cuando ya produce y pauta todos los meses.</p></div></div>
    <div class="seg wz-seg">${["Onboarding","Activo","Pausado"].map(x=>`<label><input type="radio" name="estado" value="${x}" ${d.estado===x?"checked":""}><span>${x}</span></label>`).join("")}</div></section>
   ${d.estado==="Onboarding"?`<section class="panel"><div class="wz-h"><span class="wz-n">2</span><div><h2>¿Qué pasos del onboarding ya están hechos?</h2></div></div>
    <div class="wz-checks">${c.onboarding.map((x,i)=>`<label class="alta-i ${d.onb[i]?"ok":""}"><input type="checkbox" name="onb${i}" ${d.onb[i]?"checked":""}> ${esc(x.n)}</label>`).join("")}</div></section>`:""}
   ${d.estado==="Activo"?`<section class="panel"><div class="wz-h"><span class="wz-n">2</span><div><h2>¿Dónde está cada pieza de ${MESES[MES].toLowerCase()}?</h2><p class="sub" style="margin:2px 0 0">Elegí la etapa en la que está hoy y hace cuántos días. Si todavía no arrancó, dejala en la primera etapa con 0 días.</p></div></div>
    <div class="fields" style="max-width:420px"><div class="field"><label for="cuota-video">Videos del mes</label><input id="cuota-video" type="number" min="0" max="12" name="cuota-video" value="${d.cuota.video}" data-wzre="1"></div><div class="field"><label for="cuota-imagen">Imágenes del mes</label><input id="cuota-imagen" type="number" min="0" max="12" name="cuota-imagen" value="${d.cuota.imagen}" data-wzre="1"></div></div>
    <div class="wz-list">${d.video.map((r,i)=>fila("video",r,i)).join("")}${d.imagen.map((r,i)=>fila("imagen",r,i)).join("")}</div></section>`:""}
   <section class="panel"><div class="wz-h"><span class="wz-n">${d.estado==="Pausado"?2:3}</span><div><h2>¿Qué quedó pendiente con el cliente?</h2><p class="sub" style="margin:2px 0 0">Un pendiente por renglón. Se cargan como pedidos con responsable Tomi.</p></div></div>
    ${c.pedidos.filter(p=>!p.ok).length?`<div class="note">Ya cargados: ${c.pedidos.filter(p=>!p.ok).map(p=>esc(p.t)).join(" · ")}</div>`:""}
    <div class="fields"><div class="field"><label for="wz-dentro">Dentro del servicio</label><textarea id="wz-dentro" name="dentro" placeholder="Ej.: apagar la campaña de Rosario el miércoles">${esc(d.dentro)}</textarea></div>
    <div class="field"><label for="wz-fuera">Fuera del servicio</label><textarea id="wz-fuera" name="fuera" placeholder="Ej.: flyer impreso para la recepción">${esc(d.fuera)}</textarea></div></div></section>
   <section class="panel"><div class="wz-h"><span class="wz-n">${d.estado==="Pausado"?3:4}</span><div><h2>Cierre</h2></div></div>
    <div class="fields"><div class="field"><label for="wz-rev">Día de revisión semanal</label><select id="wz-rev" name="revision">${[1,2,3,4,5].map(i=>`<option value="${i}" ${d.revision===i?"selected":""}>${DIAS[i]}</option>`).join("")}</select></div>
    <div class="field"><label for="wz-nota">Nota de estado (opcional)</label><input id="wz-nota" name="nota" value="${esc(d.nota)}" placeholder="Ej.: el cliente cambió el horario de la sede"></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" type="submit" name="sig" value="1">Guardar y seguir con el próximo</button><button class="btn" type="submit" name="sig" value="0">Guardar</button></div></section>
  </form>`;
}

/* ---------- nav ---------- */
function renderNav(){
  const foot=document.querySelector(".side-foot");if(foot&&!foot.dataset.ok){foot.dataset.ok=1;foot.insertAdjacentHTML("beforeend",`<div class="meta" style="margin-top:6px">Sesión: ${esc(USER.nombre)}</div><a class="meta" href="${BASE}/cuenta" style="color:var(--accent);text-decoration:none">Cambiar contraseña</a><form method="post" action="${BASE}/api/logout"><button class="btn sm ghost" type="submit" style="padding-left:0">Cerrar sesión</button></form>`);if(USER.rol==="cliente"){foot.querySelector("label").hidden=true;$("#who").hidden=true}}
  const portal=S.quien.startsWith("cliente:");
  const tn=portal?0:tareas(S.quien).length;
  const prod=S.clientes.reduce((a,c)=>a+c.piezas.filter(p=>p.etapa!=="aire").length,0);
  $("#nav").innerHTML=portal?`<button class="on">Mis resultados</button>`:`
    <button data-go="hoy" class="${R.view==="hoy"?"on":""}">Hoy <span class="count">${tn}</span></button>
    <button data-go="produccion" class="${R.view==="produccion"?"on":""}">Producción <span class="count">${prod}</span></button>
    <button data-go="cartera" class="${R.view==="cartera"||R.view==="cliente"?"on":""}">Cartera <span class="count">${S.clientes.length}</span></button>
    <button data-go="puesta" class="${R.view==="puesta"||R.view==="cargar"?"on":""}">Puesta al día <span class="count">${pendientesPuesta().length}</span></button>
    <div class="side-sep" style="margin-top:14px">Clientes</div>
    ${S.clientes.map(c=>{const h=salud(c);return `<button data-open="${c.id}" class="${R.view==="cliente"&&R.id===c.id?"on":""}"><span>${esc(c.nombre)}</span><span class="health ${h.nivel}"><i></i></span></button>`}).join("")}`;
  $("#who").innerHTML=EQUIPO.map(p=>`<option value="${p}" ${S.quien===p?"selected":""}>${p}${p==="Tomi"?" · operaciones":" · estrategia"}</option>`).join("")+
    `<optgroup label="Portal del cliente">${S.clientes.filter(c=>c.estado==="Activo").map(c=>`<option value="cliente:${c.id}" ${S.quien==="cliente:"+c.id?"selected":""}>${esc(c.nombre)}</option>`).join("")}</optgroup>`;
}
function render(){
  renderNav();const v=$("#view");
  v.classList.toggle("wide",R.view==="produccion"&&!S.quien.startsWith("cliente:"));
  if(S.quien.startsWith("cliente:")){v.innerHTML=vPortal(cli(S.quien.slice(8)));renderDrawer();return}
  const demo=`<div class="demo"><span>Conectado a la base de datos. Los cambios se guardan para todo el equipo.</span><button class="btn sm" data-act="recargar">Actualizar datos</button></div>`;
  v.innerHTML=demo+({hoy:vHoy,produccion:vProduccion,cartera:vCartera,puesta:vPuesta,cargar:()=>vCargar(cli(R.id)),cliente:()=>vCliente(cli(R.id))})[R.view]();
  renderDrawer();
}

/* ---------- Hoy ---------- */
function vHoy(){
  const t=tareas(S.quien);const atr=t.filter(x=>x.d>x.sla&&x.tipo!=="puesta").length;const nAlta=t.filter(x=>x.tipo==="alta").length;
  const g=[["Puesta al día",t.filter(x=>x.tipo==="puesta")],["Para hacer",t.filter(x=>x.tipo==="hacer"||x.tipo==="revision")],["Seguimientos a clientes y editor",t.filter(x=>x.tipo==="seguir")],["Pedidos",t.filter(x=>x.tipo==="pedido")],["Alta de clientes",t.filter(x=>x.tipo==="alta").sort((a,b)=>a.pct-b.pct)]];
  const fecha=new Date(HOY+"T12:00:00");
  return `<div class="head"><div><h3>${DIAS[fecha.getDay()]} ${fecha.getDate()} de octubre</h3><h1 style="margin-top:6px">Hola, ${esc(S.quien)}. <span class="ac">${t.length-nAlta} cosas</span> para hoy.</h1>
   <p class="sub">${atr?`${atr} están atrasadas. Arrancá por arriba: la lista ya está ordenada por urgencia.`:"Nada atrasado."}</p></div></div>
  ${g.filter(([titulo,arr])=>arr.length||titulo==="Para hacer").map(([titulo,arr])=>`<section class="panel"><div class="head"><h2>${titulo}</h2><span class="meta">${arr.length}</span></div>
   ${arr.length?`<div class="list">${arr.map(x=>{const st=x.d>x.sla?"bad":x.d===x.sla?"warn":"ok";
     return `<div class="item"><span class="av" style="width:36px;height:36px">${ini(x.c.nombre)}</span>
      <div class="grow"><div class="t">${esc(x.txt)}</div><div class="d">${esc(x.c.nombre)} · ${esc(x.sub)}</div></div>
      ${x.tipo==="puesta"?`<span class="pill bad">${x.sla===0?"Sin cargar":x.d+" d"}</span><button class="btn sm primary" data-cargar="${x.c.id}">Cargar</button>`:x.tipo==="alta"?`<span class="pill ${x.pct>=50?"warn":"bad"}">${x.pct}%</span>`:x.tipo==="revision"?`<span class="pill info">Hoy</span>`:`<span class="pill ${st}">${x.d<=0?"hoy":x.d+" d"}</span>`}
      ${x.p&&x.tipo==="hacer"?`<button class="btn sm primary" data-act="avanzar" data-pid="${x.p.id}">Listo</button>`:""}
      ${x.p&&x.tipo==="seguir"?`<button class="btn sm" data-act="avanzar" data-pid="${x.p.id}">Ya llegó</button>`:""}
      ${x.tipo==="revision"?`<button class="btn sm primary" data-open="${x.c.id}" data-tabto="revision">Hacer revisión</button>`:""}
      ${x.tipo==="pedido"?`<button class="btn sm" data-act="ped-ok" data-cid="${x.c.id}" data-id="${x.ped.id}">Resuelto</button>`:""}
      ${x.p?`<button class="btn sm ghost" data-pieza="${x.p.id}">Ver</button>`:`<button class="btn sm ghost" data-open="${x.c.id}">Abrir</button>`}</div>`}).join("")}</div>`:`<div class="empty">Nada pendiente acá.</div>`}</section>`).join("")}`;
}

/* ---------- Producción ---------- */
function vProduccion(){
  const tipos=R.tipo==="todos"?["video","imagen"]:[R.tipo];
  const cs=S.clientes.filter(c=>c.estado==="Activo");
  const tot=cs.reduce((a,c)=>a+c.cuota.video+c.cuota.imagen,0);
  const aire=cs.reduce((a,c)=>a+piezasMes(c).filter(p=>p.etapa==="aire").length,0);
  const all=cs.flatMap(c=>piezasMes(c).map(p=>({p,c}))).filter(x=>R.fcli==="todos"||x.c.id===R.fcli);
  const board=tipo=>{const cols=ETAPAS[tipo];
    return `<div class="board-wrap"><div class="board">${cols.map(e=>{const items=all.filter(x=>x.p.tipo===tipo&&x.p.etapa===e.k);
      return `<div class="col" data-drop="${tipo}:${e.k}"><div class="col-h"><div><b>${e.n}</b><span class="who">${e.r?(e.r==="Cliente"?"Lo tiene el cliente":e.r==="Editor"?"Lo tiene el editor":e.r):"Publicado"}</span></div><span class="n">${items.length}</span></div>
       ${items.map(({p,c})=>{const ls=lateState(p);const ang=c.angulos.find(a=>a.id===p.angulo);const d=days(p.desde);
        return `<div class="card ${ls}" draggable="true" data-drag="${p.id}" data-pieza="${p.id}">
          <div class="top"><span class="av">${ini(c.nombre)}</span>${esc(c.nombre)}</div>
          <div class="tt">${esc(p.titulo)}</div>${ang?`<div class="ang">Ángulo: ${esc(ang.n)}</div>`:""}
          <div class="bot"><span class="kind ${p.tipo}">${p.tipo}</span>${p.etapa==="aire"?`<span class="days">✓</span>`:`<span class="days ${ls}">${d===0?"hoy":d+" d"} · máx ${e.sla}</span>`}</div></div>`}).join("")}
      </div>`}).join("")}</div></div>`};
  return `<div class="head"><div><h1>Producción <span class="ac">· ${MESES[MES]}</span></h1><p class="sub">Todas las piezas del mes de todos los clientes. Arrastrá una tarjeta para moverla de etapa o abrila para ver guion, crudos y final.</p></div>
    <div class="stat" style="padding:14px 18px;flex-direction:row;align-items:center;gap:14px"><b style="font-size:24px">${aire}/${tot}</b><span>piezas al aire<br>este mes</span></div></div>
  ${cs.length?"":`<div class="empty">Todavía no hay clientes activos con estado cargado. Empezá por <button class="btn sm primary" data-go="puesta">Puesta al día</button></div>`}
  <div class="toolbar"><div class="seg">${[["todos","Todo"],["video","Videos"],["imagen","Imágenes"]].map(([k,l])=>`<button data-tipo="${k}" class="${R.tipo===k?"on":""}">${l}</button>`).join("")}</div>
    <select id="fcli" aria-label="Filtrar por cliente"><option value="todos">Todos los clientes</option>${cs.map(c=>`<option value="${c.id}" ${R.fcli===c.id?"selected":""}>${esc(c.nombre)}</option>`).join("")}</select>
    <button class="btn" data-act="nueva">Nueva pieza</button></div>
  ${tipos.map(t=>`<section style="display:flex;flex-direction:column;gap:10px"><h3>${t==="video"?"Videos · graba el cliente, edita el editor":"Imágenes · las genera el equipo con IA"}</h3>${board(t)}</section>`).join("")}`;
}

/* ---------- Cartera ---------- */
function vCartera(){
  const cs=S.clientes;const hs=cs.map(salud);
  const fact=cs.reduce((a,c)=>a+resumen(c,MES).fact,0);
  return `<div class="head"><div><h1>Cartera <span class="ac">· ${cs.length} clientes</span></h1><p class="sub">"Al día" muestra la última novedad registrada; pasados 7 días sin movimiento el cliente vuelve a Puesta al día. La salud combina rendimiento, entregas del equipo, respuesta del cliente y carga de ventas. Abrí un cliente para ver por qué.</p></div></div>
  <div class="stats">
   <div class="stat">${ico("alert","bad")}<b>${hs.filter(h=>h.nivel==="bad").length}</b><span>clientes en rojo</span></div>
   <div class="stat">${ico("clock","warn")}<b>${hs.filter(h=>h.nivel==="warn").length}</b><span>en amarillo</span></div>
   <div class="stat">${ico("check","ok")}<b>${hs.filter(h=>h.nivel==="ok").length}</b><span>en verde</span></div>
   <div class="stat">${ico("inbox","vi")}<b>${hs.filter(h=>h.nivel==="none").length}</b><span>sin datos de ventas</span></div></div>
  <section class="panel"><div class="tbl-wrap"><table><thead><tr><th>Cliente</th><th>Salud</th><th>Al día</th><th>Plan de 90 días</th><th>Producción del mes</th><th class="num">ROAS mes</th><th>Alta</th><th>Lo más urgente</th></tr></thead><tbody>
  ${cs.map((c,i)=>{const h=hs[i];const r=resumen(c,MES);const dp=diaPlan(c);const f=faseActual(c);const ps=piezasMes(c);
    const peor=h.partes.slice().sort((a,b)=>a.v-b.v)[0];
    return `<tr class="click" data-open="${c.id}"><td><div class="cname"><span class="av">${ini(c.nombre)}</span><div>${esc(c.nombre)}<small>${esc(c.rubro)}</small></div></div></td>
     <td><span class="health ${h.nivel}"><i></i>${h.score??"—"}</span></td><td>${(()=>{const fr=frescura(c);return `<span class="pill ${fr.cls}">${fr.txt}</span>`})()}</td>
     <td style="min-width:170px">${c.estado!=="Activo"?`<span class="pill ${c.estado==="Sin cargar"?"bad":"info"}">${c.estado}</span>`:!dp?`<span class="meta">Sin plan cargado</span>`:dp.antes?`<span class="meta">Arranca en ${dp.faltan} días</span>`:`<div style="font-size:12.5px;margin-bottom:6px">${f>=0?esc(c.plan.fases[f].n):""} · día ${dp.d} de ${dp.tot}</div><div class="timeline"><i style="width:${dp.pct}%"></i></div>`}</td>
     <td>${c.estado!=="Activo"?"—":`<div class="quota">${ps.map(p=>`<i class="${p.etapa==="aire"?"on":"mid"}" title="${esc(p.titulo)}"></i>`).join("")}${Array(Math.max(0,c.cuota.video+c.cuota.imagen-ps.length)).fill("<i></i>").join("")}</div><div class="meta" style="margin-top:4px">${ps.filter(p=>p.etapa==="aire").length} de ${c.cuota.video+c.cuota.imagen} al aire</div>`}</td>
     <td class="num" style="color:${r.roas===null?"var(--muted)":r.roas>=4?"var(--ok)":"var(--bad)"}">${r.roas===null?"—":r.roas.toFixed(1)+"×"}</td>
     <td>${(()=>{const a=alta(c);return `<span class="pill ${a.pct===100?"ok":a.pct>=50?"warn":"bad"}">${a.pct}%</span>`})()}</td>
     <td><span class="meta" style="color:var(--fg)">${esc(peor.n)}:</span> <span class="meta">${esc(peor.why)}</span></td></tr>`}).join("")}
  </tbody></table></div></section>`;
}

/* ---------- Cliente ---------- */
const TABS=[["resumen","Resumen"],["estrategia","Estrategia 90 días"],["angulos","Ángulos"],["piezas","Piezas"],["resultados","Resultados"],["revision","Revisión semanal"],["ficha","Ficha"]];
function vCliente(c){
  const h=salud(c);
  const tabs=c.estado==="Onboarding"?[["resumen","Onboarding"],["ficha","Ficha"]]:c.estado==="Sin cargar"?[["resumen","Resumen"],["resultados","Resultados"],["ficha","Ficha"]]:TABS;
  if(!tabs.some(t=>t[0]===R.tab))R.tab="resumen";
  return `<button class="back" data-go="cartera">← Cartera</button>
  <div class="head"><div style="display:flex;gap:16px;align-items:center"><span class="av" style="width:56px;height:56px;border-radius:18px;font-size:17px">${ini(c.nombre)}</span>
    <div><h1>${esc(c.nombre)}</h1><p class="sub" style="margin-top:4px">${esc(c.rubro)} · ${esc(c.zona)}</p></div></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="health ${h.nivel}" style="font-size:15px"><i></i>Salud ${h.score??"sin datos"}</span>${(()=>{const fr=frescura(c);return `<span class="pill ${fr.cls}">Al día: ${fr.txt.toLowerCase()}</span>`})()}${c.drive?`<a class="btn sm" href="${esc(c.drive)}" target="_blank" rel="noopener">Carpeta de Drive ↗</a>`:""}<button class="btn sm primary" data-cargar="${c.id}">Actualizar estado</button></div></div>
  <div class="tabs">${tabs.map(([k,l])=>`<button data-tab="${k}" class="${R.tab===k?"on":""}">${l}</button>`).join("")}</div>
  ${c.estado==="Sin cargar"&&R.tab==="resumen"?tSinCargar(c):c.estado==="Onboarding"&&R.tab==="resumen"?tOnboarding(c):({resumen:tResumen,estrategia:tEstrategia,angulos:tAngulos,piezas:tPiezas,resultados:tResultados,revision:tRevision,ficha:tFicha})[R.tab](c)}`;
}
function tSinCargar(c){const al=alta(c);
  return `<section class="panel" style="align-items:flex-start"><h3>Sin cargar</h3><div class="now-title">Todavía no cargaste el estado de ${esc(c.nombre)}.</div>
   <p class="sub" style="margin:0">Son cuatro preguntas: etapa del servicio, dónde está cada pieza del mes, qué quedó pendiente y día de revisión.</p>
   <button class="btn primary" data-cargar="${c.id}">Cargar estado</button></section>
  <section class="panel"><div class="head"><h3>Alta del cliente · ${al.pct}% completo</h3></div><div class="prog"><i style="width:${al.pct}%"></i></div>
   <div class="alta">${al.items.map(x=>`<button class="alta-i ${x.ok?"ok":""}" data-tab="${x.tab==="estrategia"||x.tab==="angulos"?"ficha":x.tab}"><span class="chk">${x.ok?"✓":""}</span>${x.n}</button>`).join("")}</div></section>`}
function tOnboarding(c){
  return `<section class="panel"><h2>Onboarding</h2><p class="sub" style="margin:0">Hasta completar estos pasos el cliente no entra al ciclo mensual.</p>
   <div class="stepper">${c.onboarding.map((x,i)=>{const cur=!x.ok&&c.onboarding.findIndex(y=>!y.ok)===i;return `<div class="sp ${x.ok?"done":""} ${cur?"cur":""}"><span class="d"></span><span>${esc(x.n)}</span><span class="meta">${x.ok?"Hecho":x.r?`Cliente · ${days(x.desde)} d`:""}</span></div>`}).join("")}</div>
   <div><button class="btn primary" data-act="onb" data-cid="${c.id}">Marcar paso actual como hecho</button></div></section>`;
}
function tResumen(c){
  const h=salud(c);const r=resumen(c,MES);const ps=piezasMes(c);const f=faseActual(c);const al=alta(c);
  return `${al.pct<100?`<section class="panel"><div class="head"><h3>Alta del cliente · ${al.pct}% completo</h3><span class="meta">Completá lo que falta para que el sistema pueda medir y la IA pueda escribir</span></div>
   <div class="prog"><i style="width:${al.pct}%"></i></div>
   <div class="alta">${al.items.map(x=>`<button class="alta-i ${x.ok?"ok":""}" data-tab="${x.tab}"><span class="chk">${x.ok?"✓":""}</span>${x.n}</button>`).join("")}</div></section>`:""}<section class="panel"><div class="head"><h3>Salud de la cuenta</h3><span class="health ${h.nivel}"><i></i>${h.score===null?"Sin datos":h.score+" / 100"}</span></div>
    <div class="hbars">${h.partes.map(p=>`<div class="hbar ${p.c}"><div style="display:flex;justify-content:space-between"><span>${p.n}</span><b style="font-weight:500">${p.v}</b></div><div class="prog"><i style="width:${p.v}%"></i></div><span class="why">${esc(p.why)}</span></div>`).join("")}</div></section>
  <div class="grid2">
   <section class="panel"><div class="head"><h3>Plan de 90 días</h3><button class="btn sm ghost" data-tab="estrategia">Ver plan</button></div>
     <div class="now-title">${esc(c.plan.titulo||"Sin plan cargado")}</div>
     ${c.plan.fases.length?(()=>{const dp=diaPlan(c);return `<div class="meta">${dp.antes?`Arranca en ${dp.faltan} días`:`${f>=0?"Fase: "+esc(c.plan.fases[f].n)+" · ":""}día ${dp.d} de ${dp.tot}`}</div><div class="timeline"><i style="width:${dp.pct}%"></i></div>`})():""}</section>
   <section class="panel"><h3>${MESES[MES]} hasta hoy</h3><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">
     <div class="stat"><b>${r.ventas}</b><span>ventas</span></div><div class="stat"><b>${mshort(r.fact)}</b><span>facturación</span></div>
     <div class="stat"><b>${mshort(r.inv)}</b><span>inversión</span></div><div class="stat"><b style="color:${r.roas===null?"inherit":r.roas>=4?"var(--ok)":"var(--bad)"}">${r.roas===null?"—":r.roas.toFixed(1)+"×"}</b><span>ROAS</span></div></div></section>
  </div>
  <div class="grid2">
   <section class="panel"><div class="head"><h3>Piezas del mes</h3><button class="btn sm ghost" data-tab="piezas">Ver todas</button></div>
     <div class="list">${ps.map(p=>{const e=etapa(p);const ls=lateState(p);return `<div class="item" style="cursor:pointer" data-pieza="${p.id}"><span class="kind ${p.tipo}">${p.tipo}</span><div class="grow"><div class="t">${esc(p.titulo)}</div><div class="d">${esc(e.n)}${e.r?" · "+e.r:""}</div></div><span class="days ${ls}">${p.etapa==="aire"?"Al aire":days(p.desde)+" d"}</span></div>`}).join("")||`<div class="empty">Sin piezas este mes.</div>`}</div></section>
   <section class="panel"><h3>Pedidos y novedades</h3>
     <div class="list">${c.pedidos.filter(p=>!p.ok).map(p=>`<div class="item"><span class="pill ${p.fuera?"warn":"info"}">${p.fuera?"Fuera del servicio":"Pedido"}</span><div class="grow"><div class="t">${esc(p.t)}</div><div class="d">${esc(p.r)} · ${fdate(p.f)}</div></div><button class="btn sm" data-act="ped-ok" data-cid="${c.id}" data-id="${p.id}">Resuelto</button></div>`).join("")}
     ${c.notas.slice(0,4).map(n=>`<div class="item"><span class="meta" style="min-width:40px">${fdate(n.f)}</span><div class="grow"><div>${esc(n.t)}</div><div class="d">${esc(n.a)}</div></div></div>`).join("")}</div>
     <form class="inline-form" data-form="nota" data-cid="${c.id}" style="grid-template-columns:1fr auto auto"><div class="field"><label for="nt">Nueva novedad o pedido</label><input id="nt" name="t" required placeholder="Ej.: pidió un flyer para noviembre"></div>
       <div class="field"><label for="ntp">Tipo</label><select id="ntp" name="tipo"><option value="nota">Novedad</option><option value="dentro">Pedido</option><option value="fuera">Pedido fuera del servicio</option></select></div><button class="btn" type="submit">Agregar</button></form></section>
  </div>`;
}
function tEstrategia(c){
  const f=faseActual(c);const p=c.plan;
  return `<section class="panel"><h3>Objetivo${p.inicio?` · ${fdate(p.inicio)} al ${fdate(p.fin)}`:""}</h3><div class="now-title" style="font-size:26px">${esc(p.titulo||"Sin objetivo cargado")}</div>
   <details${p.titulo?"":" open"}><summary class="meta" style="cursor:pointer">Editar objetivo y fechas</summary><div class="fields" style="margin-top:10px"><div class="field full"><label for="pt">Objetivo del trimestre</label><input id="pt" data-cf="planTitulo" data-rerender="1" value="${esc(p.titulo)}"></div><div class="field"><label for="pi">Inicio</label><input id="pi" type="date" data-cf="planInicio" data-rerender="1" value="${p.inicio}"></div><div class="field"><label for="pf">Fin</label><input id="pf" type="date" data-cf="planFin" data-rerender="1" value="${p.fin}"></div></div></details>
   ${p.kpis.length?`<div><div class="kpi-row h"><span>Indicador</span><span class="base">Punto de partida</span><span>Objetivo</span><span>Hoy</span><span></span></div>
   ${p.kpis.map(k=>`<div class="kpi-row"><span>${esc(k.n)}</span><span class="base meta">${esc(k.base)}</span><span>${esc(k.obj)}</span><span style="font-weight:500">${esc(k.act)}</span><span class="pill ${k.ok===null?"":k.ok?"ok":"bad"}">${k.ok===null?"En curso":k.ok?"En objetivo":"Fuera"}</span></div>`).join("")}</div>`:""}
   ${c.id==="doup"?`<p class="meta" style="margin:0">* Octubre parcial, al 14/10. El plan arranca el 19/10.</p>`:""}</section>
  <section class="panel"><h3>Fases</h3><div class="phase">${p.fases.map((x,i)=>`<div class="ph ${i===f?"now":""}"><span class="when">${fdate(x.d)} – ${fdate(x.h)}${i===f?" · ahora":""}</span><h2>${esc(x.n)}</h2><ul>${x.items.map(it=>`<li>${esc(it)}</li>`).join("")}</ul></div>`).join("")||`<div class="empty">Sin fases cargadas.</div>`}</div></section>
  <section class="panel"><div class="head"><h3>Reglas de decisión</h3><button class="btn sm ghost" data-tab="revision">Usarlas en la revisión</button></div>
   <div><div class="rule h"><span>Situación</span><span>Criterio</span><span>Acción</span><span></span></div>${c.reglas.map(r=>`<div class="rule"><span class="s">${esc(r.s)}</span><span class="c">${esc(r.c)}</span><span>${esc(r.a)}</span><span></span></div>`).join("")}</div></section>`;
}
const AEST=[["revisar","Sin clasificar",""],["ganador","Ganadores","ok"],["testeo","En testeo","info"],["idea","Sin explorar",""],["fatigado","Fatigados","warn"],["descartado","Descartados","bad"]];
function tAngulos(c){
  const cols=[["ganador"],["testeo"],["idea","revisar"],["fatigado","descartado"]];
  return `<p class="sub" style="margin:0">Cada pieza nace de un ángulo. El aprendizaje queda acá aunque el anuncio se apague, y es lo que lee la IA para escribir guiones.</p>
  <div class="angles">${cols.map(ks=>`<div class="acol"><h3>${ks.map(k=>AEST.find(a=>a[0]===k)[1]).join(" y ")}</h3>
   ${c.angulos.filter(a=>ks.includes(a.e)).map(a=>{const est=AEST.find(x=>x[0]===a.e);const np=c.piezas.filter(p=>p.angulo===a.id).length;const vt=c.ventas.filter(v=>v.anuncio===a.n&&v.estado==="Compró").length;
     return `<div class="acard"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span class="n">${esc(a.n)}</span><span class="pill ${est[2]}">${est[1].replace(/s$/,"").replace("Ganadore","Ganador")}</span></div>
      ${a.h?`<p>${esc(a.h)}</p>`:""}${a.k?`<div class="k">${esc(a.k)}</div>`:""}<span class="meta">${np} pieza${np===1?"":"s"}${vt?` · ${vt} ventas registradas`:""}</span>
      <select data-ang="${a.id}" aria-label="Estado de ${esc(a.n)}">${AEST.map(x=>`<option value="${x[0]}" ${x[0]===a.e?"selected":""}>${x[1]}</option>`).join("")}</select></div>`}).join("")||`<div class="empty">Vacío</div>`}</div>`).join("")}</div>
  <form class="inline-form" data-form="angulo" data-cid="${c.id}"><div class="field"><label for="an">Nuevo ángulo</label><input id="an" name="n" required placeholder="Ej.: El lugar"></div><div class="field" style="grid-column:span 2"><label for="ah">Hipótesis</label><input id="ah" name="h" placeholder="Por qué creemos que va a funcionar"></div><button class="btn" type="submit">Agregar</button></form>`;
}
function tPiezas(c){
  const meses=[...new Set(c.piezas.map(p=>p.mes))].sort().reverse();
  return meses.map(m=>{const ps=c.piezas.filter(p=>p.mes===m);return `<section class="panel"><div class="head"><h3>${MESES[m]}</h3><span class="meta">${ps.filter(p=>p.tipo==="video").length}/${c.cuota.video} videos · ${ps.filter(p=>p.tipo==="imagen").length}/${c.cuota.imagen} imágenes</span></div>
   <div class="tbl-wrap"><table><thead><tr><th>Tipo</th><th>Pieza</th><th>Ángulo</th><th>Etapa</th><th>Lo tiene</th><th class="num">Días</th><th>Archivos</th></tr></thead><tbody>
   ${ps.map(p=>{const e=etapa(p);const a=c.angulos.find(x=>x.id===p.angulo);const ls=lateState(p);const nl=Object.values(p.links).filter(Boolean).length;
     return `<tr class="click" data-pieza="${p.id}"><td><span class="kind ${p.tipo}">${p.tipo}</span></td><td style="font-weight:500">${esc(p.titulo)}</td><td class="meta">${esc(a?a.n:"—")}</td><td>${esc(e.n)}</td><td>${e.r?`<span class="role ${e.r}">${e.r}</span>`:"—"}</td><td class="num"><span class="days ${ls}">${p.etapa==="aire"?"—":days(p.desde)}</span></td><td class="meta">${nl} link${nl===1?"":"s"}</td></tr>`}).join("")}</tbody></table></div></section>`}).join("")||`<div class="empty">Sin piezas.</div>`;
}
function mesesCon(c){const ks=Object.keys(MESES).filter(m=>c.metricas[m]||c.ventas.some(v=>v.fecha.startsWith(m)));if(!ks.includes(MES))ks.push(MES);return ks.slice(-6)}
function chartMeses(c){
  const ms=mesesCon(c);const rs=ms.map(m=>resumen(c,m));const max=Math.max(1,...rs.map(r=>Math.max(r.fact,r.inv)));
  const W=560,H=200,pl=8,pb=26,bw=Math.min(34,(W-16)/ms.length/2-8),gap=(W-pl*2)/ms.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Facturación e inversión por mes">
   <line x1="0" x2="${W}" y1="${H-pb}" y2="${H-pb}" stroke="var(--line)"/>
   ${ms.map((m,i)=>{const r=rs[i];const x=pl+gap*i+gap/2;const hf=(H-pb-24)*r.fact/max,hi=(H-pb-24)*r.inv/max;
     return `<rect x="${x-bw-3}" y="${H-pb-hi}" width="${bw}" height="${hi}" rx="6" fill="var(--line-2)"/><rect x="${x+3}" y="${H-pb-hf}" width="${bw}" height="${hf}" rx="6" fill="var(--accent)"/>
     <text x="${x+3+bw/2}" y="${H-pb-hf-6}" text-anchor="middle" class="lbl">${r.roas===null?"":r.roas.toFixed(1)+"×"}</text>
     <text x="${x}" y="${H-8}" text-anchor="middle">${MESES[m]}</text>`}).join("")}</svg>
   <div style="display:flex;gap:16px" class="meta"><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--line-2);margin-right:6px"></span>Inversión</span><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--accent);margin-right:6px"></span>Facturación (ROAS arriba)</span></div>`;
}
function bloqueMetricas(c,mes,cliente){
  const r=resumen(c,mes);
  const fn=r.embudo?[["Conversaciones",r.conv],["Agendas",r.agendas],["Asistencias",r.asist],["Ventas",r.ventas]]:[["Conversaciones",r.conv],["Ventas",r.ventas]];
  const mx=Math.max(1,...fn.map(x=>x[1]));
  const porAng={};c.ventas.filter(v=>v.fecha.startsWith(mes)).forEach(v=>{const k=v.anuncio||"No sabe";porAng[k]??={k,reg:0,ven:0,fact:0};porAng[k].reg++;if(v.estado==="Compró"){porAng[k].ven++;porAng[k].fact+=+v.monto||0}});
  const filas=Object.values(porAng).sort((a,b)=>b.fact-a.fact);
  return `<div class="stats">
    <div class="stat">${ico("coin")}<b>${mshort(r.fact)}</b><span>facturación de ${MESES[mes].toLowerCase()}</span></div>
    <div class="stat">${ico("check","ok")}<b>${r.ventas}</b><span>ventas · ticket ${r.ticket?mshort(r.ticket):"—"}</span></div>
    <div class="stat">${ico("trend",r.roas!==null&&r.roas<4?"bad":"ok")}<b>${r.roas===null?"—":r.roas.toFixed(1)+"×"}</b><span>${cliente?"cada $1 en anuncios devolvió":"ROAS · mínimo 4×"}</span></div>
    <div class="stat">${ico("film","vi")}<b>${r.cpv?mshort(r.cpv):"—"}</b><span>costo por venta</span></div></div>
  <div class="grid2" style="align-items:start">
   <section class="panel"><h3>Embudo</h3><div class="funnel">${fn.map(([l,v],i)=>{const prev=i?fn[i-1][1]:null;return `<div class="fn-row"><span>${l}</span><div class="fn-bar"><i style="width:${v/mx*100}%"></i></div><span class="num">${v.toLocaleString("es-AR")}</span><span class="bm meta">${prev?(v/prev*100).toFixed(1)+"% del paso anterior":""}</span></div>`}).join("")}</div></section>
   <section class="panel"><h3>Últimos meses</h3>${chartMeses(c)}</section></div>
  <section class="panel"><h3>Qué anuncio vende</h3><div class="tbl-wrap"><table><thead><tr><th>Ángulo / anuncio</th><th class="num">Registros</th><th class="num">Ventas</th><th class="num">Facturación</th><th class="num">% del total</th></tr></thead><tbody>
   ${filas.map(x=>`<tr><td>${esc(x.k)}</td><td class="num">${x.reg}</td><td class="num">${x.ven}</td><td class="num">${money(x.fact)}</td><td class="num">${r.fact?(x.fact/r.fact*100).toFixed(0)+"%":"—"}</td></tr>`).join("")||`<tr><td colspan="5"><div class="empty">${r.agg?"Este mes tiene totales importados, sin detalle por anuncio. Cargá los registros del cliente para verlo.":"Sin ventas cargadas."}</div></td></tr>`}</tbody></table></div></section>`;
}
function tResultados(c){
  const m=c.metricas[R.mes]||{};
  return `<div class="toolbar"><div class="seg" style="overflow-x:auto;max-width:100%">${mesesCon(c).map(x=>`<button data-mes="${x}" class="${R.mes===x?"on":""}">${MESES[x]}</button>`).join("")}</div></div>
  ${bloqueMetricas(c,R.mes,false)}
  <section class="panel"><h3>Datos de Meta del mes</h3><p class="note" style="margin:0">Por ahora se cargan a mano desde el administrador de anuncios. Con la conexión a la API se completan solos cada día.</p>
   <div class="fields"><div class="field"><label for="minv">Inversión en pesos</label><input id="minv" type="number" data-met="inv" value="${m.inv??""}"></div><div class="field"><label for="mconv">Conversaciones</label><input id="mconv" type="number" data-met="conv" value="${m.conv??""}"></div></div></section>
  ${tablaVentas(c,R.mes,false)}`;
}
function tablaVentas(c,mes,cliente){
  const v=c.ventas.filter(x=>x.fecha.startsWith(mes)).sort((a,b)=>a.fecha<b.fecha?1:-1);const emb=!c.ventas.every(x=>x.estado==="Compró")||c.ventas.length===0&&false;
  const lim=cliente?20:40;const shown=v.slice(0,lim);
  return `<section class="panel"><div class="head"><h3>${cliente?"Tus cargas":"Registros del cliente"} · ${MESES[mes]}</h3><span class="meta">${v.length} registros${v.length>lim?` · mostrando los últimos ${lim}`:""}</span></div>
  <div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Nombre</th>${emb?"<th>Estado</th>":""}<th>Plan</th><th class="num">Monto</th><th>Vino por</th>${cliente?"<th></th>":""}</tr></thead><tbody>
  ${shown.map(x=>`<tr><td class="meta">${fdate(x.fecha)}</td><td>${esc(x.nombre)}</td>${emb?`<td><span class="pill ${x.estado==="Compró"?"ok":x.estado==="No asistió"?"":"warn"}">${esc(x.estado)}</span></td>`:""}<td>${esc(x.plan||"—")}</td><td class="num">${x.monto?money(x.monto):"—"}</td><td class="meta">${esc(x.anuncio)}</td>${cliente?`<td><button class="btn sm ghost" data-act="v-del" data-cid="${c.id}" data-id="${x.id}" aria-label="Borrar">✕</button></td>`:""}</tr>`).join("")||`<tr><td colspan="7"><div class="empty">Sin registros.</div></td></tr>`}</tbody></table></div></section>`;
}
function tRevision(c){
  const r=resumen(c,MES);
  return `<section class="panel"><div class="head"><div><h2>Revisión semanal · ${DIAS[c.revision]}</h2><p class="sub" style="margin-top:4px">Repasá cada regla contra el administrador de anuncios y las ventas cargadas. Anotá solo lo que decidiste.</p></div>
    <div class="meta">Esta semana: ${r.ventas} ventas en el mes · ROAS ${r.roas===null?"—":r.roas.toFixed(1)+"×"}</div></div>
   <form data-form="revision" data-cid="${c.id}" style="display:flex;flex-direction:column;gap:0">
    <div class="rule h"><span>Regla</span><span>Criterio</span><span>Acción si se cumple</span><span>¿Qué pasó?</span></div>
    ${c.reglas.map((x,i)=>`<div class="rule"><span class="s">${esc(x.s)}</span><span class="c">${esc(x.c)}</span><span>${esc(x.a)}</span>
      <select name="r${i}" aria-label="Resultado ${esc(x.s)}"><option value="">No se cumple</option><option value="aplicada">Se aplicó la acción</option><option value="pendiente">Hay que aplicarla</option></select></div>`).join("")}
    <div class="field" style="margin-top:14px"><label for="rvn">Decisiones y aprendizajes</label><textarea id="rvn" name="nota" placeholder="Ej.: se pausa Aprende un truco, el ángulo comunidad pasa a escala"></textarea></div>
    <div style="margin-top:12px"><button class="btn primary" type="submit">Guardar revisión</button></div></form></section>
  <section class="panel"><h3>Revisiones anteriores</h3>${c.revisiones.length?`<div class="list">${c.revisiones.map(x=>`<div class="item" style="align-items:flex-start"><span class="meta" style="min-width:44px">${fdate(x.f)}</span><div class="grow">${x.dec.map(d=>`<div><b style="font-weight:500">${esc(d.s)}:</b> ${esc(d.t)}</div>`).join("")}<div class="d">${esc(x.a)}</div></div></div>`).join("")}</div>`:`<div class="empty">Todavía no hay revisiones.</div>`}</section>`;
}
function tFicha(c){
  const f=c.ficha;const ta=(k,l)=>`<div class="field"><label for="f-${k}">${l}</label><textarea id="f-${k}" data-ficha="${k}">${esc(f[k])}</textarea></div>`;
  return `<div class="grid2" style="align-items:start"><section class="panel"><h2>Ficha del cliente</h2><div class="fields" style="grid-template-columns:1fr">
    ${ta("hace","Qué hace")}${ta("noHace","Qué no hace o no se promete")}${ta("publico","Público y segmentos")}${ta("oferta","Oferta y proceso de venta")}${ta("tono","Tono")}${ta("reglas","Reglas de producción")}</div>
    <h3 style="margin-top:6px">Servicios y precios</h3><div class="list">${c.servicios.map(s=>`<div class="item"><div class="grow">${esc(s.n)}</div><b style="font-weight:500">${money(s.p)}</b></div>`).join("")||`<div class="empty">Sin servicios.</div>`}</div>
    <div class="fields"><div class="field"><label for="cv">Videos por mes</label><input id="cv" type="number" data-cuota="video" value="${c.cuota.video}"></div><div class="field"><label for="ci">Imágenes por mes</label><input id="ci" type="number" data-cuota="imagen" value="${c.cuota.imagen}"></div>
    <div class="field full"><label for="cm">ID de la cuenta publicitaria de Meta</label><input id="cm" data-cf="meta" value="${esc(c.meta)}" placeholder="Ej.: 1517467059358334"></div>
    <div class="field full"><label for="cd">Carpeta de Drive del cliente</label><input id="cd" data-cf="drive" value="${esc(c.drive)}" placeholder="https://drive.google.com/…"></div></div></section>
   <section class="panel"><div class="head"><h2>Contexto para la IA</h2><button class="btn sm primary" data-act="ctx" data-cid="${c.id}">Copiar</button></div>
    <p class="sub" style="margin:0">Se arma solo con la ficha, el plan y el banco de ángulos. Es la entrada del futuro creador de guiones.</p><pre class="ctx" id="ctx">${esc(contexto(c))}</pre></section></div>`;
}
function contexto(c){
  const f=c.ficha;const L=(t,v)=>v?`${t}: ${v}\n`:"";
  return `CLIENTE: ${c.nombre} · ${c.rubro} · ${c.zona}\n\n`+L("Qué hace",f.hace)+L("No hacer ni prometer",f.noHace)+L("Público",f.publico)+L("Oferta",f.oferta)+L("Tono",f.tono)+L("Reglas de producción",f.reglas)+
  (c.servicios.length?`\nSERVICIOS\n${c.servicios.map(s=>`- ${s.n}: ${money(s.p)}`).join("\n")}\n`:"")+
  (c.plan.titulo?`\nOBJETIVO DEL TRIMESTRE\n${c.plan.titulo}\n`:"")+
  `\nÁNGULOS\n${AEST.map(([k,l])=>{const a=c.angulos.filter(x=>x.e===k);return a.length?`${l}:\n${a.map(x=>`- ${x.n}${x.h?": "+x.h:""}${x.k?" ("+x.k+")":""}`).join("\n")}`:""}).filter(Boolean).join("\n")}`;
}

/* ---------- drawer de pieza ---------- */
function findPieza(id){for(const c of S.clientes){const p=c.piezas.find(x=>x.id==id);if(p)return{c,p}}return{}}
function renderDrawer(){
  const on=!!R.pieza;$("#dbg").classList.toggle("on",on);$("#drawer").classList.toggle("on",on);if(!on)return;
  const {c,p}=findPieza(R.pieza);if(!p){R.pieza=null;return renderDrawer()}
  const et=ETAPAS[p.tipo];const i=et.findIndex(e=>e.k===p.etapa);const a=c.angulos.find(x=>x.id===p.angulo);const cliente=S.quien.startsWith("cliente:");
  $("#drawer").innerHTML=`<button class="x" data-act="cerrar" aria-label="Cerrar">✕</button>
   <div class="dh"><div class="top" style="display:flex;gap:8px;align-items:center"><span class="kind ${p.tipo}">${p.tipo}</span><span class="meta">${esc(c.nombre)} · ${MESES[p.mes]}</span></div>
    ${S.quien.startsWith("cliente:")?`<h2 style="font-size:21px;padding-right:40px">${esc(p.titulo)}</h2>`:`<input aria-label="Título de la pieza" data-titulo="${p.id}" value="${esc(p.titulo)}" style="font-size:19px;font-weight:500;border-color:transparent;padding:4px 6px;margin-left:-6px;width:calc(100% - 40px)">`}${a?`<span class="meta">Ángulo: ${esc(a.n)}</span>`:""}</div>
   <div class="db">
    <div class="stepper">${et.map((e,j)=>`<div class="sp ${j<i?"done":""} ${j===i?"cur":""}"><span class="d"></span><span>${e.n}</span><span class="meta">${j===i&&e.k!=="aire"?`${e.r} · ${days(p.desde)} d de ${e.sla}`:j<i?(p.hist.find(h=>h.k===e.k)?.f?fdate(p.hist.find(h=>h.k===e.k).f):"✓"):e.r}</span></div>`).join("")}</div>
    ${p.etapa!=="aire"&&!cliente?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="avanzar" data-pid="${p.id}">Pasar a ${et[i+1].n.toLowerCase()}</button>${i>0?`<button class="btn" data-act="retro" data-pid="${p.id}">Volver un paso</button>`:""}</div>`:""}
    <div class="links"><h3>Archivos en Drive</h3>
     ${(p.tipo==="video"?[["guion","Guion"],["crudos","Crudos"],["final","Video final"]]:[["guion","Brief"],["final","Imagen final"]]).map(([k,l])=>`<div class="link-row"><label for="lk-${k}">${l}</label>${cliente?(p.links[k]?`<a href="${esc(p.links[k])}" target="_blank" rel="noopener">Abrir ↗</a>`:`<span class="meta">Todavía no</span>`):`<input id="lk-${k}" data-link="${k}" data-pid="${p.id}" value="${esc(p.links[k])}" placeholder="Pegá el link de Drive">`}</div>`).join("")}
     <p class="note" style="margin:4px 0 0">Los videos viven en Drive. El sistema guarda los links y el estado; no hace falta subir archivos pesados.</p></div>
    ${p.tipo==="video"?`<div class="field"><label for="pg">Ganchos a testear</label><input id="pg" type="number" min="1" max="5" data-ganchos="${p.id}" value="${p.ganchos}"></div>`:""}
    <div class="field"><label for="pang">Ángulo</label><select id="pang" data-pang="${p.id}"><option value="">Sin ángulo</option>${c.angulos.map(x=>`<option value="${x.id}" ${x.id===p.angulo?"selected":""}>${esc(x.n)}</option>`).join("")}</select></div>
   </div>`;
}

/* ---------- portal ---------- */
function vPortal(c){
  const opts=[...new Set([...c.angulos.filter(a=>a.e!=="descartado").map(a=>a.n),"No sabe"])];
  const emb=resumen(c,MES).embudo;
  const ps=piezasMes(c).filter(p=>p.etapa==="aprobacion"||p.etapa==="grabacion");
  return `<div class="client-banner"><div><div class="hi">Hola, ${esc(c.nombre)}</div><span>Cargá cada ${emb?"persona que agenda y su resultado":"venta"}. Con eso vemos qué anuncio te trae plata y decidimos dónde invertir.</span></div><span class="livedot" style="color:inherit">Actualizado en vivo</span></div>
  ${ps.length?`<section class="panel"><h3>Te necesitamos</h3><div class="list">${ps.map(p=>`<div class="item"><span class="kind ${p.tipo}">${p.tipo}</span><div class="grow"><div class="t">${p.etapa==="grabacion"?"Grabar":"Aprobar"}: ${esc(p.titulo)}</div><div class="d">${p.etapa==="grabacion"?"El guion está en tu carpeta de Drive":"El video editado está en tu carpeta de Drive"}</div></div>${p.links.guion||p.links.final?`<a class="btn sm" target="_blank" rel="noopener" href="${esc(p.etapa==="grabacion"?p.links.guion:p.links.final||p.links.guion)}">Abrir ↗</a>`:""}</div>`).join("")}</div></section>`:""}
  <section class="panel"><h2>Cargar ${emb?"registro":"venta"}</h2>
   <form class="inline-form" data-form="venta" data-cid="${c.id}">
    <div class="field"><label for="vf">Fecha</label><input id="vf" type="date" name="fecha" value="${HOY}" required></div>
    <div class="field"><label for="vn">Nombre</label><input id="vn" name="nombre" required placeholder="Nombre y apellido"></div>
    ${emb?`<div class="field"><label for="ve">Resultado</label><select id="ve" name="estado"><option>Compró</option><option>Seña</option><option>En seguimiento</option><option>No compró</option><option>No asistió</option></select></div>`:""}
    <div class="field"><label for="vp">Plan</label>${c.servicios.length?`<select id="vp" name="plan" data-planprice="1">${c.servicios.map(s=>`<option data-p="${s.p}">${esc(s.n)}</option>`).join("")}</select>`:`<input id="vp" name="plan" placeholder="Qué compró">`}</div>
    <div class="field"><label for="vm">Monto cobrado</label><input id="vm" type="number" name="monto" value="${c.servicios[0]?.p||""}"></div>
    <div class="field"><label for="va">¿Por qué anuncio llegó?</label><select id="va" name="anuncio">${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select></div>
    <button class="btn primary" type="submit">Cargar</button></form></section>
  ${bloqueMetricas(c,MES,true)}${tablaVentas(c,MES,true)}`;
}

/* ---------- acciones (guardan en la base vía /api/action) ---------- */
async function act(type,payload={},opt={}){
  try{
    const r=await fetch(BASE+"/api/action",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type,quien:S.quien.startsWith("cliente:")?"Cliente":S.quien,...payload})});
    if(r.status===401){location.href=BASE+"/login";return null}const d=await r.json();
    if(!r.ok||d.error){toast(d.error?"No se pudo guardar: "+d.error:"No se pudo guardar");return null}
    S.clientes=d.clientes;if(opt.msg)toast(opt.msg);if(!opt.quiet)render();else renderNav();return d;
  }catch(e){toast("Sin conexión con el servidor. Revisá que esté corriendo.");return null}
}
document.addEventListener("click",async ev=>{
  const t=ev.target.closest("[data-go],[data-open],[data-tab],[data-act],[data-tipo],[data-mes],[data-pieza],[data-cargar]");if(!t)return;
  if(t.dataset.cargar){R.view="cargar";R.id=t.dataset.cargar;R.draft=null;R.pieza=null;render();scrollTo(0,0);return}
  if(t.dataset.act==="cerrar"){R.pieza=null;renderDrawer();return}
  if(t.dataset.go){R.view=t.dataset.go;R.pieza=null;render();scrollTo(0,0);return}
  if(t.dataset.open){R.view="cliente";R.id=t.dataset.open;R.tab=t.dataset.tabto||"resumen";R.mes=MES;R.pieza=null;render();scrollTo(0,0);return}
  if(t.dataset.tab){R.tab=t.dataset.tab;render();return}
  if(t.dataset.tipo){R.tipo=t.dataset.tipo;render();return}
  if(t.dataset.mes){R.mes=t.dataset.mes;render();return}
  if(t.dataset.pieza&&!t.dataset.act){R.pieza=+t.dataset.pieza;renderDrawer();return}
  const a=t.dataset.act;
  if(a==="avanzar"||a==="retro"){const{p}=findPieza(t.dataset.pid);const et=ETAPAS[p.tipo];const i=et.findIndex(e=>e.k===p.etapa);const j=a==="avanzar"?i+1:i-1;if(j<0||j>=et.length)return;
    await act("piece.move",{id:p.id,etapa:et[j].k,nombreEtapa:et[j].n},{msg:`Pasó a ${et[j].n.toLowerCase()}`});return}
  if(a==="ped-ok"){await act("request.close",{id:+t.dataset.id},{msg:"Pedido resuelto"});return}
  if(a==="onb"){await act("onboarding.next",{clientId:t.dataset.cid},{msg:"Paso marcado como hecho"});return}
  if(a==="v-del"){await act("sale.delete",{id:+t.dataset.id},{msg:"Registro borrado"});return}
  if(a==="nueva"){const act0=S.clientes.find(x=>x.estado==="Activo");if(!act0&&R.fcli==="todos"){toast("Primero cargá el estado de un cliente activo");return}
    const c=cli(R.fcli!=="todos"?R.fcli:act0.id);const tipo=R.tipo==="imagen"?"imagen":"video";
    const d=await act("piece.create",{clientId:c.id,tipo,etapa:ETAPAS[tipo][0].k,mes:MES},{msg:`Pieza creada en ${c.nombre}`});if(d&&d.created){R.pieza=d.created;renderDrawer()}return}
  if(a==="ctx"){const txt=contexto(cli(t.dataset.cid));try{navigator.clipboard.writeText(txt).then(()=>toast("Contexto copiado"),selCtx)}catch(e){selCtx()}return}
  if(a==="recargar"){await cargar();toast("Datos actualizados");return}
});
function selCtx(){const el=$("#ctx");if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Texto seleccionado: copialo con Ctrl+C")}
document.addEventListener("change",async ev=>{
  const t=ev.target;
  if(t.form&&t.form.dataset.form==="cargar"){if(t.name==="estado"||t.dataset.wzre){leerDraft(t.form);render()}return}
  if(t.id==="who"){S.quien=t.value;try{localStorage.setItem("goodly-quien",t.value)}catch(e){}R.pieza=null;if(!t.value.startsWith("cliente:")&&R.view==="cliente"&&!R.id)R.view="hoy";render();return}
  if(t.id==="fcli"){R.fcli=t.value;render();return}
  if(t.dataset.planprice){const o=t.selectedOptions[0];const m=t.form.querySelector("[name=monto]");if(m)m.value=o.dataset.p;return}
  if(t.dataset.link){await act("piece.update",{id:+t.dataset.pid,link:t.dataset.link,valor:t.value.trim()},{quiet:true,msg:"Link guardado"});return}
  if(t.dataset.titulo){if(t.value.trim())await act("piece.update",{id:+t.dataset.titulo,titulo:t.value.trim()});return}
  if(t.dataset.ganchos){await act("piece.update",{id:+t.dataset.ganchos,ganchos:+t.value},{quiet:true});return}
  if(t.dataset.pang){await act("piece.update",{id:+t.dataset.pang,angulo:t.value});return}
  const c=cli(R.id);if(!c)return;
  if(t.dataset.ang){await act("angle.update",{id:+t.dataset.ang,estado:t.value},{msg:"Ángulo actualizado"});return}
  if(t.dataset.ficha){await act("client.update",{id:c.id,campo:t.dataset.ficha,valor:t.value},{quiet:true});const el=$("#ctx");if(el)el.textContent=contexto(cli(c.id));return}
  if(t.dataset.cuota){await act("client.update",{id:c.id,campo:t.dataset.cuota,valor:t.value},{quiet:true});return}
  if(t.dataset.cf){await act("client.update",{id:c.id,campo:t.dataset.cf,valor:t.value.trim()},{quiet:!t.dataset.rerender,msg:"Guardado"});return}
  if(t.dataset.met){await act("metric.set",{clientId:c.id,mes:R.mes,campo:t.dataset.met,valor:t.value});return}
});
document.addEventListener("submit",async ev=>{
  const f=ev.target;if(!f.dataset.form)return;ev.preventDefault();const c=cli(f.dataset.cid);const d=Object.fromEntries(new FormData(f));
  const btn=f.querySelector("[type=submit]");if(btn)btn.disabled=true;
  try{
  if(f.dataset.form==="cargar"){leerDraft(f);const sig=ev.submitter&&ev.submitter.value==="1";
    const ok=await act("status.save",{clientId:c.id,d:R.draft,mes:MES},{quiet:true,msg:`Estado de ${c.nombre} guardado`});if(!ok)return;R.draft=null;
    if(sig){const nx=pendientesPuesta()[0];if(nx)R.id=nx.id;else R.view="puesta"}else{R.view="cliente";R.tab="resumen"}render();scrollTo(0,0);return}
  if(f.dataset.form==="venta"){await act("sale.create",{clientId:c.id,fecha:d.fecha,nombre:d.nombre,estado:d.estado||"Compró",plan:d.plan,monto:d.monto,anuncio:d.anuncio},{msg:"Cargado. Las métricas ya se actualizaron."});return}
  if(f.dataset.form==="nota"){if(d.tipo==="nota")await act("note.create",{clientId:c.id,texto:d.t},{msg:"Novedad agregada"});else await act("request.create",{clientId:c.id,texto:d.t,fuera:d.tipo==="fuera"},{msg:"Pedido agregado"});return}
  if(f.dataset.form==="angulo"){await act("angle.create",{clientId:c.id,nombre:d.n,hipotesis:d.h},{msg:"Ángulo agregado"});return}
  if(f.dataset.form==="revision"){const dec=c.reglas.map((r,i)=>d["r"+i]?{s:r.s,t:d["r"+i]==="aplicada"?"Se aplicó: "+r.a.toLowerCase():"Pendiente: "+r.a.toLowerCase()}:null).filter(Boolean);
    if(d.nota)dec.push({s:"Notas",t:d.nota});if(!dec.length)dec.push({s:"Sin cambios",t:"Ninguna regla se cumplió esta semana."});
    await act("review.create",{clientId:c.id,decisiones:dec},{msg:"Revisión guardada"});return}
  }finally{if(btn&&document.body.contains(btn))btn.disabled=false}
});
/* arrastrar tarjetas */
document.addEventListener("dragstart",ev=>{const c=ev.target.closest("[data-drag]");if(c){ev.dataTransfer.setData("text/plain",c.dataset.drag);ev.dataTransfer.effectAllowed="move"}});
document.addEventListener("dragover",ev=>{const col=ev.target.closest("[data-drop]");if(col){ev.preventDefault();document.querySelectorAll(".col.over").forEach(x=>x!==col&&x.classList.remove("over"));col.classList.add("over")}});
document.addEventListener("dragleave",ev=>{const col=ev.target.closest("[data-drop]");if(col&&!col.contains(ev.relatedTarget))col.classList.remove("over")});
document.addEventListener("drop",async ev=>{const col=ev.target.closest("[data-drop]");if(!col)return;ev.preventDefault();col.classList.remove("over");
  const id=ev.dataTransfer.getData("text/plain");const{p}=findPieza(id);const[tipo,k]=col.dataset.drop.split(":");if(!p||p.tipo!==tipo||p.etapa===k)return;
  const e=ETAPAS[tipo].find(x=>x.k===k);await act("piece.move",{id:p.id,etapa:k,nombreEtapa:e.n},{msg:`Pasó a ${e.n.toLowerCase()}`})});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&R.pieza){R.pieza=null;renderDrawer()}});
/* carga inicial y refresco al volver a la pestaña */
async function cargar(){
  try{const r=await fetch(BASE+"/api/state",{cache:"no-store"});if(r.status===401){location.href=BASE+"/login";return}const d=await r.json();S.clientes=d.clientes;render()}
  catch(e){$("#view").innerHTML=`<div class="empty">No se pudo conectar con el servidor. Revisá que esté corriendo con <b>npm run dev</b>.</div>`}
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!R.draft&&!R.pieza)cargar()});
cargar();
