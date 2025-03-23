// lib/db.ts
import { openDB, DBSchema } from 'idb'

// ナレッジのデータ型定義
export interface Knowledge {
  id?: number
  title: string
  text: string
  date: string
  labels: string[]
  read?: boolean
  path?: string // パスベースの整理 (例: '/trashbox' はゴミ箱に入ったナレッジ)
  originalPath?: string // ゴミ箱に移動する前の元のパス
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

// ナレッジデータをすべて取得する関数（更新日時の新しい順、デフォルトではゴミ箱以外）
export async function getKnowledgeItems(
  includeTrash: boolean = false
): Promise<Knowledge[]> {
  const db = await getDB()
  const items = await db.getAll(STORE_NAME)

  // ゴミ箱のアイテムを除外（includeTrashがtrueの場合は含める）
  const filtered = includeTrash
    ? items
    : items.filter((item) => item.path !== '/trashbox')

  // 日付の新しい順（降順）にソート
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

// 検索ワードでナレッジデータを検索する関数
export async function searchKnowledgeItems(
  searchTerm: string,
  includeTrash: boolean = false
): Promise<Knowledge[]> {
  // 検索ワードが空の場合は全てのアイテムを返す
  if (!searchTerm.trim()) {
    return getKnowledgeItems(includeTrash)
  }

  const db = await getDB()
  const items = await db.getAll(STORE_NAME)

  // 検索ワードで絞り込み（タイトルと本文で検索）
  const searchTermLower = searchTerm.toLowerCase()
  const filtered = items.filter((item) => {
    // ゴミ箱のアイテムを除外（includeTrashがtrueの場合は含める）
    if (!includeTrash && item.path === '/trashbox') {
      return false
    }

    return (
      item.title.toLowerCase().includes(searchTermLower) ||
      item.text.toLowerCase().includes(searchTermLower)
    )
  })

  // 日付の新しい順（降順）にソート
  return filtered.sort((a, b) => {
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

// ナレッジデータをゴミ箱に移動する関数
export async function moveToTrash(id: number): Promise<void> {
  const db = await getDB()
  const knowledge = await db.get(STORE_NAME, id)
  if (knowledge) {
    // 元のパスを保存
    knowledge.originalPath = knowledge.path || ''
    knowledge.path = '/trashbox'
    await db.put(STORE_NAME, knowledge)
  }
}

// ナレッジデータを完全に削除する関数
export async function deleteKnowledge(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// ゴミ箱からナレッジを元に戻す関数
export async function restoreFromTrash(id: number): Promise<void> {
  const db = await getDB()
  const knowledge = await db.get(STORE_NAME, id)
  if (knowledge && knowledge.path === '/trashbox') {
    // 元のパスに戻す
    knowledge.path = knowledge.originalPath || ''
    knowledge.originalPath = undefined // 元のパス情報をクリア
    await db.put(STORE_NAME, knowledge)
  }
}

// ゴミ箱内のすべてのナレッジを完全に削除する関数
export async function emptyTrash(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const items = await tx.store.getAll()

  for (const item of items) {
    if (item.path === '/trashbox' && item.id !== undefined) {
      await tx.store.delete(item.id)
    }
  }

  await tx.done
}

// 特定のパスのナレッジデータを取得する関数
export async function getKnowledgeItemsByPath(
  path: string | null
): Promise<Knowledge[]> {
  const db = await getDB()
  const items = await db.getAll(STORE_NAME)

  // パスでフィルタリング
  const filtered = path
    ? items.filter((item) => item.path === path)
    : items.filter((item) => !item.path || item.path === '') // パスなしのアイテム

  // 日付の新しい順（降順）にソート
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
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
