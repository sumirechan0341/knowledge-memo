import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Knowledge } from '@/lib/db'
import { useKnowledge } from '../use-knowledge'
import { highlightText } from '@/lib/highlight-text'

interface KnowledgeListProps {
  items: Knowledge[]
  searchTerm?: string
}

export function KnowledgeList({ items, searchTerm = '' }: KnowledgeListProps) {
  const [knowledge, setKnowledge] = useKnowledge()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
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
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {searchTerm
                      ? highlightText(item.title, searchTerm)
                      : item.title}
                  </div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    knowledge.selected === item.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {(() => {
                    const updateDate = new Date(item.updatedAt || item.date)
                    const oneWeekAgo = new Date()
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

                    if (updateDate < oneWeekAgo) {
                      // 1週間以上前の場合は日付を表示
                      return updateDate.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })
                    } else {
                      // 1週間以内の場合は相対時間を表示
                      return formatDistanceToNow(updateDate, {
                        addSuffix: true
                      })
                    }
                  })()}
                </div>
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {searchTerm
                ? highlightText(item.text.substring(0, 300), searchTerm)
                : item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant={'default'}>
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
