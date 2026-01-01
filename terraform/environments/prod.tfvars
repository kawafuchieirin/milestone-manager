# 本番環境設定
aws_region          = "ap-northeast-1"
project_name        = "milestone-manager"
environment         = "prod"
dynamodb_table_name = "milestone-manager"

# Cognito
cognito_callback_urls = [
  "https://dup715o0rkbl.cloudfront.net/",
  "http://localhost:5173/"
]
cognito_logout_urls = [
  "https://dup715o0rkbl.cloudfront.net/login",
  "http://localhost:5173/login"
]

# CORS
cors_allowed_origins = [
  "https://dup715o0rkbl.cloudfront.net",
  "http://localhost:5173"
]

# カスタムドメイン（不要）
frontend_domain     = ""
acm_certificate_arn = ""
