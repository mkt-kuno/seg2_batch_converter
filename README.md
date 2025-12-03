# SEG2 → CSV Converter (Web Version)

Bun + TypeScript + React + Tailwind CSS で構築された SEG2 ファイル変換ツール。

## 技術スタック

- **Runtime**: Bun
- **Language**: TypeScript
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Bundler**: Vite

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview
```

## 機能

- 📁 ドラッグ＆ドロップまたはファイル選択でSEG2ファイルを読み込み
- 📊 ファイル情報（チャンネル数、周波数、サンプル数）を自動解析
- 📝 オシロスコープ形式のヘッダー付きCSV出力
- 💾 Chrome/Edge では File System Access API で出力先フォルダを選択可能

## 対応フォーマット

**入力**: `.sg2`, `.dat`, `.seg2`
**出力**: `.csv`（メタデータヘッダー付き）

## ファイル構成

```
seg2-converter-web/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx           # エントリーポイント
    ├── App.tsx            # メインコンポーネント
    ├── index.css          # グローバルスタイル
    ├── components/
    │   ├── FileDropZone.tsx
    │   ├── FileList.tsx
    │   ├── ConvertButton.tsx
    │   └── ResultsPanel.tsx
    └── lib/
        ├── seg2-parser.ts   # SEG2パーサー
        └── csv-exporter.ts  # CSVエクスポーター
```

## デスクトップアプリ化

### Tauri（推奨）

```bash
# Tauriの追加
bun add -D @tauri-apps/cli @tauri-apps/api

# 初期化
bunx tauri init

# ビルド
bunx tauri build
```

### Electron

```bash
bun add -D electron electron-builder
```

## ブラウザ対応

| ブラウザ | ファイル読み込み | フォルダ選択保存 |
|---------|-----------------|-----------------|
| Chrome/Edge | ✅ | ✅ (File System Access API) |
| Firefox | ✅ | ❌ (個別ダウンロード) |
| Safari | ✅ | ❌ (個別ダウンロード) |

## ライセンス

MIT
