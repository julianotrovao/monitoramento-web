resource "aws_ecr_repository" "monitoramento_web" {
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = var.ecr_repo_name
    Env  = var.environment
  }
}