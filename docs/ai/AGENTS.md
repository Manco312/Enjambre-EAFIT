# AGENTS.md — Contexto del proyecto para asistentes de IA

> Documento de contexto para que los prompts futuros sean cortos. Si algo aquí
> contradice al código, **gana el código** — y actualiza este archivo.
> Última revisión: 2026-09-08.

---

## 1. Qué es

**Enjambre EAFIT**: plataforma web para gestionar los **Grupos Estudiantiles** de la
Universidad EAFIT. Cubre:

- Grupos y sus **comités/departamentos**.
- **Base de datos de integrantes** por grupo (columnas de negocio tipo Excel).
- **Estados de miembro** (`MemberStatus`), cada uno con un `target` (objetivo de
  permanencia, entero).
- **Tabla de permanencia**: actividades ponderadas (`weight` en %) y el **puntaje**
  de cada integrante, con hoja general + una hoja por comité, exportable a Excel.

Roles de usuario:

| Rol     | Quién                             | Alcance                                       |
| ------- | --------------------------------- | -------------------------------------------- |
| `ADMIN` | Desarrollo Estudiantil (EAFIT)    | Todo: CRUD de grupos, comités, estados, etc. |
| `BOARD` | Junta directiva de **un** grupo   | Gestiona miembros / actividades / permanencia |

Cuentas demo (del `.env` del backend): `admin` / `admin123` · `junta.spie` / `junta123`.

---

## 2. Stack y layout

Monorepo simple. Todo el código vive en `src/`:

| Carpeta        | Stack                                                                        | Puerto dev |
| -------------- | -------------------------------------------------------------------------- | ---------- |
| `src/backend`  | NestJS 12 · TypeORM · SQLite (`better-sqlite3`, `synchronize: true`) · JWT · `class-validator` · Vitest | `3000` |
| `src/frontend` | Vue 3 · Vite · TypeScript · Pinia · Vue Router · Tailwind CSS v4 · axios     | `5173`     |

- **Node** `^22.18.0` o `>=24.12.0`. ESM en todo el backend (import specifiers con
  extensión `.js`).
- El frontend **consume la API REST** del backend en `http://localhost:3000/api`
  (`VITE_API_URL`). Ya **no** hay modo localStorage: lo único que se guarda en el
  navegador es el token JWT (`enjambre.token`).
- Otras carpetas de `docs/`: `diagrams/`, `mockups/`, `proposals/`. La guía humana
  completa está en [`src/README.md`](../../src/README.md).

### Árbol relevante

```
src/backend/src/
  auth/         login, JWT, AuthGuard (APP_GUARD global) + RolesGuard (@Roles)
  users/        solo POST (crea cuentas de junta, rol BOARD) — @Roles('ADMIN')
  groups/       Group + subrecursos GroupMember y MemberStatus (3 controllers/services)
  committees/   Committee (comités/departamentos de un grupo)
  members/      Member (base de datos de integrantes); create orquesta GroupMember + comités
  activities/   Activity (actividades de permanencia; period lo pone el server)
  permanences/  Permanence (puntos de un miembro en una actividad)
  database/
    data-source.ts     DataSource para el seed
    seeds/index.ts      orquesta los seeders en orden
  utils/period.util.ts  getCurrentPeriod() -> "YYYY-S" (S = 1 si mes < 6, si no 2)
  main.ts       prefijo global 'api' + ValidationPipe({ whitelist, forbidNonWhitelisted, transform })

src/frontend/src/
  services/     una clase por recurso, métodos estáticos, llaman a la API con axios
  stores/       Pinia SOLO para auth (authstore) y toasts (toaststore)
  views/        pantallas (login, landing, grupos, miembros, permanencia, board)
  components/   tablas, modales, sidebar, topbar, editores de listas
  interfaces/   tipos del dominio = respuestas de la API aplanadas (con *Id, no objetos)
  dtos/         cuerpos que se envían a la API
  constants/    environment, routeNames, roles, memberColumns, documentTypes, messages
  router/index.ts   rutas + guard (AuthService.guardRoute)
```

---

## 3. Cómo levantar / operar

Siempre **desde `src/backend` o `src/frontend`** (rutas relativas: la BD es
`src/backend/database.sqlite`).

```bash
# Backend
cd src/backend
npm install
cp .env.example .env          # editar JWT_SECRET
npm run seed                  # crea el esquema (synchronize) + datos iniciales
npm run start:dev             # API en http://localhost:3000/api

# Frontend (otra terminal)
cd src/frontend
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

### Reiniciar la base de datos

No hay migraciones. `synchronize: true` recrea el esquema al conectar; los seeders
son **idempotentes** (comprueban antes de insertar).

```powershell
cd src/backend
Remove-Item database.sqlite -ErrorAction SilentlyContinue
npm run seed        # recrea esquema + datos
```

Orden del seed ([`seeds/index.ts`](../../src/backend/src/database/seeds/index.ts)):
grupos → usuarios → estados de miembro → miembros → group-members → comités →
actividades → permanencias.

### Scripts que deben pasar antes de dar algo por terminado

| Carpeta    | Comandos                                                       |
| ---------- | ------------------------------------------------------------- |
| `backend`  | `npm run lint` · `npm run format` · `npm run build` · `npm run test` |
| `frontend` | `npm run lint` · `npm run format` · `npm run type-check` · `npm run build` |

---

## 4. Modelo de datos (ER)

```
Group 1─* Committee
Group 1─* MemberStatus            (name, target:int)
Group 1─1 User (rol BOARD)
Group 1─* Activity
Group 1─* GroupMember *─1 Member  UNIQUE(member, group); un memberStatus por vínculo
Member *─* Committee              (join table committee_member; dueño = Member.committees)
Activity *─1 Committee?           committeeId NULL  => actividad GENERAL
Permanence *─1 Member, *─1 Activity   UNIQUE(member, activity); percentage:int
```

Detalles que importan:

- **`Member`** trae solo columnas del ER: `idEpik` (unique), `fullName`,
  `documentType`, `documentNumber` (unique), `email` (unique, se guarda TRIM+UPPER),
  `phone` (unique), `program`, `secondProgram?`. La pertenencia a comités es M:N por
  **id** (`committeeIds: number[]`), nunca por nombre.
- **`GroupMember`** = relación miembro↔grupo con **un único `memberStatusId`** por
  `(member, group)`. `MemberService.getMembersByGroupId` devuelve
  `MemberWithMembership` (= `MemberInterface` + `memberStatusId`) resolviendo el join.
- **`MemberStatus.target`**: objetivo de permanencia embebido (no hay entidad
  `PermanenceTarget` aparte).
- **`Activity`**: `weight` (int, %), `period` (`"YYYY-S"`, **lo asigna el servidor**,
  no se manda desde el front), `committeeId` nullable. General ⇔ `committeeId === null`.
- **`Permanence.percentage`**: **puntos obtenidos** en esa actividad, entero en
  `[0, weight]`. **No es un 0–100.** Se llama `percentage` por la columna del backend.
- **Eager loading** en casi todas las relaciones + `onDelete: 'CASCADE'`. Borrar un
  `Group` cascadea a comités, estados, actividades, permanencias, cuenta de junta y
  miembros que no estén en otro grupo.
- `password` en `User` lleva `@Exclude()` (no se serializa; `UsersController` activa
  `ClassSerializerInterceptor`).

---

## 5. API REST (`/api`, todo requiere JWT salvo login)

Auth: `Authorization: Bearer <token>`. `AuthGuard` es `APP_GUARD` global;
solo `POST /api/auth/login` es `@Public()`.

| Recurso          | Endpoints                                              | `@Roles('ADMIN')` en                     |
| ---------------- | ---------------------------------------------------- | -------------------------------------- |
| `auth`           | `POST /auth/login` · `GET /auth/me`                   | —                                     |
| `users`          | `POST /users`                                         | todo el controller                    |
| `groups`         | `GET /groups` · `GET /groups/:id` · `POST` · `PATCH /:id` · `DELETE /:id` | POST, PATCH, DELETE |
| `committees`     | `GET /committees?groupId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | POST, PATCH, DELETE |
| `member-statuses`| `GET /member-statuses?groupId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | POST, PATCH, DELETE |
| `group-members`  | `GET /group-members?groupId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | — |
| `members`        | `GET /members?groupId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | — |
| `activities`     | `GET /activities?groupId=&committeeId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | — |
| `permanences`    | `GET /permanences?memberId=&activityId=&groupId=` · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` | — |

- `ValidationPipe` global con `forbidNonWhitelisted` → mandar una propiedad no
  declarada en el DTO devuelve **400**.
- No hay endpoint de "upsert" de permanencia: el front hace GET-y-decide en
  `PermanenceService.setPercentage` (PATCH si existe `(activity, member)`, si no POST).
- No hay endpoint para listar usuarios (el nombre de la cuenta de junta no se
  muestra en la UI).

---

## 6. Convenciones de código

### Backend (patrón por recurso, de Mateo — seguir siempre)

`entities/x.entity.ts` · `dto/create-x.dto.ts` + `dto/update-x.dto.ts`
(`PartialType`) · `x.service.ts` · `x.controller.ts` · `x.module.ts` ·
`x.service.spec.ts` + `x.controller.spec.ts`.

- `service.findById` lanza `NotFoundException`; `create` lanza `ConflictException`
  ante choque de clave natural; `update` usa `repository.preload`; `remove` devuelve
  `DeleteResult`.
- `@Get()` `findAll` con `@Query('groupId')` opcional es extensión aceptada del CRUD.
- **DAG de módulos (acíclico):** `GroupsModule` ← `CommitteesModule` ← `MembersModule`;
  `ActivitiesModule` → Groups+Committees; `PermanencesModule` → Members+Activities.
  `GroupMembersService` valida el miembro con `@InjectRepository(Member)` (no con
  `MembersService`) para no cerrar el ciclo.
- Specs con globals de Vitest.

### Frontend

- **Una clase-servicio por recurso**, métodos **estáticos**, `axios` directo,
  URL base desde `ENVIRONMENT.API_URL` (`constants/environment.ts`).
- **Pinia solo para `auth` y `toasts`.** El resto del estado se pide a la API en
  cada carga de pantalla (no hay stores de dominio ni caché global).
- `interfaces/` = respuestas de la API **aplanadas**: se usan `groupId`,
  `committeeId`, `memberStatusId`, `committeeIds`, no objetos anidados.
- `dtos/` = cuerpos de request. `CreateMemberDTO` manda escalares + `committeeIds` +
  `groupId` + `memberStatusId` (el backend orquesta `GroupMember` y las asociaciones).
- Servicios que **orquestan varias llamadas**: `GroupService.registerGroup` /
  `updateGroupDetails` (helpers `reconcile()` para comités, `applyStatuses()` para
  estados con reasignación de miembros huérfanos al primer estado que sobrevive —
  el ER no permite `memberStatusId` nulo).
- **Toasts**: `ToastService.success/error/info(msg, key?)` → `toaststore`,
  auto-cierre ~3.5 s, render en `ToastHost.vue` (montado en `App.vue`). Ediciones en
  línea usan una `key` fija para reemplazar en vez de apilar.
- **Rutas**: nombres en `constants/routeNames.ts`; `meta` lleva `public` /
  `requiresAuth` / `roles`; el guard global es `AuthService.guardRoute`. Mismas
  pantallas para ADMIN (`/admin/groups/:id/...`) y BOARD (`/group/...`).
- **Export Excel**: `ExcelExportService` con import diferido de `xlsx` (0.18.5,
  chunk aparte) + `utils/downloadBlob`.
- Identidad visual blanco / negro / azul EAFIT; paleta `brand-*` en el CSS de
  entrada de Tailwind.

---

## 7. Lógica de la tabla de permanencia

Archivo: [`services/PermanenceSheetService.ts`](../../src/frontend/src/services/PermanenceSheetService.ts).
`buildSheet(groupId, 'general' | committeeId)` arma un `PermanenceSheetView` con
filas por miembro.

- **`puntaje` (`row.score`) = suma directa de los puntos obtenidos** en las
  actividades de la hoja (cada `percentage` ya está en %). **NO se normaliza** sobre
  la suma de pesos. En la hoja general se suman también los subtotales de los comités
  del miembro. _(Cambiado el 2026-09-08: antes era `total / sumaDePesos * 100`, lo
  que daba 100 % al completar todo.)_
- **`objetivo` (`row.target`) = `MemberStatus.target`** del estado del miembro en
  ese grupo. Como el puntaje ya no se normaliza a 100, el `target` debe configurarse
  como el **porcentaje de puntos exigido** (p. ej. 30), no como 100.
- **`meets` = `score >= target`** → fila **verde**; si no, **roja**.
- `PermanenceTable.vue` muestra los valores como inputs `[0, weight]`;
  `setValue` acota a ese rango y hace el upsert vía `PermanenceService.setPercentage`.

---

## 8. Gotchas / limitaciones conocidas

- **Tests preexistentes que fallan en árbol limpio** (no tocar sin querer
  arreglarlos): `auth/auth.service.spec.ts` "should throw UnauthorizedException when
  the user does not exist"; `activities/activities.service.spec.ts` fechas límite de
  `getCurrentPeriod` (sensibles a zona horaria). Estado esperado: ~127 passing / 3
  failing.
- **`documentType` en el seed**: `member.seed.ts` guarda `'CC'` pero el front usa
  nombres completos (`constants/documentTypes.ts`). El `<select>` no casa hasta
  editar el miembro.
- **Sin scoping por grupo para `BOARD`**: un token de junta puede leer/escribir
  `members`/`activities`/`permanences` de cualquier grupo por API; el front solo lo
  restringe por rutas.
- **JWT sin refresh**: expira en `JWT_EXPIRES_IN` (1d por defecto) → re-login.
- **SQLite + `synchronize: true`**: cambios de entidad pueden requerir borrar
  `database.sqlite` y re-seedear. Una BD vieja con roles en minúscula no enruta bien.
- Datos sembrados de miembros = **ficticios inventados**; del Excel de la raíz solo
  se tomó la ESTRUCTURA de columnas, nunca datos reales de personas.

---

## 9. Al terminar una tarea

1. Correr lint + format + type-check/build (+ test en backend) de la carpeta tocada.
2. Si cambió algo estructural (entidad, endpoint, convención, flujo), **actualizar
   este archivo** y `src/README.md` si aplica.
3. Commits: mensaje en español, imperativo, como los del historial
   (`Manejo de Miembros + ...`).
