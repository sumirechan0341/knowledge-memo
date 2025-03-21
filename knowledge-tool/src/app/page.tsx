'use client'

import { useEffect, useState } from 'react'
import { useCookies } from 'next-client-cookies' // ← 正しいインポートパス
import { Knowledge, getKnowledgeItems, addKnowledge } from '@/lib/db'
import { Knowledge as KnowledgeComponent } from '@/components/knowledge'
import { collections, sampleKnowledgeItems } from '@/lib/data'
import { Button } from '@/components/ui/button'

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
        let items = await getKnowledgeItems()

        // データがなければサンプルデータを追加
        if (items.length === 0) {
          await Promise.all(
            sampleKnowledgeItems.map((item) => addKnowledge(item))
          )
          items = await getKnowledgeItems()
        }

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
      <div className="flex h-screen items-center justify-center">
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
      <div className="flex h-screen items-center justify-center">
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
    <div className="hidden flex-col md:flex h-screen">
      <KnowledgeComponent
        collections={collections}
        knowledgeItems={knowledgeItems}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
