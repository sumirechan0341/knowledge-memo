// lib/db.ts
import { openDB, DBSchema } from 'idb'

// ナレッジのデータ型定義
export interface Knowledge {
  id?: number // オートインクリメントされるキー
  title: string
  content: string
  createdAt: string // ISO形式の日時
  tags?: string[]
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

// ナレッジデータをすべて取得する関数
export async function getKnowledgeItems(): Promise<Knowledge[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
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
