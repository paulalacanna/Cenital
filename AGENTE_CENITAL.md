# AGENTE.md — Migración de diseño Figma a código

## 1. Contexto del proyecto

Este proyecto consiste en migrar un diseño realizado en Figma a código para una página web navegable. El desarrollo se realizará en Visual Studio Code y el diseño de referencia está disponible como imágenes dentro de la carpeta del proyecto.

El sitio debe funcionar como una experiencia web completa, no solo como una maqueta estática. Debe respetar el diseño visual original, permitir navegación entre pantallas, incorporar login/creación de cuenta, filtros funcionales, estados interactivos y personalización de contenido según las preferencias del usuario.

El código ya fue iniciado, pero debe ser revisado, perfeccionado y modificado sin limitaciones cuando sea necesario para mejorar fidelidad visual, arquitectura, interacción, navegación, accesibilidad y funcionamiento general.

## 2. Objetivo principal

Transformar el diseño de Figma en una implementación web fiel, navegable, funcional, mantenible y escalable.

El resultado esperado es una página web con 7 u 8 pantallas navegables, visualmente coherente con las imágenes del diseño y con interacciones reales que mejoren la experiencia del usuario.

## 3. Alcance funcional

El proyecto debe contemplar como mínimo:

- Pantallas navegables según el diseño de Figma.
- Sistema de login.
- Sistema de creación de cuenta.
- Pantalla o sección Home.
- Pantalla o sección Descubrir.
- Filtro funcional en la pantalla Descubrir.
- Pantalla o sección Mi Cenital.
- Personalización de experiencia de usuario desde Mi Cenital.
- Estados visuales de interacción: hover, active, focus, click, disabled, selected, loading y error cuando corresponda.
- Uso del archivo `cenital-tokens.json` como base del sistema de diseño.
- Persistencia local de preferencias del usuario cuando no exista backend.
- Adaptación del Home en función de las preferencias cargadas por el usuario.

## 4. Reglas generales de trabajo

Antes de modificar código:

1. Revisar la estructura completa del proyecto.
2. Identificar el stack utilizado: HTML/CSS/JS, React, Vite, Next, Vue u otro.
3. Revisar `package.json`, archivos de configuración, rutas, componentes, estilos y assets.
4. Localizar las imágenes exportadas desde Figma.
5. Localizar y leer el archivo `cenital-tokens.json`.
6. Entender qué partes del código ya están resueltas y cuáles necesitan corrección.
7. No borrar trabajo existente sin reemplazarlo por una versión mejor.
8. Mantener nombres claros, semánticos y consistentes.
9. Priorizar código simple, limpio y fácil de modificar.

Si la lógica de una pantalla o interacción no se entiende a partir del diseño o del código existente, se debe preguntar antes de inventar una solución definitiva. Si el faltante es menor y puede resolverse con una suposición razonable, avanzar y dejar comentada la decisión tomada.

## 5. Uso obligatorio del sistema de diseño

El archivo `cenital-tokens.json` debe ser usado como soporte para el sistema visual de la página.

Se debe revisar si el archivo incluye tokens de:

- Colores.
- Tipografías.
- Tamaños de fuente.
- Pesos tipográficos.
- Espaciados.
- Radios de borde.
- Sombras.
- Breakpoints.
- Z-index.
- Duraciones de transición.

Los tokens deben transformarse preferentemente en variables reutilizables, por ejemplo:

```css
:root {
  --color-primary: ...;
  --color-background: ...;
  --font-base: ...;
  --space-md: ...;
  --radius-card: ...;
}
```

Reglas:

- Evitar valores hardcodeados si existe un token equivalente.
- Si falta un token, crear una variable local clara y documentada.
- Mantener coherencia visual en todos los componentes.
- Usar los tokens para botones, cards, inputs, navegación, filtros, modales y estados.

## 6. Fidelidad visual al diseño de Figma

La implementación debe buscar una reproducción fiel del diseño original.

Se debe verificar:

- Jerarquía tipográfica.
- Proporciones.
- Espaciados.
- Alineaciones.
- Tamaños de imágenes.
- Grillas.
- Colores.
- Botones.
- Cards.
- Estados de navegación.
- Iconografía.
- Bordes, radios y sombras.
- Distribución responsive si corresponde.

Las imágenes del diseño ubicadas en la carpeta del proyecto deben usarse como referencia visual directa.

## 7. Navegación entre pantallas

El sitio debe tener navegación funcional entre las 7 u 8 pantallas del diseño.

La navegación puede implementarse con:

- Rutas reales si el proyecto usa framework con router.
- Estado interno si es una app simple.
- Links semánticos si es HTML/CSS/JS puro.

Reglas:

- Todas las pantallas principales deben ser accesibles.
- No deben existir botones o links visuales sin comportamiento, salvo que estén explícitamente marcados como deshabilitados.
- La navegación debe mostrar estado activo cuando corresponda.
- El usuario debe poder volver al Home desde las secciones principales.
- La experiencia debe sentirse como una página real, no como imágenes sueltas.

## 8. Login y creación de cuenta

La página debe permitir:

- Iniciar sesión.
- Crear una cuenta nueva.
- Validar campos obligatorios.
- Mostrar errores claros.
- Cambiar estados de botones según validez del formulario.
- Simular una sesión si no existe backend.

Campos sugeridos para login:

- Email.
- Contraseña.

Campos sugeridos para crear cuenta:

- Nombre.
- Email.
- Contraseña.
- Confirmación de contraseña.

Validaciones mínimas:

- Email con formato válido.
- Contraseña no vacía.
- Confirmación coincidente en creación de cuenta.
- Mensajes visibles para errores.
- Estado `loading` simulado si corresponde.
- Estado de sesión guardado en `localStorage` o mecanismo equivalente si no hay backend.

Si ya existe una lógica de autenticación en el proyecto, mejorarla sin romperla.

## 9. Pantalla Descubrir y filtro funcional

La pantalla `Descubrir` contiene un filtro que debe funcionar a la perfección.

El filtro debe permitir modificar los contenidos visibles de manera clara, rápida y consistente.

Comportamientos esperados:

- Filtrar por categoría, tema, interés, autor, periodista, texto o el criterio que indique el diseño.
- Permitir seleccionar y deseleccionar opciones.
- Mostrar estado visual de filtro activo.
- Permitir limpiar filtros.
- Mostrar resultados actualizados inmediatamente o al aplicar, según indique el diseño.
- Mostrar mensaje de estado vacío si no hay resultados.
- Mantener consistencia visual entre resultados filtrados y no filtrados.
- Evitar errores si faltan datos.

Estados obligatorios:

- Filtro normal.
- Filtro hover.
- Filtro seleccionado.
- Filtro activo.
- Sin resultados.
- Reset o limpiar filtros.

Si el diseño no especifica la lógica exacta del filtro, implementar una solución sólida basada en datos internos y dejar preparada una estructura fácilmente editable.

Ejemplo de estructura de datos sugerida:

```js
const articles = [
  {
    id: 1,
    title: "Título del contenido",
    category: "Política",
    interests: ["actualidad", "economía"],
    author: "Nombre del autor",
    readingTime: "5 min",
    featured: true
  }
];
```

## 10. Interacciones y estados visuales

Agregar interacciones de estado en todos los elementos accionables.

Elementos que deben tener estados:

- Botones.
- Links.
- Cards clickeables.
- Inputs.
- Checkboxes.
- Radios.
- Selectores.
- Filtros.
- Tabs.
- Menús.
- Elementos de navegación.
- Tarjetas de contenido.

Estados recomendados:

- `hover`.
- `focus`.
- `focus-visible`.
- `active`.
- `selected`.
- `disabled`.
- `loading`.
- `error`.
- `success`.

Reglas:

- Las transiciones deben ser suaves y consistentes.
- Usar tokens de duración si existen.
- El foco de teclado debe ser visible.
- No eliminar outlines sin reemplazarlos por un foco accesible.
- Las cards clickeables deben comunicar visualmente que se pueden abrir.
- Los botones principales deben diferenciarse de los secundarios.

## 11. Sección Mi Cenital

La sección `Mi Cenital` debe permitir personalizar la experiencia del usuario.

Campos o decisiones que debe poder configurar el usuario:

- Con qué frecuencia lee.
- Cuáles son sus intereses.
- Qué autores o periodistas sigue, prefiere o le agradan.

Estas preferencias deben guardarse y afectar la experiencia posterior.

Cuando el usuario complete o modifique estos campos y vuelva al Home, el Home debe cambiar en base a lo elegido.

Ejemplos de personalización esperada:

- Si el usuario elige interés en política, priorizar contenidos de política.
- Si elige economía, mostrar más contenidos económicos.
- Si sigue a determinados autores, destacar artículos de esos autores.
- Si indica que lee poco, mostrar contenidos más breves o destacados.
- Si indica que lee todos los días, mostrar mayor variedad o recomendaciones más completas.

La personalización puede implementarse con estado local y persistencia en `localStorage` si no hay backend.

Estructura sugerida:

```js
const userPreferences = {
  readingFrequency: "daily",
  interests: ["política", "economía"],
  followedAuthors: ["Autor 1", "Autora 2"]
};
```

Reglas:

- Los cambios deben guardarse al confirmar o al modificar, según el diseño.
- Al regresar al Home, leer las preferencias actualizadas.
- El Home debe tener secciones dinámicas o al menos reordenar contenidos según preferencias.
- Debe existir un estado inicial para usuarios sin preferencias cargadas.
- Debe poder editarse la configuración más de una vez.

## 12. Home personalizado

El Home debe funcionar con dos estados principales:

### Usuario sin preferencias

Mostrar una experiencia general:

- Contenidos destacados.
- Últimas publicaciones.
- Invitación a personalizar `Mi Cenital`.
- Secciones generales según el diseño.

### Usuario con preferencias

Modificar la experiencia según elecciones:

- Reordenar artículos.
- Destacar temas elegidos.
- Mostrar autores seguidos.
- Mostrar recomendaciones.
- Cambiar textos introductorios si corresponde.

El cambio debe ser visible para el usuario luego de configurar `Mi Cenital`.

## 13. Datos de contenido

Si no existe backend ni API, crear datos locales realistas y bien organizados.

Recomendación:

- Crear un archivo de datos separado, por ejemplo `data.js`, `content.js` o similar.
- Cada contenido debe tener id, título, bajada, categoría, autor, tags, tiempo de lectura, imagen y estado destacado si corresponde.
- Usar esos datos para Home, Descubrir, filtros y personalización.

Evitar duplicar datos manualmente en varios componentes.

## 14. Accesibilidad mínima obligatoria

La web debe ser usable con mouse y teclado.

Requisitos:

- Usar HTML semántico cuando sea posible.
- Botones reales para acciones.
- Links reales para navegación.
- Labels asociados a inputs.
- Foco visible.
- Textos alternativos en imágenes relevantes.
- Contraste suficiente.
- Mensajes de error claros.
- No depender únicamente del color para indicar estados.

## 15. Responsive y adaptación

Si el diseño incluye versiones responsive, respetarlas.

Si no las incluye, adaptar la interfaz con criterio:

- Desktop como referencia principal.
- Tablet y mobile con grillas flexibles.
- Menú adaptable si es necesario.
- Cards reordenables.
- Inputs y filtros cómodos en pantallas chicas.

No romper la fidelidad visual en desktop para resolver mobile, salvo que sea inevitable.

## 16. Criterios para modificar código existente

Se puede modificar cualquier parte del código si eso mejora el resultado.

Prioridades:

1. Funcionamiento correcto.
2. Fidelidad al diseño.
3. Claridad del código.
4. Reutilización de componentes.
5. Sistema de diseño consistente.
6. Accesibilidad.
7. Performance razonable.

Evitar:

- Código duplicado innecesario.
- Estilos inline excesivos.
- Nombres genéricos como `div1`, `box2`, `thing`.
- Mezclar lógica compleja directamente en el HTML si se puede organizar mejor.
- Hardcodear datos repetidos.
- Crear dependencias nuevas sin necesidad.

## 17. Flujo de trabajo sugerido

1. Analizar estructura del proyecto.
2. Revisar imágenes de Figma.
3. Revisar `cenital-tokens.json`.
4. Detectar pantallas existentes y faltantes.
5. Armar mapa de navegación.
6. Crear o ajustar sistema de variables/tokens.
7. Corregir layout general.
8. Implementar componentes reutilizables.
9. Implementar navegación.
10. Implementar login y creación de cuenta.
11. Implementar Descubrir con filtro funcional.
12. Implementar Mi Cenital con preferencias.
13. Conectar preferencias con Home.
14. Agregar interacciones y estados.
15. Revisar responsive.
16. Probar manualmente todos los flujos.
17. Limpiar código, comentarios innecesarios y archivos obsoletos.

## 18. Pruebas manuales obligatorias

Antes de considerar terminado el trabajo, verificar:

- Todas las pantallas abren correctamente.
- La navegación no se rompe.
- Login muestra errores si los datos son inválidos.
- Crear cuenta valida campos correctamente.
- La sesión se mantiene si se usa persistencia local.
- Descubrir filtra correctamente.
- Descubrir permite limpiar filtros.
- Descubrir muestra estado vacío sin errores.
- Mi Cenital guarda frecuencia de lectura.
- Mi Cenital guarda intereses.
- Mi Cenital guarda autores o periodistas elegidos.
- Home cambia luego de modificar Mi Cenital.
- Los botones tienen hover y active.
- Los inputs tienen focus y error.
- El diseño usa tokens.
- No hay errores en consola.
- El sitio se ve correctamente en desktop.
- El sitio se adapta razonablemente a pantallas chicas.

## 19. Preguntas que se deben hacer si falta información

Preguntar solamente cuando sea necesario para resolver una lógica importante.

Preguntas posibles:

- ¿Cuáles son exactamente las 7 u 8 pantallas del flujo?
- ¿Cuál es el orden correcto de navegación entre pantallas?
- ¿El login debe ser real o solo una simulación local?
- ¿Qué criterios exactos debe usar el filtro de Descubrir?
- ¿Qué opciones concretas debe tener Mi Cenital?
- ¿Qué debe cambiar específicamente en el Home cuando el usuario elige intereses?
- ¿Hay versión mobile del diseño en Figma?
- ¿Qué imagen corresponde a cada pantalla?
- ¿Hay autores, periodistas o categorías reales que deban usarse?

Si no hay respuesta, avanzar con una solución razonable, modular y fácil de ajustar.

## 20. Criterios de aceptación final

El trabajo puede considerarse correcto cuando:

- El diseño está migrado con alta fidelidad visual.
- Las 7 u 8 pantallas son navegables.
- Login y creación de cuenta funcionan como flujo completo.
- Descubrir tiene filtro operativo y confiable.
- Mi Cenital permite personalizar frecuencia, intereses y autores.
- Home refleja los cambios realizados en Mi Cenital.
- El sistema visual usa `cenital-tokens.json`.
- Existen interacciones claras para hover, click, focus y estados activos.
- La experiencia no se siente estática.
- El código está ordenado y preparado para seguir creciendo.
- No hay errores evidentes en consola.

## 21. Instrucción final para el agente de código

Actuar como desarrollador frontend senior.

No limitarse a copiar visualmente el diseño: convertirlo en una experiencia web funcional, consistente y navegable. Revisar el código existente, corregir lo necesario, reorganizar si mejora el proyecto y usar `cenital-tokens.json` como fuente principal del sistema visual.

Cuando una interacción no esté clara, preguntar. Cuando la solución sea evidente o pueda resolverse con una decisión razonable, avanzar y dejar el código preparado para ajustes posteriores.
