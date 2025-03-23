// アカウント（コレクション）のサンプルデータ
export const collections = [
  {
    label: '開発メモ',
    description: 'プログラミングと開発に関するメモ',
    iconName: 'code'
  },
  {
    label: '学習ノート',
    description: '学習内容のノート',
    iconName: 'book-text'
  },
  {
    label: 'アイデア集',
    description: 'プロジェクトのアイデア',
    iconName: 'pen-tool'
  }
]

export type Collection = (typeof collections)[number]

// ナビゲーション用のタグカテゴリ
export const tagCategories = [
  {
    title: 'プログラミング言語',
    tags: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Ruby']
  },
  {
    title: 'フレームワーク',
    tags: ['React', 'Next.js', 'Vue', 'Angular', 'Django', 'Rails']
  },
  {
    title: 'ツール',
    tags: ['Git', 'Docker', 'Kubernetes', 'CI/CD', 'AWS']
  },
  {
    title: 'その他',
    tags: ['デザイン', 'ドキュメント', 'アルゴリズム', 'パフォーマンス']
  }
]
