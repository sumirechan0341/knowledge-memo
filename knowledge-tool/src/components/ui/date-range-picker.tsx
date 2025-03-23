'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

interface DateRangePickerProps {
  className?: string
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  align?: 'start' | 'center' | 'end'
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
  align = 'start'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // 日付範囲をクリアする関数
  const clearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateRangeChange(undefined)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'yyyy/MM/dd', { locale: ja })} -{' '}
                  {format(dateRange.to, 'yyyy/MM/dd', { locale: ja })}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-5 w-5"
                    onClick={clearDateRange}
                    asChild
                  >
                    <div>
                      <X className="h-3 w-3" />
                      <span className="sr-only">クリア</span>
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  {format(dateRange.from, 'yyyy/MM/dd', { locale: ja })}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-5 w-5"
                    onClick={clearDateRange}
                    asChild
                  >
                    <div>
                      <X className="h-3 w-3" />
                      <span className="sr-only">クリア</span>
                    </div>
                  </Button>
                </>
              )
            ) : (
              <span>日付範囲を選択</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
