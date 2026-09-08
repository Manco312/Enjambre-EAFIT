# Declaración de uso de Inteligencia Artificial

**Proyecto:** Enjambre EAFIT — Plataforma de gestión de Grupos Estudiantiles
**Última actualización:** 2026-09-08

---

## 1. Resumen

El equipo de desarrollo declara que en la construcción de este proyecto se utilizaron
herramientas de Inteligencia Artificial generativa (asistentes de código basados en
modelos de lenguaje) **como apoyo a la implementación**. La concepción, el análisis,
las decisiones de diseño y la planeación del proyecto fueron realizados por el
equipo humano. La IA se empleó para acelerar el **trabajo pesado y repetitivo** de
codificación, siempre bajo revisión y validación de los integrantes.

Toda salida generada con asistencia de IA fue leída, entendida, probada y aprobada
por el equipo antes de incorporarse. El equipo asume la responsabilidad plena sobre
el código y la documentación del repositorio.

---

## 2. Lo que hizo el equipo

- Definición del problema, el alcance y los requisitos de la plataforma.
- Análisis del dominio: grupos estudiantiles, comités, estados de miembro,
  actividades y tabla de permanencia.
- Modelo de datos y diagrama entidad-relación; decisiones sobre relaciones,
  unicidad y cascadas.
- Arquitectura de la solución: separación backend/frontend, elección del stack
  (NestJS, TypeORM, SQLite, Vue 3, Pinia, Tailwind), organización por módulos y el
  patrón "una clase-servicio por recurso".
- Diseño de la API REST (recursos, endpoints, esquema de autorización por roles).
- Diseño de la interfaz y de los flujos de usuario (login, gestión de grupos,
  base de datos de integrantes, tabla de permanencia, exportación a Excel).
- Reglas de negocio: cálculo del puntaje de permanencia, objetivos por estado de
  miembro, criterios de cumplimiento.
- Priorización del trabajo, división de tareas y definición del roadmap.
- Revisión de código, pruebas funcionales y validación de cada entrega.

## 3. En lo que se usó IA (trabajo pesado de implementación)

- Generación de código repetitivo y de andamiaje siguiendo patrones ya decididos
  por el equipo (entidades, DTOs, servicios, controladores, módulos, stores,
  componentes de tabla y modales).
- Escritura y ajuste de pruebas unitarias.
- Refactorizaciones mecánicas y renombrados a gran escala para alinear el código
  con el modelo de datos acordado.
- Redacción de borradores de documentación técnica (por ejemplo `docs/ai/AGENTS.md`,
  secciones del README) a partir de indicaciones del equipo.
- Búsqueda y explicación de errores, y propuestas de corrección puntuales.
- Tareas de formato, linting y consistencia de estilo.

---

## 4. Herramientas utilizadas

- Claude/Claude Code.

## 5. Controles aplicados

- Revisión humana de todo el código y la documentación antes de integrarlos.
- Ejecución de linters, verificación de tipos, compilación y pruebas
  (`lint`, `format`, `type-check`/`build`, `test`) sobre cada cambio.
- Ningún dato personal real fue entregado a las herramientas de IA: los datos de
  ejemplo del proyecto son ficticios; del material original solo se tomó la
  estructura de campos.
- Las decisiones de arquitectura y de negocio no se delegaron en la IA.
