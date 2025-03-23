import { useState, useEffect, useRef, useCallback } from 'react'
import { Knowledge } from './db'

// WebWorkerの型定義
interface SearchWorker extends Worker {
  postMessage(message: {
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
  }): void
}

// 検索結果のメッセージ型定義
interface SearchResultMessage {
  type: 'searchResult'
  data: {
    results: Knowledge[]
    searchTerm: string
  }
}

/**
 * WebWorkerを使用して検索を行うカスタムフック
 * @returns 検索関数と検索状態
 */
export function useSearchWorker() {
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Knowledge[]>([])
  const [error, setError] = useState<Error | null>(null)
  const workerRef = useRef<SearchWorker | null>(null)
  const searchTermRef = useRef<string>('')
  // 検索状態を追跡するためのref
  const isSearchingRef = useRef(false)
  // 最新の検索結果を保持するref
  const resultsRef = useRef<Knowledge[]>([])

  // WebWorkerの初期化
  useEffect(() => {
    try {
      // WebWorkerの作成
      const worker = new Worker(
        new URL('./search-worker.ts', import.meta.url),
        { type: 'module' }
      ) as SearchWorker

      // メッセージ受信ハンドラの設定
      worker.onmessage = (event: MessageEvent<SearchResultMessage>) => {
        const { type, data } = event.data

        if (type === 'searchResult') {
          // 検索結果の処理
          const { results: searchResults, searchTerm } = data

          // 最新の検索結果のみを反映（古い検索結果は無視）
          if (searchTerm === searchTermRef.current) {
            setResults(searchResults)
            // 検索結果をrefにも保存
            resultsRef.current = searchResults
          }
          // 検索が完了したらisSearchingをfalseに設定（検索語に関わらず）
          setIsSearching(false)
          isSearchingRef.current = false
        }
      }

      // エラーハンドラの設定
      worker.onerror = (error) => {
        console.error('Search worker error:', error)
        setError(new Error('検索処理でエラーが発生しました'))
        setIsSearching(false)
        isSearchingRef.current = false
      }

      workerRef.current = worker

      // クリーンアップ関数
      return () => {
        worker.terminate()
        workerRef.current = null
      }
    } catch (err) {
      console.error('Failed to initialize search worker:', err)
      setError(
        err instanceof Error
          ? err
          : new Error('WebWorkerの初期化に失敗しました')
      )
    }
  }, [])

  /**
   * WebWorkerを使用して検索を実行する関数
   * @param items 検索対象のアイテム
   * @param searchTerm 検索ワード
   * @param includeTrash ゴミ箱のアイテムを含めるかどうか
   * @param dateRange 日付範囲フィルター
   * @returns 検索結果のPromise
   */
  const search = useCallback(
    async (
      items: Knowledge[],
      searchTerm: string,
      includeTrash: boolean = false,
      dateRange?: { from?: Date; to?: Date }
    ): Promise<Knowledge[]> => {
      // WebWorkerが利用できない場合はエラー
      if (!workerRef.current) {
        const fallbackError = error || new Error('検索機能が利用できません')
        throw fallbackError
      }

      // 検索中の状態を設定
      setIsSearching(true)
      isSearchingRef.current = true
      searchTermRef.current = searchTerm

      // 検索リクエストをWebWorkerに送信
      workerRef.current.postMessage({
        type: 'search',
        data: {
          items,
          searchTerm,
          includeTrash,
          dateRange
        }
      })

      // 検索結果を待機するPromiseを返す
      return new Promise((resolve) => {
        // 検索結果を監視する関数
        const checkResults = () => {
          if (!isSearchingRef.current) {
            // 検索が完了したら、現在の結果を返す
            // resultsRefから最新の結果を取得
            resolve([...resultsRef.current])
          } else {
            // まだ検索中の場合は再度チェック
            setTimeout(checkResults, 50)
          }
        }

        checkResults()
      })
    },
    [error] // resultsを依存配列から削除
  )

  return {
    search,
    isSearching,
    results,
    error
  }
}
