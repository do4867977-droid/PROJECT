require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const { insertReservation, checkHealth, ensureDb } = require('../lib/reservations');

const app = express();
app.use(express.json());

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const REDIRECT_URL = process.env.REDIRECT_URL || 'http://localhost:3000/';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Add it to backend/.env');
}

app.get('/api/health', async (_req, res) => {
  const result = await checkHealth();
  const status = result.ok === false ? 503 : 200;
  res.status(status).json(result);
});

app.post('/api/reservations', async (req, res) => {
  try {
    const result = await insertReservation(req.body);
    res.json(result);
  } catch (err) {
    console.error('Insert reservation error', err.message || err);
    res.status(err.statusCode || 500).json({ error: err.message || String(err) });
  }
});

app.post('/api/create-payment', async (req, res) => {
  if (!WOMPI_PRIVATE_KEY) {
    return res.status(500).json({ error: 'WOMPI_PRIVATE_KEY not configured' });
  }

  const data = req.body;
  const amount = parseInt(data.price || 0, 10) * parseInt(data.qty || 1, 10) * 100;

  try {
    const resp = await fetch('https://checkout.wompi.co/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + WOMPI_PRIVATE_KEY
      },
      body: JSON.stringify({
        transaction: {
          amount_in_cents: amount,
          currency: 'COP',
          customer_email: data.email || 'no-email@notprovided.com',
          reference: data.id || 'R-' + Date.now(),
          payment_method: { type: 'CARD' },
          redirect_url: REDIRECT_URL
        }
      })
    });
    res.json(await resp.json());
  } catch (err) {
    console.error('Wompi error', err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;

ensureDb()
  .then(() => {
    app.listen(PORT, () => console.log('Backend listening on', PORT));
  })
  .catch(err => {
    if (!process.env.DATABASE_URL) {
      app.listen(PORT, () => console.log('Backend listening on', PORT, '(no database)'));
      return;
    }
    console.error('Database init failed', err.message || err);
    process.exit(1);
  });
