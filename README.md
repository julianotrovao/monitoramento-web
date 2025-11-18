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
# Testes da Aplicação

## Estrutura de Testes

A aplicação possui testes unitários e de integração implementados com Jest:

- `__tests__/monitor.test.js` - Testes das funções de monitoramento (ping e HTTP)
- `__tests__/db.test.js` - Testes do módulo de banco de dados
- `__tests__/integration.test.js` - Testes de integração do fluxo completo

## Executar Testes

### Instalar dependências
```bash
npm install
```

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

## Cobertura de Testes

Os testes cobrem:

✅ **Monitor Module**
- Ping bem-sucedido e com falhas
- Requisições HTTP com diferentes status codes
- Tratamento de erros de rede
- Medição de tempo de resposta

✅ **Database Module**
- Inicialização e criação de tabelas
- Inserção de resultados de ping
- Inserção de resultados HTTP
- Inserção de resultados com erro
- Queries customizadas

✅ **Integration Tests**
- Monitoramento de múltiplos targets
- Execução em intervalos configurados
- Continuidade mesmo com erros
- Cancelamento de monitoramento

## Relatório de Cobertura

Após executar `npm test`, o relatório de cobertura estará disponível em `coverage/lcov-report/index.html`

#IMPLEMENTAÇÕES DO TERRAFORM NA AWS
```markdown
# Terraform: monitoramento-web ECS infra

Arquivos incluídos (atualizados):
- provider.tf, versions.tf
- variables.tf (agora com region e image_tag)
- vpc.tf
- security.tf
- alb.tf
- ecr.tf
- iam.tf
- ecs.tf (tasks em subnets públicas, assign_public_ip = true, imagem usa tag variável)
- outputs.tf
- .github/workflows/build-and-push.yml (workflow para build/push e forçar novo deployment)

Principais mudanças feitas:
- Container default port alterado para 3000 (variável container_port).
- Added variable image_tag (padrão "latest") e task definition usa ${aws_ecr_repository.monitoramento_web.repository_url}:${var.image_tag}.
- ECS tasks agora rodam em subnets públicas e recebem IP público (assign_public_ip = true).
- GitHub Actions workflow para build/push da imagem ao ECR e forçar nova implantação no ECS.

Como usar localmente:
1. Ajuste variáveis em `variables.tf` se necessário (região, CIDRs, porta, CPU/memory, desired_count, image_tag).
2. Inicialize Terraform:
   terraform init
3. Visualize o plano:
   terraform plan
4. Aplique:
   terraform apply

Push da imagem manual (se não usar o workflow):
- aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
- docker build -t monitoramento-web .
- docker tag monitoramento-web:latest <ecr_repo_url>:latest
- docker push <ecr_repo_url>:latest

GitHub Actions:
- Coloque os secrets no repositório:
  - AWS_REGION (ex: us-east-1)
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
- O workflow build-and-push cria uma imagem com a tag = sha do commit e também replica como :latest.
- O workflow executa `aws ecs update-service --force-new-deployment` para forçar que o service puxe a nova imagem (assumindo nomes padrão de cluster/service: monitoramento-web-cluster e monitoramento-web-service criados por Terraform).

Observações:
- Em produção é recomendável usar imagens versionadas (não somente :latest) e automatizar atualização do task_definition com a tag exata.
- Custos: NAT gateways, ALB e EIPs geram custo. Se quiser simplificar (evitar NAT+EIP), posso criar uma versão sem NAT (tasks em public / sem EIP).
```