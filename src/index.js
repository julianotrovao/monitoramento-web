const express = require('express');
const { collectDefaultMetrics, register, Gauge } = require('prom-client');
const { startMonitoring } = require('./monitor');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Prometheus
collectDefaultMetrics();

const gaugePingRtt = new Gauge({ name: 'agent_ping_rtt_ms', help: 'Ping RTT in ms', labelNames: ['target'] });
const gaugePingLoss = new Gauge({ name: 'agent_ping_loss_pct', help: 'Ping packet loss %', labelNames: ['target'] });

const gaugeHttpTime = new Gauge({ name: 'agent_http_time_ms', help: 'HTTP time in ms', labelNames: ['target', 'status'] });

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

async function main() {
  await db.init();

  const targets = (process.env.TARGETS || 'google.com,youtube.com,rnp.br').split(',').map(t => t.trim());
  const intervalSec = parseInt(process.env.CHECK_INTERVAL || '60', 10);

  startMonitoring({ targets, intervalSec, onResult: async (result) => {
    // Persist
    try {
      await db.insertResult(result);
    } catch (err) {
      console.error('DB insert error', err);
    }

    // Set metrics
    if (result.type === 'ping') {
      gaugePingRtt.labels(result.target).set(result.rtt);
      gaugePingLoss.labels(result.target).set(result.packetLoss);
    } else if (result.type === 'http') {
      gaugeHttpTime.labels(result.target, String(result.status)).set(result.time);
    }
  }});

  app.listen(port, () => console.log(`Agent listening on ${port}`));
}

main().catch(err => { console.error(err); process.exit(1); });
