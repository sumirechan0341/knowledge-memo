'use client'

import { ComponentProps } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Knowledge } from '@/lib/db'
import { useKnowledge } from '@/lib/use-knowledge'

interface KnowledgeListProps {
  items: Knowledge[]
}

export function KnowledgeList({ items }: KnowledgeListProps) {
  const [knowledge, setKnowledge] = useKnowledge()

  // 利用可能なすべてのタグのリストを取得
  const allTags = [...new Set(items.flatMap((item) => item.tags || []))]

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-center">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                表示するナレッジがありません
              </div>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                knowledge.selected === item.id && 'bg-muted'
              )}
              onClick={() =>
                setKnowledge({
                  ...knowledge,
                  selected: item.id
                })
              }
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="font-semibold">{item.title || '無題'}</div>
                  <div
                    className={cn(
                      'ml-auto text-xs',
                      knowledge.selected === item.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.createdAt &&
                      formatDistanceToNow(parseISO(item.createdAt), {
                        addSuffix: true,
                        locale: ja
                      })}
                  </div>
                </div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.content.substring(0, 300).replace(/\n/g, ' ')}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant={getBadgeVariantFromTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

function getBadgeVariantFromTag(
  tag: string
): ComponentProps<typeof Badge>['variant'] {
  // プログラミング言語系
  if (
    [
      'JavaScript',
      'TypeScript',
      'Python',
      'Go',
      'Ruby',
      'Java',
      'PHP',
      'C#',
      'C++'
    ].includes(tag)
  ) {
    return 'default'
  }

  // フレームワーク系
  if (
    [
      'React',
      'Next.js',
      'Vue',
      'Angular',
      'Svelte',
      'Express',
      'Django',
      'Rails'
    ].includes(tag)
  ) {
    return 'secondary'
  }

  // ツール系
  if (
    ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD'].includes(
      tag
    )
  ) {
    return 'outline'
  }

  // デザイン系
  if (['CSS', 'Tailwind', 'デザイン', 'UI', 'UX'].includes(tag)) {
    return 'destructive'
  }

  // その他（ドキュメント、プロセスなど）
  return 'secondary'
}
