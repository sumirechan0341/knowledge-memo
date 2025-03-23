'use client'

import { useEffect, useState } from 'react'
import { useCookies } from 'next-client-cookies' // ← 正しいインポートパス
import { Knowledge, getKnowledgeItems } from '@/lib/db'
import { accounts } from './knowledge/data'
import { Button } from '@/components/ui/button'
import { KnowledgeComponent } from './knowledge/components/knowledge'

export default function KnowledgePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // クッキーからレイアウト設定を取得
  const cookies = useCookies()
  const layoutCookie = cookies.get('react-resizable-panels:layout:knowledge')
  const collapsedCookie = cookies.get('react-resizable-panels:collapsed')

  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : [20, 32, 48]
  const defaultCollapsed = collapsedCookie ? JSON.parse(collapsedCookie) : false

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const items = await getKnowledgeItems()
        setKnowledgeItems(items)
      } catch (err) {
        console.error('Failed to fetch knowledge items:', err)
        setError('データの取得に失敗しました。')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">
            ナレッジベースを読み込んでいます...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-destructive">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            再試行
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden flex-col md:flex h-full">
      <KnowledgeComponent
        accounts={accounts}
        knowledges={knowledgeItems}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
