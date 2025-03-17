'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Archive,
  Copy,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  Star,
  Trash2,
  Edit,
  Check,
  Tag,
  Save,
  Plus,
  Pencil
} from 'lucide-react'
import { Knowledge, updateKnowledge, deleteKnowledge } from '@/lib/db'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface KnowledgeDisplayProps {
  knowledge: Knowledge | null
  onRefresh: () => void
}

export function KnowledgeDisplay({
  knowledge,
  onRefresh
}: KnowledgeDisplayProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState('')
  const [editedContent, setEditedContent] = React.useState('')
  const [editedTags, setEditedTags] = React.useState<string[]>([])
  const [newTag, setNewTag] = React.useState('')

  // 編集モードが変更されたときに状態を更新
  React.useEffect(() => {
    if (knowledge) {
      setEditedTitle(knowledge.title)
      setEditedContent(knowledge.content)
      setEditedTags(knowledge.tags || [])
    }
  }, [knowledge, isEditing])

  const handleSave = async () => {
    if (!knowledge?.id) return

    try {
      await updateKnowledge({
        id: knowledge.id,
        title: editedTitle,
        content: editedContent,
        createdAt: knowledge.createdAt,
        tags: editedTags
      })
      setIsEditing(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to update knowledge:', error)
    }
  }

  const handleDelete = async () => {
    if (!knowledge?.id) return

    try {
      await deleteKnowledge(knowledge.id)
      onRefresh()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete knowledge:', error)
    }
  }

  const handleCopy = () => {
    if (!knowledge) return

    const textContent = `${knowledge.title}\n\n${knowledge.content}`
    navigator.clipboard
      .writeText(textContent)
      .then(() => {
        // コピー成功通知を表示することもできる
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!knowledge}>
                <Star className="h-4 w-4" />
                <span className="sr-only">お気に入り</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>お気に入りに追加</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!knowledge}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">アーカイブ</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>アーカイブ</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!knowledge}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>削除</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!knowledge}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">リマインダー</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">
                    リマインダー設定
                  </div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      今日の後で
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      明日
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      今週末
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      来週
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>リマインダー</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!knowledge}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
                <span className="sr-only">{isEditing ? '保存' : '編集'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isEditing ? '編集完了' : '編集'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!knowledge}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">複製</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>複製</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!knowledge}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">共有</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>共有</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!knowledge}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">その他</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              <span>コピー</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>編集</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {knowledge ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarFallback>
                  {knowledge.title
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-7 text-base font-semibold"
                  />
                ) : (
                  <div className="font-semibold text-base">
                    {knowledge.title || '無題'}
                  </div>
                )}
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">作成日:</span>{' '}
                  {knowledge.createdAt &&
                    format(parseISO(knowledge.createdAt), 'yyyy年MM月dd日', {
                      locale: ja
                    })}
                </div>
              </div>
            </div>
            {knowledge.createdAt && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(parseISO(knowledge.createdAt), 'PPpp', { locale: ja })}
              </div>
            )}
          </div>
          <Separator />

          {/* メインコンテンツ */}
          <div className="flex-1 p-4">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  placeholder="内容を入力..."
                />

                <div>
                  <Label
                    htmlFor="tags"
                    className="mb-2 block text-sm font-medium"
                  >
                    タグ
                  </Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editedTags.map((tag, i) => (
                      <Badge
                        key={i}
                        className="bg-primary/20 text-primary hover:bg-primary/30 gap-1 pl-2"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-primary/20 h-4 w-4 inline-flex items-center justify-center"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <span className="sr-only">{tag}を削除</span>×
                        </button>
                      </Badge>
                    ))}
                    {editedTags.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        タグはありません
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="new-tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="新しいタグを追加..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      <Plus className="h-4 w-4 mr-1" />
                      追加
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {knowledge.content || '内容がありません。'}
                </div>

                {knowledge.tags && knowledge.tags.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">タグ</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {knowledge.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
          <div className="mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium">
            ナレッジが選択されていません
          </h3>
          <p className="max-w-sm text-sm">
            左のリストからナレッジを選択するか、新しいナレッジを作成してください。
          </p>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。このナレッジは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
