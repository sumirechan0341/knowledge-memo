'use client'
import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Plus, Search, Tag, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { getKnowledgeItems, Knowledge } from '../lib/db'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface KnowledgeCollectionViewProps {
  onSelectKnowledge: (knowledge: Knowledge) => void
  onCreateNew: () => void
  refreshTrigger: number
}

const KnowledgeCollectionView: React.FC<KnowledgeCollectionViewProps> = ({
  onSelectKnowledge,
  onCreateNew,
  refreshTrigger
}) => {
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<Knowledge[]>([])

  const fetchKnowledgeItems = async () => {
    const data = await getKnowledgeItems()
    // 作成日の新しい順にソート
    const sortedData = data.sort(
      (a, b) =>
        new Date(b.createdAt || '').getTime() -
        new Date(a.createdAt || '').getTime()
    )
    setKnowledgeItems(sortedData)
    setFilteredItems(sortedData)
  }

  useEffect(() => {
    fetchKnowledgeItems()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = knowledgeItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags &&
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    )
    setFilteredItems(filtered)
  }, [searchTerm, knowledgeItems])

  const getExcerpt = (content: string, maxLength = 80) => {
    if (!content) return '内容なし'
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card className="h-full flex flex-col rounded-none border-0 shadow-none bg-sidebar text-sidebar-foreground">
      <CardHeader className="px-4 py-3 space-y-3 border-b border-sidebar-border bg-gradient-to-b from-sidebar-accent/40 to-sidebar/95">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-sidebar-foreground flex items-center">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 mr-2 fill-sidebar-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0-3h8v2h-8zm0 6h4v2h-4z" />
            </svg>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80">
              コレクション
            </span>
          </CardTitle>
          <Button
            onClick={onCreateNew}
            size="sm"
            className="rounded-full h-8 w-8 p-0 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            {/* <Search className="h-3.5 w-3.5 text-sidebar-foreground/50" /> */}
          </div>
          <input
            type="search"
            placeholder="検索..."
            className="w-full pl-8 h-9 text-sm rounded-lg bg-sidebar-accent/30 border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-primary/30 focus:border-sidebar-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full w-full scrollbar-fancy">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-sidebar-foreground/60 p-4">
              <div className="text-center mb-3 font-medium">
                ナレッジがありません
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNew}
                className="bg-sidebar-accent/50 text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-accent/80 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" /> 追加する
              </Button>
            </div>
          ) : (
            <div>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'p-3 hover:bg-sidebar-accent/40 cursor-pointer transition-all border-l-2 border-transparent hover:border-l-sidebar-primary',
                    index !== filteredItems.length - 1 &&
                      'border-b border-sidebar-border/60'
                  )}
                  onClick={() => onSelectKnowledge(item)}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sidebar-foreground/90 line-clamp-1">
                        {item.title || '無題'}
                      </h3>
                    </div>
                    <p className="text-sm text-sidebar-foreground/60 line-clamp-2">
                      {getExcerpt(item.content)}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs font-medium text-sidebar-foreground/50 bg-sidebar-accent/30 px-2 py-0.5 rounded-md inline-flex items-center">
                        <FileText className="h-3 w-3 mr-1 opacity-70" />
                        {item.createdAt
                          ? format(parseISO(item.createdAt), 'MM/dd', {
                              locale: ja
                            })
                          : '-'}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center text-xs">
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded-full bg-sidebar-primary/10 text-sidebar-primary/80 text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-sidebar-accent/30 text-sidebar-foreground/60 text-xs">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default KnowledgeCollectionView
