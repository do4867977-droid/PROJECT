const { neon } = require('@neondatabase/serverless');

const WOMPI_PAYMENT_URL =
  process.env.WOMPI_PAYMENT_URL || 'https://checkout.wompi.co/l/VPOS_LBTnN9';

let sql = null;

function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}

async function ensureDb() {
  const client = getSql();
  if (!client) {
    const err = new Error('DATABASE_URL not configured');
    err.statusCode = 503;
    throw err;
  }
  await client`
    CREATE TABLE IF NOT EXISTS reservations (
      id text PRIMARY KEY,
      product_name text,
      sku text,
      size text,
      color text,
      qty integer,
      price integer,
      fullname text,
      phone text,
      email text,
      notes text,
      created_at timestamptz DEFAULT now()
    )
  `;
  await client`CREATE INDEX IF NOT EXISTS idx_reservations_sku ON reservations (sku)`;
  return client;
}

function mapReservation(data) {
  const rawPrice = data.price;
  const price =
    typeof rawPrice === 'number'
      ? rawPrice
      : parseInt(String(rawPrice || '').replace(/\D/g, ''), 10) || 0;

  return {
    id: data.id || 'R-' + Date.now(),
    product_name: data.productName || data.product_name || null,
    sku: data.productSku || data.sku || null,
    size: data.size || null,
    color: data.color || null,
    qty: parseInt(data.qty || '1', 10),
    price,
    fullname: data.fullname || null,
    phone: data.phone || null,
    email: data.email || null,
    notes: data.notes || null,
    created_at: data.created_at || new Date().toISOString()
  };
}

async function insertReservation(data) {
  const sku = data?.productSku || data?.sku;
  if (!sku) {
    const err = new Error('Missing reservation data (sku)');
    err.statusCode = 400;
    throw err;
  }

  const client = await ensureDb();
  const row = mapReservation(data);

  await client`
    INSERT INTO reservations (
      id, product_name, sku, size, color, qty, price,
      fullname, phone, email, notes, created_at
    ) VALUES (
      ${row.id}, ${row.product_name}, ${row.sku}, ${row.size}, ${row.color},
      ${row.qty}, ${row.price}, ${row.fullname}, ${row.phone}, ${row.email},
      ${row.notes}, ${row.created_at}
    )
  `;

  return { ok: true, id: row.id, paymentUrl: WOMPI_PAYMENT_URL };
}

async function checkHealth() {
  const body = { ok: true, time: new Date().toISOString(), database: false };
  const client = getSql();
  if (!client) {
    return { ...body, error: 'DATABASE_URL not configured' };
  }
  try {
    await client`SELECT 1 AS ok`;
    return { ...body, database: true };
  } catch (err) {
    return {
      ok: false,
      time: body.time,
      database: false,
      error: err.message || String(err)
    };
  }
}

module.exports = {
  mapReservation,
  ensureDb,
  insertReservation,
  checkHealth,
  WOMPI_PAYMENT_URL
};
