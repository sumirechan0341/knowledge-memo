import { atom, useAtom } from 'jotai'
import { Knowledge } from '@/lib/db'

type Config = {
  selected: Knowledge['id'] | null
  isCreating: boolean
  tempKnowledge: Omit<Knowledge, 'id'> | null
}

const configAtom = atom<Config>({
  selected: null,
  isCreating: false,
  tempKnowledge: null
})

export function useKnowledge() {
  return useAtom(configAtom)
}
