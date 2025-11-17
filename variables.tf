variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "monitoramento-web"
}

variable "environment" {
  description = "Environment tag"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets_cidrs" {
  description = "CIDRs for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets_cidrs" {
  description = "CIDRs for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "ECS service desired count"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "Task CPU units (Fargate)"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Task memory (Fargate)"
  type        = string
  default     = "512"
}

variable "ecr_repo_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "monitoramento-web"
}

variable "image_tag" {
  description = "Tag to use for the ECR image (workflows will push both ${GITHUB_SHA} and latest)"
  type        = string
  default     = "latest"
}