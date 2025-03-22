import { format } from 'date-fns'
import { Trash2, Save, X } from 'lucide-react'
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
import { Knowledge, addKnowledge, updateKnowledge } from '@/lib/db'
import { useKnowledge } from '../use-knowledge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface KnowledgeDisplayProps {
  knowledge: Knowledge | null
  onKnowledgeSaved?: () => void
}

export function KnowledgeDisplay({
  knowledge,
  onKnowledgeSaved
}: KnowledgeDisplayProps) {
  const [mail, setMail] = useKnowledge()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<Knowledge, 'id'>>({
    name: '',
    subject: '',
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
        name: knowledge.name,
        subject: knowledge.subject,
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
        name: knowledge.name,
        subject: knowledge.subject,
        text: knowledge.text,
        date: knowledge.date,
        labels: knowledge.labels,
        read: knowledge.read || false
      })
      setLabelsInput(knowledge.labels.join(', '))
      setHasChanges(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!knowledge && !mail.isCreating}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>ゴミ箱に入れる</TooltipContent>
          </Tooltip>
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
      <Separator />

      {knowledge || mail.isCreating ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={formData.name || 'New Knowledge'} />
                <AvatarFallback>
                  {formData.name
                    ? formData.name
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  className="line-clamp-1 text-xs border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="件名を入力"
                  name="subject"
                  value={formData.subject}
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
          <Separator />
          <div className="flex-1 p-4">
            <Textarea
              className="w-full h-full min-h-[200px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="内容を入力"
              name="text"
              value={formData.text}
              onChange={handleChange}
            />
          </div>
          <Separator className="mt-auto" />
          <div className="p-4">
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
