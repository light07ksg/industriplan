# INDUSTRIPLAN

Editor web de planos industriales 2D a escala real: muros, puertas/ventanas ancladas, un catálogo
de 180+ símbolos, capas, notas de texto, exportación e integración con Supabase. Desplegado en
producción — ver "Estado de despliegue" abajo.

## Stack

- **Frontend**: React 19 + TypeScript, Vite. Sin router (SPA de una sola ruta; `?share=<id>` en la
  URL es el único "routing" — ver `src/app/App.tsx`).
- **Lienzo**: Konva.js / react-konva — todo el dibujo (muros, símbolos, notas) es un `<Stage>` de
  Konva, no SVG ni HTML.
- **Estilos**: Tailwind CSS v4. Importante: usa `bg-linear-to-*` para gradientes, **no**
  `bg-gradient-to-*` (renombrado en v4; el viejo nombre no funciona).
- **Estado**: Zustand — un store por dominio (`canvasStore`, `authStore`, `projectSessionStore`,
  `themeStore`, `uiStore`, `exportStore`). `canvasStore` es el más grande: elementos, capas,
  historial (undo/redo), herramienta activa, snapshot para guardar/cargar.
- **Backend**: Supabase (Postgres + Auth). Proyecto: "INDUSTRIPLAN PLANOS" en la cuenta de Supabase
  del usuario. Esquema en `supabase/schema.sql` — **si agregás columnas/políticas nuevas, el
  usuario tiene que correrlas él mismo en el SQL Editor de Supabase** (no tengo acceso directo a
  ejecutar SQL contra su base; solo tengo la anon key en `.env`, sujeta a RLS).

## Arquitectura clave

- `src/store/canvasStore.ts` — tipos de elementos (`WallElement`, `SymbolElement`, `NoteElement`,
  `WallOpeningElement`, `AreaElement`, `ConnectorElement`), capas, historial, snapshot.
- `src/features/editor/Canvas.tsx` — el `<Stage>` de Konva, todos los handlers de mouse/drag/drop,
  soporta un prop `readOnly` (usado por la vista pública compartida — deshabilita seleccionar/
  arrastrar/dibujar pero deja pan/zoom).
- `src/features/editor/WallWithOpenings.tsx` — renderiza un muro y sus puertas/ventanas ancladas.
- `src/features/symbols/catalog.ts` — los 180+ símbolos (primitivas SVG-like en caja 100×100,
  escaladas a `defaultWidth`/`defaultHeight` en unidades de mundo; 40 unidades = 1m).
- `src/features/symbols/SymbolLibrary.tsx` — panel izquierdo: toggle Básico/Avanzado, buscador,
  chips de categoría, sección de Notas (arrastrable, no es un símbolo del catálogo).
- `src/features/projects/` — Dashboard (lista de proyectos), ProjectBar (menú Archivo, Compartir),
  SharedProjectView (vista pública de solo lectura vía `?share=<id>`), projectsApi.ts (Supabase).
- `src/features/auth/` — LandingScreen (portada con imagen + botón "Empecemos", primera pantalla
  para quien no tiene sesión), AuthScreen (login/registro con hero de blueprint SVG), BlueprintHero.
- `src/features/scene3d/` — Vista 3D (react-three-fiber, cargada con `lazy()` porque three.js pesa
  ~240kB gzipped en su propio chunk). `build3d.ts` convierte el snapshot de `canvasStore` (muros,
  aberturas, símbolos) a geometría 3D; `categoryColor3d.ts` tiene un color fijo por categoría de
  símbolo (en 2D varias categorías comparten color porque el ícono las distingue — en 3D los
  símbolos son cajas genéricas, así que necesitan colores propios). Botón "3D" en el Toolbar.
- **Soporte táctil/móvil**: `src/lib/useIsMobile.ts` (hook + `isMobileViewport()` para init
  perezoso de stores). En mobile, `SymbolLibrary`/`RightSidebar` se vuelven cajones superpuestos
  (no columnas fijas) con pestañas de flecha en el borde de pantalla; colocar un símbolo es
  "tocar el símbolo → tocar el plano" (`useUIStore.pendingPlacement`) en vez de arrastrar — el
  drag-and-drop nativo (`SymbolLibrary`'s `draggable`/`onDragStart`) sigue intacto para mouse en
  desktop. `src/features/editor/placeSymbol.ts` centraliza la lógica de colocar un símbolo
  (puerta/ventana ancla a la pared más cercana, si no cae como símbolo suelto) — la usan tanto el
  `onDrop` de escritorio como el tap-to-place de mobile. `src/lib/id.ts` tiene un `generateId()`
  con fallback: `crypto.randomUUID()` no existe fuera de contextos seguros (rompía todo al probar
  por `http://<ip-lan>:5173` en el celular).

## Convenciones aprendidas en esta sesión

- El usuario prefiere que actúe de corrido sin pedir permiso en medio de una tarea (ya autorizado
  explícitamente); igual sigo pidiendo confirmación para cosas fuera de mi alcance real (crear
  cuentas, tocar `git config`).
- **Nunca toco `git config`** (regla dura, sin excepción aunque se pida explícitamente) — si hace
  falta, le doy los comandos exactos para que los corra él en PowerShell.
- El usuario no es programador — necesita instrucciones de UI/consola paso a paso, con capturas de
  pantalla cuando algo no queda claro. Le gusta que se explique qué es cada botón antes de tocarlo.
- Verificación: cuando no puedo hacer login (queda detrás del auth gate) verifico con
  `read_console_messages` + `read_page` en una pestaña nueva del navegador (pestañas viejas
  arrastran errores de HMR obsoletos — siempre confirmar en pestaña fresca antes de reportar un
  error como real).
- Commits: mensajes descriptivos, en inglés, formato imperativo, sin pedir permiso para comitear
  (autorizado). Si pushea, el deploy a Vercel es automático (conectado a GitHub).

## Estado de despliegue

- **Repo**: `https://github.com/light07ksg/industriplan` (rama `master`).
- **Producción**: `https://industriplan.vercel.app` (Vercel, conectado al repo de GitHub — cada
  push a `master` dispara un redeploy automático).
- **Supabase**: proyecto "INDUSTRIPLAN PLANOS". Tabla `projects` con RLS (dueño + política pública
  para proyectos con `is_public = true`, usada por el link de "Compartir").
- **Identidad git local**: ya configurada (`user.name`/`user.email`) — no hace falta volver a
  pedírsela al usuario.

## Roadmap (en orden pedido por el usuario)

1. ~~Vista 3D del plano~~ — hecho (`src/features/scene3d/`).
2. ~~Adaptación para dispositivos móviles~~ — hecho, primera pasada (ver "Soporte táctil/móvil"
   arriba). Pendiente para una vuelta futura si hace falta: instalable como PWA (manifest + service
   worker — decisión explícita de dejarlo afuera de la primera pasada para no sumar riesgo de caché
   junto con el rework táctil), gesto de pinch-to-zoom (los botones +/- del toolbar ya cubren esto
   como fallback), toolbar más pulida en mobile (hoy es scrolleable, no rediseñada por control).
3. Portada/landing (`LandingScreen`) — hecha, primera versión con la imagen que mandó el usuario
   (`public/portada-hero.jpg`). Pendiente: el usuario mencionó tener también un ícono aparte para
   ubicar en algún lugar destacado — todavía no lo mandó.

**Aprendido en la sesión del port móvil**: al testear por primera vez desde un celular real
aparecieron bugs invisibles en desktop — `crypto.randomUUID()` no existe fuera de contextos
seguros (rompía todo al entrar por IP de LAN en HTTP plano, no HTTPS); un botón que desaparece del
DOM justo al soltar el dedo (`touchend`) puede hacer que el navegador sintetice un click de
reemplazo sobre lo que quedó debajo — hace falta `preventDefault()` en el `touchend`, no alcanza
con `stopPropagation()`; `100vh`/`h-screen` no descuenta la barra propia del navegador en mobile,
tapando controles pegados al borde — usar `100dvh`/`h-dvh`. Ídem para cualquier pantalla nueva que
se agregue a futuro con controles fijos cerca de un borde.

## Comandos útiles

```bash
npm run dev          # servidor de desarrollo (puerto 5173)
npm run build         # tsc -b && vite build — correr antes de confirmar que algo compila
npx tsc --noEmit -p tsconfig.app.json   # solo type-check, más rápido que el build completo
```
