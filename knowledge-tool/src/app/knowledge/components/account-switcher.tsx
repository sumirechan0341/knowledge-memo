'use client'

import * as React from 'react'
import { Code, BookText, PenTool, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface AccountSwitcherProps {
  isCollapsed: boolean
  accounts: {
    label: string
    email: string
    iconName: string
  }[]
}

// アイコン名からコンポーネントを取得する関数
const getIconByName = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'code':
      return <Code className="h-4 w-4" />
    case 'book-text':
      return <BookText className="h-4 w-4" />
    case 'pen-tool':
      return <PenTool className="h-4 w-4" />
    default:
      return <Code className="h-4 w-4" /> // デフォルトアイコン
  }
}

export function AccountSwitcher({
  isCollapsed,
  accounts
}: AccountSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    accounts[0].email
  )

  return (
    <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
          isCollapsed &&
            'flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden'
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          {getIconByName(
            accounts.find((account) => account.email === selectedAccount)
              ?.iconName || ''
          )}
          <span className={cn('ml-2', isCollapsed && 'hidden')}>
            {
              accounts.find((account) => account.email === selectedAccount)
                ?.label
            }
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.email} value={account.email}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {getIconByName(account.iconName)}
              {account.email}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
