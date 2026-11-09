# 4readers — app móvil (Expo + React Native)

Frontend móvil de 4readers (Expo + React Native): blog verificado estilo X/Twitter, estudio de creadores, billetera de fichas y minitienda con Stripe.

## Arranque

```bash
npm install
npx expo install --fix      # alinea las versiones de Expo/RN con tu SDK
npx expo start              # escanea el QR con Expo Go
```

La URL de la API se detecta sola en desarrollo (IP de tu PC + `:3000`). Para fijarla: copia `.env.example` a `.env` y define `EXPO_PUBLIC_API_URL`.
Tu PC y el teléfono deben estar en la misma red, y la API debe escuchar en `0.0.0.0` (Nest lo hace por defecto).

## Estructura

```
app/                    Rutas (expo-router)
  (auth)/               login, register
  (tabs)/               index (Inicio), explore, saved (Guardados), profile
  post/[id], post/new   detalle y publicar
  category/[id]  my-posts  wallet  store/  moderation/
src/
  api/        client.ts (fetch + refresh), hooks.ts (React Query), keys.ts, types.ts
  lib/        session (SecureStore), queryClient (persistencia), bookmarks, validation, format
  ui/         Sistema de diseño: la ÚNICA fuente de componentes
  components/ PostList (lista compartida)
```

## Una sola identidad visual

Todo sale de `src/ui` y de `src/ui/theme.ts`. No hay estilos de pantalla "sueltos":

| Componente | Dónde se usa |
|---|---|
| `Field` | login, registro, título/resumen/contenido/fuentes del artículo, notas de moderación |
| `Button` / `IconButton` | todas las acciones (primario, secundario, ghost, light) |
| `Chip` / `ChipRow` | categorías, filtros, orden, pestañas internas, veredicto, categoría al publicar |
| `PostRow` | Inicio, categoría, Guardados, Mis artículos, Moderación |
| `ListRow` | Perfil, movimientos, compras, categorías, fuentes |
| `ScreenHeader` / `NavHeader` | cabeceras de pestañas / de pantallas apiladas |
| `Card`, `Badge`, `Banner`, `EmptyState`, `ErrorState`, `SkeletonRows` | estados y contenedores |

Cambiar un color, radio o fuente en `theme.ts` cambia toda la app.

## Velocidad y persistencia

- **Caché en disco** (`queryClient.ts`): React Query + AsyncStorage. La app abre con el último feed/billetera al instante y revalida en segundo plano.
- **`staleTime` 60 s** por defecto (categorías 1 h, paquetes 30 min): navegar no repite peticiones. La API limita a 60 req/min por cliente.
- **Detalle instantáneo**: el feed ya trae el contenido, `usePost` abre con esos datos sin esperar a la red.
- **Offline**: sin red se muestra lo cacheado; React Query reintenta al volver la conexión o al reabrir la app.
- **Tokens** en SecureStore. Renovación automática y "single-flight" (una sola llamada a `/auth/refresh` aunque fallen varias peticiones); si el token está por caducar se renueva *antes* de pedir. Un fallo de red nunca cierra sesión; un refresh rechazado sí, y limpia toda la caché.
- **Guardados** ("For Later"): la API no tiene favoritos, así que se guardan en el dispositivo (por usuario) con copia del artículo para leerlo sin conexión.
- Paginación infinita (10 por página) en feed, mis artículos, movimientos, compras y moderación.
- Esqueletos con la forma de `PostRow` mientras carga.

## Endpoints usados

`/auth/{register,login,refresh}` · `/users/me` · `/wallet/me`, `/wallet/me/transactions` · `/blog/categories`, `/blog/posts`, `/blog/posts/me`, `/blog/posts/:id`, `POST /blog/posts`, `/blog/moderation/posts`, `POST /blog/moderation/posts/:id/verify` · `/store/packages`, `POST /store/stripe/checkout`, `/store/orders/me` · `PATCH /blog/posts/:id`, `GET /blog/posts/me/:id`, `POST /blog/posts/:id/verification-request`.

**Reputación y economía:** perfil público de autor (`/blog/authors/:username`: verificados, tasa de verificación, confianza media), propinas en fichas desde el detalle de cada artículo (la plataforma retiene una comisión) y edición de artículos verificados con confirmación (retira la insignia). Los moderadores cobran una recompensa por revisión, visible en *Movimientos*.

**Cobros:** la pantalla *Cobros* (Perfil) permite verificar identidad, indicar el destino y retirar fichas ganadas. El dinero lo envía un administrador (endpoints `/payouts/admin/*` de la API).

**Modelo:** publicar es gratis; la insignia de verificación se compra con fichas desde el detalle del artículo (solo el autor ve ese panel). Requiere la API actualizada (`docs/MODELO_COMERCIAL.md` en `cashback-api-actualizada.zip`).
Los errores del backend (`{ code, message, details, actionHint, referenceId }`) se muestran tal cual: ya vienen en español y sin datos técnicos. El `402 INSUFFICIENT_FUNDS` lleva al usuario a la Minitienda.

## Compra con Stripe

`/store/stripe/checkout` devuelve `checkoutUrl`; se abre en el navegador integrado. Al volver, la orden queda `PENDING` hasta que llega el webhook de Stripe, y la pestaña **Compras** consulta cada 4 s hasta confirmarla (luego refresca el saldo).
Para que el navegador se cierre solo al terminar, apunta en el backend `STRIPE_SUCCESS_URL` a `cashbank://store/success` y `STRIPE_CANCEL_URL` a `cashbank://store/cancel` (la app ya tiene esas rutas). No lo he podido probar contra Stripe: si rechaza el esquema `cashbank://`, déjalo como está; funciona igual, solo que cierras el navegador a mano.

## Límites conocidos

- La API no maneja imágenes: las portadas son degradados generados de forma estable por categoría.
- No incluye pantallas de administración (bonos, estado de billetera, crear categorías/paquetes, cambiar roles). Los endpoints existen; se añaden con los mismos componentes.
- Desarrollo: en un *development build* de Android (no Expo Go) con API en `http://`, activa tráfico en claro (`expo-build-properties` → `usesCleartextTraffic`).
