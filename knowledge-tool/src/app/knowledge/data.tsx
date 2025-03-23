// アイコンを関数ではなく、文字列IDとして定義する
export const accounts = [
  {
    label: '開発メモ',
    email: 'dev@example.com',
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
