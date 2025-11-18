# Monitor Agent - Aplicação de Monitoramento Web

Agente de monitoramento web com ping, HTTP timing, persistência em PostgreSQL, métricas Prometheus, traces OpenTelemetry e dashboards Grafana.

## 🚀 Funcionalidades

- ✅ Monitoramento de ping (RTT e packet loss)
- ✅ Monitoramento HTTP (tempo de resposta e status code)
- ✅ Persistência em PostgreSQL
- ✅ Métricas Prometheus
- ✅ Traces distribuídos com OpenTelemetry
- ✅ Visualização no Jaeger
- ✅ Dashboards Grafana com gráficos pizza
- ✅ Testes unitários e de integração

## 📋 Pré-requisitos

- Node.js 16+
- Docker e Docker Compose

## 🔧 Instalação

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie a infraestrutura com Docker Compose:
```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** (porta 5432)
- **Prometheus** (porta 9090)
- **Grafana** (porta 3001)
- **Jaeger** (porta 16686)
- **OpenTelemetry Collector** (portas 4317/4318)

## 🏃 Executar a Aplicação

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Acessar Dashboards

### Grafana
- URL: http://localhost:3001
- Usuário: `admin`
- Senha: `admin`
- Dashboard: "Monitor Agent Dashboard" com gráficos pizza

### Prometheus
- URL: http://localhost:9090

### Jaeger (Traces)
- URL: http://localhost:16686

## 🧪 Executar Testes

```bash
# Todos os testes com cobertura
npm test

# Modo watch
npm run test:watch
```

## 📈 Métricas Disponíveis

A aplicação expõe as seguintes métricas em `/metrics`:

- `agent_ping_rtt_ms` - Tempo de resposta do ping em ms
- `agent_ping_loss_pct` - Percentual de perda de pacotes
- `agent_http_time_ms` - Tempo de resposta HTTP em ms

## 🔍 Traces OpenTelemetry

A aplicação gera traces para:
- `monitoring.iteration` - Cada iteração de monitoramento
- `ping.check` - Cada verificação de ping
- `http.check` - Cada verificação HTTP

Visualize os traces no Jaeger: http://localhost:16686

## 🎯 Endpoints

- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus

## 🛠️ Configuração

Edite o arquivo `.env` para configurar:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/monitor
PORT=3000
TARGETS=google.com,youtube.com,rnp.br
CHECK_INTERVAL=60
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## 📦 Estrutura do Projeto

```
.
├── src/
│   ├── index.js          # Aplicação principal
│   ├── monitor.js        # Lógica de monitoramento
│   ├── db.js            # Conexão com banco de dados
│   └── tracing.js       # Configuração OpenTelemetry
├── __tests__/           # Testes
├── grafana/
│   ├── dashboards/      # Dashboards Grafana
│   └── provisioning/    # Configuração automática
├── docker-compose.yml   # Infraestrutura
├── otel-collector-config.yml  # Config OpenTelemetry
└── prometheus.yml       # Config Prometheus
```

## 🐳 Docker Compose Services

- **postgres**: Banco de dados PostgreSQL
- **prometheus**: Sistema de métricas
- **grafana**: Visualização de dashboards
- **jaeger**: Visualização de traces
- **otel-collector**: Coletor OpenTelemetry

## 📝 Licença

MIT
