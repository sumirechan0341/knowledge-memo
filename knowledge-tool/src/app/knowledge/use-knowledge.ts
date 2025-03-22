import { atom, useAtom } from 'jotai'
import { Knowledge } from '@/lib/db'

type Config = {
  selected: Knowledge['id'] | null
}

const configAtom = atom<Config>({
  selected: null
})

export function useKnowledge() {
  return useAtom(configAtom)
}
