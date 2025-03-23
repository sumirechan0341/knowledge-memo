'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Knowledge } from '@/lib/db'
import { Textarea } from '@/components/ui/textarea'

interface WeeklyReviewModalProps {
  isOpen: boolean
  onClose: () => void
  journalItems: Knowledge[]
}

// Mock API function for AI summarization
const mockGenerateAISummary = async (
  journalEntries: Knowledge[]
): Promise<string> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create a simple summary based on the journal entries
  const entryCount = journalEntries.length
  if (entryCount === 0) {
    return 'この期間のジャーナルエントリはありません。'
  }

  const titles = journalEntries.map((entry) => entry.title).join('、')
  const dateRange = `${format(
    new Date(journalEntries[0].date),
    'yyyy/MM/dd'
  )} から ${format(
    new Date(journalEntries[entryCount - 1].date),
    'yyyy/MM/dd'
  )}`

  return `# ${dateRange}の振り返り

この期間には${entryCount}件のジャーナルエントリがありました：${titles}

## 主なポイント
- この期間は生産性が高かったようです
- いくつかの重要なタスクを完了しました
- 新しいアイデアがいくつか生まれました

## 改善点
- タスク管理をより効率的に行うことができます
- 定期的な振り返りを継続しましょう

## 次週の目標
- 優先度の高いタスクに集中する
- 定期的な休憩を取る
- ドキュメントの整理を進める`
}

export function WeeklyReviewModal({
  isOpen,
  onClose,
  journalItems
}: WeeklyReviewModalProps) {
  // デフォルトで過去7日間を選択
  const today = new Date()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 7),
    to: today
  })
  const [filteredItems, setFilteredItems] = useState<Knowledge[]>([])
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isGenerated, setIsGenerated] = useState<boolean>(false)

  // 日付範囲が変更されたときにジャーナルアイテムをフィルタリング
  useEffect(() => {
    if (!dateRange.from) return

    const from = dateRange.from
    const to = dateRange.to || dateRange.from

    // 日付範囲内のジャーナルアイテムをフィルタリング
    const filtered = journalItems.filter((item) => {
      const itemDate = new Date(item.date)
      // 日付の時間部分を無視して比較
      const itemDateOnly = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        itemDate.getDate()
      )
      const fromDateOnly = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate()
      )
      const toDateOnly = new Date(to.getFullYear(), to.getMonth(), to.getDate())

      return itemDateOnly >= fromDateOnly && itemDateOnly <= toDateOnly
    })

    // 日付順にソート
    const sortedFiltered = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    setFilteredItems(sortedFiltered)
    // 新しい日付範囲が選択されたら、生成済みフラグをリセット
    setIsGenerated(false)
  }, [dateRange, journalItems])

  // AIサマリーを生成
  const generateSummary = async () => {
    setIsLoading(true)
    try {
      const result = await mockGenerateAISummary(filteredItems)
      setSummary(result)
      setIsGenerated(true)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setSummary('サマリーの生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>週間振り返り</DialogTitle>
          <DialogDescription>
            選択した期間のジャーナルエントリをAIが要約します。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date-range" className="text-sm font-medium">
              期間を選択
            </label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                if (range) setDateRange(range)
              }}
            />
          </div>

          <div className="grid gap-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                選択期間内のエントリ: {filteredItems.length}件
              </span>
              <Button
                onClick={generateSummary}
                disabled={isLoading || filteredItems.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : isGenerated ? (
                  '再生成'
                ) : (
                  'AIサマリーを生成'
                )}
              </Button>
            </div>
          </div>

          {isGenerated && (
            <div className="grid gap-2 mt-2">
              <label htmlFor="summary" className="text-sm font-medium">
                AIサマリー
              </label>
              <Textarea
                id="summary"
                value={summary}
                readOnly
                className="h-[300px] font-mono text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
