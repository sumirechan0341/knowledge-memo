// lib/db.ts
import { openDB, DBSchema } from 'idb'

// ナレッジのデータ型定義
export interface Knowledge {
  id?: number
  name: string
  subject: string
  text: string
  date: string
  labels: string[]
  read?: boolean
}

// IndexedDBのスキーマ定義
interface KnowledgeDB extends DBSchema {
  knowledge: {
    key: number
    value: Knowledge
    indexes: { 'by-createdAt': string }
  }
}

const DB_NAME = 'knowledge-db'
const DB_VERSION = 1
const STORE_NAME = 'knowledge'

// IndexedDBを開く関数（DBが存在しなければ作成・アップグレード処理を行う）
async function getDB() {
  return openDB<KnowledgeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true
      })
      store.createIndex('by-createdAt', 'createdAt')
    }
  })
}

// ナレッジデータをすべて取得する関数（更新日時の新しい順）
export async function getKnowledgeItems(): Promise<Knowledge[]> {
  const db = await getDB()
  const items = await db.getAll(STORE_NAME)

  // 日付の新しい順（降順）にソート
  return items.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

// 新しいナレッジデータを追加する関数
export async function addKnowledge(
  item: Omit<Knowledge, 'id'>
): Promise<number> {
  const db = await getDB()
  return db.add(STORE_NAME, item)
}

// 既存のナレッジデータを更新する関数
export async function updateKnowledge(item: Knowledge): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, item)
}

// ナレッジデータを削除する関数
export async function deleteKnowledge(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// モックデータをIndexedDBに初期化する関数
export async function initializeDBWithMockData(
  mockData: Knowledge[]
): Promise<void> {
  const db = await getDB()

  // 現在のデータ数を確認
  const count = await db.count(STORE_NAME)

  // データが存在しない場合のみ初期化
  if (count === 0) {
    const tx = db.transaction(STORE_NAME, 'readwrite')

    // 各モックデータを追加
    for (const item of mockData) {
      await tx.store.add(item)
    }

    await tx.done
    console.log('IndexedDB initialized with mock data')
  } else {
    console.log('IndexedDB already contains data, skipping initialization')
  }
}
