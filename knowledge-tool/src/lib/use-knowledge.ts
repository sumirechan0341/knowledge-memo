import { atom, useAtom } from 'jotai'
import { Knowledge } from '@/lib/db'

type KnowledgeConfig = {
  selected: Knowledge['id'] | null
  collection: string | null
  tag: string | null
  view: 'all' | 'recent' | 'favorites'
}

const knowledgeConfigAtom = atom<KnowledgeConfig>({
  selected: null,
  collection: null,
  tag: null,
  view: 'all'
})

export function useKnowledge() {
  return useAtom(knowledgeConfigAtom)
}
