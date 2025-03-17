// 拡張子を.tsxに変更して、JSXをサポート
import { Code, BookText, PenTool } from 'lucide-react'

// これはメールデータをナレッジデータに変換したものです
export const knowledges = [
  {
    id: '6c84fb90-12c4-11e1-840d-7b25c5ee775a',
    name: 'Reactの基本概念',
    subject: 'コンポーネント、JSX、プロップス、ステート',
    text: 'Reactは、Facebookによって開発されたオープンソースのJavaScriptライブラリです。UIを構築するためのコンポーネントベースのアプローチを提供します。\n\n主要な概念：\n\n1. **コンポーネント**: UIの独立した再利用可能な部品\n2. **JSX**: JavaScriptの拡張構文で、HTMLのようなマークアップをJavaScript内に記述できる\n3. **props**: 親コンポーネントから子コンポーネントにデータを渡す方法\n4. **state**: コンポーネント内で管理されるデータ\n5. **ライフサイクルメソッド**: コンポーネントの異なる段階で実行されるメソッド\n\nサンプルコード：\n```jsx\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n```',
    date: '2023-10-22T09:00:00',
    read: true,
    labels: ['React', 'フロントエンド', 'JavaScript']
  },
  {
    id: '110e8400-e29b-11d4-a716-446655440000',
    name: 'Next.jsの特徴と利点',
    subject: 'サーバーサイドレンダリング、静的サイト生成、API routes',
    text: 'Next.jsは、Reactフレームワークで、サーバーサイドレンダリング、静的サイト生成、API routes、ファイルベースのルーティングなどの機能を提供します。\n\n主な特徴：\n\n- **ファイルベースのルーティング**: pages/ディレクトリ内のファイル構造に基づいたルーティング\n- **サーバーサイドレンダリング(SSR)**: 各リクエストでページをレンダリング\n- **静的サイト生成(SSG)**: ビルド時にページを生成\n- **API Routes**: サーバーレス関数としてAPIエンドポイントを作成\n- **自動コード分割**: パフォーマンス最適化のためページごとにバンドルを分割\n\n利点：\n- 高速なページロード\n- SEOフレンドリー\n- 開発者体験の向上\n- スケーラビリティ',
    date: '2023-10-22T10:30:00',
    read: true,
    labels: ['Next.js', 'React', 'フレームワーク']
  },
  {
    id: '3e7c3f6d-bdf5-46ae-8d90-171300f27ae2',
    name: 'Tailwind CSSの使い方',
    subject: 'ユーティリティファーストのCSSフレームワーク',
    text: 'Tailwind CSSは、ユーティリティファーストのCSSフレームワークです。カスタムデザインを素早く構築するために設計された低レベルのユーティリティクラスを提供します。\n\n基本的な使い方：\n\n1. プロジェクトにTailwindをインストール\n   ```bash\n   npm install tailwindcss\n   ```\n\n2. tailwind.config.jsを作成\n   ```bash\n   npx tailwindcss init\n   ```\n\n3. CSSファイルにTailwindディレクティブを追加\n   ```css\n   @tailwind base;\n   @tailwind components;\n   @tailwind utilities;\n   ```\n\n4. HTMLでユーティリティクラスを使用\n   ```html\n   <div class="p-4 m-2 bg-blue-500 text-white rounded shadow">\n     Tailwindを使ったボックス\n   </div>\n   ```\n\nTailwindの利点：\n- カスタムデザインを簡単に実装\n- クラス名を考える時間の削減\n- 一貫性のあるデザインシステム\n- 小さなファイルサイズ（未使用のCSSを削除）',
    date: '2023-04-10T11:45:00',
    read: true,
    labels: ['CSS', 'Tailwind', 'デザイン']
  },
  {
    id: '61c35085-72d7-42b4-8d62-738f700d4b92',
    name: 'TypeScriptの型システム',
    subject: '静的型付けによるコード品質の向上',
    text: 'TypeScriptは、JavaScriptに静的型付けを追加した言語です。型システムによりコードの品質と保守性が向上します。\n\n基本的な型：\n\n- **プリミティブ型**: string, number, boolean, null, undefined, symbol, bigint\n- **オブジェクト型**: interface, type, class\n- **配列型**: Array<T> または T[]\n- **タプル型**: [string, number]\n- **ユニオン型**: string | number\n- **インターセクション型**: Type1 & Type2\n- **ジェネリック型**: Array<T>\n\n例：\n```typescript\n// インターフェース定義\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // オプショナルプロパティ\n}\n\n// 関数の型付け\nfunction getUserName(user: User): string {\n  return user.name;\n}\n\n// ジェネリクスの使用\nfunction getFirstItem<T>(array: T[]): T | undefined {\n  return array[0];\n}\n```',
    date: '2023-03-25T13:15:00',
    read: false,
    labels: ['TypeScript', 'JavaScript', 'プログラミング']
  },
  {
    id: '8f7b5db9-d935-4e42-8e05-1f1d0a3dfb97',
    name: 'GitHubの効率的なワークフロー',
    subject: 'ブランチ戦略、プルリクエスト、CI/CD',
    text: 'GitHubを使った効率的な開発ワークフローについてのメモです。\n\n### ブランチ戦略\n\n- **main/master**: 本番環境のコード\n- **develop**: 開発環境のコード\n- **feature/XXX**: 新機能の開発\n- **bugfix/XXX**: バグ修正\n- **release/XXX**: リリース準備\n\n### プルリクエストのベストプラクティス\n\n1. 小さな変更に留める\n2. 明確なタイトルと説明\n3. レビュアーを指定\n4. ラベルを追加\n5. スクリーンショットや動画を添付（UI変更の場合）\n\n### CI/CDの活用\n\n- GitHub Actionsを使用した自動テスト\n- 自動デプロイのセットアップ\n- コードカバレッジの追跡\n\n### コードレビューのポイント\n\n- 実装だけでなく設計も確認\n- コーディング規約への準拠\n- セキュリティの問題がないか\n- エッジケースの考慮\n\n### その他のTips\n\n- Issuesを活用したタスク管理\n- Projects機能でのカンバン方式\n- マイルストーンの設定\n- ドキュメントの更新を忘れない',
    date: '2023-03-10T15:00:00',
    read: false,
    labels: ['GitHub', 'Git', 'ワークフロー']
  },
  {
    id: '1f0f2c02-e299-40de-9b1d-86ef9e42126b',
    name: '効果的なREADMEの書き方',
    subject: 'プロジェクトの顔となるドキュメント',
    text: 'プロジェクトのREADMEは、そのプロジェクトの顔です。効果的なREADMEを書くための要素：\n\n### 必須セクション\n\n1. **プロジェクト名とロゴ**\n2. **簡潔な説明**: 1-2文でプロジェクトの目的を説明\n3. **インストール方法**: ステップバイステップの手順\n4. **使用方法**: 基本的な使い方の例\n5. **機能一覧**: 主な機能をリストアップ\n\n### 追加セクション\n\n6. **デモ**: スクリーンショットやGIF、デモサイトへのリンク\n7. **依存関係**: 必要なライブラリやツール\n8. **設定**: 設定オプションの説明\n9. **API**: 公開APIの詳細（該当する場合）\n10. **貢献方法**: 貢献のためのガイドライン\n11. **ライセンス**: 使用ライセンスの情報\n12. **謝辞**: 参考にしたプロジェクトや貢献者への感謝\n\n### フォーマットのヒント\n\n- Markdown形式を使用\n- 見出しを効果的に使う\n- コードブロックを適切に書式化\n- バッジを追加（ビルド状態、バージョン、ライセンスなど）\n- 目次を追加（長いREADMEの場合）\n\n良いREADMEは、新しいユーザーがプロジェクトを理解し、使い始めるための障壁を下げます。',
    date: '2023-02-15T16:30:00',
    read: true,
    labels: ['ドキュメント', 'GitHub', 'マークダウン']
  },
  {
    id: '17c0a96d-4415-42b1-8b4f-764efab57f66',
    name: 'Dockerの基本コマンド',
    subject: 'コンテナ操作のチートシート',
    text: 'Dockerの基本的なコマンドのチートシート：\n\n### イメージ関連\n\n```bash\n# イメージのビルド\ndocker build -t myimage:latest .\n\n# イメージ一覧の表示\ndocker images\n\n# イメージの削除\ndocker rmi myimage:latest\n\n# 未使用イメージの削除\ndocker image prune\n```\n\n### コンテナ関連\n\n```bash\n# コンテナの起動\ndocker run -d -p 8080:80 --name mycontainer myimage:latest\n\n# コンテナ一覧の表示\ndocker ps  # 実行中のみ\ndocker ps -a  # すべて\n\n# コンテナの停止\ndocker stop mycontainer\n\n# コンテナの開始\ndocker start mycontainer\n\n# コンテナの再起動\ndocker restart mycontainer\n\n# コンテナの削除\ndocker rm mycontainer\n\n# コンテナ内でコマンド実行\ndocker exec -it mycontainer bash\n\n# コンテナのログ表示\ndocker logs mycontainer\n```\n\n### ボリューム関連\n\n```bash\n# ボリュームの作成\ndocker volume create myvolume\n\n# ボリューム一覧の表示\ndocker volume ls\n\n# ボリュームの削除\ndocker volume rm myvolume\n```\n\n### ネットワーク関連\n\n```bash\n# ネットワークの作成\ndocker network create mynetwork\n\n# ネットワーク一覧の表示\ndocker network ls\n\n# ネットワークの削除\ndocker network rm mynetwork\n```\n\n### Docker Compose\n\n```bash\n# コンテナの起動\ndocker-compose up -d\n\n# コンテナの停止\ndocker-compose down\n\n# コンテナのビルドと起動\ndocker-compose up --build -d\n```',
    date: '2023-01-28T17:45:00',
    read: false,
    labels: ['Docker', 'インフラ', 'コマンド']
  },
  {
    id: '2f0130cb-39fc-44c4-bb3c-0a4337edaaab',
    name: 'Reduxとは何か',
    subject: '予測可能な状態コンテナ',
    text: "ReduxはJavaScriptアプリケーションのための予測可能な状態コンテナです。Reactと組み合わせて使われることが多いですが、他のUIライブラリやフレームワークでも使用できます。\n\n### 主要な概念\n\n1. **Store**: アプリケーションの状態を保持する単一のオブジェクト\n2. **Action**: 状態の変更を記述するプレーンなオブジェクト\n3. **Reducer**: 現在の状態とアクションを受け取り、新しい状態を返す純粋関数\n4. **Dispatch**: アクションをStoreに送信するメソッド\n5. **Selector**: Storeから特定のデータを取得する関数\n\n### Reduxを使うべき時\n\n- アプリケーション全体で多くの状態を共有する必要がある\n- 状態の更新ロジックが複雑\n- コードベースが中〜大規模で、多くの人が働いている\n- 状態の変更を追跡する必要がある\n\n### 基本的な使い方\n\n```javascript\n// アクションタイプの定義\nconst ADD_TODO = 'ADD_TODO';\n\n// アクションクリエイター\nfunction addTodo(text) {\n  return {\n    type: ADD_TODO,\n    text\n  };\n}\n\n// Reducer\nfunction todosReducer(state = [], action) {\n  switch (action.type) {\n    case ADD_TODO:\n      return [\n        ...state,\n        {\n          text: action.text,\n          completed: false\n        }\n      ];\n    default:\n      return state;\n  }\n}\n\n// Storeの作成\nimport { createStore } from 'redux';\nconst store = createStore(todosReducer);\n\n// アクションのディスパッチ\nstore.dispatch(addTodo('Learn Redux'));\n```\n\n### 現代のRedux\n\n最近では、Redux Toolkitが推奨されています：\n\n```javascript\nimport { createSlice, configureStore } from '@reduxjs/toolkit';\n\nconst todosSlice = createSlice({\n  name: 'todos',\n  initialState: [],\n  reducers: {\n    addTodo: (state, action) => {\n      state.push({ text: action.payload, completed: false });\n    }\n  }\n});\n\nconst store = configureStore({\n  reducer: {\n    todos: todosSlice.reducer\n  }\n});\n```",
    date: '2022-12-20T18:30:00',
    read: true,
    labels: ['Redux', 'React', '状態管理']
  }
]

export type Knowledge = (typeof knowledges)[number]

// アイコンを関数ではなく、文字列IDとして定義する
export const accounts = [
  {
    label: '開発メモ',
    email: 'dev@example.com',
    // Lucideのコンポーネントを直接使うのではなく、名前だけを渡す
    iconName: 'code'
  },
  {
    label: '学習ノート',
    email: 'study@example.com',
    iconName: 'book-text'
  },
  {
    label: 'アイデア',
    email: 'idea@example.com',
    iconName: 'pen-tool'
  }
]

export type Account = (typeof accounts)[number]

export const tags = [
  {
    name: 'React',
    count: 3
  },
  {
    name: 'JavaScript',
    count: 2
  },
  {
    name: 'TypeScript',
    count: 1
  },
  {
    name: 'CSS',
    count: 1
  },
  {
    name: 'Tailwind',
    count: 1
  },
  {
    name: 'Next.js',
    count: 1
  },
  {
    name: 'GitHub',
    count: 2
  },
  {
    name: 'Git',
    count: 1
  },
  {
    name: 'Docker',
    count: 1
  },
  {
    name: 'Redux',
    count: 1
  }
]

export type Tag = (typeof tags)[number]
