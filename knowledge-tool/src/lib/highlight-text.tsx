import React from 'react'

/**
 * テキスト内の検索ワードをハイライトする関数
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
  if (!searchTerm || !text) {
    return text
  }

  const searchTermLower = searchTerm.toLowerCase()
  const textLower = text.toLowerCase()
  const parts: React.ReactNode[] = []

  let lastIndex = 0
  let index = textLower.indexOf(searchTermLower)

  while (index !== -1) {
    // 検索ワードの前のテキストを追加
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index))
    }

    // 検索ワードをハイライト付きで追加
    const highlightedText = text.substring(index, index + searchTerm.length)
    parts.push(
      <span key={`highlight-${index}`} className={className}>
        {highlightedText}
      </span>
    )

    lastIndex = index + searchTerm.length
    index = textLower.indexOf(searchTermLower, lastIndex)
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}
