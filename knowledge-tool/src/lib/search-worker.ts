// search-worker.ts
// WebWorkerで実行される検索処理

import { Knowledge } from './db'

// メインスレッドから受け取るメッセージの型定義
interface SearchMessage {
  type: 'search'
  data: {
    items: Knowledge[]
    searchTerm: string
    includeTrash: boolean
  }
}

// 検索結果を返すメッセージの型定義
interface SearchResultMessage {
  type: 'searchResult'
  data: {
    results: Knowledge[]
    searchTerm: string
  }
}

// WebWorker内でのメッセージ受信処理
self.onmessage = (event: MessageEvent<SearchMessage>) => {
  const { type, data } = event.data

  if (type === 'search') {
    const { items, searchTerm, includeTrash } = data

    // 検索処理の実行
    const results = performSearch(items, searchTerm, includeTrash)

    // 結果をメインスレッドに返す
    const resultMessage: SearchResultMessage = {
      type: 'searchResult',
      data: {
        results,
        searchTerm
      }
    }

    self.postMessage(resultMessage)
  }
}

/**
 * 検索処理を実行する関数
 * @param items 検索対象のナレッジアイテム
 * @param searchTerm 検索ワード
 * @param includeTrash ゴミ箱のアイテムを含めるかどうか
 * @returns 検索結果
 */
function performSearch(
  items: Knowledge[],
  searchTerm: string,
  includeTrash: boolean
): Knowledge[] {
  // 検索ワードが空の場合は全てのアイテムを返す（ゴミ箱の除外処理は行う）
  if (!searchTerm.trim()) {
    return includeTrash
      ? items
      : items.filter((item) => item.path !== '/trashbox')
  }

  // 検索ワードで絞り込み（タイトルと本文で検索）
  const searchTermLower = searchTerm.toLowerCase()
  const filtered = items.filter((item) => {
    // ゴミ箱のアイテムを除外（includeTrashがtrueの場合は含める）
    if (!includeTrash && item.path === '/trashbox') {
      return false
    }

    // タイトルと本文で検索
    const titleOrTextMatch =
      item.title.toLowerCase().includes(searchTermLower) ||
      item.text.toLowerCase().includes(searchTermLower)

    // タグで検索（先頭に#がついている場合はタグ検索と判断）
    if (searchTermLower.startsWith('#')) {
      const tagSearchTerm = searchTermLower.substring(1) // #を除去
      if (tagSearchTerm.trim() === '') {
        return titleOrTextMatch // #のみの場合は通常検索
      }

      // タグが検索ワードを含むか確認
      return item.labels.some((label) =>
        label.toLowerCase().includes(tagSearchTerm)
      )
    }

    return titleOrTextMatch
  })

  // 日付の新しい順（降順）にソート
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

// TypeScriptでWebWorkerを使用する場合の型定義
export {}
