import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import { supabase } from '../lib/supabaseClient'

const HomePage = () => {
  const [boards, setBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBoards(data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createBoard = async () => {
    if (!newBoardName.trim()) return

    try {
      setIsCreating(true)
      
      // slug 생성 (간단한 버전)
      const slug = newBoardName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const { data, error } = await supabase
        .from('boards')
        .insert({
          name: newBoardName.trim(),
          slug: slug
        })
        .select()
        .single()

      if (error) throw error

      // 기본 컬럼들 생성
      const defaultColumns = [
        { title: '할 일', position: 0 },
        { title: '진행 중', position: 1 },
        { title: '완료', position: 2 }
      ]

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(
          defaultColumns.map(col => ({
            ...col,
            board_id: data.id
          }))
        )

      if (columnsError) throw columnsError

      setBoards([data, ...boards])
      setNewBoardName('')
      setIsCreating(false)
    } catch (error) {
      setError(error.message)
      setIsCreating(false)
    }
  }

  const deleteBoard = async (boardId) => {
    if (!window.confirm('이 보드를 삭제하시겠습니까? 모든 컬럼과 카드가 함께 삭제됩니다.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId)

      if (error) throw error

      setBoards(boards.filter(board => board.id !== boardId))
    } catch (error) {
      setError(error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 md:py-8 px-4">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            칸반 보드
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            프로젝트를 효율적으로 관리하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 새 보드 생성 */}
        <div className="mb-6 md:mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            새 보드 만들기
          </h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="보드 이름을 입력하세요..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createBoard()
                }
              }}
            />
            <Button
              onClick={createBoard}
              disabled={!newBoardName.trim() || isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? '생성 중...' : '보드 생성'}
            </Button>
          </div>
        </div>

        {/* 보드 목록 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            내 보드들
          </h2>
          
          {boards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">📋</div>
              <p className="text-gray-600">
                아직 생성된 보드가 없습니다. 첫 번째 보드를 만들어보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map(board => (
                <div
                  key={board.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {board.name}
                    </h3>
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                      title="보드 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    생성일: {new Date(board.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  
                  <Link to={`/board/${board.slug}`}>
                    <Button className="w-full">
                      보드 열기
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage