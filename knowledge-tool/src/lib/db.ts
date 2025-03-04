import { openDB, IDBPDatabase, DBSchema } from 'idb'

export interface Journal {
  id?: number
  date: string
  content: string
}

interface KnowledgeDB extends DBSchema {
  journals: {
    key: number
    value: Journal
    indexes: {
      // "by-date" インデックスは、Journal の date プロパティに基づいて検索できるようにするためのものです。
      'by-date': string
    }
  }
}

const DB_NAME = 'knowledgeDB'
const DB_VERSION = 1
const STORE_NAME = 'journals'

async function initDB(): Promise<IDBPDatabase<KnowledgeDB>> {
  return openDB<KnowledgeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        })
        // 例として日付での検索が必要なら、インデックスを作成します。
        store.createIndex('by-date', 'date')
      }
    }
  })
}

export async function addJournal(journal: Journal): Promise<number> {
  const db = await initDB()
  return db.add(STORE_NAME, journal)
}

export async function getJournals(): Promise<Journal[]> {
  const db = await initDB()
  return db.getAll(STORE_NAME)
}

export async function updateJournal(journal: Journal): Promise<void> {
  const db = await initDB()
  await db.put(STORE_NAME, journal)
}

export async function deleteJournal(id: number): Promise<void> {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}
