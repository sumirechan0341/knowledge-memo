import { atom, useAtom } from 'jotai'
import { Knowledge, knowledges } from './data'

type Config = {
  selected: Knowledge['id'] | null
}

const configAtom = atom<Config>({
  selected: knowledges.length > 0 ? knowledges[0].id : null
})

export function useKnowledge() {
  return useAtom(configAtom)
}
