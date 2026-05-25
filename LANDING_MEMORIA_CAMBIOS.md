# Goodly Fit Landing - Memoria de Cambios

Fecha de auditoria: 2026-05-21 17:22:33 -03

## Objetivo actual

Dejar terminada una landing VSL simple, potente y prolija para Goodly Fit, enfocada en vender Core y Gold sin mostrar precios ni una seccion de planes extensa.

## Decisiones tomadas en el chat

- La landing debe girar alrededor del VSL.
- Se venden solo Core y Gold por ahora.
- Black / AI Recovery queda fuera de esta pagina.
- La estructura final debe ser corta: hero, problema, solucion, casos de exito, CTA final.
- La estetica buscada es cercana a Doglio / Arcadia: fondo oscuro, mucho margen lateral, VSL central, cards simples, botones con efecto premium y poca explicacion.
- La seccion de planes fue eliminada.
- La landing no debe sentirse como una pagina SaaS larga, sino como una pagina de aplicacion.

## Cambios ya implementados

- Reescritura de la landing estatica en `index.html`.
- Espejo de la misma version en `goodlyfit-landing.html`.
- Nuevo hero con logo Goodly Fit, promesa principal, VSL y CTA.
- Logo superior reemplazado por el archivo local `logo gf`.
- Eliminacion del badge "Sistema comercial para gimnasios".
- Eliminacion del texto explicativo bajo el headline.
- Eliminacion de chips de prueba bajo el boton.
- Seccion problema simplificada, sin subtitulo.
- Cards de problema con cruz roja 3D.
- Seccion solucion simplificada, sin subtitulo.
- Solucion en 6 cards: Estrategia organica, Publicidad, Recupero de socios, Agente IA, CRM comercial, Pagina web.
- Eliminacion de la card "Oferta irresistible".
- Casos de exito en formato horizontal con texto a la izquierda e imagen difuminada a la derecha.
- CTA final centrado usando el fondo `fondo-cta.png`.
- Mayor margen lateral y mas aire entre secciones.
- Recursos copiados dentro de `assets/` para que Vercel pueda servirlos.
- VSL convertido a cover propio, sin mostrar el embed crudo de Loom antes del click.
- VSL actualizado para mostrar directo la preview real de Loom, sin el logo Goodly Fit de fondo.
- Ajuste del caso Camilo Yanes para quitar la linea negra visible entre texto e imagen.
- Footer actualizado con logo Goodly Fit clickeable que vuelve a la seccion principal.

## Ultima pasada - 2026-05-21 19:02 -03

- Header: se usa `assets/logos/logo-gf-cropped.png`, derivado del recurso `landing/logo gf.png`.
- Hero: se agrego `id="headline"` para que el logo del footer pueda volver al inicio.
- VSL: el cover ahora usa `assets/ui/loom-preview.gif` como previsualizacion directa de Loom.
- Casos: se suavizo el blend del media de Camilo para eliminar la linea negra en el borde izquierdo.
- Footer: se agrego el logo Goodly Fit arriba del texto de derechos reservados, con link a `#headline`.
- Auditoria local: 10 imagenes cargadas, 0 imagenes rotas, 0 overflow horizontal.
- CTA final: `assets/ui/fondo-cta.png` carga correctamente como imagen de fondo visual.

## Ajuste VSL - 2026-05-21

- Se corrigio el embed de Loom para evitar que aparezcan barra de progreso, reacciones y caja de comentarios al reproducir.
- Se descartaron los crops agresivos del iframe porque Loom reacomodaba la interfaz interna y no era estable.
- Se activo el modo limpio de Loom con `raw_embed_video=true`, `minimal_player=true` y `disable_click_interactions=true`.
- El iframe volvio a ocupar el 100% del marco, sin escalados raros ni mascaras negras.
- Auditoria local: iframe activo, clase `is-playing` aplicada, reproductor limpio al inicio y al final, 0 overflow horizontal.

## Ajustes finales post-produccion - 2026-05-21

- Headline: se redujo levemente el ancho/tamano y se agrego aire vertical para que no se corte.
- Hero CTA: se agrandaron un poco la frase `Llena la aplicacion...` y el boton `Agendar ahora`.
- Problema: se cambio `plata` por `dinero`.
- VSL: se agrego un crop suave al iframe limpio de Loom para reducir barras negras arriba y abajo.
- Camilo Yanes: se corrigio el borde negro derecho haciendo que la imagen exceda el contenedor y anulando el `max-width` global.
- Headline fix: se elimino el `nowrap` rigido para que `clientes nuevos` no se corte en anchos intermedios.

## Ajuste hero - 2026-05-22

- Se copio `landing/fondo headline.png` a `assets/ui/fondo-headline.png` para que Vercel pueda servir el recurso desde la landing.
- Hero/headline: se aplico `assets/ui/fondo-headline.png` como fondo real de la primera seccion.
- Hero/headline: se agregaron overlays oscuros/azules para conservar contraste del logo, headline, VSL y CTA sobre la imagen.

## Ajuste fondos secciones - 2026-05-22

- Problema, solucion y casos de exito ahora comparten el mismo fondo base limpio.
- Se quitaron los fondos propios y lineas divisorias de problema y casos para que la secuencia se vea mas continua.

## Agenda y dominio - 2026-05-23

- Se preparo la ruta `/agenda/` como pagina independiente para embeber el calendario de Calendly.
- Los CTAs principales de la landing ahora apuntan a `/agenda/` en lugar de abrir Calendly directo en otra pestaña.
- La pagina de agenda mantiene branding visual Goodly Fit, fondo premium, logo, vuelta a landing y tracking basico.
- `vercel.json` ahora incluye `agenda/**/*` dentro de los builds estaticos.
- Favicon: se copio `landing/Logo goodly fit.png` a `assets/logos/logo-goodly-fit-favicon.png` y se uso como icono de pestana en home y agenda.

## Mockup formulario propio - 2026-05-23

- Se transformo `/agenda/` en un flujo de aplicacion previo a Calendly.
- El formulario muestra una pregunta por pantalla, boton `Siguiente`, boton `Anterior` y progreso `Pregunta X de 10` + `Faltan X`.
- Calendly queda bloqueado visualmente hasta completar la aplicacion.
- Al terminar, se desbloquea el calendario y se arma la URL de Calendly con nombre, email y respuestas como parametros/prefill.
- Se dejo preparado el evento `goodly_application_completed` para GTM/dataLayer y un `console.info` temporal con los datos para conectar despues a CRM, webhook o GHL.
- No se hizo commit ni push: queda como mockup local para aprobacion visual.

## Ajustes formulario propio - 2026-05-23

- La aplicacion paso de 8 a 10 preguntas.
- Se actualizo el ejemplo de gimnasio a `Goodly Gym, Buenos Aires, 7 sedes`.
- Se agrego la pregunta multiseleccion `Como es tu sistema comercial hoy` con checkboxes: organico, CM, publicidad, chatbot WhatsApp y CRM.
- Se cambio `socios activos` por `clientes activos` y se actualizaron los rangos: menos de 300, 300 a 700, 700 a 3000, + de 3000.
- Se reemplazo la pregunta de decision por compromiso de asistencia/tomadores de decision.
- Se agrego la pregunta de timing: listo para escalar ahora vs curioseando.

## Ajustes formulario propio v2 - 2026-05-23

- El formulario se mantuvo en 10 preguntas.
- Se agrego la pregunta `Cual es el Instagram de tu gimnasio`.
- Se agrego la pregunta de rol con opciones: Dueño, Gerente, Empleado, para filtrar curiosos y priorizar decisores.
- Se eliminaron las preguntas `Cual es el principal problema comercial hoy` y `Contanos brevemente que estas intentando mejorar`.
- La ultima pregunta ahora confirma que un asesor va a hablar por WhatsApp en pocos minutos y que, si no responde, la agenda se cancela automaticamente.
- Se actualizaron los parametros enviados a Calendly con Instagram, rol, sistema comercial, clientes activos, asistencia y confirmacion por WhatsApp.

## Ajustes formulario propio v3 - 2026-05-23

- En sistema comercial se cambio `Tengo CM` por `Tengo Community Manager`.
- Se agregaron `Tengo equipo de marketing interno` y `Ninguna de las anteriores`.
- `Ninguna de las anteriores` funciona como opcion excluyente frente al resto de checkboxes.
- En clientes activos se cambiaron los rangos finales a `700 a 1500 clientes` y `Mas de 1500 clientes`.
- En asistencia se cambio el texto a `Asisto con mi socio y no vamos a llegar tarde`.
- El desbloqueo de calendario dejo de depender del widget JS de Calendly: ahora se inyecta un iframe directo con parametros embed para que el calendario aparezca al tocar `Ver calendario`.

## Ajuste copy centro fitness - 2026-05-23

- En la landing principal y la pagina de agenda se cambio el termino visible `gimnasio/gimnasios` por `centro fitness/centros fitness`.
- En agenda se cambio el titulo del formulario a `La situacion actual de tu centro fitness`.
- La bajada del formulario ahora explica que las preguntas sirven para entender la situacion del centro fitness y preparar el diagnostico comercial de la llamada.
- Se actualizo el placeholder de nombre del negocio a `Goodly Fitness, Buenos Aires, 7 sedes`.

## Ajuste agenda simple - 2026-05-23

- La frase superior de agenda quedo como `Primero completa la aplicacion. Luego vas a poder elegir dia y horario para revisar tu sistema comercial.`
- Se elimino el titulo `La situacion actual de tu centro fitness` y su bajada para que el formulario arranque mas rapido con la primera pregunta.

## Ajuste WhatsApp con pais - 2026-05-23

- En la pregunta de WhatsApp se agrego un selector de pais con bandera, nombre y codigo internacional.
- El selector incluye Argentina, Uruguay, Chile, Paraguay, Bolivia, Peru, Colombia, Mexico, Brasil, Ecuador, Venezuela, Costa Rica, Panama, Estados Unidos, Canada y Espana.
- El numero local se carga en un campo separado y el dato final se combina como `codigo + numero` para enviarlo a Calendly/CRM.
- La validacion del formulario ahora revisa todos los campos requeridos del paso activo, incluyendo `select`.

## Ajustes UX formulario mobile - 2026-05-23

- Se acerco el boton `Siguiente` al campo activo reduciendo el alto artificial del formulario y quitando el empuje hacia abajo.
- En mobile se oculta el panel de calendario bloqueado hasta completar la aplicacion, para que el formulario sea mas corto.
- Al completar la aplicacion en mobile se oculta el panel del formulario y se muestra el calendario.
- El input de WhatsApp ahora queda como un solo campo compuesto: selector de pais con bandera/codigo, prefijo no editable y numero local.
- Los paises del selector quedaron en orden alfabetico.
- Se cambio la ayuda de sedes a `Si tenes mas de una sede, aclara todas las ciudades en las que estan` y el ejemplo a `Goodly Fit Gym (Buenos Aires, Rosario, Cordoba)`.
- La opcion de marketing se cambio a `Tengo un equipo interno de marketing` para diferenciarla mejor de Community Manager.
- La ayuda de decision/asistencia se cambio a `La llamada se realiza con las personas decisoras del negocio y en horario puntual`.
- Se reforzo el desbloqueo de calendario con iframe directo, display explicito, modo calendario y fallback visible a Calendly.
- El logo superior de agenda quedo centrado, sin boton `Volver a la landing`; el logo mantiene link a `/`.

## Ajustes telefono y email - 2026-05-23

- Se reemplazo el selector nativo de pais por un dropdown custom.
- En el dropdown abierto se muestra bandera, pais y codigo; en la barra cerrada solo se muestra bandera y pais para no duplicar el codigo.
- El codigo internacional queda bloqueado en un bloque separado y el telefono local se escribe a la derecha dentro de la misma barra, tambien en mobile.
- Se agrego validacion fuerte de email con regex y mensaje: `El formato no es correcto. Ejemplo valido: juan.garcia@gmail.com`.
- El input de email tambien recibio `pattern` para ayudar a que Calendly acepte el dato.

## Fix dropdown pais - 2026-05-23

- El desplegable de paises no se veia porque la barra de telefono tenia `overflow: hidden`.
- Se cambio a `overflow: visible` y se subio el `z-index` del menu para que pueda desplegarse por encima del formulario.

## Fix imagenes agenda file - 2026-05-24

- Se copiaron los recursos visuales necesarios dentro de `agenda/assets/` para que la pagina funcione abriendola directo por `file://`.
- La agenda ahora carga logo, favicon y fondo desde `./assets/...` en vez de `../assets/...`.
- Se agrego cache bust `v=20260524` al logo y favicon de agenda.

## Ajuste rol negocio - 2026-05-23

- Se agrego `Coordinador` como opcion en la pregunta `Cual es tu rol en el negocio`.

## Validaciones formulario - 2026-05-23

- Nombre y apellido ahora exige minimo de caracteres y muestra `Escribi tu nombre y apellido para avanzar`.
- Nombre del centro fitness exige minimo de caracteres y muestra `El nombre del centro fitness es demasiado corto. Agrega nombre y ciudad`.
- Instagram exige minimo de caracteres y muestra `El Instagram es demasiado corto. Ingresa el usuario completo`.
- WhatsApp valida cantidad minima de digitos segun codigo de pais antes de avanzar.
- Se elimino la opcion `Tengo un equipo interno de marketing`.
- En sistema comercial, `Tengo Community Manager` quedo como primera opcion.

## Ajuste copy calendario bloqueado - 2026-05-24

- En la tarjeta de calendario se elimino el texto `Primero completa la aplicacion para desbloquear horarios`.
- El texto bloqueado ahora dice `Completa las preguntas para desbloquear opciones de dias y horarios`.

## Efecto boton siguiente - 2026-05-24

- El boton `Siguiente` recibio un efecto de brillo animado que cruza de izquierda a derecha, inspirado en la referencia visual de Doglio.

## Ajuste fallback Calendly - 2026-05-24

- Se quito el texto visible `Si el calendario no carga, abrilo desde aca: Abrir Calendly`.
- Se elimino tambien el enlace de fallback oculto y sus referencias JS.

## Auditoria visual realizada

- Desktop verificado: sin overflow horizontal.
- Mobile verificado: sin overflow horizontal.
- Imagenes verificadas: 10 imagenes reales cargando, sin roturas, tanto en `http://127.0.0.1:4173/` como en `file://`.
- VSL verificado: antes del click se ve un cover propio, no el embed crudo de Loom.
- Click del VSL verificado: no navega a Loom, inyecta el iframe inline con autoplay.
- CTA final verificado: usa `assets/ui/fondo-cta.png` como imagen real de fondo.

## Nota operativa

No se hizo commit ni push a GitHub/Vercel. Los cambios estan locales en `gymos-landing`.

## Fix final imagenes agenda - 2026-05-24

- Se dejo la agenda apuntando a `../assets/...` para que el logo, favicon y fondo funcionen tanto en `file://`, localhost y Vercel.
- Se mantuvo una copia fallback en `agenda/assets/` para cubrir versiones cacheadas que todavia busquen `./assets/...`.
- Verificado en `http://127.0.0.1:4180/agenda/`: logo Goodly Fit carga con dimensiones reales y el fondo `fondo-headline.png` aparece aplicado en el `body`.

## Tracking CRM, Meta y dashboard - 2026-05-25

- Se agrego el endpoint seguro `api/lead.js` para enviar aplicaciones completas a GHL por webhook sin exponer la URL dentro del HTML.
- El formulario de `/agenda/` ahora genera eventos de embudo: `goodly_application_started`, `goodly_application_completed`, `goodly_calendar_opened` y `calendly_event_scheduled`.
- Meta Pixel ahora marca `Lead` solo cuando la aplicacion fue completada, no cuando alguien toca el boton de agenda.
- La landing principal ahora mide `goodly_vsl_play` y `goodly_cta_click` en `dataLayer`, mas eventos custom de Meta (`GoodlyVSLPlay` y `GoodlyCTAClick`).
- Se incorporo captura de UTMs, `fbclid`, `_fbp`, `_fbc`, URL y referrer para que GTM/GA4, Meta y GHL puedan leer mejor la fuente de cada lead.
- El endpoint incluye soporte opcional para Meta Conversions API si se configuran `META_CAPI_TOKEN`, `META_PIXEL_ID` y `META_GRAPH_API_VERSION` en Vercel.
- En esta configuracion estatica de Vercel, el formulario publica al endpoint desplegado como `/api/lead.js`.
- En GHL se configuro el workflow `Landing Goodly Fit - Aplicaciones` con trigger `Inbound Webhook Aplicacion landing Goodly Fit`.
- El workflow crea/actualiza contacto con nombre, email, telefono, negocio y source `Landing Goodly Fit`.
- Se agrego una accion `Note` para guardar dentro del contacto las respuestas de la aplicacion, UTMs, URL, fbclid y Event ID.
- Prueba real validada: el contacto `Test Goodly Nota` entro en GHL y la nota `Aplicacion Goodly Fit` muestra respuestas y tracking.
- Meta Pixel browser-side quedo activo en landing y agenda. Meta CAPI server-side queda preparado, pero salta `missing_meta_capi_token` hasta configurar el token en Vercel.

## Automatizacion cita agendada - 2026-05-25

- Se agrego `api/appointment.js` para recibir el evento `calendly.event_scheduled` desde `/agenda/` y reenviarlo a GHL por webhook.
- `/agenda/` ahora conserva los datos de la aplicacion completada y, cuando Calendly confirma la cita, envia aplicacion + payload de Calendly + tracking a `/api/appointment.js`.
- El endpoint puede hidratar datos reales de Calendly si se configura `CALENDLY_TOKEN`: fecha, hora, zona horaria, link de reunion, link de reprogramacion y link de cancelacion.
- El endpoint envia a GHL campos planos para automatizaciones: `name`, `email`, `phone`, `gym`, `instagram`, `businessRole`, `commercialSystem`, `activeClients`, `decisionAttendance`, `whatsappConfirmation`, `appointmentDate`, `appointmentTime`, `meetingLink`, `rescheduleUrl`, `cancelUrl`, UTMs y tracking.
- En GHL se creo el workflow borrador `Goodly Fit - Cita agendada Calendly`.
- Trigger configurado: `Inbound Webhook Cita Calendly Goodly Fit`.
- Webhook GHL de cita: `https://services.leadconnectorhq.com/hooks/4S1B54UPr516ZRNelvK0/webhook-trigger/88d0ff4f-cb3d-430e-a39e-0968d070343d`.
- El trigger recibio una prueba por `curl` y GHL devolvio `Success: test request received`.
- Accion `Create Contact` configurada en el workflow de cita: nombre, email, telefono, business name y source `Goodly Fit - Agenda Calendly`.
- Accion `Note` configurada para guardar las respuestas de aplicacion, datos de cita Calendly, links y tracking.
- Accion `Add Tag` configurada con `goodly fit landing`, `cita agendada` y `pendiente confirmacion`.
- `GHL_APPOINTMENT_WEBHOOK_URL` quedo agregado en Vercel. Hace falta nuevo deploy para que el endpoint live lo tome.
- Con confirmacion explicita del usuario, se agrego una accion `WhatsApp` free-form al workflow publicado: pide responder `CONFIRMO` y avisa que Nahuel se comunica a la brevedad.
- Se agrego una rama `Undelivered` despues del WhatsApp: si el mensaje no se entrega, envia email interno a `nahuel.turano@goodlyfit.app` con datos del contacto, respuestas y cita para seguimiento manual.
- El workflow `Goodly Fit - Cita agendada Calendly` quedo guardado y publicado en GHL.
- Deploy Vercel verificado: `ArVf9b8aL`, commit `839b085`, estado `Ready Latest`.
- Prueba live verificada contra `https://www.goodlyfit.app/api/appointment.js`: respuesta `crm.skipped:false`, `status:200`.
- Logs de GHL verificados con contacto de prueba `Test Goodly Cita Final`: `Create Contact`, `Note`, `Add Tag` e `Internal Notification` ejecutaron; `WhatsApp` fallo por telefono de prueba invalido y entro correctamente por la rama `Undelivered`.
- Pendiente para enriquecer recordatorios con dia, hora y link reales: configurar `CALENDLY_TOKEN` en Vercel para hidratar el evento Calendly desde el endpoint.
