'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { KnowledgeComponent } from '@/app/knowledge/components/knowledge'
import { accounts } from '@/app/knowledge/data'
import {
  Knowledge,
  getKnowledgeItems,
  initializeDBWithMockData
} from '@/lib/db'

export default function KnowledgePage() {
  const [knowledges, setKnowledges] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [defaultLayout, setDefaultLayout] = useState<number[] | undefined>(
    undefined
  )
  const [defaultCollapsed, setDefaultCollapsed] = useState<boolean | undefined>(
    undefined
  )

  // ナレッジデータを再読み込みする関数
  const refreshKnowledge = useCallback(async () => {
    try {
      const items = await getKnowledgeItems()
      setKnowledges(items)
    } catch (error) {
      console.error('Failed to refresh knowledge data:', error)
    }
  }, [])

  useEffect(() => {
    // クッキーからレイアウト設定を読み込む
    const layoutCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('react-resizable-panels:layout:knowledge='))

    if (layoutCookie) {
      const layoutValue = layoutCookie.split('=')[1]
      setDefaultLayout(JSON.parse(decodeURIComponent(layoutValue)))
    }

    const collapsedCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('react-resizable-panels:collapsed='))

    if (collapsedCookie) {
      const collapsedValue = collapsedCookie.split('=')[1]
      setDefaultCollapsed(JSON.parse(decodeURIComponent(collapsedValue)))
    }

    // IndexedDBからデータを読み込む
    const loadData = async () => {
      try {
        // モックデータでIndexedDBを初期化（データが存在しない場合のみ）
        await initializeDBWithMockData([])

        // IndexedDBからデータを取得
        await refreshKnowledge()
      } catch (error) {
        console.error('Failed to load data from IndexedDB:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [refreshKnowledge])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/knowledge-dark.png"
          width={1280}
          height={727}
          alt="Knowledge"
          className="hidden dark:block"
        />
        <Image
          src="/examples/knowledge-light.png"
          width={1280}
          height={727}
          alt="Knowledge"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <KnowledgeComponent
          accounts={accounts}
          knowledges={knowledges}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
          onKnowledgeAdded={refreshKnowledge}
        />
      </div>
    </>
  )
}
