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