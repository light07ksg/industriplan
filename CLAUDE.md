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
- `src/features/auth/` — AuthScreen (login/registro con hero de blueprint SVG), BlueprintHero.

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

1. **Vista/exportación 3D** del plano, a partir de los mismos datos (`canvasStore` ya tiene todo lo
   necesario: paredes con grosor real, símbolos con ancho/alto/rotación, escala real en metros).
   — **Próximo en la fila.**
2. Adaptación para dispositivos móviles (probablemente PWA responsiva, no reescritura nativa — ver
   discusión previa: dibujar muros punto a punto y arrastrar símbolos chiquitos con el dedo no
   funciona igual que con mouse, va a necesitar una interacción distinta, no solo CSS responsivo).

## Comandos útiles

```bash
npm run dev          # servidor de desarrollo (puerto 5173)
npm run build         # tsc -b && vite build — correr antes de confirmar que algo compila
npx tsc --noEmit -p tsconfig.app.json   # solo type-check, más rápido que el build completo
```
