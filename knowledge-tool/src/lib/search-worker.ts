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
    dateRange?: {
      from?: Date
      to?: Date
    }
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
    const { items, searchTerm, includeTrash, dateRange } = data

    // 検索処理の実行
    const results = performSearch(items, searchTerm, includeTrash, dateRange)

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
 * @param dateRange 日付範囲フィルター
 * @returns 検索結果
 */
function performSearch(
  items: Knowledge[],
  searchTerm: string,
  includeTrash: boolean,
  dateRange?: { from?: Date; to?: Date }
): Knowledge[] {
  // 最初にゴミ箱フィルターを適用
  let filteredItems = includeTrash
    ? items
    : items.filter((item) => item.path !== '/trashbox')

  // 日付範囲フィルターを適用
  if (dateRange && (dateRange.from || dateRange.to)) {
    filteredItems = filteredItems.filter((item) => {
      const itemDate = new Date(item.date)

      // fromのみ指定されている場合
      if (dateRange.from && !dateRange.to) {
        return itemDate >= dateRange.from
      }

      // toのみ指定されている場合
      if (!dateRange.from && dateRange.to) {
        // toは終日を含めるため、日付の最後（23:59:59）までを含める
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        return itemDate <= endOfDay
      }

      // 両方指定されている場合
      if (dateRange.from && dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        return itemDate >= dateRange.from && itemDate <= endOfDay
      }

      return true
    })
  }

  // 検索ワードが空の場合は日付フィルターのみ適用した結果を返す
  if (!searchTerm.trim()) {
    return filteredItems
  }

  // 検索ワードで絞り込み（タイトルと本文で検索）
  const searchTermLower = searchTerm.toLowerCase()
  const filtered = filteredItems.filter((item) => {
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
