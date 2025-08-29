import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useBoardStore from '../../store/boardStore'
import Modal from '../common/Modal'
import Button from '../common/Button'

const Card = ({ card }) => {
  const { updateCard, deleteCard } = useBoardStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(card.title)
  const [editDescription, setEditDescription] = useState(card.description || '')
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (editTitle.trim()) {
      await updateCard(card.id, { 
        title: editTitle.trim(),
        description: editDescription.trim() || null
      })
      setIsModalOpen(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('이 카드를 삭제하시겠습니까?')) {
      deleteCard(card.id)
      setIsModalOpen(false)
    }
  }

  const handleModalClose = () => {
    setEditTitle(card.title)
    setEditDescription(card.description || '')
    setIsModalOpen(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className={`
          bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-grab
          hover:shadow-md transition-shadow duration-200
          ${isDragging ? 'opacity-50' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-gray-900 flex-1">
            {card.title}
          </h4>
        </div>
        
        {card.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {card.description}
          </p>
        )}
      </div>

      {/* 카드 상세 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="카드 상세"
      >
        <div className="space-y-4">
          {/* 제목 편집 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="카드 제목을 입력하세요..."
            />
          </div>

          {/* 설명 편집 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="카드 설명을 입력하세요..."
            />
          </div>

          {/* 버튼들 */}
          <div className="flex justify-between pt-4">
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
            >
              삭제
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="small"
                onClick={handleModalClose}
              >
                취소
              </Button>
              <Button
                size="small"
                onClick={handleSave}
                disabled={!editTitle.trim()}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Card