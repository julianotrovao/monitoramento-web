-- Migration: cria tabela de resultados de monitoramento
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