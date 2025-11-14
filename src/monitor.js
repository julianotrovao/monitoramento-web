const ping = require('ping');
const axios = require('axios');
const { performance } = require('perf_hooks');

async function runPing(target) {
  try {
    const res = await ping.promise.probe(target, { timeout: 10 });
    // res.time may be 'unknown' when unreachable
    return {
      type: 'ping',
      target,
      rtt: typeof res.time === 'number' ? res.time : (isNaN(Number(res.time)) ? null : Number(res.time)),
      packetLoss: typeof res.packetLoss === 'number' ? res.packetLoss : (res.packetLoss ? parseFloat(res.packetLoss) : null),
      timestamp: new Date()
    };
  } catch (err) {
    return { type: 'ping', target, rtt: null, packetLoss: null, error: String(err), timestamp: new Date() };
  }
}

async function runHttp(target) {
  const url = target.startsWith('http') ? target : `https://${target}`;
  const start = performance.now();
  try {
    const resp = await axios.get(url, { timeout: 15000, validateStatus: () => true });
    const time = Math.round(performance.now() - start);
    return {
      type: 'http',
      target,
      time,
      status: resp.status,
      timestamp: new Date()
    };
  } catch (err) {
    const time = Math.round(performance.now() - start);
    return { type: 'http', target, time, status: null, error: String(err), timestamp: new Date() };
  }
}

function startMonitoring({ targets = [], intervalSec = 60, onResult }) {
  async function runOneIteration() {
    for (const t of targets) {
      try {
        const pingRes = await runPing(t);
        if (onResult) await onResult(pingRes);
      } catch (err) {
        console.error('Ping error', err);
      }

      try {
        const httpRes = await runHttp(t);
        if (onResult) await onResult(httpRes);
      } catch (err) {
        console.error('HTTP error', err);
      }
    }
  }

  // Run immediately, then interval
  runOneIteration();
  return setInterval(runOneIteration, intervalSec * 1000);
}

module.exports = { startMonitoring, runPing, runHttp };
