# Backend (Neon PostgreSQL + Wompi)

## Endpoints

- `GET /api/health` — estado del servidor y conexión a Neon
- `POST /api/reservations` — guarda reservas en PostgreSQL (Neon)
- Tras guardar una reserva, el frontend redirige a `WOMPI_PAYMENT_URL` (link de pago Wompi)
- `POST /api/create-payment` — API Wompi avanzada (opcional)

## Configuración

1. Copia `backend/.env.example` a `backend/.env`.
2. En [Neon](https://neon.tech), crea un proyecto y pega la **connection string** en `DATABASE_URL` (usa la variante **pooled** en producción).
3. Instala y arranca:

```bash
cd backend
npm install
npm start
```

4. Abre la tienda en `http://localhost:3000/` (el backend sirve el frontend estático).
5. La tabla `reservations` se crea automáticamente al iniciar el servidor. También puedes ejecutar `neon/migrations/create_reservations.sql` manualmente en el SQL Editor de Neon.

## Formulario → base de datos

| Campo del formulario | Columna |
|----------------------|---------|
| productName | product_name |
| productSku | sku |
| size | size |
| color | color |
| qty | qty |
| price | price |
| fullname | fullname |
| phone | phone |
| email | email |
| notes | notes |
| (generado) id | id |
| (generado) created_at | created_at |

## Netlify (producción)

Ver [NETLIFY.md](./NETLIFY.md). Debes configurar `DATABASE_URL` en el panel de Netlify.

## Seguridad

No subas `backend/.env` ni expongas `DATABASE_URL` en el frontend.
