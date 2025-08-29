import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from './Card'
import Button from '../common/Button'
import useBoardStore from '../../store/boardStore'

const Column = ({ column }) => {
  const { cards, addCard, updateColumn, deleteColumn } = useBoardStore()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  // 이 컬럼에 속한 카드들만 필터링
  const columnCards = cards.filter(card => card.column_id === column.id)
    .sort((a, b) => a.position - b.position)

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await addCard(column.id, newCardTitle.trim())
      setNewCardTitle('')
      setIsAddingCard(false)
    }
  }

  const handleEditColumn = () => {
    const newTitle = prompt('컬럼 제목을 수정하세요:', column.title)
    if (newTitle && newTitle !== column.title) {
      updateColumn(column.id, { title: newTitle })
    }
  }

  const handleDeleteColumn = () => {
    if (window.confirm('이 컬럼과 모든 카드를 삭제하시겠습니까?')) {
      deleteColumn(column.id)
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-72 md:w-80 flex-shrink-0 shadow-sm border border-gray-200">
      {/* 컬럼 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base">
            {column.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {columnCards.length}개 카드
          </p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={handleEditColumn}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-white"
            title="컬럼 수정"
          >
            ✏️
          </button>
          <button
            onClick={handleDeleteColumn}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-white"
            title="컬럼 삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* 카드 목록 */}
      <div
        ref={setNodeRef}
        className="min-h-[200px] space-y-2"
      >
        <SortableContext 
          items={columnCards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnCards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* 카드 추가 */}
      <div className="mt-4">
        {isAddingCard ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="카드 제목을 입력하세요..."
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCard()
                }
              }}
            />
            <div className="flex space-x-2">
              <Button 
                size="small" 
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
              >
                추가
              </Button>
              <Button 
                size="small" 
                variant="secondary" 
                onClick={() => {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="small"
            onClick={() => setIsAddingCard(true)}
            className="w-full"
          >
            + 카드 추가
          </Button>
        )}
      </div>
    </div>
  )
}

export default Column