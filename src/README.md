# Enjambre EAFIT

Plataforma para centralizar y gestionar la información de los **Grupos Estudiantiles**
de la Universidad EAFIT: grupos y sus comités/departamentos, la base de datos de
integrantes de cada grupo, los estados de miembro (con su objetivo de permanencia) y
la **tabla de permanencia** (actividades ponderadas y el puntaje de cada integrante).

El proyecto es _full‑stack_ y vive en dos carpetas dentro de `src/`:

| Carpeta         | Stack                                                                      | Puerto (dev) |
| --------------- | ------------------------------------------------------------------------- | ------------ |
| `src/backend`   | NestJS 12 · TypeORM · SQLite (better‑sqlite3) · JWT · class‑validator     | `3000`       |
| `src/frontend`  | Vue 3 · Vite · TypeScript · Pinia · Vue Router · Tailwind CSS v4 · axios  | `5173`       |

El frontend consume la API REST del backend (`http://localhost:3000/api`). La
autenticación es por **JWT**: al iniciar sesión se guarda el token y se envía en la
cabecera `Authorization: Bearer <token>` en todas las peticiones.

---

## 1. Requisitos

- **Node.js** `^22.18.0` o `>=24.12.0` (lo exige el frontend).
- **npm** (viene con Node).
- No hace falta ningún servidor de base de datos: el backend usa **SQLite** en un
  archivo local (`src/backend/database.sqlite`) que se crea solo.

---

## 2. Puesta en marcha rápida

```bash
# 1) Backend
cd src/backend
npm install
cp .env.example .env          # y edita JWT_SECRET (ver más abajo)
npm run seed                  # crea la BD + datos iniciales
npm run start:dev             # API en http://localhost:3000/api

# 2) Frontend (en otra terminal)
cd src/frontend
npm install
cp .env.example .env          # VITE_API_URL ya apunta al backend local
npm run dev                   # app en http://localhost:5173
```

Abre <http://localhost:5173> e inicia sesión con una de las **cuentas de
demostración**:

| Rol                         | Usuario      | Contraseña  |
| --------------------------- | ------------ | ----------- |
| Administrador (Desarrollo Estudiantil) | `admin`      | `admin123`  |
| Junta directiva (grupo SPIE)           | `junta.spie` | `junta123`  |

> Estas credenciales salen de las variables `ADMIN_*` / `BOARD_*` del `.env` del
> backend; cámbialas ahí y vuelve a seedear si quieres otras.

---

## 3. Backend en detalle (`src/backend`)

### 3.1. Variables de entorno

Copia `.env.example` a `.env`. Variables:

| Variable          | Obligatoria | Por defecto              | Para qué sirve                                                        |
| ----------------- | ----------- | ------------------------ | -------------------------------------------------------------------- |
| `JWT_SECRET`      | **Sí**      | —                        | Firma/verificación de los JWT. Si falta, el servidor **no arranca**. |
| `JWT_EXPIRES_IN`  | No          | `1d`                     | Vigencia del token (formato de `jsonwebtoken`, p. ej. `8h`, `7d`).   |
| `PORT`            | No          | `3000`                   | Puerto del servidor HTTP.                                            |
| `CORS_ORIGIN`     | No          | `http://localhost:5173`  | Orígenes permitidos por CORS, separados por comas.                  |
| `ADMIN_USERNAME`  | Para seed   | —                        | Usuario admin que crea `npm run seed`.                              |
| `ADMIN_PASSWORD`  | Para seed   | —                        | Contraseña del admin (se guarda hasheada con bcrypt).              |
| `BOARD_USERNAME`  | Para seed   | —                        | Usuario de junta del grupo SPIE.                                    |
| `BOARD_PASSWORD`  | Para seed   | —                        | Contraseña de la junta.                                             |

Genera un `JWT_SECRET` aleatorio, por ejemplo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3.2. Base de datos

- Motor: **SQLite** vía `better-sqlite3`. El archivo es `src/backend/database.sqlite`
  (está en `.gitignore`).
- El esquema se crea **automáticamente** con `synchronize: true` de TypeORM: tanto
  al levantar el servidor (`npm run start:dev`) como al correr `npm run seed`.
- No hay migraciones. Si cambias una entidad, TypeORM intenta ajustar el esquema en
  caliente; ante problemas, **borra `database.sqlite` y vuelve a seedear**.

### 3.3. Sembrar datos (`npm run seed`)

```bash
cd src/backend
npm run seed
```

Ejecuta `src/database/seeds/index.ts`, que crea (si no existen ya) en este orden:

1. **Grupos**: `SPIE` y `Organización Estudiantil (OE)`.
2. **Usuarios**: `admin` (rol `ADMIN`) y el usuario de junta (rol `BOARD`, ligado a
   SPIE). Las contraseñas se hashean con bcrypt.
3. **Estados de miembro** del grupo SPIE (con su objetivo `target` de permanencia).
4. **Miembros** de ejemplo.
5. **Vínculos miembro↔grupo** (`group_member`).
6. **Comités** del grupo SPIE.
7. **Actividades** (generales y de comité).
8. **Permanencias** (valores de cada miembro en cada actividad).

El seed es **idempotente**: si un registro ya existe lo salta. Para **empezar de
cero**:

```bash
rm src/backend/database.sqlite   # (Windows: del src\backend\database.sqlite)
npm run seed
```

> El seed usa el loader `ts-node/esm`. En Node 24 puede imprimir un aviso de
> _deprecation_ sobre `--loader`; es inofensivo.

### 3.4. Levantar el servidor

```bash
cd src/backend
npm run start:dev     # watch mode; API en http://localhost:3000/api
```

Todos los endpoints están bajo el prefijo global `/api` y requieren JWT, **excepto**
`POST /api/auth/login`. La API valida los cuerpos con `class-validator` y **rechaza
propiedades no declaradas** (`forbidNonWhitelisted`).

### 3.5. Scripts útiles

| Comando              | Qué hace                                             |
| -------------------- | --------------------------------------------------- |
| `npm run start:dev`  | Servidor en watch mode.                             |
| `npm run start`      | Servidor sin watch.                                 |
| `npm run build`      | Compila a `dist/`.                                  |
| `npm run start:prod` | Ejecuta `dist/main` (requiere `build` previo).      |
| `npm run seed`       | Crea/actualiza la BD con datos iniciales.           |
| `npm run test`       | Tests unitarios (Vitest).                           |
| `npm run lint`       | oxlint.                                             |
| `npm run format`     | Prettier `--write`.                                 |

### 3.6 Documentación de las APIs
La documentación de las APIs se realizó mediante OpenAPI y Swagger UI. Para acceder a la documentación, es necesario ejecutar previamente el backend y dirigirse a la siguiente ruta:


`http://localhost:3000/docs`
--
-

## 4. Frontend en detalle (`src/frontend`)

### 4.1. Variables de entorno

Copia `.env.example` a `.env`:

| Variable               | Por defecto                     | Para qué sirve                          |
| ---------------------- | ------------------------------- | -------------------------------------- |
| `VITE_API_URL`         | `http://localhost:3000/api`     | URL base de la API del backend.        |
| `VITE_APP_NAME`        | `Enjambre EAFIT`                | Nombre mostrado en la UI.              |
| `VITE_APP_INSTITUTION` | `Universidad EAFIT`             | Institución mostrada en la UI.         |
| `VITE_APP_DESCRIPTION` | (texto de la plataforma)        | Descripción mostrada en la landing.    |

### 4.2. Levantar la app

```bash
cd src/frontend
npm install
npm run dev           # http://localhost:5173
```

El frontend **no persiste nada en `localStorage`** salvo el token JWT
(`enjambre.token`); todo el estado se pide a la API en cada carga de pantalla. Al
arrancar, `AuthService.bootstrapSession()` usa el token guardado para rehidratar la
sesión contra `GET /api/auth/me`.

### 4.3. Scripts útiles

| Comando               | Qué hace                                    |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo (Vite).             |
| `npm run build`       | `type-check` + build de producción a `dist/`. |
| `npm run preview`     | Sirve el build de producción.              |
| `npm run type-check`  | `vue-tsc --build`.                          |
| `npm run lint`        | oxlint + eslint (con `--fix`).             |
| `npm run format`      | Prettier `--write`.                        |

---

## 5. Orden de arranque recomendado

1. **Backend**: `.env` listo → `npm run seed` → `npm run start:dev`.
2. **Frontend**: `.env` listo → `npm run dev`.
3. Navegar a <http://localhost:5173>, iniciar sesión como `admin` / `admin123`.

Si el frontend muestra errores de red al cargar, casi siempre es porque el backend
no está arriba, el `.env` del backend no tiene `JWT_SECRET`, o la BD no está seedeada
(login válido pero pantallas vacías).

---

## 6. Estructura del proyecto

```
src/
├── backend/
│   └── src/
│       ├── auth/            # login, JWT, AuthGuard (global) y RolesGuard (@Roles)
│       ├── users/           # solo POST (crea usuarios de junta, rol BOARD)
│       ├── groups/          # Group + subrecursos GroupMember y MemberStatus
│       ├── committees/      # Committee (comités/departamentos de un grupo)
│       ├── members/         # Member (base de datos de integrantes)
│       ├── activities/      # Activity (actividades de permanencia; período automático)
│       ├── permanences/     # Permanence (puntos de un miembro en una actividad)
│       └── database/
│           ├── data-source.ts      # DataSource para el seed
│           └── seeds/              # scripts de datos iniciales (index.ts los orquesta)
└── frontend/
    └── src/
        ├── services/        # una clase por recurso; llaman a la API con axios
        ├── stores/          # solo Pinia para auth y toasts
        ├── views/           # pantallas (login, grupos, miembros, permanencia, board)
        ├── components/      # tablas, modales, sidebar, etc.
        ├── interfaces/      # tipos del dominio (respuestas de la API, aplanadas)
        └── dtos/            # tipos de los cuerpos que se envían a la API
```

### Modelo de datos (resumen)

- Un **Group** tiene comités (**Committee**), estados de miembro (**MemberStatus**,
  con `target`) y una cuenta de junta (**User** con rol `BOARD`).
- Un **Member** pertenece a un grupo a través de **GroupMember**
  (`UNIQUE(member, group)`, con un único `memberStatus` por vínculo) y puede
  pertenecer a varios **Committee** (relación M:N).
- Una **Activity** pertenece a un grupo y, opcionalmente, a un comité
  (`committeeId = null` ⇒ actividad general). Tiene un `weight` (%) y un `period`
  que **asigna el servidor** (semestre vigente).
- Una **Permanence** es el puntaje (`percentage`, entero, 0..`weight`) de un
  **Member** en una **Activity** (`UNIQUE(member, activity)`).
- Borrar un **Group** elimina en cascada sus comités, estados, actividades,
  permanencias, la cuenta de junta y los miembros que no pertenezcan a otro grupo.

### Autorización

- `AuthGuard` global: todo requiere JWT salvo `POST /api/auth/login`.
- `@Roles('ADMIN')` sobre las mutaciones de `groups`, `committees`,
  `member-statuses` y sobre `POST /api/users`. El resto de endpoints los puede usar
  cualquier usuario autenticado.

---

## 7. Notas y limitaciones conocidas

- **`documentType` en el seed**: `member.seed.ts` guarda `'CC'`, mientras que el
  frontend usa los nombres completos (`'Cédula de ciudadanía'`, …). Los miembros
  seedeados se ven bien pero el `<select>` de tipo de documento no casará con ese
  valor hasta que se edite. Alinea el seed con `src/frontend/src/constants/documentTypes.ts`
  si vas a demostrar esa columna.
- **Usuario de la junta en la UI**: no hay endpoint para listar/consultar usuarios,
  así que el nombre de la cuenta de junta no se muestra en el panel de grupos.
- **Sin _scoping_ por grupo para BOARD**: un usuario de junta puede leer/escribir
  `members` / `activities` / `permanences` de cualquier grupo llamando la API
  directamente (el frontend solo lo restringe por rutas).
- **JWT sin refresh**: el token vive `JWT_EXPIRES_IN` (1 día por defecto); al
  expirar hay que volver a iniciar sesión.
- **SQLite con `synchronize: true`**: cómodo para desarrollo, pero cambios de
  entidad pueden requerir borrar `database.sqlite` y re‑seedear.
- Tras cambiar los roles a `ADMIN`/`BOARD`, una BD antigua con roles en minúscula
  no enruta bien: re‑seedea.
