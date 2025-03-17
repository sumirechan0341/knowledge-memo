'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PanelRightOpen,
  PanelRightClose,
  Plus,
  Search,
  Calendar,
  Edit
} from 'lucide-react'
import KnowledgeCollectionView from '../../components/KnowledgeCollectionView'
import KnowledgeSingleView from '../../components/KnowledgeSingleView'
import { addKnowledge, Knowledge } from '../../lib/db'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

const Home: React.FC = () => {
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(
    null
  )
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectKnowledge = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge)
  }

  const handleCreateNew = async () => {
    const newKnowledge: Omit<Knowledge, 'id'> = {
      title: '新しいナレッジ',
      content: '',
      createdAt: new Date().toISOString(),
      tags: []
    }
    const newId = await addKnowledge(newKnowledge)
    setSelectedKnowledge({ ...newKnowledge, id: newId })
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden paper-texture">
      {/* サイドバー */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out border-r border-sidebar-border shadow-sm relative z-10',
          isCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
        )}
      >
        <KnowledgeCollectionView
          onSelectKnowledge={handleSelectKnowledge}
          refreshTrigger={refreshTrigger}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-border flex items-center bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 text-primary/80 hover:bg-primary/10 rounded-lg"
          >
            {isCollapsed ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </Button>
          <h1 className="text-lg font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 mr-2 fill-primary"
            >
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.95 0-4.05.4-5.5 1.5v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Knowledge
            </span>
            <span className="font-normal text-foreground/90">Journal</span>
          </h1>
          <div className="ml-auto flex items-center space-x-2">
            <div className="relative mr-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                {/* <Search className="h-3.5 w-3.5 text-muted-foreground/70" /> */}
              </div>
              <input
                type="search"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-56 sm:w-64 md:w-72 text-sm rounded-lg bg-background/70 border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    onClick={handleCreateNew}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-card/95 backdrop-blur-sm border-border shadow-md">
                  <div className="flex items-center">
                    <span>新規作成</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <KnowledgeSingleView
            knowledge={selectedKnowledge}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
            onDeselect={() => setSelectedKnowledge(null)}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
