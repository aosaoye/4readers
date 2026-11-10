# Reglas de Diseño e Interfaz (DESIGN_RULES.md)

Este documento contiene las restricciones y estándares visuales obligatorios de la aplicación para mantener total coherencia con el diseño de Twitter/X y las decisiones del proyecto:

---

## 1. Botones de Píldora (Pill Buttons)
- **CERO MARGIN EXTERNO**: Los botones con forma de píldora (`borderRadius: 999` o `height / 2`) **NO** deben tener margen exterior (`margin: 0`, sin `marginHorizontal`, `marginVertical`, etc.) a menos que sea el espaciado dentro de un contenedor flex (`gap`).
- Deben comportarse e integrarse exactamente como los botones del Home (limpios, alineados al borde del contenedor o con el flex correspondiente).
- Alturas estándar:
  - Pequeño / Acción de fila («Seguir» / «Seguir 24»): `height: 32`, `paddingHorizontal: 16`, `borderRadius: 16`.
  - Mediano / Llamado a la acción («Comenzar»): `height: 38`, `paddingHorizontal: 24`, `borderRadius: 19`.
  - Grande / Acción principal («Añadir número de teléfono» / «Siguiente»): `height: 48` a `52`, `paddingHorizontal: 28`, `borderRadius: 24-26`.

---

## 2. Chips y Categorías Horizontales (Como en Home)
- La fila horizontal de chips/categorías debe ocupar el **100% del ancho de la pantalla** en su contenedor propio.
- **NO colocar la fila horizontal dentro de un contenedor con paddingHorizontal externo** que corte el primer pill (ej. cortar la "N" de "Noticias").
- El espaciado de inicio se da mediante `contentContainerStyle: { paddingHorizontal: space.lg, gap: space.sm }`, garantizando que el primer chip se vea completo y redondo desde el inicio del scroll, exactamente igual que las categorías del Home.

---

## 3. Pestañas de Cabecera (Tabs)
- Las pestañas (`Temas`, `Tal vez los conozcas`, `Sugeridos`) deben caber **en una sola línea sin partirse**.
- **NO usar `flex: 1` idéntico para todas las pestañas** cuando una de ellas tiene un texto mucho más largo como «Tal vez los conozcas» (20 caracteres).
- Usar `justifyContent: 'space-between'` o `'space-around'` con `paddingHorizontal: 8-12` por pestaña y `numberOfLines={1}` para que todos los textos quepan limpios en una única fila horizontal.
- La línea indicadora activa debe estar centrada bajo el texto de la pestaña seleccionada.

---

## 4. Alineación de Cabeceras con Back Button
- En cualquier pantalla con botón de regreso (`<`), el título principal de la pantalla debe estar **en la misma fila horizontal, alineado con el botón de regreso** (`flexDirection: 'row'`, `alignItems: 'center'`).
- **NUNCA colocar el título en una línea debajo del botón de regreso** (como ocurría en Recomendaciones).

---

## 5. Tarjetas y Secciones Informativas
- **NO crear tarjetas con fondo ni bordes artificiales** para bloques informativos que en Twitter/X son transparentes.
- El bloque «Encontrar amigos» en la pestaña *Sugeridos* es **completamente transparente** (sin `backgroundColor`, sin `borderColor`, sin `borderWidth`).
- El fondo del cuerpo debe ser `#000000` en modo oscuro, limpio y sin cajas intermedias innecesarias.

---

## 6. Flujo de Contactos y Libreta de Direcciones
1. **Pestaña «Tal vez los conozcas»**:
   - Inicial: «Encuentra a personas que conoces» con botón «Permitir el acceso a los contact...».
   - Al pulsar y conceder acceso, si el usuario no tiene número de teléfono registrado en la base de datos:
     - Muestra la pantalla con icono de teléfono en círculo oscuro: «Encuentra a tus amigos» y subtítulo «Añade un número de teléfono para ver a quién conoces en X» con el botón «Añadir número de teléfono».
   - Al añadir teléfono o sincronizar:
     - Debe llevar directamente a la pestaña **«Tal vez los conozcas»** o **«Sugeridos»**, mostrando la lista de **Personas que tal vez conozcas** con casillas cuadradas (`[ ]` / `[✓]`) y barra inferior («Descartar por ahora» y «Siguiente»).
2. **Pestaña «Sugeridos»**:
   - Bloque transparente «Encontrar amigos» con botón «Comenzar».
   - Al pulsar «Comenzar»: Abre un bottom sheet «Sincronizar contactos».
   - Al pulsar «Sincronizar contactos»: Sincroniza y lleva a la pestaña **«Tal vez los conozcas»** (o sugeridos) mostrando los contactos recomendados.

---

## 7. Switches Personalizados (CustomSwitch Obligatorio)
- **PROHIBIDO TERMINANTEMENTE EL USO DE `<Switch />` NATIVO DE REACT NATIVE**.
- Todo switch en la aplicación DEBE utilizar `CustomSwitch` (`src/ui/Switch.tsx` exportado en `@/ui`).
- Dimensiones estándar de diseño X: `width: 52`, `height: 32`, `borderRadius: 16`, `borderWidth: 2`, `thumb: 26`.
- **Estado ON estándar obligatorio en TODO el proyecto**: Pista NARANJA (`#E4531D` / `colors.accent`), thumb blanco `#FFFFFF`. NUNCA azul.
- **Estado ON específico para Silenciar/Aplazar**: Pista roja `#F4212E`, thumb blanco `#FFFFFF`.
- **Estado OFF**: Pista oscura `#171A1F` / `#272C30`, borde `#383F4A`, thumb `#3C434F` / `#536471`.
- Animación fluida con `Animated.spring` (desplazamiento `translateX`, interpolación de color de fondo y borde).
- La cabecera de Notificaciones, Explorar y sus pantallas hijas deben usar `useSafeAreaInsets` con `paddingTop: Math.max(top, space.sm)` para no montarse jamás sobre la barra de estado del sistema (reloj, batería, etc.).

---

## 8. Distribución al 100% del Ancho de Pantalla en Pestañas (Tabs)
- Las pestañas de navegación con iconos (como en el Perfil) **DEBEN OCUPAR SIEMPRE EL 100% DEL ANCHO DE LA PANTALLA**.
- **PROHIBIDO** dejar las pestañas agrupadas a la mitad de la pantalla dejando un espacio negro vacío a la derecha.
- Estructura obligatoria: Contenedor con `width: '100%'`, `flexDirection: 'row'`, `justifyContent: 'space-between'` o `space-around`, donde las pestañas inactivas tienen `flex: 1` y la activa `flex: 1.6`.
- Las 5 pestañas canónicas de perfil son:
  1. `Posts`: Icono + texto `Posts ∨` (con chevron abajo).
  2. `Respuestas`: Icono `message-circle`.
  3. `Reposts`: Icono `repeat` (reemplaza a Destacados).
  4. `Videos`: Icono `tv` (con estado Próximamente).
  5. `Artículos`: Icono `edit-3` (con promoción de Premium).
- La pestaña activa expande su etiqueta con el indicador de subrayado blanco; las 4 inactivas muestran exclusivamente su icono correspondiente, todas distribuidas uniformemente a lo largo de todo el ancho del dispositivo sin desbordamiento.

---

## 9. Conexiones de Perfil ("Siguiendo" y "Seguidores") y Selector de Fotos
1. **Acceso desde el Perfil**:
   - Al pulsar **`X Siguiendo`** (primero): Abre `/connections?type=following`, mostrando cabecera `< [Usuario] [👤+]` y pestañas:
     - `Siguiendo`: Lista de usuarios seguidos (`jase`, `Hacking Articles`) con botón píldora `Siguiendo`.
     - `Suscriptores`: Estado vacío «Aún no tienes ningún Suscriptor. Aquí encontrarás una lista de todas las personas que están Suscritas a tu cuenta.»
     - `Suscripciones`: «Aún no tienes suscripciones».
   - Al pulsar **`X Seguidor`** (segundo): Abre `/connections?type=followers`, mostrando cabecera `< [Usuario] [👤+]` y pestañas:
     - `Seguidores verificados`: Estado vacío «¿Estás buscando seguidores? Cuando una cuenta verificada siga a esta cuenta, aparecerá aquí. Postear e interactuar con otros ayuda a conseguir más seguidores.»
     - `Seguidores que conoces`: «No hay nada que ver aquí... por ahora.»
     - `Seguidores`: Lista de seguidores con botón `Seguir`.
   - El botón superior derecho `👤+` abre `/follow` (para descubrir más cuentas y temas).

2. **Selector de Fotos y Modales Anidados en Android**:
   - **PROHIBIDO el uso de `<Modal>` dentro de otro `<Modal>`** en Android (rompe el ciclo de renderizado nativo de Dialog).
   - Los sheets inferiores de selección de foto (`Tomar foto`, `Elegir foto existente`) y de selector de fecha custom se renderizan mediante superposiciones absolutas (`modalOverlayAbsolute` con `zIndex: 1000` y `elevation: 10`).
   - Se utiliza `expo-image-picker` (`launchCameraAsync` y `launchImageLibraryAsync`) para seleccionar o tomar fotos reales del dispositivo, con recorte y fallback seguro.

---

## 10. Cabecera del Perfil, Búsqueda, Nombres y Pestañas Canónicas
1. **Separación del Avatar respecto al Back Button**:
   - La portada (`coverBanner`) debe tener una altura suficiente (`height: 145 + Math.max(top, 16)`) para que entre el botón circular de regreso `(←)` y el avatar circular (`marginTop: -38`) exista un espacio vertical holgado y visible de portada (~60-70px), sin encimarse ni tocarse.
2. **Iconos de Cabecera Superior**:
   - En la esquina superior derecha: `slash` (`⊘`), `search` (`Q`), `more-horizontal` (`...`).
3. **Búsqueda en Perfil (`Q`)**:
   - Al presionar `Q`, abre la barra de búsqueda prellenada con `from:<usuario>`.
   - Muestra la sugerencia activa `Buscar “from:<usuario> ”` en negrita blanca.
   - Permite borrar la consulta con `(x)` o presionar para filtrar los posts del perfil.
4. **Nombre Completo y Usuario (@handle)**:
   - Arriba: **Nombre completo** en tipografía grande (`John Ripper`), sin sufijos numéricos artificiales.
   - Abajo: **Nombre de usuario / Handle** (`@JohnRipper45606` o `@exploitx86`), en gris `#71767B`.
   - **PROHIBIDO duplicar el nombre o el usuario**.
5. **Contenido de las Pestañas de Perfil**:
   - **Reposts**: Estado vacío con texto literal en negrita blanca: `No hay nada que ver aquí... por ahora.`.
   - **Artículos**: Título grande `Escribe artículos en X`, subtítulo explicativo de que solo los suscriptores de Premium pueden publicar Artículos, y botón píldora azul `#1D9BF0` `Suscríbete a Premium`.
   - **Videos**: Icono y mensaje `Próximamente`.

---

## 11. Carrusel de «A quién seguir» y Enlace «Mostrar más»
1. **Carrusel Horizontal**:
   - «A quién seguir» en el perfil es un **carrusel horizontal** de tarjetas con ancho ~280px (`ScrollView horizontal showsHorizontalScrollIndicator={false}`).
   - Cada tarjeta contiene:
     - Cabecera con imagen fotográfica de portada (`height: 100`, `width: '100%'`).
     - Badge oficial en el banner si aplica (ej. `DEFENSE FORCES · VERIFIED` en píldora oscura superior izquierda).
     - Avatar circular (`58x58`) solapando la mitad inferior de la portada (`marginTop: -29`).
     - Botón píldora **«Seguir»** con separación de ~6-8px respecto a la base de la imagen fotográfica (no debe tocar la foto).
     - Nombre con insignia de verificación ✔, handle `@usuario` y biografía con límite de 3 líneas.
2. **Enlace «Mostrar más»**:
   - **NUNCA embebido o pegado dentro de una tarjeta**.
   - Debe ubicarse **debajo de todo el carrusel**, separado con margen superior (`paddingHorizontal: 16`, `paddingTop: 14`), con texto azul `#1D9BF0` y enlace directo a `/follow`.

---

## 12. Estudio para Creadores (`/creator-studio`)
1. **Acceso desde el Perfil**:
   - Menú de opciones (`...` en la cabecera del perfil) incluye la opción principal **`Estudio para creadores`** con el icono de cohete outline (`rocket-outline`).
2. **Pantalla «Estudio del creador»**:
   - Cabecera con botón de retroceso `←` y título centrado **`Estudio del creador`** sobre fondo `#000000`.
   - Secciones y elementos:
     - **Programas**:
       - `Recompensas por contenido` (`Gana con tus publicaciones`) con badge `No elegible` y chevron `>`.
       - `Suscripciones` con badge `Inelegible` y chevron `>`.
     - **Herramientas**:
       - `Estadísticas` con chevron `>`.
       - `Inspiración` (`Principales publicaciones por interacción`) con chevron `>`.
       - `Academia de Creadores` (`Consejos y guías para creadores`) con badge azul `Nuevo` y chevron `>`.
     - **Soporte**:
       - `Contactar con soporte` con chevron `>`.
       - `Más información` con chevron `>`.
   - Todos los elementos abren su respectivo modal informativo o acción con detalles de requisitos y analíticas.


---

## 13. Sistema de Temas Claro/Oscuro Reactivo (Dark Mode Puro y Light Mode)
1. **Regla de Oro de Reactividad**:
   - Todo componente o pantalla DEBE consumir el hook `useTheme()` (`const { isDark, colors } = useTheme();`).
   - **PROHIBIDO** importar `colors` estático en llamadas a `StyleSheet.create` para elementos con colores dependientes del tema (fondos, bordes, tarjetas, textos secundarios, etc.).
   - En **Modo Oscuro**: El fondo del canvas DEBE ser negro puro (`#000000` / `#09090B`), las tarjetas y elevaciones en gris muy oscuro (`#121215`, `#16181C`), los bordes sutiles (`#272C30`, `#2F3336`), y el texto principal blanco puro (`#FFFFFF`).
   - En **Modo Claro**: El fondo del canvas DEBE ser blanco/gris neutro muy claro (`#FFFFFF` / `#F8FAFC`), tarjetas blancas puras (`#FFFFFF`), bordes suaves (`#EFF3F4`, `#CFD9DE`), y textos oscuros (`#0F1419`, `#536471`).
2. **Componentes y Vistas de Detalle**:
   - Las barras de métricas de posts, paneles de propinas (`TipPanel`), secciones de comentarios (`CommentsSection`) y modales deben adaptar sus fondos y bordes de forma inmediata al cambiar el tema, sin requerir reinicio de la aplicación.

---

## 14. Composición y Publicación de Posts (Inserción de GIFs, Imágenes y Resumen)
1. **Manejo Estricto de GIFs y Medios**:
   - **EL GIF O IMAGEN ANIMADA NUNCA DEBE ASIGNARSE A `coverImageUrl`**. La propiedad `coverImageUrl` está reservada exclusivamente para fotografías panorámicas de cabecera/portada.
   - Todo GIF seleccionado por el usuario DEBE insertarse **dentro del cuerpo del contenido (`content`)** en formato Markdown: `![GIF](url)`.
   - Si el post contiene tanto portada como GIF, la portada se muestra en la cabecera del post y el GIF se renderiza fluidamente dentro del flujo de lectura del texto.
2. **Renderizado de Contenido (`PostContentRenderer`)**:
   - El renderizador de contenido de posts (`app/post/[id].tsx`) debe procesar las etiquetas Markdown `![desc](url)`, separando los párrafos de texto y renderizando las imágenes/GIFs con bordes redondeados y aspecto nativo en su posición exacta entre los párrafos.
3. **Manejo del Resumen (`summary`)**:
   - **PROHIBIDO** duplicar el contenido completo en el campo `summary`.
   - Si `summary` es idéntico a `content` o no aporta un extracto diferenciado, no debe renderizarse como un bloque duplicado en la pantalla de detalle del post.

---

## 15. Espacios de Audio (Spaces): Onboarding, Temas, Programación y Confirmación
1. **Onboarding ("Graba tu Espacio") Único**:
   - La pantalla de introducción y beneficios ("Graba tu Espacio") debe mostrarse **UNA SOLA VEZ** por usuario.
   - El estado de visualización se persiste en `AsyncStorage` (`@spaces_intro_seen`). Una vez que el usuario presiona «Entendido», se guarda el indicador y las aperturas posteriores abren directamente la pantalla «Crea tu Espacio».
2. **Selector de Audiencia ("¿Quiénes pueden responder?")**:
   - Modal inferior de 5 opciones con iconos y selector radio a la derecha:
     1. 🌐 `Todos`
     2. 🛡️ `Cuentas con marca de verificación`
     3. 👤 `Cuentas a las que sigues`
     4. ＠ `Solo las cuentas que menciones`
     5. 👥 `Cuentas a las que sigues y a las que ellas siguen`
3. **Selector de Temas ("Añadir Temas")**:
   - Bottom sheet con título «Añadir Temas» y subtítulo «Ayuda a las personas que siguen Temas a descubrir tu Espacio. Selecciona un máximo de 3.».
   - Píldoras de temas agrupadas (Deportes, Fútbol, Real Madrid, etc.), contador en tiempo real «X seleccionados (máx. 3)» y botón píldora blanco «Guardar».
4. **Programador de Espacios ("Programa tu Espacio")**:
   - Selector tipo rueda/columnas con Día, Mes, Año, Hora, Minuto y Período (a. m. / p. m.).
   - **El año se calcula y actualiza AUTOMÁTICAMENTE** en función del año actual (`new Date().getFullYear()`).
5. **Pantalla de Confirmación ("Tu Espacio está programado. ¡Ahora anúncialo!")**:
   - Al pulsar «Programar», muestra la pantalla de éxito con checkmark azul/morado, tarjeta morada de vista previa del Espacio con avatar, nombre de anfitrión y fecha/hora programada.
   - 4 botones circulares de acción rápida:
     1. ✏️ `Postear` (Redactar un post anunciando el espacio)
     2. 💬 `Chat` (Compartir por mensaje)
     3. 🔗 `Copiar enlace` (Copiar URL al portapapeles)
     4. 📤 `Compartir por...` (Lanzar share sheet nativo)
   - Botón píldora inferior «Editar» para volver a modificar los datos si se desea.
