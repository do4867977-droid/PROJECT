const { checkHealth } = require('../../lib/reservations');

const headers = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const result = await checkHealth();
    const status = result.ok === false ? 503 : 200;
    return { statusCode: status, headers, body: JSON.stringify(result) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
