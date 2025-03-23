import { format } from 'date-fns'
import { Trash2, Save, X, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Knowledge,
  addKnowledge,
  updateKnowledge,
  moveToTrash,
  restoreFromTrash
} from '@/lib/db'
import { useKnowledge } from '../use-knowledge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { highlightText } from '@/lib/highlight-text'

interface KnowledgeDisplayProps {
  knowledge: Knowledge | null
  onKnowledgeSaved?: () => void
  searchTerm?: string
}

export function KnowledgeDisplay({
  knowledge,
  onKnowledgeSaved,
  searchTerm = ''
}: KnowledgeDisplayProps) {
  const [mail, setMail] = useKnowledge()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<Knowledge, 'id'>>({
    title: '',
    text: '',
    date: new Date().toISOString(),
    labels: [],
    read: false
  })
  const [labelsInput, setLabelsInput] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // 既存のナレッジが選択された場合、またはtempKnowledgeが設定された場合、フォームデータを更新
  useEffect(() => {
    if (mail.isCreating && mail.tempKnowledge) {
      setFormData(mail.tempKnowledge)
      setLabelsInput(mail.tempKnowledge.labels.join(', '))
      setHasChanges(false)
    } else if (knowledge) {
      setFormData({
        title: knowledge.title,
        text: knowledge.text,
        date: knowledge.date,
        labels: knowledge.labels,
        read: knowledge.read || false
      })
      setLabelsInput(knowledge.labels.join(', '))
      setHasChanges(false)
    }
  }, [knowledge, mail.isCreating, mail.tempKnowledge])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelsInput(e.target.value)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setIsSubmitting(true)

    try {
      // ラベルをカンマ区切りで分割し、トリムして空の値を除外
      const labels = labelsInput
        .split(',')
        .map((label) => label.trim())
        .filter((label) => label !== '')

      const dataToSave = {
        ...formData,
        labels
      }

      if (mail.isCreating) {
        // 新しいナレッジを追加
        await addKnowledge(dataToSave)

        // 編集モードを終了
        setMail({
          ...mail,
          isCreating: false,
          tempKnowledge: null
        })
      } else if (knowledge) {
        // 既存のナレッジを更新
        await updateKnowledge({
          ...dataToSave,
          id: knowledge.id
        })
      }

      // 変更フラグをリセット
      setHasChanges(false)

      // 親コンポーネントに通知
      if (onKnowledgeSaved) {
        onKnowledgeSaved()
      }
    } catch (error) {
      console.error('Failed to save knowledge:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (mail.isCreating) {
      setMail({
        ...mail,
        isCreating: false,
        tempKnowledge: null
      })
    } else if (knowledge) {
      // 元のデータに戻す
      setFormData({
        title: knowledge.title,
        text: knowledge.text,
        date: knowledge.date,
        labels: knowledge.labels,
        read: knowledge.read || false
      })
      setLabelsInput(knowledge.labels.join(', '))
      setHasChanges(false)
    }
  }

  const handleMoveToTrash = async () => {
    if (knowledge?.id) {
      try {
        await moveToTrash(knowledge.id)
        // 親コンポーネントに通知
        if (onKnowledgeSaved) {
          onKnowledgeSaved()
        }
      } catch (error) {
        console.error('Failed to move knowledge to trash:', error)
      }
    }
  }

  const handleRestoreFromTrash = async () => {
    if (knowledge?.id) {
      try {
        await restoreFromTrash(knowledge.id)
        // 親コンポーネントに通知
        if (onKnowledgeSaved) {
          onKnowledgeSaved()
        }
      } catch (error) {
        console.error('Failed to restore knowledge from trash:', error)
      }
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex items-center p-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {knowledge?.path === '/trashbox' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!knowledge || mail.isCreating}
                  onClick={handleRestoreFromTrash}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Restore from trash</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>ゴミ箱から復元</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!knowledge || mail.isCreating}
                  onClick={handleMoveToTrash}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Move to trash</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>ゴミ箱に入れる</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(hasChanges || mail.isCreating) && (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              {hasChanges && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <Separator className="flex-shrink-0" />

      {knowledge || mail.isCreating ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4 flex-shrink-0">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={formData.title || 'New Knowledge'} />
                <AvatarFallback>
                  {formData.title
                    ? formData.title
                        .split(' ')
                        .map((chunk) => chunk[0])
                        .join('')
                    : 'NK'}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <Input
                  className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="名前を入力"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">タグ:</span>{' '}
                  <Input
                    className="inline-block w-auto border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="タグをカンマ区切りで入力"
                    value={labelsInput}
                    onChange={handleLabelsChange}
                  />
                </div>
              </div>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {mail.isCreating
                ? '新規作成中'
                : knowledge?.date && format(new Date(knowledge.date), 'PPpp')}
            </div>
          </div>
          <Separator className="flex-shrink-0" />
          <div className="flex-1 p-4 overflow-auto">
            {mail.isCreating || hasChanges ? (
              <Textarea
                className="w-full h-full min-h-[200px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="内容を入力"
                name="text"
                value={formData.text}
                onChange={handleChange}
              />
            ) : (
              <div className="w-full h-full min-h-[200px] whitespace-pre-wrap">
                {searchTerm
                  ? highlightText(formData.text, searchTerm)
                  : formData.text}
              </div>
            )}
          </div>
          <Separator className="mt-auto flex-shrink-0" />
          <div className="p-4 flex-shrink-0">
            <form>
              <div className="grid gap-4">
                <Textarea className="p-4" placeholder={`コメントを追加...`} />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch id="mute" aria-label="Mute thread" />{' '}
                    お気に入りに追加
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    送信
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          選択されたナレッジはありません
        </div>
      )}
    </div>
  )
}
