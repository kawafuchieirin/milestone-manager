# 本番環境設定
aws_region          = "ap-northeast-1"
project_name        = "milestone-manager"
environment         = "prod"
dynamodb_table_name = "milestone-manager"

# Cognito（本番ドメインに置き換えてください）
cognito_callback_urls = [
  "https://your-domain.com/"
]
cognito_logout_urls = [
  "https://your-domain.com/login"
]

# CORS（本番ドメインに置き換えてください）
cors_allowed_origins = [
  "https://your-domain.com"
]

# カスタムドメイン（必要に応じて設定）
frontend_domain     = ""  # 例: "app.your-domain.com"
acm_certificate_arn = ""  # 例: "arn:aws:acm:us-east-1:123456789012:certificate/xxx"
