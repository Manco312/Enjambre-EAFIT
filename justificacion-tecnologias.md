# Justificación del framework y del stack tecnológico — Enjambre EAFIT

> Preparado por: Luciana Hoyos, Mateo Pineda y Santiago Manco.
> Fecha: 2026-09-09.

---

## 1. Contexto de la decisión

**Enjambre EAFIT** es una aplicación web para centralizar la gestión de los Grupos
Estudiantiles de la Universidad EAFIT: grupos y comités, base de datos de
integrantes por grupo, estados de miembro y la tabla de permanencia (actividades
ponderadas y el puntaje de cada integrante). Reemplaza un proceso manual basado en
Excel y formularios sueltos.

Condiciones que enmarcan la elección de tecnologías:

- **Equipo pequeño (3 personas)** y con formación previa común: todos veníamos de
  cursos y proyectos con **TypeScript**, **Vue** y **NestJS**.
- **Ventana de tiempo corta** y sujeta al calendario académico (agosto–noviembre
  de 2026): la velocidad de desarrollo y la baja fricción de arranque pesan mucho.
- **Alcance de MVP**: CRUD sobre un modelo relacional acotado, autenticación por
  roles, reportes exportables a Excel. No hay requisitos de alta concurrencia,
  streaming, ni analítica en tiempo real.
- **Sin infraestructura dedicada**: se necesita poder correr y demostrar todo en la
  máquina de cualquier integrante o evaluador, sin instalar un motor de base de
  datos.
- **Un solo lenguaje de punta a punta** para reducir el costo de cambio de contexto
  entre frontend y backend.

Estas condiciones apuntan a un stack **JavaScript/TypeScript full‑stack**, con un
framework de backend opinado y un framework de frontend reactivo, y una base de
datos embebida para desarrollo.

---

## 2. Stack seleccionado (resumen)

| Capa | Tecnología | Rol en el proyecto |
| --- | --- | --- |
| Lenguaje | **TypeScript** | Único lenguaje en front y back; tipos compartidos de dominio |
| Framework backend | **NestJS 12** | API REST modular, inyección de dependencias, guards de auth |
| ORM / acceso a datos | **TypeORM** | Entidades, relaciones, `synchronize` en desarrollo |
| Base de datos | **SQLite** (`better-sqlite3`) | Persistencia embebida, cero infraestructura |
| Autenticación | **JWT** (`@nestjs/jwt`) + **bcrypt** | Login por token, contraseñas hasheadas |
| Validación | **class-validator** / **class-transformer** | DTOs validados, `whitelist` + `forbidNonWhitelisted` |
| Documentación de API | **OpenAPI / Swagger UI** (`@nestjs/swagger`) | `/docs` autogenerado |
| Framework frontend | **Vue 3** (Composition API) | SPA de administración |
| Build / dev server | **Vite** | HMR, build de producción |
| Estado | **Pinia** | Solo `auth` y `toasts` (el resto se pide a la API) |
| Ruteo | **Vue Router** | Rutas + guard por rol |
| Estilos | **Tailwind CSS v4** | Utilidades, identidad visual EAFIT (`brand-*`) |
| Cliente HTTP | **axios** | Llamadas a la API, header `Authorization` |
| Exportación | **SheetJS (`xlsx`)** | Reportes a Excel (import diferido) |
| Pruebas | **Vitest** | Unit tests de servicios y controladores del backend |
| Calidad | **oxlint**, **ESLint**, **Prettier** | Lint y formato en front y back |

---

## 3. Criterios de evaluación y su peso

Cada criterio se puntúa de **1 (muy malo) a 5 (excelente)**. El peso refleja la
importancia relativa **para este proyecto y este equipo**.

| # | Criterio | Peso | Por qué importa aquí |
| --- | --- | --- | --- |
| C1 | **Curva de aprendizaje / conocimiento previo del equipo** | **25 %** | El equipo ya dominaba estas herramientas; adoptar algo nuevo habría gastado semanas que no teníamos. Es el criterio de mayor peso. |
| C2 | Productividad y velocidad de desarrollo | 20 % | Ventana de tiempo corta; se prioriza andamiaje listo (CLI, scaffolding, HMR). |
| C3 | Ajuste al alcance del MVP | 15 % | CRUD sobre modelo relacional + auth por roles + export. No sobra complejidad. |
| C4 | Mantenibilidad y tipado | 15 % | Proyecto que continuará otro semestre; tipos y estructura clara reducen deuda. |
| C5 | Ecosistema, comunidad y documentación | 10 % | Respuestas rápidas a dudas, librerías maduras, ejemplos abundantes. |
| C6 | Costo e infraestructura | 10 % | Debe correr en cualquier laptop sin servicios pagos ni servidores. |
| C7 | Rendimiento suficiente | 5 % | Cargas modestas (decenas de grupos, cientos de miembros); casi cualquier opción cumple. |

---

## 4. Puntaje por tecnología

Puntaje ponderado = Σ (puntaje del criterio × peso del criterio). Máximo posible: 5.00.

### 4.1. Framework de backend

| Criterio (peso) | **NestJS** | Express “a mano” | Spring Boot (Java) | Django (Python) |
| --- | :---: | :---: | :---: | :---: |
| C1 Curva de aprendizaje / conocimiento del equipo (25 %) | **5** | 4 | 2 | 2 |
| C2 Productividad (20 %) | **5** | 3 | 4 | 4 |
| C3 Ajuste al MVP (15 %) | 4 | 4 | 4 | **5** |
| C4 Mantenibilidad y tipado (15 %) | **5** | 2 | **5** | 3 |
| C5 Ecosistema y documentación (10 %) | 4 | **5** | **5** | **5** |
| C6 Costo e infraestructura (10 %) | 5 | 5 | 3 | 4 |
| C7 Rendimiento (5 %) | 4 | 4 | **5** | 3 |
| **Puntaje ponderado** | **4.65** | 3.55 | 3.65 | 3.45 |

### 4.2. Framework de frontend

| Criterio (peso) | **Vue 3** | React | Angular | Svelte |
| --- | :---: | :---: | :---: | :---: |
| C1 Curva de aprendizaje / conocimiento del equipo (25 %) | **5** | 4 | 2 | 3 |
| C2 Productividad (20 %) | **5** | 4 | 3 | **5** |
| C3 Ajuste al MVP (15 %) | 5 | 5 | 4 | 5 |
| C4 Mantenibilidad y tipado (15 %) | 4 | **5** | **5** | 4 |
| C5 Ecosistema y documentación (10 %) | 4 | **5** | 4 | 3 |
| C6 Costo e infraestructura (10 %) | 5 | 5 | 5 | 5 |
| C7 Rendimiento (5 %) | 4 | 4 | 4 | **5** |
| **Puntaje ponderado** | **4.65** | 4.45 | 3.35 | 4.30 |

### 4.3. Base de datos (para el alcance actual)

| Criterio (peso) | **SQLite** | PostgreSQL | MySQL/MariaDB | MongoDB |
| --- | :---: | :---: | :---: | :---: |
| C1 Curva de aprendizaje / conocimiento del equipo (25 %) | **5** | 4 | 4 | 3 |
| C2 Productividad (20 %) | **5** | 4 | 4 | 4 |
| C3 Ajuste al MVP — modelo relacional (15 %) | 4 | **5** | **5** | 2 |
| C4 Mantenibilidad y tipado (15 %) | 4 | **5** | 4 | 3 |
| C5 Ecosistema y documentación (10 %) | 4 | **5** | **5** | 4 |
| C6 Costo e infraestructura (10 %) | **5** | 3 | 3 | 3 |
| C7 Rendimiento a esta escala (5 %) | 4 | **5** | **5** | 4 |
| **Puntaje ponderado** | **4.50** | 4.35 | 4.15 | 3.05 |

> Nota: la elección de **TypeORM** desacopla la aplicación del motor concreto. Si el
> proyecto crece, migrar de SQLite a PostgreSQL es principalmente un cambio de
> configuración del `DataSource` más la introducción de migraciones.

### 4.4. Componentes complementarios (puntaje directo, sin ponderar por columnas)

| Componente | Alternativa elegida | Curva de aprendizaje (equipo) | Ajuste al MVP | Ecosistema | Puntaje global |
| --- | --- | :---: | :---: | :---: | :---: |
| Build frontend | **Vite** | 5 | 5 | 5 | **5.0** |
| Estado frontend | **Pinia** | 5 | 5 | 4 | **4.7** |
| Ruteo frontend | **Vue Router** | 5 | 5 | 5 | **5.0** |
| Estilos | **Tailwind CSS v4** | 4 | 5 | 5 | **4.7** |
| ORM | **TypeORM** | 5 | 4 | 4 | **4.3** |
| Auth | **JWT + bcrypt** | 5 | 5 | 5 | **5.0** |
| Validación | **class-validator** | 5 | 5 | 4 | **4.7** |
| Doc de API | **Swagger / OpenAPI** | 4 | 5 | 5 | **4.7** |
| Cliente HTTP | **axios** | 5 | 5 | 5 | **5.0** |
| Export Excel | **SheetJS (`xlsx`)** | 4 | 5 | 4 | **4.3** |
| Pruebas | **Vitest** | 4 | 5 | 4 | **4.3** |

---

## 5. La curva de aprendizaje como criterio decisivo

**Se le asignó el peso más alto (25 %) y el puntaje máximo (5/5) a las tecnologías
elegidas**, y esto es deliberado:

- Los tres integrantes ya habían trabajado con **Vue** y **TypeScript** en cursos
  previos y en proyectos personales, y con **NestJS** en el curso de tópicos de
  ingeniería de software. No hubo que aprender el framework: se empezó a producir
  desde el primer día.
- **NestJS** impone una estructura conocida (módulos, controladores, servicios,
  DTOs, guards). El equipo ya tenía interiorizado ese patrón, así que las
  decisiones de arquitectura se tomaron rápido y de forma consistente
  (`entities/`, `dto/`, `x.service.ts`, `x.controller.ts`, `x.module.ts`,
  specs con Vitest).
- **Un solo lenguaje (TypeScript) en todo el stack** elimina el costo de cambiar de
  mentalidad entre frontend y backend: mismas herramientas de lint/formato
  (oxlint, Prettier), mismos idioms, e incluso formas de datos equivalentes entre
  los DTO del frontend y los del backend.
- **Vite + Vue** dan retroalimentación inmediata (HMR en milisegundos), lo que
  acorta el ciclo de prueba manual, algo crítico cuando el tiempo calendario es
  escaso.
- El costo de oportunidad de elegir algo “mejor en el papel” pero desconocido
  (p. ej. Spring Boot, Angular) habría sido de **varias semanas de aprendizaje**
  sobre una ventana de ~3 meses. Con un equipo experto en el stack actual, ese
  tiempo se invirtió en features y pruebas.

En resumen: para este equipo y este calendario, **el conocimiento previo no es un
lujo, es lo que hace viable entregar el alcance a tiempo**. De ahí que domine la
ponderación.

---

## 6. Justificación general

La decisión se resume en una idea: **elegir el stack que el equipo ya dominaba y
que cubre el alcance del MVP sin complejidad sobrante**. Con tres personas y una
ventana de ~3 meses atada al calendario académico, el tiempo que habría costado
aprender un framework nuevo era tiempo que no podía dedicarse a construir y probar
funcionalidad.

- **Un solo lenguaje (TypeScript) de punta a punta.** Frontend y backend comparten
  herramientas de lint y formato, idioms y formas de datos entre los DTO de ambos
  lados. Se elimina el costo de cambiar de contexto y el tipado estático ataca
  directamente uno de los problemas de negocio (los errores de tipado del proceso
  manual en Excel), reforzado por la validación de DTOs en la API.

- **Backend opinado y modular (NestJS + TypeORM).** NestJS aporta una estructura
  conocida y uniforme (módulos, controladores, servicios, DTOs, guards) que evitó
  discutir arquitectura en cada recurso; TypeORM modela el diagrama
  entidad‑relación como entidades decoradas y, con `synchronize` en desarrollo,
  quitó la fricción de escribir migraciones mientras el modelo aún cambiaba. La
  autenticación con JWT es sin estado y trivial de consumir desde una SPA.

- **Frontend reactivo y de arranque rápido (Vue 3 + Vite + Pinia + Vue Router +
  Tailwind).** Vue cubre de sobra una SPA de administración con formularios,
  tablas con filtros y edición en línea, y modales; Vite da retroalimentación
  inmediata (HMR) que acorta el ciclo de prueba manual; Pinia se limita a `auth` y
  `toasts`; Tailwind centraliza la identidad visual EAFIT sin acumular CSS muerto.

- **Cero infraestructura para desarrollar y demostrar (SQLite).** La base de datos
  es un archivo local: cualquier integrante o evaluador clona, hace `npm run seed`
  y tiene el sistema corriendo, sin instalar un motor de base de datos.

- **Deuda técnica conocida y acotada.** `synchronize` sin migraciones, SQLite en
  desarrollo y JWT sin refresh token son decisiones conscientes para el alcance
  actual; están documentadas y la propia elección de capas (TypeORM, arquitectura
  modular de NestJS) deja abierto el camino de evolución — p. ej. migrar a
  PostgreSQL es principalmente un cambio de configuración del `DataSource`.

El resto de piezas (Swagger para documentar la API desde el código, axios como
cliente HTTP, SheetJS para exportar a Excel, Vitest para las pruebas, oxlint /
ESLint / Prettier para calidad) son librerías maduras, estándar en este ecosistema
y ya conocidas por el equipo, sin coste de aprendizaje relevante.

---

## 7. Alternativas consideradas y por qué se descartaron

| Alternativa | Motivo principal del descarte |
| --- | --- |
| **MERN / Express a mano** | Habría que construir validación, DI y estructura desde cero; NestJS ya lo trae y el equipo lo conoce. |
| **Spring Boot (Java)** | Excelente para sistemas grandes, pero curva alta para el equipo, más lenguaje adicional y más peso de infraestructura para un MVP. |
| **Django (Python)** | Muy productivo, pero rompe el “un solo lenguaje” y el equipo tenía menos experiencia; el admin autogenerado no encaja con la UI a medida requerida. |
| **Angular** | Framework potente pero con curva y andamiaje pesados para un equipo de 3; Vue cubre el alcance con menos fricción. |
| **React** | Opción técnicamente válida y cercana; se prefirió Vue por familiaridad y velocidad de arranque. El margen era estrecho. |
| **PostgreSQL desde el inicio** | Requiere un servicio corriendo; añade fricción a demos y a la puesta en marcha. Se deja como evolución natural vía TypeORM. |
| **MongoDB** | El dominio es claramente relacional (grupos, comités, miembros, estados, actividades, permanencias con claves únicas y cascadas); un modelo documental complicaría las consultas. |
| **Sesiones en servidor** | Añaden estado y almacenamiento de sesión; JWT sin estado es más simple para una SPA y suficiente para el alcance. |
| **CSS Modules / librería de componentes completa** | Tailwind da control fino sobre la identidad visual EAFIT sin adoptar el sistema de diseño de un tercero. |

---

## 8. Conclusión

El stack elegido —**TypeScript de punta a punta, NestJS + TypeORM + SQLite + JWT en
el backend y Vue 3 + Vite + Pinia + Vue Router + Tailwind en el frontend**— es el
que **maximiza el puntaje ponderado** bajo los criterios del proyecto, con la
**curva de aprendizaje** (conocimiento previo del equipo) como factor de mayor peso
y puntaje máximo. Cada pieza es una tecnología madura, bien documentada y ya
dominada por el equipo, lo que permitió dedicar la corta ventana de tiempo a
construir y probar funcionalidad en lugar de a aprender herramientas. Las
decisiones que suponen deuda conocida (`synchronize` sin migraciones, SQLite para
desarrollo, JWT sin refresh) están documentadas y tienen un camino de evolución
claro que la propia elección de capas (TypeORM, arquitectura modular de NestJS)
mantiene abierto.
