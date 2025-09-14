# CLAUDE.md

このファイルは、Claude がこのリポジトリのコードを扱う際のガイダンスを提供します。

日本語で対応してください。

エラーなどが原因で、当初の方針で実装できない場合は、勝手に別の方針で実装するのではなく、ユーザーに別の方針で問題ないか確認するようにして。

原稿の文章を短文で区切ったものの一つ一つを、ビートと呼ぶ。

## プロジェクト概要

**Podly**は**eject 済み**の Expo React Native アプリケーションです。TikTok スタイルのソーシャルメディアアプリで、動画とポッドキャストの両方に対応しています。eject 済みなので npx expo start は行っていはいけません。

## 技術スタック

- **Expo SDK**: 53.0.4 (eject 済み)
- **React Native**: 0.79.1 (New Architecture enabled)
- **React**: 19.0.0
- **TypeScript**: 5.8.3 (strict mode)
- **Expo Router**: v5 (File-based routing)
- **State Management**: Zustand 5.0.2
- **Styling**: NativeWind 4.1.23 (Tailwind CSS for React Native)
- **Audio Player**: React Native Track Player 4.1.1
- **Backend as a Service (BaaS)**: Supabase 2.50.0
- **Native Features**: Expo Image, Video, Location, Image Picker 等

## フォルダ構成

```
/
├── app/                    # メインアプリケーション（Expo Router）
│   ├── (tabs)/            # タブベースナビゲーション
│   │   ├── index.tsx      # ホーム画面
│   │   ├── discover.tsx   # 発見画面
│   │   ├── create.tsx     # 作成画面
│   │   ├── profile.tsx    # プロフィール画面
│   │   └── _layout.tsx    # タブレイアウト
│   ├── _layout.tsx        # ルートレイアウト
│   ├── modal.tsx          # モーダル画面
│   ├── create-audio.tsx   # 音声作成画面
│   ├── create-publish.tsx # 公開画面
│   ├── edit-profile/      # プロフィール編集
│   └── +not-found.tsx     # 404画面
│
├── components/            # 再利用可能なコンポーネント
│   ├── AudioPlayer.tsx    # 音声プレイヤー
│   ├── AuthModal.tsx      # 認証モーダル
│   ├── CommentModal.tsx   # コメントモーダル
│   ├── PodcastActions.tsx # ポッドキャストアクション
│   ├── PodcastInfo.tsx    # ポッドキャスト情報
│   └── ProfileMenuModal.tsx # プロフィールメニュー
│
├── store/                 # Zustand状態管理
│   ├── authStore.ts       # 認証状態
│   ├── podcastStore.ts    # ポッドキャスト状態
│   └── trackPlayerStore.ts # 音声プレイヤー状態
│
├── services/              # API・外部サービス
│   ├── supabase.ts        # Supabaseクライアント
│   ├── scriptGenerator.ts # 原稿生成API
│   ├── audioGenerator.ts  # 音声生成API
│   ├── AudioPlayerService.ts # 音声プレイヤー設定
│   ├── TrackPlayerService.ts # Track Player設定
│   └── database.ts        # データベース操作
│
├── hooks/                 # カスタムフック
│   ├── useAuth.ts         # 認証フック
│   ├── useColorScheme.ts  # カラースキーム
│   └── useThemeColor.ts   # テーマカラー
│
├── types/                 # TypeScript型定義
│   └── podcast.ts         # ポッドキャスト型
│
├── utils/                 # ユーティリティ関数
│   ├── formatNumber.ts    # 数値フォーマット
│   ├── screenUtils.ts     # 画面ユーティリティ
│   └── uploadImage.ts     # 画像アップロード
│
├── constants/             # 定数定義
│   └── Colors.ts          # カラー定義
│
├── assets/                # 静的アセット
├── mocks/                 # モックデータ
├── docs/                  # ドキュメント
│
├── ios/                   # iOS ネイティブコード（eject済み）
├── android/               # Android ネイティブコード（eject済み）
│
├── package.json
├── app.json              # Expo設定
├── tsconfig.json         # TypeScript設定
├── eslint.config.js      # ESLint設定
└── expo-env.d.ts         # Expo型定義
```

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npx expo start

# プラットフォーム別実行（eject済み）
npm run android    # expo run:android
npm run ios        # expo run:ios

# プロダクションビルド（eject済み）
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

## 開発ルール

### 1. ファイル作成・編集時の注意点

- **eject 済みプロジェクト**のため、ネイティブフォルダ（ios/android）の変更は慎重に行う
- Expo Router v5 のファイルベースルーティングを使用
- TypeScript を必須とし、型安全性を重視（strict mode）
- NativeWind クラスを使用してスタイリング

### 2. コンポーネント設計

- 機能別にコンポーネントを分割（Video/Audio/Profile 等）
- 再利用可能なコンポーネントは`components/`フォルダに配置
- プロップスとステートの型定義を必須とする
- React.memo、useMemo、useCallback を適切に使用

### 3. 状態管理

- グローバル状態は Zustand を使用
- ローカル状態は React の useState を使用
- 状態の型定義を必須とする
- AsyncStorage を使用して永続化

- I/O（Supabase、外部 API、AsyncStorage、ファイル等）は `services/` に集約する
- ストアは状態とフロー制御に専念し、I/O は直接呼ばない（必ずサービス経由）
- ストアの公開関数は「サービス呼び出し → 結果を状態へ反映」の流れに統一する
- 例外が必要な場合は理由を明記し、後で是正する

### 4. ナビゲーション

- Expo Router v5 のファイルベースルーティングを使用
- タブナビゲーションは`app/(tabs)/`で管理
- モーダルは`app/modal.tsx`で管理
- 型付きルートを使用

### 5. スタイリング

- NativeWind（Tailwind CSS）を使用
- インラインスタイルは最小限に留める
- レスポンシブデザインを考慮
- **4 の倍数ルール**を厳守（後述）

### 6. メディア処理

- 動画: expo-video を使用
- 音声: react-native-track-player を使用（バックグラウンド再生対応）
- 画像: expo-image を使用（最適化機能付き）

### 7. パフォーマンス

- 大きなリストは FlatList を使用
- 画像の最適化を考慮
- メモ化（React.memo, useMemo, useCallback）を適切に使用
- リアルタイム機能は Supabase Realtime を使用

### 8. 型定義

- 全ての props と state に型定義を追加
- API レスポンスの型定義を作成
- 共通で使用する型は`types/`フォルダに定義
- strict mode で TypeScript を使用

### 9. バックエンド・API 設計

- **BaaS**: Supabase を使用してバックエンド機能を提供
- **データベースアクセス**: Supabase クライアントを使用して直接 DB にアクセス
- **認証**: Supabase Auth を使用してユーザー認証を管理
- **リアルタイム機能**: Supabase Realtime を使用してリアルタイムデータ同期
- **ファイルストレージ**: Supabase Storage を使用して動画・音声・画像ファイルを管理

- **API 設計**:
  - REST API の代わりに Supabase クライアントのメソッドを使用
  - データベース操作は`supabase.from().select()`, `supabase.from().insert()`等を使用
  - 認証が必要な操作では、適切な Row Level Security (RLS)ポリシーを設定
- **例外: 外部 API 使用**:
  - **原稿生成**: Supabase ではなくアプリケーションサーバー側で用意された API を使用
  - **音声生成**: Supabase ではなくアプリケーションサーバー側で用意された API を使用
  - **実装場所**: 外部 API 連携は`services/`フォルダ内に専用のサービスファイルを作成
  - **エラーハンドリング**: アプリケーションサーバー API の接続エラーや制限に対する適切なエラーハンドリングを実装
  - **設定管理**: API エンドポイントや API キーは環境変数として管理

### 10. データベースマイグレーション・責務分離

- **重要**: データベースマイグレーションファイル（\*.sql）を作ってはいけない
- **禁止事項**: SQL マイグレーションファイルやスクリプトフォルダを作成してはいけない
- **ID 生成**: ヘルパー関数を使用（`generateId()`, `generateUUIDLikeId()`, `generateSemanticId()`）
- **例外**: `profiles.id`は UUID（auth.users とリンク）

### 11. ログ・エラー出力ルール

- **絵文字禁止**: console.log、console.error、throw new Error 等の出力メッセージに絵文字を使用しない
- **プレーンテキスト**: ログやエラーメッセージは英数字、記号、日本語のみを使用
- **理由**:
  - ターミナルやログファイルでの表示崩れを防ぐ
  - CI/CD パイプラインでのログ解析を容易にする
  - 開発チーム間での一貫性を保つ
- **対象範囲**:
  - console.log, console.error, console.warn, console.info
  - throw new Error()のエラーメッセージ
  - デバッグ用の出力
  - アラート・トースト等のシステムメッセージ

### 12. useEffect の使用方針

- **責務を限定する**: useEffect は「1 つの目的」に限定して使用すること（例: データフェッチ、イベントリスナー管理など）。
- **依存配列を明示する**: 必ず依存配列を適切に記述し、無限ループや不要な再実行を避ける。
- **不要な useEffect を避ける**:
  - props や state から派生する値は useMemo で計算する
  - コールバック関数の安定化は useCallback を使う
  - 単純なロジックはコンポーネント外またはカスタムフックに分離する
- **カスタムフック化を推奨**: 複数の useEffect が増える場合は、関連する処理をカスタムフックにまとめて可読性を高める。
- **外部状態管理とのバランス**: グローバルな副作用やデータ同期には Zustand や React Query を検討し、useEffect に集約しすぎない。
- **パフォーマンスに配慮**: リストレンダリングや頻繁に変わる状態に依存する副作用は極力避ける。

## UI デザインテーマ

### テーマ: 「プロフェッショナル・ミニマリズム」

このアプリの UI は**ダークモード特化の没入型メディア体験**をコンセプトとしています。

### カラーパレット

- **Background**: #121620 (深いダークブルー背景)
- **Card**: #1E2430 (マットなチャコール)
- **Primary**: #4F7CFF (プロフェッショナルブルー)
- **Secondary**: #6AD5E8 (ソフトティールアクセント)
- **Highlight**: #F2994A (オレンジハイライト)
- **Text**: #FFFFFF (メインテキスト)
- **Subtext**: #A0A7B5 (サブテキスト)

### デザイン原則

- **フルスクリーン没入**: TikTok 風の画面いっぱいを使った動画・音声体験
- **ミニマル情報設計**: 必要な情報のみを適切なタイミングで表示
- **ジェスチャーベース**: スワイプ中心の直感的操作
- **触覚フィードバック**: Haptics による操作感の向上
- **統一されたボーダー半径**: 8px でソフトな印象
- **カード型レイアウト**: 情報のグルーピング
- **グラデーション**: CTA ボタンでの効果的活用

### コンポーネント統一ルール

- アイコンは Ionicons で統一
- 状態表現の明確性（アクティブ/非アクティブ）
- オーバーレイコントロールで操作性を保持
- リアルタイム反応（いいね、再生状態など）
- プログレスインジケーターで進行状況を可視化

### レイアウト統一ルール - 4 の倍数ルール

- **必須**: padding、margin、width、height、border-radius 等のすべての数値は 4 の倍数で統一する
  - 例: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 120...
  - 一貫性のあるリズムとグリッドベースのデザインを実現
  - デザイナーとエンジニア間でのコミュニケーションを簡素化
  - レスポンシブデザインでの計算が容易になる
- **例外**: フォントサイズや line-height は可読性を優先し、4 の倍数でなくても可
- **アイコンサイズ**: 16, 20, 24, 28, 32, 40, 48 等を基本とする
- **間隔の基準値**:
  - 最小間隔: 4px
  - 通常間隔: 8px, 12px, 16px
  - 大きな間隔: 20px, 24px, 32px
  - セクション間隔: 40px, 48px, 64px
- **適用対象**: StyleSheet のすべての数値プロパティ（position、size、spacing 関連）

## データベーススキーマ（Supabase）

### コアテーブル

- **profiles**: ユーザー情報（UUID id、auth.users とリンク）
- **podcasts**: コンテンツとメタデータ、原稿、音声 URL（VARCHAR(255) ids）
- **genres**: コンテンツカテゴリー（VARCHAR(255) ids）
- **likes/saves/follows**: ソーシャルインタラクション（VARCHAR(255) ids）
- **play_history**: 進行状況追跡（VARCHAR(255) ids）
- **bgm**: バックグラウンドミュージック（VARCHAR(255) ids）

### 認証

- Supabase Auth で email/password 認証
- Row Level Security (RLS)ポリシーを適用
- AsyncStorage でセッション永続化

## 重要な注意事項

- このプロジェクトは**eject 済み**のため、Expo CLI と React Native CLI の両方の機能が使用可能
- ネイティブコードの変更時は、適切なビルドプロセスを実行
- 新しいネイティブ依存関係の追加時は、iOS/Android の両方でのビルドを確認
- `docs/db_schema.md`でスキーマ構造を確認
- 外部 API 制限とエラーハンドリングを適切に実装

## 主要機能

- **TikTok スタイルフィード**: 垂直スクロールとフルスクリーン没入
- **音声再生**: バックグラウンド再生と進行状況追跡
- **コンテンツ作成**: 原稿/音声生成付きマルチステップフロー
- **ソーシャル機能**: フォロー、いいね、保存、コメント
- **リアルタイム更新**: Supabase リアルタイムサブスクリプション

## デザインルール（HIG 準拠）

### 基本原則（ファースト・プリンシプル）

- ユーザのタスク最優先: UI は目的達成を邪魔しない。余分な装飾や独自ジェスチャの強要は避ける。（Apple Developer）
- 一貫性と学習コストの最小化: 標準コンポーネントやパターンを用い、iOS らしい見え方・挙動に合わせる。（Apple Developer）
- 適応性（Adaptivity）: 画面サイズ、ダークモード、文字サイズ、言語（RTL 含む）に自動的に馴染む設計を優先する。（Apple Developer）

### ナビゲーション

- タブバーはアプリの最上位の並列セクションを横断するために使用（目安は 3〜5 個）。アクション置き場にしない。バッジは控えめに通知。（Apple Developer）
- ツールバーは現在の画面コンテキストに関わる操作（作成・共有など）を配置。タブバーと役割を混同しない。（Apple Developer）
- 階層移動はナビゲーションバーのプッシュ／戻るで予測可能に。検索は標準の検索バーやインライン検索を使用。（Apple Developer）

### レイアウトとスペーシング

- Safe Area・レイアウトガイドを厳守し、ノッチやホームインジケータを侵さない。Auto Layout／Size Class で可変対応。（toptal.com）
- スクロールとコンテンツ優先の配置とし、余白・行間は読みやすさを最優先とする。
- コンテナ（リスト、グリッド、カード）で情報密度と可読性のバランスを取る。

### タイポグラフィ

- SF Pro（システムフォント）と Text Styles を使用し、Dynamic Type でユーザ設定の文字サイズに追従。見出し／本文／キャプションの意味的スタイルを使う。（Apple Developer）
- 固定ピクセル指定は最小限にし、自動スケーリングと適切な行間で読みやすさを担保。（Apple Developer）

### カラーとコントラスト

- システムカラー（semantic colors）を優先し、Light／Dark・アクセシビリティ設定での変化に追従する。
- 文字やアイコンは背景と十分なコントラストを確保。ブランド色はアクセントに限定する（HIG では WCAG・APCA を参照）。（Apple Developer）

### アイコン／シンボル／画像

- SF Symbols を優先し、テキストの重み・スケールと自動整合する。必要に応じてカスタムシンボルも SF のデザイン言語に合わせて作成。（Apple Developer）
- アプリアイコンはシンプルで記憶しやすく、焦点を一つに。写真や UI 断片の流用、透過は避ける。各サイズで明瞭に縮小。（Apple Developer）

### コントロールとタッチ領域

- 主要タップ領域は 44×44 pt 以上。押し間違いを避け、状態（有効／無効／選択）を視覚的に区別する。
- リストセルのスワイプ、コンテキストメニューなど、プラットフォーム標準の相互作用を活用。（Apple Developer）

### ジェスチャ＆スクロール

- 標準ジェスチャ（タップ／ドラッグ／スワイプ／ピンチ）を尊重し、システムジェスチャと衝突させない。
- スクロール時のバーの表示・収縮は可読性とコンテキスト保持を両立し、ユーザが「戻れる感覚」を失わせない。（Apple Developer）

### フィードバック（ハプティクス、サウンド、アニメーション）

- 意味のあるタイミングで短く控えめに。強すぎるハプティクスや過剰な動きは疲労や酔いの原因となる。
- Core Haptics／HIG「Playing haptics」の推奨パターンを参考に、視覚・触覚・聴覚の多重フィードバックで確実に伝える。（Apple Developer）

### 入力とフォーム

- 入力目的に応じて適切なキーボード種別とコンテンツタイプを選択（メール、数値、パスワード等）。
- プレースホルダ頼みにせず、ラベルは常時参照可能に。エラーは具体的に即時で示す。（Apple Developer）

### 共有・コラボ・システム統合

- 共有は標準の共有シート（Activity View）を使用し、コンテキストに合うアクティビティのみを提示する。
