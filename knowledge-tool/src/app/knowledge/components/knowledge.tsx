'use client'

import * as React from 'react'
import {
  Inbox,
  Search,
  Trash2,
  Plus,
  X,
  Tag as TagIcon,
  Book,
  BarChart
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AccountSwitcher } from './account-switcher'
import { KnowledgeDisplay } from './knowledge-display'
import { KnowledgeList } from './knowledge-list'
import { Nav } from './nav'
import { TagList } from './tag-list'
import { useKnowledge } from '../use-knowledge'
import { Knowledge, getKnowledgeItemsByPath, emptyTrash } from '@/lib/db'
import { useSearchWorker } from '@/lib/use-search-worker'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { WeeklyReviewModal } from '@/app/journal/components/weekly-review-modal'
interface KnowledgeProps {
  accounts: {
    label: string
    email: string
    iconName: string
  }[]
  knowledges: Knowledge[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  onKnowledgeAdded?: () => void
  isJournalView?: boolean
}

export function KnowledgeComponent({
  accounts,
  knowledges,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  onKnowledgeAdded,
  isJournalView = false
}: KnowledgeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [selectedKnowledge, setSelectedKnowledge] = useKnowledge()
  const [currentItems, setCurrentItems] = React.useState(knowledges)
  const [isTrashView, setIsTrashView] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTag, setSelectedTag] = React.useState<string | undefined>(
    undefined
  )
  // 日付範囲フィルター用の状態
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  )
  // 週間振り返りモーダル用の状態
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = React.useState(false)
  // WebWorkerを使用した検索処理のカスタムフックを使用
  const { search, isSearching } = useSearchWorker()

  // 前回の検索条件を保持するためのref
  const prevSearchRef = React.useRef({
    term: '',
    isTrash: false,
    tag: undefined as string | undefined,
    dateRange: undefined as DateRange | undefined
  })

  // デバウンス処理: 入力が止まってから検索を実行（800msに増加）
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue)
    }, 800) // 800ミリ秒のデバウンス時間に増加

    return () => clearTimeout(timer) // クリーンアップ関数
  }, [inputValue])
  // Update currentItems when knowledges prop changes or search term changes
  React.useEffect(() => {
    const updateItems = async () => {
      // 検索条件を保存（デバッグ用）
      const oldTerm = prevSearchRef.current.term

      // 検索条件を更新（常に最新の検索条件を保持）
      prevSearchRef.current = {
        term: searchTerm,
        isTrash: isTrashView,
        tag: selectedTag,
        dateRange: dateRange
      }

      if (
        searchTerm.trim() ||
        (dateRange && (dateRange.from || dateRange.to))
      ) {
        try {
          console.log(
            `Searching for: "${searchTerm}" (previous: "${oldTerm}")${
              dateRange ? ' with date range' : ''
            }`
          )

          // WebWorkerを使用して検索を実行（常に実行）
          const searchResults = await search(
            knowledges,
            searchTerm,
            isTrashView,
            dateRange
          )
          setCurrentItems(searchResults)
        } catch (error) {
          console.error('Search failed:', error)
        }
      } else if (selectedTag) {
        // タグでフィルタリング
        const taggedItems = knowledges.filter((item) =>
          !isTrashView
            ? item.path !== '/trashbox' && item.labels.includes(selectedTag)
            : item.path === '/trashbox' && item.labels.includes(selectedTag)
        )
        setCurrentItems(taggedItems)
      } else if (isTrashView) {
        try {
          const trashedItems = await getKnowledgeItemsByPath('/trashbox')
          setCurrentItems(trashedItems)
        } catch (error) {
          console.error('Failed to fetch trashed items:', error)
        }
      } else {
        setCurrentItems(knowledges)
      }
    }

    updateItems()
  }, [knowledges, isTrashView, searchTerm, selectedTag, dateRange, search])
  // Function to handle tag selection
  const handleTagSelect = (tag: string) => {
    // 同じタグが選択された場合は選択解除
    if (selectedTag === tag) {
      setSelectedTag(undefined)
    } else {
      setSelectedTag(tag)
      // タグ選択時は検索ワードをクリア
      setInputValue('')
      setSearchTerm('')
      // 日付範囲もクリア
      if (dateRange) {
        setDateRange(undefined)
      }
    }
  }

  // Function to handle viewing trash items
  const handleViewTrash = async () => {
    try {
      const trashedItems = await getKnowledgeItemsByPath('/trashbox')
      setCurrentItems(trashedItems)
      setIsTrashView(true)
      // タグ選択をリセット
      setSelectedTag(undefined)
      // 日付範囲をリセット
      setDateRange(undefined)
      // Reset selection when switching to trash view
      setSelectedKnowledge({
        ...selectedKnowledge,
        selected: null,
        isCreating: false,
        tempKnowledge: null
      })
    } catch (error) {
      console.error('Failed to fetch trashed items:', error)
    }
  }

  // Function to refresh the current view (used after restore from trash)
  const refreshCurrentView = async () => {
    if (isTrashView) {
      await handleViewTrash()
    } else {
      // 現在の選択状態を保持
      const currentSelection = selectedKnowledge.selected

      // リストを更新
      setCurrentItems(knowledges)

      // 選択状態を維持（新規作成後も選択状態を保持するため）
      if (
        currentSelection !== selectedKnowledge.selected &&
        selectedKnowledge.selected !== null
      ) {
        setSelectedKnowledge({
          ...selectedKnowledge
        })
      }
    }
  }

  // Function to handle viewing all items (non-trash)
  const handleViewAll = async () => {
    setCurrentItems(knowledges)
    setIsTrashView(false)
    // タグ選択をリセット
    setSelectedTag(undefined)
    // 日付範囲をリセット
    setDateRange(undefined)
    // Reset selection when switching to all view
    setSelectedKnowledge({
      ...selectedKnowledge
    })
  }

  // Function to handle emptying the trash
  const handleEmptyTrash = async () => {
    if (confirm('ゴミ箱を空にしますか？この操作は元に戻せません。')) {
      try {
        await emptyTrash()
        // Refresh the trash view
        handleViewTrash()
        // Notify parent component
        if (onKnowledgeAdded) {
          onKnowledgeAdded()
        }
      } catch (error) {
        console.error('Failed to empty trash:', error)
      }
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:knowledge=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-[100vh] items-stretch overflow-hidden"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={30}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onExpand={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            'flex flex-col',
            isCollapsed &&
              'min-w-[50px] transition-all duration-300 ease-in-out',
            'overflow-hidden h-[100vh]'
          )}
        >
          <div
            className={cn(
              'flex h-[52px] items-center justify-center py-2',
              isCollapsed ? 'h-[52px]' : 'px-2'
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'すべて',
                label: knowledges.length.toString(),
                icon: Inbox,
                variant: isTrashView
                  ? 'ghost'
                  : isJournalView
                  ? 'ghost'
                  : 'default',
                onClick: isJournalView
                  ? () => {
                      window.location.href = '/'
                    }
                  : handleViewAll
              },
              {
                title: 'ジャーナル',
                label: '',
                icon: Book,
                variant: isJournalView ? 'default' : 'ghost',
                onClick: () => {
                  if (!isJournalView) {
                    // Navigate to journal page
                    window.location.href = '/journal'
                  }
                }
              },
              {
                title: 'ゴミ箱',
                label: '',
                icon: Trash2,
                variant: isTrashView ? 'default' : 'ghost',
                onClick: handleViewTrash
              }
            ]}
          />
          <Separator />
          <div className={cn('flex-1', isCollapsed ? 'hidden' : '')}>
            <TagList
              knowledges={knowledges}
              onTagSelect={handleTagSelect}
              selectedTag={selectedTag}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          className="flex flex-col overflow-hidden h-[100vh]"
        >
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="flex items-center px-4 py-2 h-[52px]">
              <h1 className="text-xl font-bold">
                {isTrashView
                  ? 'ゴミ箱'
                  : isJournalView
                  ? 'ジャーナル'
                  : 'TSUREDURE - 徒然なるままに'}
              </h1>
              <div className="flex items-center ml-auto gap-x-2">
                {isTrashView ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEmptyTrash}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    ゴミ箱を空にする
                  </Button>
                ) : isJournalView ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsWeeklyReviewOpen(true)}
                    >
                      <BarChart className="mr-2 h-4 w-4" />
                      週間振り返り
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      // For regular knowledge view
                      setSelectedKnowledge({
                        ...selectedKnowledge,
                        selected: null,
                        isCreating: true,
                        tempKnowledge: {
                          title: '',
                          text: '',
                          date: today.toISOString(),
                          labels: [],
                          read: false
                        }
                      })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新規作成
                  </Button>
                )}
                <TabsList>
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    すべて
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    未読
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
              {selectedTag && (
                <div className="mb-2 flex items-center">
                  <Badge className="mr-2">
                    <TagIcon className="mr-1 h-3 w-3" />
                    {selectedTag}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setSelectedTag(undefined)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">タグ選択をクリア</span>
                  </Button>
                </div>
              )}
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      selectedTag ? `"${selectedTag}"内を検索...` : '検索...'
                    }
                    className="pl-8"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  {inputValue && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => {
                        setInputValue('')
                        setSearchTerm('')
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">検索をクリア</span>
                    </Button>
                  )}
                </div>
              </form>

              {/* 日付範囲フィルター */}
              {isJournalView && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    日付範囲でフィルター
                  </h3>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                  {/* 日付範囲の結果メッセージはここでは表示せず、下部の共通メッセージ領域で表示 */}
                </div>
              )}

              {isSearching &&
                (searchTerm ||
                  (dateRange && (dateRange.from || dateRange.to))) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    検索中...
                  </div>
                )}
              {searchTerm && !isSearching && (
                <div className="mt-2 text-xs">
                  {currentItems.length === 0
                    ? `"${searchTerm}" に一致する結果はありません`
                    : `"${searchTerm}" の検索結果: ${currentItems.length}件`}
                </div>
              )}
              {!searchTerm &&
                dateRange &&
                (dateRange.from || dateRange.to) &&
                !isSearching &&
                !selectedTag && (
                  <div className="mt-2 text-xs">
                    {currentItems.length === 0
                      ? '選択した日付範囲に一致する結果はありません'
                      : `日付範囲内の結果: ${currentItems.length}件`}
                  </div>
                )}
              {!searchTerm && selectedTag && !isSearching && (
                <div className="mt-2 text-xs">
                  {currentItems.length === 0
                    ? `タグ "${selectedTag}" に一致する結果はありません`
                    : `タグ "${selectedTag}" の結果: ${currentItems.length}件`}
                </div>
              )}
            </div>
            <ScrollArea className="h-full overflow-y-auto">
              <TabsContent value="all" className="m-0 flex flex-col">
                <KnowledgeList items={currentItems} searchTerm={searchTerm} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[2]}
          minSize={30}
          className="flex flex-col overflow-hidden h-[100vh]"
        >
          <KnowledgeDisplay
            knowledge={
              selectedKnowledge.isCreating
                ? null
                : currentItems.find(
                    (item) => item.id === selectedKnowledge.selected
                  ) || null
            }
            searchTerm={searchTerm}
            onKnowledgeSaved={() => {
              refreshCurrentView()
              if (onKnowledgeAdded) {
                onKnowledgeAdded()
              }
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Weekly Review Modal */}
      {isJournalView && (
        <WeeklyReviewModal
          isOpen={isWeeklyReviewOpen}
          onClose={() => setIsWeeklyReviewOpen(false)}
          journalItems={knowledges.filter(
            (item) => item.path && item.path.startsWith('/journal/')
          )}
        />
      )}
    </TooltipProvider>
  )
}
