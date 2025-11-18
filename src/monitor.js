const ping = require('ping');
const axios = require('axios');
const { performance } = require('perf_hooks');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('monitor-agent');

async function runPing(target) {
  return tracer.startActiveSpan('ping.check', async (span) => {
    span.setAttribute('target', target);
    span.setAttribute('check.type', 'ping');
    
    try {
      const res = await ping.promise.probe(target, { timeout: 10 });
      const rtt = typeof res.time === 'number' ? res.time : (isNaN(Number(res.time)) ? null : Number(res.time));
      const packetLoss = typeof res.packetLoss === 'number' ? res.packetLoss : (res.packetLoss ? parseFloat(res.packetLoss) : null);
      
      span.setAttribute('ping.rtt', rtt || 0);
      span.setAttribute('ping.packet_loss', packetLoss || 0);
      span.setStatus({ code: 1 }); // OK
      
      return {
        type: 'ping',
        target,
        rtt,
        packetLoss,
        timestamp: new Date()
      };
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2, message: err.message }); // ERROR
      return { type: 'ping', target, rtt: null, packetLoss: null, error: String(err), timestamp: new Date() };
    } finally {
      span.end();
    }
  });
}

async function runHttp(target) {
  return tracer.startActiveSpan('http.check', async (span) => {
    const url = target.startsWith('http') ? target : `https://${target}`;
    span.setAttribute('target', target);
    span.setAttribute('check.type', 'http');
    span.setAttribute('http.url', url);
    
    const start = performance.now();
    try {
      const resp = await axios.get(url, { timeout: 15000, validateStatus: () => true });
      const time = Math.round(performance.now() - start);
      
      span.setAttribute('http.status_code', resp.status);
      span.setAttribute('http.response_time', time);
      span.setStatus({ code: 1 }); // OK
      
      return {
        type: 'http',
        target,
        time,
        status: resp.status,
        timestamp: new Date()
      };
    } catch (err) {
      const time = Math.round(performance.now() - start);
      span.recordException(err);
      span.setStatus({ code: 2, message: err.message }); // ERROR
      return { type: 'http', target, time, status: null, error: String(err), timestamp: new Date() };
    } finally {
      span.end();
    }
  });
}

function startMonitoring({ targets = [], intervalSec = 60, onResult }) {
  async function runOneIteration() {
    return tracer.startActiveSpan('monitoring.iteration', async (span) => {
      span.setAttribute('targets.count', targets.length);
      span.setAttribute('interval.seconds', intervalSec);
      
      try {
        for (const t of targets) {
          try {
            const pingRes = await runPing(t);
            if (onResult) await onResult(pingRes);
          } catch (err) {
            console.error('Ping error', err);
            span.recordException(err);
          }

          try {
            const httpRes = await runHttp(t);
            if (onResult) await onResult(httpRes);
          } catch (err) {
            console.error('HTTP error', err);
            span.recordException(err);
          }
        }
        span.setStatus({ code: 1 }); // OK
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: 2, message: err.message }); // ERROR
      } finally {
        span.end();
      }
    });
  }

  // Run immediately, then interval
  runOneIteration();
  return setInterval(runOneIteration, intervalSec * 1000);
}

module.exports = { startMonitoring, runPing, runHttp };
