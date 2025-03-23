import React, { useMemo } from 'react'

// 結果をキャッシュするためのマップ
const cache = new Map<string, React.ReactNode>()
const MAX_CACHE_SIZE = 100 // キャッシュの最大サイズ

/**
 * テキスト内の検索ワードをハイライトする関数（最適化版）
 * @param text ハイライト対象のテキスト
 * @param searchTerm 検索ワード
 * @param className ハイライト部分に適用するCSSクラス名
 * @returns ハイライト済みのJSX要素
 */
export function highlightText(
  text: string,
  searchTerm: string,
  className: string = 'bg-yellow-200 dark:bg-yellow-800'
): React.ReactNode {
  // 早期リターン条件の追加
  if (!searchTerm || !text) {
    return text
  }

  const searchTermTrimmed = searchTerm.trim()
  if (searchTermTrimmed === '') {
    return text
  }

  // キャッシュキーの生成
  const cacheKey = `${text.substring(0, 50)}:${searchTermTrimmed}:${className}`

  // キャッシュにある場合はキャッシュから返す
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  // テキストが長すぎる場合は処理を最適化
  const MAX_TEXT_LENGTH = 10000
  if (text.length > MAX_TEXT_LENGTH) {
    // 長いテキストの場合、検索語を含む部分のみを処理
    return processLongText(text, searchTermTrimmed, className)
  }

  // 正規表現を使用して一度に全ての一致を見つける
  const searchTermLower = searchTermTrimmed.toLowerCase()
  const textLower = text.toLowerCase()

  // 検索語がテキスト内に存在しない場合は早期リターン
  if (!textLower.includes(searchTermLower)) {
    return text
  }

  // 正規表現を使用して一致を見つける（大文字小文字を区別しない）
  const regex = new RegExp(escapeRegExp(searchTermTrimmed), 'gi')
  const parts: React.ReactNode[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const index = match.index

    // 検索ワードの前のテキストを追加
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index))
    }

    // 検索ワードをハイライト付きで追加
    const highlightedText = match[0]
    parts.push(
      <span key={`highlight-${index}`} className={className}>
        {highlightedText}
      </span>
    )

    lastIndex = index + highlightedText.length
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  const result = parts.length > 0 ? <>{parts}</> : text

  // キャッシュが大きくなりすぎないように管理
  if (cache.size >= MAX_CACHE_SIZE) {
    // 最初のエントリを削除（簡易的なLRU）
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) {
      cache.delete(firstKey)
    }
  }

  // 結果をキャッシュに保存
  cache.set(cacheKey, result)

  return result
}

/**
 * 長いテキストを効率的に処理する関数
 */
function processLongText(
  text: string,
  searchTerm: string,
  className: string
): React.ReactNode {
  const searchTermLower = searchTerm.toLowerCase()
  const textLower = text.toLowerCase()

  // 検索語の位置を全て見つける
  const positions: number[] = []
  let pos = textLower.indexOf(searchTermLower)

  while (pos !== -1) {
    positions.push(pos)
    pos = textLower.indexOf(searchTermLower, pos + 1)
  }

  if (positions.length === 0) {
    return text
  }

  // 検索語の周辺のみを表示（各一致の前後100文字）
  const parts: React.ReactNode[] = []
  const CONTEXT_SIZE = 100
  let lastEnd = 0

  positions.forEach((pos, i) => {
    const start = Math.max(0, pos - CONTEXT_SIZE)
    const end = Math.min(text.length, pos + searchTerm.length + CONTEXT_SIZE)

    // 前のセクションとの間に省略記号を追加
    if (start > lastEnd) {
      if (lastEnd > 0) {
        parts.push(<span key={`ellipsis-${i}`}>...</span>)
      }
      parts.push(text.substring(start, pos))
    } else if (pos > lastEnd) {
      parts.push(text.substring(lastEnd, pos))
    }

    // ハイライト部分
    parts.push(
      <span key={`highlight-${i}`} className={className}>
        {text.substring(pos, pos + searchTerm.length)}
      </span>
    )

    lastEnd = pos + searchTerm.length

    // 後続テキスト
    if (end > lastEnd) {
      parts.push(text.substring(lastEnd, end))
      lastEnd = end
    }
  })

  // 最後に省略記号を追加（必要な場合）
  if (lastEnd < text.length) {
    parts.push(<span key="ellipsis-end">...</span>)
  }

  return <>{parts}</>
}

/**
 * 正規表現で使用する特殊文字をエスケープする関数
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Reactコンポーネント用のメモ化されたハイライト関数
 */
export function useHighlightText(
  text: string,
  searchTerm: string,
  className?: string
): React.ReactNode {
  return useMemo(
    () => highlightText(text, searchTerm, className),
    [text, searchTerm, className]
  )
}
