Backend example for Store demo

Endpoints:
- GET /api/health - health check
- POST /api/reservations - insert reservation into Supabase table `reservations`
- POST /api/create-payment - create a Wompi transaction (returns Wompi response)

Setup:
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Start server:

```bash
npm start
```

Notes:
- The server uses `@supabase/supabase-js` to insert into Supabase. Make sure your `SUPABASE_KEY` has insert permissions (service_role or appropriate key).
- The Wompi request uses the private key and calls `https://checkout.wompi.co/v1/transactions`. Check Wompi docs for exact response fields.
