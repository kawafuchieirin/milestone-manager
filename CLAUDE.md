# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

目標（Goal）とマイルストーン（Milestone）を管理するサーバーレスアプリケーション。AWS上でReact + FastAPIで構成。

## 開発コマンド

### フロントエンド（frontend/）

```bash
cd frontend
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動（http://localhost:5173）
npm run build        # TypeScriptビルド + Viteビルド
npm run lint         # ESLint実行
npm run preview      # ビルド成果物のプレビュー
```

### バックエンド（backend/）

```bash
cd backend
pip install -r requirements.txt    # 依存関係インストール
python run_local.py                # 開発サーバー起動（http://localhost:8080）

# DynamoDBテーブル作成（ローカル開発用）
python scripts/create_table.py
```

環境変数は `.env.example` を `.env` にコピーして設定。

### Terraform（terraform/）

```bash
cd terraform
terraform init                                    # 初期化
terraform plan -var-file=environments/dev.tfvars  # 差分確認
terraform apply -var-file=environments/dev.tfvars # デプロイ
```

## アーキテクチャ

### フロントエンド

- **技術**: React 19 + TypeScript + Vite + TailwindCSS v4
- **状態管理**: TanStack Query（React Query）
- **認証**: AWS Amplify + Cognito
- **ルーティング**: React Router v7
- **主要ディレクトリ**:
  - `src/features/` - 機能別モジュール（auth, goals, milestones）
  - `src/lib/api.ts` - APIクライアント（Bearer token認証対応）
  - `src/types/index.ts` - 共通型定義
  - `src/lib/amplify.ts` - Amplify設定

### バックエンド

- **技術**: FastAPI + Mangum（Lambda対応）
- **DB**: DynamoDB（Single Table Design）
- **認証**: Cognito JWT検証
- **主要ディレクトリ**:
  - `src/api/routes/` - APIエンドポイント（goals, milestones）
  - `src/models/` - Pydanticモデル
  - `src/repositories/` - DynamoDBアクセス（Repositoryパターン）
  - `src/core/config.py` - 環境設定（pydantic-settings）

### DynamoDB Single Table Design

```
PK: USER#{userId} or GOAL#{goalId}
SK: GOAL#{goalId} or MILESTONE#{milestoneId}
type: "goal" or "milestone"
```

**アクセスパターン**:
- ユーザーの全Goal取得: `PK = USER#{userId}, SK begins_with GOAL#`
- Goalに紐づくMilestone取得: `PK = GOAL#{goalId}, SK begins_with MILESTONE#`

### Terraform（モジュール構成）

- `modules/dynamodb/` - DynamoDBテーブル（Single Table Design）
- `modules/cognito/` - Cognito User Pool + Client
- `modules/api/` - Lambda + API Gateway（HTTP API + JWT認証）
- `modules/frontend/` - S3 + CloudFront（OAC使用）

環境別設定は `environments/dev.tfvars`、`environments/prod.tfvars` で管理。

## API設計

フロントエンドとバックエンドは`/api`プレフィックスで通信。

- `GET/POST /api/goals` - Goal一覧・作成
- `GET/PUT/DELETE /api/goals/{id}` - Goal詳細・更新・削除
- `GET/POST /api/goals/{goalId}/milestones` - Milestone一覧・作成
- `PUT/DELETE /api/milestones/{id}` - Milestone更新・削除

## 環境変数

### バックエンド（.env）
- `AWS_REGION` - AWSリージョン（デフォルト: ap-northeast-1）
- `DYNAMODB_TABLE_NAME` - テーブル名
- `DYNAMODB_ENDPOINT_URL` - ローカルDynamoDB用（http://localhost:8000）
- `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` - Cognito設定

### フロントエンド
- `VITE_API_URL` - バックエンドAPIのURL
