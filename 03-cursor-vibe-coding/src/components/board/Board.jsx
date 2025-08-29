import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Column from './Column'
import Card from './Card'
import Button from '../common/Button'
import useBoardStore from '../../store/boardStore'

const Board = () => {
  const { 
    currentBoard, 
    columns, 
    cards,
    addColumn, 
    moveCard,
    isLoading,
    error 
  } = useBoardStore()
  
  const [activeCard, setActiveCard] = useState(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event) => {
    const { active } = event
    const card = cards.find(card => card.id === active.id)
    setActiveCard(card)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeCard = cards.find(card => card.id === active.id)
    if (!activeCard) return

    const overId = over.id
    const overColumn = columns.find(col => col.id === overId)
    const overCard = cards.find(card => card.id === overId)

    let newColumnId = activeCard.column_id
    let newPosition = activeCard.position

    if (overColumn) {
      // 컬럼 위에 드롭된 경우 - 해당 컬럼의 마지막 위치에 추가
      newColumnId = overColumn.id
      const columnCards = cards.filter(card => card.column_id === overColumn.id && card.id !== activeCard.id)
      newPosition = columnCards.length
    } else if (overCard && overCard.id !== activeCard.id) {
      // 다른 카드 위에 드롭된 경우
      newColumnId = overCard.column_id
      
      // 모든 컬럼 카드를 가져와서 정렬 (activeCard 제외하지 않음)
      const allColumnCards = cards
        .filter(card => card.column_id === overCard.column_id)
        .sort((a, b) => a.position - b.position)
      
      const overIndex = allColumnCards.findIndex(card => card.id === overCard.id)
      
      // 같은 컬럼 내에서 이동하는 경우
      if (newColumnId === activeCard.column_id) {
        const activeIndex = allColumnCards.findIndex(card => card.id === activeCard.id)
        
        // 위로 이동하는 경우
        if (activeIndex > overIndex) {
          newPosition = overIndex
        } else {
          // 아래로 이동하는 경우
          newPosition = overIndex
        }
      } else {
        // 다른 컬럼으로 이동하는 경우
        newPosition = overIndex
      }
    }

    // 실제로 위치가 변경된 경우에만 업데이트
    if (newColumnId !== activeCard.column_id || newPosition !== activeCard.position) {
      console.log('Moving card:', {
        cardId: activeCard.id,
        from: { columnId: activeCard.column_id, position: activeCard.position },
        to: { columnId: newColumnId, position: newPosition }
      })
      
      // 카드 이동 및 다른 카드들 위치 재정렬
      await reorderCardsAndMove(activeCard, newColumnId, newPosition)
    }
  }

  // 카드 이동 및 다른 카드들 위치 재정렬
  const reorderCardsAndMove = async (activeCard, newColumnId, newPosition) => {
    try {
      // 1. 먼저 이동할 카드의 새 위치 설정
      await moveCard(activeCard.id, newColumnId, newPosition)
      
      // 2. 같은 컬럼 내의 다른 카드들 위치 재정렬
      const targetColumnCards = cards
        .filter(card => card.column_id === newColumnId && card.id !== activeCard.id)
        .sort((a, b) => a.position - b.position)
      
      // 3. 새로운 위치에 따라 다른 카드들의 position 업데이트
      const updates = []
      
      targetColumnCards.forEach((card, index) => {
        const expectedPosition = index >= newPosition ? index + 1 : index
        if (card.position !== expectedPosition) {
          updates.push({ cardId: card.id, position: expectedPosition })
        }
      })
      
      // 4. 원래 컬럼이 다른 경우, 원래 컬럼의 카드들도 재정렬
      if (activeCard.column_id !== newColumnId) {
        const originalColumnCards = cards
          .filter(card => card.column_id === activeCard.column_id && card.id !== activeCard.id)
          .sort((a, b) => a.position - b.position)
        
        originalColumnCards.forEach((card, index) => {
          if (card.position !== index) {
            updates.push({ cardId: card.id, position: index })
          }
        })
      }
      
      // 5. 일괄 업데이트 실행
      if (updates.length > 0) {
        console.log('Updating card positions:', updates)
        for (const update of updates) {
          await moveCard(update.cardId, null, update.position)
        }
      }
    } catch (error) {
      console.error('Error reordering cards:', error)
    }
  }

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      await addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setIsAddingColumn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">오류: {error}</div>
      </div>
    )
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">보드를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 보드 헤더 */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentBoard.name}
        </h1>
      </div>

      {/* 보드 콘텐츠 */}
      <div className="flex-1 p-4 md:p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 md:space-x-6 min-h-full pb-4">
            <SortableContext
              items={columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns
                .sort((a, b) => a.position - b.position)
                .map(column => (
                  <Column key={column.id} column={column} />
                ))}
            </SortableContext>

            {/* 컬럼 추가 */}
            <div className="flex-shrink-0 w-72 md:w-80">
              {isAddingColumn ? (
                <div className="bg-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="컬럼 제목을 입력하세요..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddColumn()
                      }
                      if (e.key === 'Escape') {
                        setIsAddingColumn(false)
                        setNewColumnTitle('')
                      }
                    }}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="small" 
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim()}
                    >
                      추가
                    </Button>
                    <Button 
                      size="small" 
                      variant="secondary" 
                      onClick={() => {
                        setIsAddingColumn(false)
                        setNewColumnTitle('')
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-gray-600 hover:text-gray-700"
                >
                  <span className="text-lg mr-2">+</span>
                  컬럼 추가
                </Button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 scale-105 shadow-2xl">
                <Card card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default Board