# 採用管理システム (ATS: Applicant Tracking System)

## 概要
このプロジェクトは採用管理プロセスを効率化するためのウェブアプリケーションです。求人情報の管理、候補者のトラッキング、面接スケジュール、評価管理などの機能を提供します。

## 技術スタック

### フロントエンド
- React (v18)
- TypeScript
- Ant Design (UIコンポーネント)
- Recharts (グラフ表示)
- Tailwind CSS (スタイリング)
- Vite (ビルドツール)

### バックエンド
- NestJS (Node.jsフレームワーク)
- TypeORM (ORMツール)
- SQLite (データベース)
- JWT (認証)
- Swagger (API仕様書)

### プロジェクト管理
- Turborepo (モノレポ管理)

## プロジェクト構造

```
ats-prot/
├── packages/
│   ├── backend/          # バックエンドアプリケーション (NestJS)
│   │   ├── src/
│   │   │   ├── auth/     # 認証関連
│   │   │   ├── candidates/ # 候補者管理
│   │   │   ├── job-postings/ # 求人情報管理
│   │   │   ├── interviews/ # 面接管理
│   │   │   ├── evaluations/ # 評価管理
│   │   │   ├── app.module.ts # メインモジュール
│   │   │   ├── main.ts    # エントリーポイント
│   │   │   └── seed.ts    # シードデータ
│   │   └── package.json
│   └── frontend/         # フロントエンドアプリケーション (React)
│       ├── src/
│       │   ├── components/ # UIコンポーネント
│       │   ├── lib/      # ユーティリティ関数、APIクライアント
│       │   ├── pages/    # ページコンポーネント
│       │   ├── App.tsx   # メインコンポーネント
│       │   ├── main.tsx  # エントリーポイント
│       │   └── types.ts  # 型定義
│       └── package.json
├── turbo.json           # Turborepo設定
└── package.json         # ルートパッケージ
```

## 主な機能

### 求人管理
- 求人情報の作成、編集、削除
- 求人のステータス管理（公開、非公開、下書き）
- 求人要件、スキル、給与範囲の設定

### 候補者管理
- 候補者情報の登録と管理
- ステータス追跡（新規、選考中、面接済み、オファー、不採用）
- スキル、経験、希望給与などの記録

### 面接管理
- 面接のスケジュール設定
- 面接タイプ（初回、技術、文化適合性、最終）の分類
- 面接のステータス管理（予定、完了、キャンセル）

### 評価管理
- 候補者の評価記録
- 複数の評価基準（技術スキル、コミュニケーション、問題解決能力など）
- コメント機能

### メールテンプレート
- 面接招待、オファー、不採用通知などのテンプレート
- 変数を使用したカスタマイズ

## セットアップと実行方法

### 前提条件
- Node.js (v16以上)
- npm (v7以上)

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yuta-nakanishi/ats-prot.git
cd ats-prot

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
# フロントエンドとバックエンドを同時に起動
npm run dev

# バックエンドのみ起動
npm run dev --filter=@recruitment/backend

# フロントエンドのみ起動
npm run dev --filter=@recruitment/frontend
```

### シードデータの投入

```bash
# バックエンドディレクトリに移動
cd packages/backend

# シードスクリプトの実行
npm run seed
```

### ビルド

```bash
# プロジェクト全体をビルド
npm run build
```

## API仕様

バックエンドサーバー起動後、以下のURLでSwagger UIによるAPI仕様書にアクセスできます：
http://localhost:3000/api

## ライセンス

MIT

## 連絡先

質問や問題がある場合は、GitHub Issuesを通じてご連絡ください。

## Stack Blitz

このプロジェクトはStack Blitzでも編集できます。

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/yuta-nakanishi/ats-prot)

## 権限管理システム

### 実装済み機能

- 権限（Permissions）の一覧表示と管理
- カスタムロール（CustomRoles）の作成・編集・削除
- ユーザーへのカスタムロール割り当て
- リソースごとの権限管理（Resource Permissions）

### 権限管理の使い方

1. **システム権限**
   - システムに定義されている基本的な権限（作成、読取、更新、削除、管理）
   - これらの権限はカスタムロールに組み込んで使用します

2. **カスタムロール**
   - 会社独自のロール（例：「採用担当者」「面接官」「管理者」など）を作成
   - 各ロールに必要な権限を付与
   - ユーザーに対して複数のカスタムロールを割り当て可能

3. **ユーザー管理**
   - ユーザー一覧からユーザーを選択
   - カスタムロールを割り当て/削除

### 次のステップ（実装予定）

1. **フロントエンドでの権限チェック**
   - 各画面やコンポーネントでのアクセス制御
   - 権限に基づくUI要素の表示/非表示

2. **リソース単位のアクセス制御**
   - 特定の求人や候補者などに対する個別の権限設定
   - チームやプロジェクト単位でのアクセス制御

3. **監査ログ**
   - 権限変更の履歴記録
   - ユーザーアクションの記録とレポート