'use client'

import * as React from 'react'
import {
  Archive,
  Inbox,
  Search,
  Send,
  Trash2,
  Code,
  FileText,
  Tag,
  Plus,
  X
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { useKnowledge } from '../use-knowledge'
import { Knowledge, getKnowledgeItemsByPath, emptyTrash } from '@/lib/db'
import { useSearchWorker } from '@/lib/use-search-worker'
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
}

export function KnowledgeComponent({
  accounts,
  knowledges,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  onKnowledgeAdded
}: KnowledgeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail, setMail] = useKnowledge()
  const [currentItems, setCurrentItems] = React.useState(knowledges)
  const [isTrashView, setIsTrashView] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [searchTerm, setSearchTerm] = React.useState('')
  // WebWorkerを使用した検索処理のカスタムフックを使用
  const { search, isSearching } = useSearchWorker()

  // 前回の検索条件を保持するためのref
  const prevSearchRef = React.useRef({
    term: '',
    isTrash: false
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
        isTrash: isTrashView
      }

      if (searchTerm.trim()) {
        try {
          console.log(`Searching for: "${searchTerm}" (previous: "${oldTerm}")`)

          // WebWorkerを使用して検索を実行（常に実行）
          const searchResults = await search(
            knowledges,
            searchTerm,
            isTrashView
          )
          setCurrentItems(searchResults)
        } catch (error) {
          console.error('Search failed:', error)
        }
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
  }, [knowledges, isTrashView, searchTerm, search])

  // Function to handle viewing trash items
  const handleViewTrash = async () => {
    try {
      const trashedItems = await getKnowledgeItemsByPath('/trashbox')
      setCurrentItems(trashedItems)
      setIsTrashView(true)
      // Reset selection when switching to trash view
      setMail({
        ...mail,
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
      handleViewAll()
    }
  }

  // Function to handle viewing all items (non-trash)
  const handleViewAll = async () => {
    setCurrentItems(knowledges)
    setIsTrashView(false)
    // Reset selection when switching to all view
    setMail({
      ...mail,
      selected: null,
      isCreating: false,
      tempKnowledge: null
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
                variant: isTrashView ? 'ghost' : 'default',
                onClick: handleViewAll
              },
              {
                title: 'プログラミング',
                label: '9',
                icon: Code,
                variant: 'ghost'
              },
              {
                title: 'ツール',
                label: '',
                icon: Send,
                variant: 'ghost'
              },
              {
                title: 'ドキュメント',
                label: '23',
                icon: FileText,
                variant: 'ghost'
              },
              {
                title: 'ゴミ箱',
                label: '',
                icon: Trash2,
                variant: isTrashView ? 'default' : 'ghost',
                onClick: handleViewTrash
              },
              {
                title: 'アーカイブ',
                label: '',
                icon: Archive,
                variant: 'ghost'
              }
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'React',
                label: '3',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'JavaScript',
                label: '2',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'TypeScript',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'React',
                label: '3',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'JavaScript',
                label: '2',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'TypeScript',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'React',
                label: '3',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'JavaScript',
                label: '2',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'TypeScript',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              },
              {
                title: 'Next.js',
                label: '1',
                icon: Tag,
                variant: 'ghost'
              },
              {
                title: 'その他',
                label: '21',
                icon: Archive,
                variant: 'ghost'
              }
            ]}
          />
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
                {isTrashView ? 'ゴミ箱' : 'ナレッジベース'}
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
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMail({
                        ...mail,
                        selected: null,
                        isCreating: true,
                        tempKnowledge: {
                          title: '',
                          text: '',
                          date: new Date().toISOString(),
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
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="検索..."
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
              {isSearching && searchTerm && (
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
            </div>
            <TabsContent
              value="all"
              className="m-0 flex flex-col overflow-auto"
            >
              <KnowledgeList items={currentItems} searchTerm={searchTerm} />
            </TabsContent>
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
              mail.isCreating
                ? null
                : currentItems.find((item) => item.id === mail.selected) || null
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
    </TooltipProvider>
  )
}
