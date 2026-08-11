# Statement of Work

## Title

Enjambre EAFIT — Aplicación Web de Centralización de Datos de Grupos Estudiantiles

---

## Abstract

Este Statement of Work (SOW) describe los objetivos, el alcance, los entregables y el cronograma para el desarrollo e implementación de Enjambre EAFIT, una aplicación web orientada a centralizar y gestionar la información de los Grupos Estudiantiles de la Universidad EAFIT. El proyecto busca reemplazar el proceso actual de recolección manual de datos (mediante archivos Excel y formularios independientes) por una solución digital centralizada, validada y escalable, que incluya control de permanencia, avisos automáticos y un proceso de llenado más intuitivo. El equipo desarrollador —Luciana Hoyos, Mateo Pineda y Santiago Manco— será responsable del ciclo completo del proyecto: diseño, desarrollo, pruebas, capacitación y despliegue. El periodo estimado de ejecución es de 3 meses, del 10/08/2026 al 10/11/2026, con hitos y entregables definidos por fase.

---

## Value

El valor estimado de este trabajo corresponde al desarrollo académico de una solución tecnológica para la Universidad EAFIT, sin contraprestación económica directa, en el marco de un proyecto de curso. El valor entregado incluye: el diseño y desarrollo de la plataforma web, la documentación técnica y manual de usuario, la capacitación a Desarrollo Estudiantil y juntas directivas, y el acompañamiento post-lanzamiento. El principal retorno de valor para la Universidad EAFIT es la reducción de errores de tipado, la eliminación de procesos manuales redundantes y la mejora en la trazabilidad y el seguimiento de la información de permanencia de los miembros de los grupos estudiantiles.

---

## Scope

El alcance de este proyecto incluye el desarrollo de una aplicación web para el registro y gestión de miembros de los Grupos Estudiantiles de EAFIT, con un módulo de carga y validación automática de datos, un módulo de control de permanencia, un panel de administración para Desarrollo Estudiantil, roles diferenciados (administrador y junta directiva), notificaciones y avisos automáticos de permanencia, exportación de reportes consolidados, y autenticación básica de usuarios. Queda explícitamente fuera de alcance: la integración con sistemas académicos oficiales de EAFIT (SGA/Banner), la gestión financiera o presupuestal de los grupos, el desarrollo de una aplicación móvil nativa, la automatización de procesos de selección o gobernanza interna, y la migración de datos históricos previos al inicio del proyecto. El trabajo requerirá colaboración entre el equipo desarrollador y Desarrollo Estudiantil (representado por Diego Osorio), y se ejecutará en fases, con entregables definidos en cada etapa del cronograma.

---

## Payment

Este proyecto se desarrolla en el marco de un curso académico de la Universidad EAFIT y no contempla pagos monetarios entre las partes. No aplica un cronograma de pagos ni transferencias bancarias. El "pago" o contraprestación se entiende en términos de evaluación académica y aceptación formal de los entregables por parte de Desarrollo Estudiantil y del cuerpo docente del curso, conforme al cumplimiento de los hitos establecidos en el cronograma.

---

## Purpose

### Objectives

El objetivo principal de este proyecto es diseñar, desarrollar e implementar Enjambre EAFIT, una plataforma web que centralice la información de los miembros de los Grupos Estudiantiles de la Universidad EAFIT y automatice el control de permanencia. Al finalizar el contrato se habrán entregado: una aplicación web funcional con módulos de registro de miembros y control de permanencia, un panel administrativo para Desarrollo Estudiantil, validación automática de datos que reduzca errores de tipado, notificaciones/avisos de permanencia, documentación técnica y manual de usuario, y capacitación a los usuarios finales. La finalización exitosa del proyecto resultará en una reducción significativa del proceso manual actual, mayor consistencia en los datos institucionales y una base escalable para el crecimiento futuro del número de grupos y miembros.

### Performance

El desempeño del proyecto se medirá mediante indicadores tanto funcionales/académicos como técnicos, monitoreados a través de reuniones de seguimiento y validación con Desarrollo Estudiantil en cada hito del cronograma.

Ejemplos de métricas de desempeño funcional:

* **Reducción de errores de tipado:** al menos 90% de reducción en inconsistencias de datos frente al proceso manual actual, medido en la fase de pruebas y validación.
* **Adopción por parte de juntas directivas:** al menos el 80% de los grupos estudiantiles piloto deben registrar y actualizar su información en la plataforma dentro de las primeras semanas post-lanzamiento.

Ejemplos de métricas de desempeño técnico:

* **Precisión de validación de datos:** el módulo de validación debe detectar y prevenir al menos el 95% de errores de formato comunes (tipos de dato, campos vacíos, duplicados).
* **Tiempo de respuesta:** las acciones de usuario (registro, consulta, exportación) deben completarse en menos de 3 segundos.
* **Disponibilidad:** la plataforma debe mantener un uptime razonable durante el periodo de pruebas y demostración final.

---

## Who does what

### People

- **Luciana Hoyos** — Equipo desarrollador, Universidad EAFIT.
- **Mateo Pineda** — Equipo desarrollador, Universidad EAFIT.
- **Santiago Manco** — Equipo desarrollador, Universidad EAFIT (contacto: smancom@eafit.edu.co, 3012289102).
- **Diego Osorio** — Coordinador de Grupos Estudiantiles, Desarrollo Estudiantil, Universidad EAFIT (contacto: dosorio@eafit.edu.co).
- **Juntas Directivas de Grupos Estudiantiles** — Usuarios finales del sistema.

### Roles

- **Equipo desarrollador (Luciana, Mateo, Santiago):** responsables del diseño, desarrollo, pruebas, documentación y despliegue de la plataforma.
- **Desarrollo Estudiantil (Diego Osorio):** rol de cliente/patrocinador del proyecto; valida requisitos, aprueba entregables y actúa como administrador del sistema una vez desplegado.
- **Juntas Directivas de Grupos Estudiantiles:** usuarios operativos que registran y mantienen actualizada la información de sus miembros.

### Responsibilities

| Área de responsabilidad | Equipo Desarrollador | Desarrollo Estudiantil (Diego Osorio) | Juntas Directivas |
|---|---|---|---|
| Levantamiento de requisitos | R | A/C | I |
| Diseño de arquitectura y base de datos | R/A | C | - |
| Desarrollo de módulos (registro, permanencia) | R/A | I | - |
| Validación de datos y reglas de negocio | R | A/C | I |
| Pruebas y validación con usuarios | R | C | C |
| Capacitación | R | A | I |
| Despliegue | R/A | C | I |
| Uso y mantenimiento de datos post-lanzamiento | C | A/R | R |

*R: Responsable, A: Aprobador (Accountable), C: Consultado, I: Informado.*

---

## Context

### Present

Actualmente, la recolección de información de los Grupos Estudiantiles de la Universidad EAFIT se realiza de forma manual y descentralizada, a través de archivos de Excel y formularios independientes gestionados por cada grupo y consolidados por Desarrollo Estudiantil. Este proceso genera errores de tipado, duplicación de datos, alta carga operativa manual y dificulta el seguimiento confiable del cumplimiento de los requisitos de permanencia de los miembros. Desarrollo Estudiantil, representado por Diego Osorio, es el área institucional encargada de supervisar y validar esta información, y actúa como cliente principal de este proyecto.

### Future

A futuro, se contempla la posibilidad de integrar Enjambre EAFIT con los sistemas académicos oficiales de la universidad, desarrollar una aplicación móvil, incorporar un dashboard analítico con métricas históricas por grupo, y habilitar funcionalidades de autogestión de procesos de elección o gobernanza interna de los grupos estudiantiles. Estas funcionalidades quedan fuera del alcance del MVP actual pero se identifican como oportunidades de evolución del producto en fases posteriores.

---

## Planning

### Requirements

Los entregables del proyecto y sus requisitos se describen a continuación, siguiendo el cronograma de hitos:

| Fase / Entregable | Descripción | Responsable | Fecha límite |
|---|---|---|---|
| Levantamiento de requisitos y diseño | Documentación de requisitos funcionales y no funcionales, validados con Desarrollo Estudiantil | Equipo desarrollador | 24/08/2026 |
| Diseño de base de datos y arquitectura | Modelo de datos y arquitectura técnica de la plataforma | Equipo desarrollador | 07/09/2026 |
| Desarrollo módulo de registro de miembros | Funcionalidad de alta, edición y validación de miembros por grupo | Equipo desarrollador | 28/09/2026 |
| Desarrollo módulo de control de permanencia | Seguimiento de requisitos de permanencia por miembro | Equipo desarrollador | 12/10/2026 |
| Panel administrativo | Vista de administración para Desarrollo Estudiantil, con roles y reportes | Equipo desarrollador | 22/10/2026 |
| Pruebas y validación con usuarios | Pruebas funcionales con Desarrollo Estudiantil y juntas directivas piloto | Equipo desarrollador + Desarrollo Estudiantil | 01/11/2026 |
| Despliegue / entrega final | Publicación en ambiente definido, capacitación y entrega de documentación | Equipo desarrollador | 10/11/2026 |

Cada entregable debe ser presentado en español, en formato digital accesible desde navegador web, y validado por Diego Osorio (Desarrollo Estudiantil) antes de darse por completado. Los criterios de aceptación de cada fase se definirán en conjunto con el cliente durante la fase de levantamiento de requisitos, tomando como referencia el MVP Scope (IN / OUT / LATER / UNKNOWN) acordado.

---

## Other terms and conditions

### Client's obligations

- Designar un contacto disponible (Diego Osorio) para consultas y validaciones durante el desarrollo del proyecto.
- Brindar acceso a la información y políticas relevantes sobre el manejo actual de datos de los Grupos Estudiantiles (formatos Excel, formularios, criterios de permanencia).
- Proveer, de estar disponibles, los lineamientos o estándares institucionales aplicables (ej. SSO EAFIT, políticas de datos).
- Retroalimentar los entregables y prototipos dentro de un plazo razonable (máximo cinco días hábiles) para no afectar el cronograma.
- Coordinar la disponibilidad de juntas directivas piloto para la fase de pruebas y validación.
- Facilitar, si aplica, acceso a un ambiente de hosting institucional para el despliegue.

---

## Schedule

### Expected start date and completion date

Los servicios del equipo desarrollador serán requeridos por un periodo aproximado de 3 meses, comenzando el 10 de agosto de 2026, con finalización esperada el 10 de noviembre de 2026, conforme al cronograma de hitos detallado en la sección de Planning.

### Sign-off

NOTE: Before signing the Statement of Work, if you have any questions or concerns, please call the Work Authority indicated above to negotiate any issues.

If you agree to the requirements of this Statement of Work, please sign and date the document which will be accepted as your proposal by Client, and return to my attention.

Please return an original signature copy by mail.

Printed Name:

__________________________________________

Signature:

__________________________________________

Date:

__________________________________________