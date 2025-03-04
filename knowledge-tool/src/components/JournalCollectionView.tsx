'use client'
import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getJournals, Journal } from '../lib/db'

interface JournalCollectionViewProps {
  onSelectJournal: (journal: Journal) => void
  onCreateNew: () => void
  refreshTrigger: number
}

const JournalCollectionView: React.FC<JournalCollectionViewProps> = ({
  onSelectJournal,
  onCreateNew,
  refreshTrigger
}) => {
  const [journals, setJournals] = useState<Journal[]>([])

  const fetchJournals = async () => {
    const data = await getJournals()
    setJournals(
      data.sort(
        (a, b) =>
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      )
    )
  }

  useEffect(() => {
    fetchJournals()
  }, [refreshTrigger])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between border-b">
        <CardTitle>My Journals</CardTitle>
        <Button variant="outline" size="icon" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full w-full">
          {journals.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No journal entries yet. Start writing!
            </div>
          ) : (
            journals.map((journal) => (
              <div
                key={journal.id}
                className="p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectJournal(journal)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">
                    {journal.date
                      ? format(parseISO(journal.date), 'PPP')
                      : 'No Date'}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {journal.content || 'No content'}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default JournalCollectionView
