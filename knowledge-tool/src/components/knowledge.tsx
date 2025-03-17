'use client'

import * as React from 'react'
import {
  AlertCircle,
  Archive,
  BookText,
  Clock,
  Code,
  FileText,
  Inbox,
  Search,
  Star,
  Tag,
  Trash2,
  PenTool
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CollectionSwitcher } from '@/components/collection-switcher'
import { KnowledgeDisplay } from '@/components/knowledge-display'
import { KnowledgeList } from '@/components/knowledge-list'
import { KnowledgeNav } from '@/components/knowledge-nav'
import { Collection, tagCategories } from '@/lib/data'
import { Knowledge } from '@/lib/db'
import { useKnowledge } from '@/lib/use-knowledge'
import { Button } from '@/components/ui/button'

interface KnowledgeProps {
  collections: Collection[]
  knowledgeItems: Knowledge[]
  defaultLayout?: number[]
  defaultCollapsed?: boolean
  navCollapsedSize: number
  onRefresh: () => void
}

export function Knowledge({
  collections,
  knowledgeItems,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  onRefresh
}: KnowledgeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [knowledge, setKnowledge] = useKnowledge()
  const [searchTerm, setSearchTerm] = React.useState('')

  // フィルタリングされたナレッジアイテム
  const filteredItems = React.useMemo(() => {
    let items = [...knowledgeItems]

    // コレクションでフィルタリング（ここでは実装しないがプレースホルダーとして）
    if (knowledge.collection) {
      // コレクションでフィルタリングするロジックを追加
    }

    // タグでフィルタリング
    if (knowledge.tag) {
      items = items.filter(
        (item) => item.tags && item.tags.includes(knowledge.tag as string)
      )
    }

    // 検索語でフィルタリング
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.content.toLowerCase().includes(term) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(term)))
      )
    }

    return items
  }, [knowledgeItems, knowledge.collection, knowledge.tag, searchTerm])

  // 選択されているナレッジを取得
  const selectedKnowledge = React.useMemo(() => {
    return knowledgeItems.find((item) => item.id === knowledge.selected) || null
  }, [knowledgeItems, knowledge.selected])

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:knowledge=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[100dvh] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
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
            isCollapsed &&
              'min-w-[50px] transition-all duration-300 ease-in-out'
          )}
        >
          <div
            className={cn(
              'flex h-[52px] items-center justify-center',
              isCollapsed ? 'h-[52px]' : 'px-2'
            )}
          >
            <CollectionSwitcher
              isCollapsed={isCollapsed}
              collections={collections}
            />
          </div>
          <Separator />
          <KnowledgeNav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'すべて',
                label: String(knowledgeItems.length),
                icon: Inbox,
                value: 'all',
                variant: 'default',
                type: 'view'
              },
              {
                title: 'お気に入り',
                label: '',
                icon: Star,
                value: 'favorites',
                variant: 'ghost',
                type: 'view'
              },
              {
                title: '最近の更新',
                label: '',
                icon: Clock,
                value: 'recent',
                variant: 'ghost',
                type: 'view'
              },
              {
                title: 'アーカイブ',
                label: '',
                icon: Archive,
                value: 'archive',
                variant: 'ghost',
                type: 'view'
              },
              {
                title: 'ゴミ箱',
                label: '',
                icon: Trash2,
                value: 'trash',
                variant: 'ghost',
                type: 'view'
              }
            ]}
          />
          <Separator />
          <KnowledgeNav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'コード',
                label: String(
                  knowledgeItems.filter(
                    (item) =>
                      item.tags?.includes('React') ||
                      item.tags?.includes('JavaScript') ||
                      item.tags?.includes('TypeScript')
                  ).length
                ),
                icon: Code,
                value: 'code',
                variant: 'ghost',
                type: 'collection'
              },
              {
                title: 'ドキュメント',
                label: String(
                  knowledgeItems.filter((item) =>
                    item.tags?.includes('ドキュメント')
                  ).length
                ),
                icon: FileText,
                value: 'documents',
                variant: 'ghost',
                type: 'collection'
              },
              {
                title: 'メモ',
                label: '',
                icon: BookText,
                value: 'notes',
                variant: 'ghost',
                type: 'collection'
              },
              {
                title: 'アイデア',
                label: '',
                icon: PenTool,
                value: 'ideas',
                variant: 'ghost',
                type: 'collection'
              }
            ]}
          />
          {tagCategories.map((category, i) => (
            <React.Fragment key={i}>
              <Separator />
              <KnowledgeNav
                isCollapsed={isCollapsed}
                links={category.tags.map((tag) => ({
                  title: tag,
                  label: String(
                    knowledgeItems.filter((item) => item.tags?.includes(tag))
                      .length
                  ),
                  icon: Tag,
                  value: tag,
                  variant: 'ghost',
                  type: 'tag'
                }))}
              />
            </React.Fragment>
          ))}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">ナレッジベース</h1>
              <TabsList className="ml-auto">
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
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="検索..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-sm font-medium">
                {knowledge.tag
                  ? `タグ: ${knowledge.tag} (${filteredItems.length})`
                  : knowledge.collection
                  ? `コレクション: ${knowledge.collection} (${filteredItems.length})`
                  : `すべてのナレッジ (${filteredItems.length})`}
              </h2>
              <Button
                size="sm"
                onClick={() => {
                  const newKnowledge = {
                    title: '新しいナレッジ',
                    content: '',
                    createdAt: new Date().toISOString(),
                    tags: []
                  }
                  // このボタンを押した後、DB操作とリフレッシュが必要
                  onRefresh()
                }}
              >
                新規作成
              </Button>
            </div>
            <TabsContent value="all" className="m-0">
              <KnowledgeList items={filteredItems} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <KnowledgeList items={filteredItems.slice(0, 3)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <KnowledgeDisplay
            knowledge={selectedKnowledge}
            onRefresh={onRefresh}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
