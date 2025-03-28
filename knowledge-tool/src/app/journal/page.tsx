'use client'

import { useEffect, useState } from 'react'
import { Knowledge, getKnowledgeItems, addKnowledge } from '@/lib/db'
import { accounts } from '../knowledge/data'
import { Button } from '@/components/ui/button'
import { KnowledgeComponent } from '../knowledge/components/knowledge'
import { format } from 'date-fns'
import { useKnowledge } from '../knowledge/use-knowledge'

export default function JournalPage() {
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedKnowledge, setSelectedKnowledge] = useKnowledge()
  const [defaultLayout, setDefaultLayout] = useState<number[]>([20, 32, 48])
  const [defaultCollapsed, setDefaultCollapsed] = useState<boolean>(false)

  // クッキーからレイアウト設定を取得
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
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get all journal entries (items with path starting with '/journal/')
        const allItems = await getKnowledgeItems(true) // Get all items including trash
        const journalItems = allItems.filter(
          (item) =>
            item.path &&
            item.path.startsWith('/journal/') &&
            item.path !== '/trashbox'
        )
        setKnowledgeItems(journalItems)

        // Check if today's journal exists
        const today = new Date()
        const todayPath = `/journal/${format(today, 'yyyy-MM-dd')}`
        const todayJournal = journalItems.find(
          (item: Knowledge) => item.path === todayPath
        )

        if (!todayJournal) {
          // Create today's journal if it doesn't exist
          createTodayJournal()
        } else {
          // Select today's journal
          setSelectedKnowledge({
            ...selectedKnowledge,
            selected: todayJournal.id,
            isCreating: false,
            tempKnowledge: null
          })
        }
      } catch (err) {
        console.error('Failed to fetch journal items:', err)
        setError('ジャーナルデータの取得に失敗しました。')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshTrigger])

  const createTodayJournal = async () => {
    try {
      const today = new Date()
      const todayFormatted = format(today, 'yyyy/MM/dd')
      const todayPath = `/journal/${format(today, 'yyyy-MM-dd')}`

      // Create a new journal entry for today
      const newJournal: Omit<Knowledge, 'id'> = {
        title: `${todayFormatted}の日記`,
        text: '',
        date: today.toISOString(),
        labels: ['日記'],
        read: false,
        path: todayPath
      }

      const newJournalId = await addKnowledge(newJournal)

      // Refresh the journal list
      const allItems = await getKnowledgeItems(true)
      const journalItems = allItems.filter(
        (item) =>
          item.path &&
          item.path.startsWith('/journal/') &&
          item.path !== '/trashbox'
      )
      setKnowledgeItems(journalItems)

      // Select the newly created journal
      setSelectedKnowledge({
        ...selectedKnowledge,
        selected: newJournalId,
        isCreating: false,
        tempKnowledge: null
      })
    } catch (err) {
      console.error("Failed to create today's journal:", err)
      setError('今日のジャーナルの作成に失敗しました。')
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">
            ジャーナルを読み込んでいます...
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
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date()
            const todayFormatted = format(today, 'yyyy/MM/dd')
            const todayPath = `/journal/${format(today, 'yyyy-MM-dd')}`

            setSelectedKnowledge({
              ...selectedKnowledge,
              selected: null,
              isCreating: true,
              tempKnowledge: {
                title: `${todayFormatted}の日記`,
                text: '',
                date: today.toISOString(),
                labels: ['日記'],
                read: false,
                path: todayPath
              }
            })
          }}
        >
          今日の日記を作成
        </Button>
      </div>
      <KnowledgeComponent
        accounts={accounts}
        knowledges={knowledgeItems}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
        onKnowledgeAdded={handleRefresh}
        isJournalView={true}
      />
    </div>
  )
}
