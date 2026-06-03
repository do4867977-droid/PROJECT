const { insertReservation } = require('../../lib/reservations');

const headers = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const result = await insertReservation(data);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    const status = err.statusCode || 500;
    console.error('reservations function', err.message || err);
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
