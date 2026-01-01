# 開発環境設定
aws_region          = "ap-northeast-1"
project_name        = "milestone-manager"
environment         = "dev"
dynamodb_table_name = "milestone-manager"

# Cognito
cognito_callback_urls = [
  "http://localhost:5173/",
  "http://localhost:3000/"
]
cognito_logout_urls = [
  "http://localhost:5173/login",
  "http://localhost:3000/login"
]

# CORS
cors_allowed_origins = [
  "http://localhost:5173",
  "http://localhost:3000"
]

# カスタムドメイン（空の場合はCloudFrontのデフォルトドメインを使用）
frontend_domain     = ""
acm_certificate_arn = ""
