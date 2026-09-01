# Enjambre EAFIT — Frontend

Frontend de **Enjambre EAFIT** construido con Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS.

La documentación completa (alcance, roles, arquitectura, convenciones y persistencia con
`localStorage`) está en el [README raíz del repositorio](../../README.md).

## Puesta en marcha

```sh
npm install
cp .env.example .env
npm run dev
```

App disponible en `http://localhost:5173`.

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Junta directiva | `junta.spie` | `junta123` |

## Scripts

```sh
npm run dev         # servidor de desarrollo
npm run build       # type-check + build de producción
npm run preview     # sirve el build de dist/
npm run type-check  # verificación de tipos (vue-tsc)
npm run lint        # oxlint + ESLint (--fix)
npm run format      # Prettier sobre src/
```

## Variables de entorno

Definidas en `.env` (ver `.env.example`):

| Variable | Descripción |
|----------|-------------|
| `VITE_APP_NAME` | Nombre visible de la aplicación. |
| `VITE_APP_INSTITUTION` | Nombre de la institución. |
| `VITE_APP_DESCRIPTION` | Descripción usada en la landing. |

## IDE recomendado

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
(deshabilitar Vetur).
