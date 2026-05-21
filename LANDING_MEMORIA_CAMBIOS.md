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

## Auditoria visual realizada

- Desktop verificado: sin overflow horizontal.
- Mobile verificado: sin overflow horizontal.
- Imagenes verificadas: 10 imagenes reales cargando, sin roturas, tanto en `http://127.0.0.1:4173/` como en `file://`.
- VSL verificado: antes del click se ve un cover propio, no el embed crudo de Loom.
- Click del VSL verificado: no navega a Loom, inyecta el iframe inline con autoplay.
- CTA final verificado: usa `assets/ui/fondo-cta.png` como imagen real de fondo.

## Nota operativa

No se hizo commit ni push a GitHub/Vercel. Los cambios estan locales en `gymos-landing`.
