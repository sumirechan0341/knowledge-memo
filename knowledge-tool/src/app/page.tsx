'use client'
import React, { useState } from 'react'
import JournalCollectionView from '../components/JournalCollectionView'
import JournalSingleView from '../components/JournalSingleView'
import { addJournal, Journal } from '../lib/db'

const Home: React.FC = () => {
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSelectJournal = (journal: Journal) => {
    setSelectedJournal(journal)
  }

  const handleCreateNew = async () => {
    // 初期値を設定して新規ジャーナルを追加する
    const newJournal: Journal = {
      date: new Date().toISOString().split('T')[0], // 今日の日付
      content: ''
    }
    const newId = await addJournal(newJournal)
    // 作成したエントリを選択状態にする
    setSelectedJournal({ ...newJournal, id: newId })
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <JournalCollectionView
          onSelectJournal={handleSelectJournal}
          refreshTrigger={refreshTrigger}
          onCreateNew={async () => {
            await handleCreateNew()
            // 必要に応じてリフレッシュトリガーを更新する
            setRefreshTrigger((prev) => prev + 1)
          }}
        />
      </div>
      <div style={{ flex: 2 }}>
        <JournalSingleView
          journal={selectedJournal}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          onDeselect={() => setSelectedJournal(null)}
        />
      </div>
    </div>
  )
}

export default Home
