'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { addJournal, updateJournal, Journal } from '../lib/db'

interface JournalSingleViewProps {
  journal: Journal | null
  onRefresh: () => void
  onDeselect: () => void
}

const JournalSingleView: React.FC<JournalSingleViewProps> = ({
  journal,
  onRefresh,
  onDeselect
}) => {
  const [date, setDate] = useState<Date | undefined>(
    journal?.date ? new Date(journal.date) : undefined
  )
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (journal) {
      setDate(journal.date ? new Date(journal.date) : undefined)
      setContent(journal.content || '')
    } else {
      setDate(undefined)
      setContent('')
    }
  }, [journal])

  const handleSave = async () => {
    if (!date) return

    const journalData = {
      ...journal,
      date: format(date, 'yyyy-MM-dd'),
      content
    }

    if (journal && journal.id) {
      await updateJournal(journalData)
    } else {
      await addJournal(journalData)
    }
    onRefresh()
    onDeselect()
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between border-b">
        <CardTitle>{journal ? 'Edit Journal' : 'New Journal Entry'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onDeselect}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 flex-grow flex flex-col">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            placeholder="Write your journal entry here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!date || !content}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Entry
        </Button>
      </CardContent>
    </Card>
  )
}

export default JournalSingleView
