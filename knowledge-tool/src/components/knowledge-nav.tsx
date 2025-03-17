'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useKnowledge } from '@/lib/use-knowledge'

interface KnowledgeNavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: LucideIcon
    value: string
    variant: 'default' | 'ghost'
    type: 'collection' | 'tag' | 'view'
  }[]
}

export function KnowledgeNav({ links, isCollapsed }: KnowledgeNavProps) {
  const [knowledge, setKnowledge] = useKnowledge()

  const handleNavClick = (link: {
    type: 'collection' | 'tag' | 'view'
    value: string
  }) => {
    if (link.type === 'collection') {
      setKnowledge({
        ...knowledge,
        collection: link.value,
        tag: null,
        view: 'all'
      })
    } else if (link.type === 'tag') {
      setKnowledge({
        ...knowledge,
        collection: null,
        tag: link.value,
        view: 'all'
      })
    } else if (link.type === 'view') {
      setKnowledge({
        ...knowledge,
        view: link.value as 'all' | 'recent' | 'favorites'
      })
    }
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          // リンクのアクティブ状態を決定
          const isActive =
            (link.type === 'collection' &&
              knowledge.collection === link.value) ||
            (link.type === 'tag' && knowledge.tag === link.value) ||
            (link.type === 'view' && knowledge.view === link.value)

          // 適切なバリアントを設定
          const variant = isActive ? 'default' : link.variant

          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavClick(link)}
                  className={cn(
                    buttonVariants({ variant, size: 'icon' }),
                    'h-9 w-9',
                    variant === 'default' &&
                      'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              key={index}
              onClick={() => handleNavClick(link)}
              className={cn(
                buttonVariants({ variant, size: 'sm' }),
                variant === 'default' &&
                  'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                'justify-start'
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    'ml-auto',
                    variant === 'default' && 'text-background dark:text-white'
                  )}
                >
                  {link.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
