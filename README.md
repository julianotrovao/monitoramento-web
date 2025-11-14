# monitoramento-web

Agente de monitoramento web (ping + HTTP timing) com persistência em Postgres.

## Rodando localmente (desenvolvimento)

1. Copie .env exemplo se necessário.
2. Rode com docker-compose:

```
docker-compose -f docker-compose.dev.yml up --build
```

O serviço ficará disponível em http://localhost:3000

Endpoints:
- /metrics -> métricas Prometheus
- /health -> health check

## Estrutura inicial

- Dockerfile
- docker-compose.dev.yml
- src/ -> código do agente
- migrations/ -> SQL
- buildspec.yml -> template para AWS CodeBuild

## Próximos passos (implementação na AWS)

- Criar pipeline (CodePipeline + CodeBuild) para build e push para ECR
- Deploy em ECS (Fargate) com serviço, task definition, ALB
- RDS Postgres privado
- Observability com Amazon Managed Prometheus + Managed Grafana
- SonarCloud para análise estática

---