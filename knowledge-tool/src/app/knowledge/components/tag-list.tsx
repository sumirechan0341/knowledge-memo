'use client'

import * as React from 'react'
import { Tag as TagIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Knowledge } from '@/lib/db'

interface TagListProps {
  knowledges: Knowledge[]
  onTagSelect: (tag: string) => void
  selectedTag?: string
  className?: string
}

export function TagList({
  knowledges,
  onTagSelect,
  selectedTag,
  className
}: TagListProps) {
  // すべてのナレッジからタグを抽出し、出現回数をカウント
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}

    knowledges.forEach((item) => {
      if (item.labels && item.labels.length > 0) {
        item.labels.forEach((label) => {
          counts[label] = (counts[label] || 0) + 1
        })
      }
    })

    // タグを出現回数の降順でソート
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  }, [knowledges])

  if (tagCounts.length === 0) {
    return (
      <div className={cn('p-4 text-sm text-muted-foreground', className)}>
        タグがありません
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <TagIcon className="mr-2 h-4 w-4" />
          <h3 className="text-sm font-medium">タグ一覧</h3>
        </div>
        <Separator className="mb-4" />
        <div className="flex flex-wrap gap-2">
          {tagCounts.map(({ tag, count }) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => onTagSelect(tag)}
            >
              {tag} ({count})
            </Badge>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
