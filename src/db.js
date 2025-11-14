const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/monitor';
const pool = new Pool({ connectionString });

async function init() {
  const create = `
  CREATE TABLE IF NOT EXISTS monitor_results (
    id SERIAL PRIMARY KEY,
    target TEXT NOT NULL,
    check_type TEXT NOT NULL,
    rtt_ms DOUBLE PRECISION NULL,
    packet_loss DOUBLE PRECISION NULL,
    http_time_ms DOUBLE PRECISION NULL,
    http_status INT NULL,
    error TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  `;
  await pool.query(create);
}

async function insertResult(res) {
  const q = `INSERT INTO monitor_results (target, check_type, rtt_ms, packet_loss, http_time_ms, http_status, error) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
  const values = [res.target, res.type, res.rtt || null, res.packetLoss || null, res.time || null, res.status || null, res.error || null];
  await pool.query(q, values);
}

module.exports = { init, insertResult, query: (text, params) => pool.query(text, params) };
