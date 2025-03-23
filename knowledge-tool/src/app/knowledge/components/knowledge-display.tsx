import { format } from 'date-fns'
import { Trash2, Save, X, RotateCcw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

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
// import { highlightText } from '@/lib/highlight-text'

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
  const [selectedKnowledge, setSelectedKnowledge] = useKnowledge()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<Knowledge, 'id'>>({
    title: '',
    text: '',
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    labels: [],
    read: false
  })
  const [labelsInput, setLabelsInput] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  // レンダリング更新用のバージョン状態
  const [renderVersion, setRenderVersion] = useState(0)

  // 既存のナレッジが選択された場合、またはtempKnowledgeが設定された場合、フォームデータを更新
  useEffect(() => {
    if (selectedKnowledge.isCreating && selectedKnowledge.tempKnowledge) {
      setFormData(selectedKnowledge.tempKnowledge)
      setLabelsInput(selectedKnowledge.tempKnowledge.labels.join(', '))
      setHasChanges(false)
    } else if (knowledge) {
      setFormData({
        title: knowledge.title,
        text: knowledge.text,
        date: knowledge.date,
        updatedAt: knowledge.updatedAt || knowledge.date,
        labels: knowledge.labels,
        read: knowledge.read || false
      })
      setLabelsInput(knowledge.labels.join(', '))
      setHasChanges(false)
    }
  }, [
    knowledge,
    selectedKnowledge.isCreating,
    selectedKnowledge.tempKnowledge,
    renderVersion,
    selectedKnowledge.selected
  ])

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
  const handleSave = useCallback(async () => {
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

      if (selectedKnowledge.isCreating) {
        // 新しいナレッジを追加
        const newKnowledgeId = await addKnowledge(dataToSave)

        // 編集モードを終了し、新しく作成したナレッジを選択状態にする
        setSelectedKnowledge({
          ...selectedKnowledge,
          isCreating: false,
          tempKnowledge: null,
          selected: newKnowledgeId
        })

        toast.success('新しいナレッジを作成しました')
      } else if (knowledge) {
        // 既存のナレッジを更新
        const updatedKnowledge = {
          ...dataToSave,
          id: knowledge.id,
          path: knowledge.path,
          originalPath: knowledge.originalPath
        }

        await updateKnowledge(updatedKnowledge)

        // フォームデータを更新して表示を反映
        setFormData({
          title: updatedKnowledge.title,
          text: updatedKnowledge.text,
          date: updatedKnowledge.date,
          updatedAt: updatedKnowledge.updatedAt,
          labels: updatedKnowledge.labels,
          read: updatedKnowledge.read || false
        })

        toast.success('ナレッジを保存しました')
      }

      // 変更フラグをリセット
      setHasChanges(false)

      // レンダリング更新のためにバージョンをインクリメント
      setRenderVersion((prev) => prev + 1)

      // 親コンポーネントに通知（新規作成時と既存ナレッジ更新時の両方）
      if (onKnowledgeSaved) {
        onKnowledgeSaved()
      }
    } catch (error) {
      console.error('Failed to save knowledge:', error)
      toast.error('ナレッジの保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    hasChanges,
    labelsInput,
    formData,
    selectedKnowledge,
    knowledge,
    setSelectedKnowledge,
    onKnowledgeSaved,
    setRenderVersion
  ])

  // Ctrl+Sでの保存を有効にする
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Windows) または Command+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // ブラウザのデフォルト保存動作を防止
        if (hasChanges) {
          handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave, hasChanges])

  const handleCancel = () => {
    if (selectedKnowledge.isCreating) {
      setSelectedKnowledge({
        ...selectedKnowledge,
        isCreating: false,
        tempKnowledge: null
      })
    } else if (knowledge) {
      // 元のデータに戻す
      setFormData({
        title: knowledge.title,
        text: knowledge.text,
        date: knowledge.date,
        updatedAt: knowledge.updatedAt || knowledge.date,
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
        toast.success('ナレッジをゴミ箱に移動しました')
      } catch (error) {
        console.error('Failed to move knowledge to trash:', error)
        toast.error('ゴミ箱への移動に失敗しました')
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
        toast.success('ナレッジをゴミ箱から復元しました')
      } catch (error) {
        console.error('Failed to restore knowledge from trash:', error)
        toast.error('ゴミ箱からの復元に失敗しました')
      }
    }
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="flex items-center p-2 flex-shrink-0 h-[52px]">
        <div className="flex items-center gap-2">
          {knowledge?.path === '/trashbox' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!knowledge || selectedKnowledge.isCreating}
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
                  disabled={!knowledge || selectedKnowledge.isCreating}
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
          {(hasChanges || selectedKnowledge.isCreating) && (
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

      {knowledge || selectedKnowledge.isCreating ? (
        <div
          className="flex flex-1 flex-col"
          key={`${renderVersion}-${selectedKnowledge.selected}`}
        >
          <div className="flex items-start p-4 flex-shrink-0 items-center gap-x-5">
            <div className="flex items-start gap-4 text-sm flex-1">
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
              <div className="grid gap-1 flex-1">
                <Input
                  className="font-semibold border-none !text-4xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="タイトルを入力"
                  width={'100%'}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">タグ:</span>{' '}
                  <Input
                    className="inline-block w-auto border-none p-0 !text-base h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="タグをカンマ区切りで入力"
                    value={labelsInput}
                    width={'100%'}
                    onChange={handleLabelsChange}
                  />
                </div>
              </div>
            </div>
            <div className="ml-auto text-xs text-muted-foreground align-item-middle">
              {selectedKnowledge.isCreating ? (
                '新規作成中'
              ) : (
                <div className="flex flex-col items-end">
                  <div className="w-[180px]">
                    作成日時:{' '}
                    {knowledge?.date &&
                      format(new Date(knowledge.date), 'yyyy/MM/dd HH:mm:ss')}
                  </div>
                  <div className="w-[180px]">
                    更新日時:{' '}
                    {knowledge?.updatedAt
                      ? format(
                          new Date(knowledge.updatedAt),
                          'yyyy/MM/dd HH:mm:ss'
                        )
                      : knowledge?.date &&
                        format(new Date(knowledge.date), 'yyyy/MM/dd HH:mm:ss')}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Separator className="flex-shrink-0" />
          <div className="flex-1 p-4">
            <Textarea
              className="w-full min-h-[200px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="内容を入力"
              name="text"
              value={searchTerm && !hasChanges ? formData.text : formData.text}
              onChange={handleChange}
              readOnly={knowledge?.path === '/trashbox'}
            />
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
                  <div className="ml-auto flex gap-2">
                    <Button onClick={(e) => e.preventDefault()} size="sm">
                      AIで情報整理
                    </Button>
                    {/* <Button onClick={(e) => e.preventDefault()} size="sm">
                      送信
                    </Button> */}
                  </div>
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
