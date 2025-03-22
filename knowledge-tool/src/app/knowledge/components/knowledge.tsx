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
  Tag
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
import { AccountSwitcher } from './account-switcher'
import { KnowledgeDisplay } from './knowledge-display'
import { KnowledgeList } from './knowledge-list'
import { Nav } from './nav'
import { useKnowledge } from '../use-knowledge'
import { Knowledge } from '@/lib/db'
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
}

export function KnowledgeComponent({
  accounts,
  knowledges,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize
}: KnowledgeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useKnowledge()

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:knowledge=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[800px] items-stretch"
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
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'すべて',
                label: '128',
                icon: Inbox,
                variant: 'default'
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
                variant: 'ghost'
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
              }
            ]}
          />
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
                  <Input placeholder="検索..." className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <KnowledgeList items={knowledges} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <KnowledgeDisplay
            knowledge={
              knowledges.find((item) => item.id === mail.selected) || null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
