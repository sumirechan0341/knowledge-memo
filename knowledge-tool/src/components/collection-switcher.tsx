'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Collection } from '@/lib/data'

interface CollectionSwitcherProps {
  isCollapsed: boolean
  collections: Collection[]
}

export function CollectionSwitcher({
  isCollapsed,
  collections
}: CollectionSwitcherProps) {
  const [selectedCollection, setSelectedCollection] = React.useState<string>(
    collections[0].label
  )

  return (
    <Select
      defaultValue={selectedCollection}
      onValueChange={setSelectedCollection}
    >
      <SelectTrigger
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
          isCollapsed &&
            'flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden'
        )}
        aria-label="コレクション選択"
      >
        <SelectValue placeholder="コレクションを選択">
          {
            collections.find(
              (collection) => collection.label === selectedCollection
            )?.icon
          }
          <span className={cn('ml-2', isCollapsed && 'hidden')}>
            {
              collections.find(
                (collection) => collection.label === selectedCollection
              )?.label
            }
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {collections.map((collection) => (
          <SelectItem key={collection.label} value={collection.label}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {collection.icon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{collection.label}</span>
                <span className="text-xs text-muted-foreground">
                  {collection.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
