# Milestone Manager

目標（Goal）とマイルストーン（Milestone）を管理するサーバーレスWebアプリケーション。

## 機能

- 目標（Goal）の作成・更新・削除
- 目標に紐づくマイルストーン（Milestone）の管理
- ガントチャート・進捗グラフの表示
- Cognito認証（メール + パスワード）

## アーキテクチャ

```
[Frontend]  ─── REST ───>  [API Gateway]  ───>  [Lambda (FastAPI)]  ───>  [DynamoDB]
     │                           │
     │                           ▼
[Amplify] <────────────────> [Cognito]
```

## 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite
- TailwindCSS v4
- TanStack Query (React Query)
- AWS Amplify (認証)
- React Router v7
- Recharts (グラフ)
- dnd-kit (ドラッグ&ドロップ)

### バックエンド
- Python 3.14+
- FastAPI
- Mangum (Lambda アダプター)
- boto3 (AWS SDK)
- Pydantic v2

### インフラ
- AWS Lambda
- Amazon DynamoDB
- Amazon API Gateway
- Amazon Cognito
- Amazon S3 + CloudFront
- Terraform (IaC)

## セットアップ

### 前提条件

- Node.js 18+
- Python 3.14+
- Terraform 1.0+
- AWS CLI（設定済み）
- DynamoDB Local（ローカル開発用、オプション）

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

開発サーバーが http://localhost:5173 で起動します。

### バックエンド

```bash
cd backend

# 仮想環境の作成（推奨）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .env を編集して必要な値を設定

# 開発サーバーの起動
python run_local.py
```

開発サーバーが http://localhost:8080 で起動します。

### DynamoDB Local（オプション）

ローカル開発でDynamoDB Localを使用する場合：

```bash
# Docker を使用する場合
docker run -p 8000:8000 amazon/dynamodb-local

# テーブル作成
cd backend
python scripts/create_table.py
```

### Terraform（インフラ構築）

```bash
cd terraform

# 初期化
terraform init

# 開発環境のデプロイ
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars

# 本番環境のデプロイ
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## 開発コマンド

### フロントエンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint実行 |
| `npm run preview` | ビルド成果物のプレビュー |

### バックエンド

| コマンド | 説明 |
|---------|------|
| `python run_local.py` | 開発サーバー起動 |
| `python scripts/create_table.py` | DynamoDBテーブル作成 |

## プロジェクト構成

```
milestone-manager/
├── frontend/                 # フロントエンド (React)
│   ├── src/
│   │   ├── features/        # 機能別モジュール
│   │   │   ├── auth/        # 認証機能
│   │   │   ├── goals/       # 目標管理機能
│   │   │   └── milestones/  # マイルストーン機能
│   │   ├── components/      # 共通コンポーネント
│   │   ├── lib/             # ユーティリティ
│   │   └── types/           # 型定義
│   └── package.json
│
├── backend/                  # バックエンド (FastAPI)
│   ├── src/
│   │   ├── api/routes/      # APIエンドポイント
│   │   ├── models/          # Pydanticモデル
│   │   ├── repositories/    # データアクセス層
│   │   ├── core/            # 設定・セキュリティ
│   │   └── main.py          # アプリケーションエントリポイント
│   ├── scripts/             # ユーティリティスクリプト
│   └── requirements.txt
│
├── terraform/                # インフラ (Terraform)
│   ├── modules/
│   │   ├── dynamodb/        # DynamoDBテーブル
│   │   ├── cognito/         # Cognito User Pool
│   │   ├── api/             # Lambda + API Gateway
│   │   └── frontend/        # S3 + CloudFront
│   ├── environments/        # 環境別設定
│   │   ├── dev.tfvars
│   │   └── prod.tfvars
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
└── README.md
```

## API エンドポイント

### Goals

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/goals` | 目標一覧取得 |
| POST | `/api/goals` | 目標作成 |
| GET | `/api/goals/{id}` | 目標詳細取得 |
| PUT | `/api/goals/{id}` | 目標更新 |
| DELETE | `/api/goals/{id}` | 目標削除 |

### Milestones

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/goals/{goalId}/milestones` | マイルストーン一覧取得 |
| POST | `/api/goals/{goalId}/milestones` | マイルストーン作成 |
| PUT | `/api/milestones/{id}` | マイルストーン更新 |
| DELETE | `/api/milestones/{id}` | マイルストーン削除 |

### その他

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/docs` | Swagger UI（開発環境のみ） |

## 環境変数

### バックエンド (.env)

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `AWS_REGION` | AWSリージョン | `ap-northeast-1` |
| `DYNAMODB_TABLE_NAME` | DynamoDBテーブル名 | `milestone-manager` |
| `DYNAMODB_ENDPOINT_URL` | DynamoDB Local URL | - |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | - |
| `COGNITO_CLIENT_ID` | Cognito Client ID | - |
| `ENVIRONMENT` | 実行環境 | `development` |
| `DEBUG` | デバッグモード | `true` |

### フロントエンド

| 変数名 | 説明 |
|--------|------|
| `VITE_API_URL` | バックエンドAPIのURL |

## ライセンス

MIT
