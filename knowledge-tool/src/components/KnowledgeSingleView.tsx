'use client'
import React, { useState, useEffect, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Calendar,
  Tag as TagIcon,
  Save,
  Trash2,
  Plus,
  X,
  Edit3,
  FileText,
  Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { updateKnowledge, deleteKnowledge, Knowledge } from '../lib/db'
import { motion, AnimatePresence } from 'framer-motion'

interface KnowledgeSingleViewProps {
  knowledge: Knowledge | null
  onRefresh: () => void
  onDeselect: () => void
}

const KnowledgeSingleView: React.FC<KnowledgeSingleViewProps> = ({
  knowledge,
  onRefresh,
  onDeselect
}) => {
  const [editableKnowledge, setEditableKnowledge] = useState<Knowledge | null>(
    knowledge
  )
  const [isEditing, setIsEditing] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // propsのknowledgeが変化したら、内部のstateを更新する
  useEffect(() => {
    setEditableKnowledge(knowledge)
    setIsEditing(false)
  }, [knowledge])

  // 編集モード開始時にタイトルにフォーカス
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  // ナレッジが選択されていない場合の表示
  if (!editableKnowledge) {
    return (
      <Card className="h-full flex flex-col rounded-none border-0 shadow-none bg-muted/20">
        <CardContent className="flex items-center justify-center h-full paper-texture">
          <motion.div
            className="text-center max-w-md mx-auto p-8 rounded-lg glass-effect paper-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
            <h2 className="text-xl font-medium mb-2">
              ナレッジが選択されていません
            </h2>
            <p className="text-muted-foreground mb-6">
              左側のコレクションからナレッジを選択するか、新しいナレッジを作成してください。
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  // 保存処理：DB上のデータを更新し、リストの再取得を促す
  const handleSave = async () => {
    if (editableKnowledge.id) {
      setIsSaving(true)
      await updateKnowledge(editableKnowledge)
      setIsEditing(false)
      setLastSaved(new Date().toISOString())
      setIsSaving(false)
      onRefresh()
    }
  }

  // 削除処理：DBから削除し、一覧画面に戻す
  const handleDelete = async () => {
    if (!window.confirm('このナレッジを削除してもよろしいですか？')) return

    if (editableKnowledge.id) {
      await deleteKnowledge(editableKnowledge.id)
      onDeselect()
      onRefresh()
    }
  }

  // タグを追加
  const handleAddTag = () => {
    if (!newTag.trim()) return
    const updatedTags = [...(editableKnowledge.tags || []), newTag.trim()]
    setEditableKnowledge({
      ...editableKnowledge,
      tags: updatedTags
    })
    setNewTag('')
  }

  // タグを削除
  const handleRemoveTag = (index: number) => {
    const updatedTags = [...(editableKnowledge.tags || [])]
    updatedTags.splice(index, 1)
    setEditableKnowledge({
      ...editableKnowledge,
      tags: updatedTags
    })
  }

  return (
    <Card className="h-full flex flex-col rounded-none border-0 shadow-none paper-texture">
      <motion.div
        className="p-4 border-b border-border flex justify-between items-center bg-card/90 backdrop-blur-sm"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isEditing ? (
          <Input
            ref={titleInputRef}
            className="text-lg font-medium focus-visible:ring-1"
            value={editableKnowledge.title}
            onChange={(e) =>
              setEditableKnowledge({
                ...editableKnowledge,
                title: e.target.value
              })
            }
            placeholder="タイトルを入力"
          />
        ) : (
          <div className="text-lg font-medium line-clamp-1">
            {editableKnowledge.title || '無題'}
          </div>
        )}
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(parseISO(lastSaved), 'HH:mm', { locale: ja })}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass-effect">
                  最終保存:{' '}
                  {format(parseISO(lastSaved), 'yyyy年MM月dd日 HH:mm:ss', {
                    locale: ja
                  })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="hover-lift"
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
                className="hover-lift"
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-primary/10 hover-lift"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="glass-effect">
                    編集する
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="hover:bg-destructive/10 hover-lift"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="glass-effect">
                    削除する
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </motion.div>

      <ScrollArea className="flex-grow scrollbar-fancy">
        <motion.div
          className="p-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-md">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {editableKnowledge.createdAt
              ? format(
                  parseISO(editableKnowledge.createdAt),
                  'yyyy年MM月dd日 (EEEE)',
                  {
                    locale: ja
                  }
                )
              : '日付なし'}
          </div>

          {isEditing ? (
            <Textarea
              ref={contentTextareaRef}
              className="min-h-[300px] focus-visible:ring-1 note-paper p-3"
              value={editableKnowledge.content}
              onChange={(e) =>
                setEditableKnowledge({
                  ...editableKnowledge,
                  content: e.target.value
                })
              }
              placeholder="メモを入力..."
            />
          ) : (
            <div
              className="prose prose-sm max-w-none note-paper p-5 rounded-lg"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {editableKnowledge.content || (
                <div className="text-muted-foreground italic ink-annotation">
                  内容がありません。編集ボタンをクリックして内容を追加してください。
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center text-sm font-medium mb-2">
              <TagIcon className="h-4 w-4 mr-2 text-primary" />
              タグ
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <AnimatePresence>
                {editableKnowledge.tags &&
                  editableKnowledge.tags.map((tag, index) => (
                    <motion.div
                      key={tag + index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      className="hover-lift"
                    >
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 h-auto text-xs flex items-center space-x-1 shadow-sm"
                      >
                        <span>{tag}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTag(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {isEditing && (
                <div className="flex items-center space-x-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="新しいタグ"
                    className="w-24 h-7 text-xs focus-visible:ring-primary/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAddTag}
                    className="h-7 w-7 hover:bg-primary/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {(!editableKnowledge.tags ||
                editableKnowledge.tags.length === 0) &&
                !isEditing && (
                  <span className="text-xs text-muted-foreground">
                    タグがありません
                  </span>
                )}
            </div>
          </div>
        </motion.div>
      </ScrollArea>

      {isEditing && (
        <motion.div
          className="p-4 border-t flex justify-end space-x-2 bg-card/90 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="hover-lift"
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center hover-lift"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </motion.div>
      )}
    </Card>
  )
}

export default KnowledgeSingleView
