terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "milestone-manager/terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# CloudFront用のACM証明書はus-east-1で作成する必要がある
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# DynamoDB
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
  table_name   = var.dynamodb_table_name
}

# Cognito
module "cognito" {
  source = "./modules/cognito"

  project_name     = var.project_name
  environment      = var.environment
  callback_urls    = var.cognito_callback_urls
  logout_urls      = var.cognito_logout_urls
  frontend_domain  = var.frontend_domain
}

# API (Lambda + API Gateway)
module "api" {
  source = "./modules/api"

  project_name         = var.project_name
  environment          = var.environment
  dynamodb_table_name  = module.dynamodb.table_name
  dynamodb_table_arn   = module.dynamodb.table_arn
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
  cognito_issuer       = module.cognito.issuer
  allowed_origins      = var.cors_allowed_origins
}

# Frontend (S3 + CloudFront)
module "frontend" {
  source = "./modules/frontend"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project_name    = var.project_name
  environment     = var.environment
  domain_name     = var.frontend_domain
  certificate_arn = var.acm_certificate_arn
  api_endpoint    = module.api.api_endpoint
}
