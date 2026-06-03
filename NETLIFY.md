# Desplegar en Netlify

El error `Unexpected token '<', "<!DOCTYPE "...` ocurre porque Netlify solo servía HTML y no existía la API. Este proyecto incluye **Netlify Functions** para `/api/reservations` y `/api/health`.

## Variables de entorno (obligatorio)

En **Netlify → Site configuration → Environment variables**, agrega:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Connection string de Neon (postgresql://...) |
| `WOMPI_PAYMENT_URL` | `https://checkout.wompi.co/l/VPOS_LBTnN9` |

Sin `DATABASE_URL`, las reservas fallarán.

## Redesplegar

1. Sube los cambios a Git (o arrastra la carpeta de nuevo).
2. Netlify ejecutará `npm install` y publicará las funciones.
3. Prueba: `https://tu-sitio.netlify.app/api/health` → debe devolver JSON con `"database": true`.

## Archivos clave

- `netlify.toml` — redirige `/api/*` a las funciones
- `netlify/functions/reservations.js` — guarda en Neon
- `lib/reservations.js` — lógica compartida con el backend local
