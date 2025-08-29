import React, { useEffect, useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Board from '../components/board/Board'
import Button from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import useBoardStore from '../store/boardStore'
import { supabase } from '../lib/supabaseClient'

const BoardPage = () => {
  const { slug } = useParams()
  const { showToast, ToastComponent } = useToast()
  const [realtimeStatus, setRealtimeStatus] = useState('DISCONNECTED')
  const { 
    currentBoard, 
    fetchBoardData, 
    isLoading, 
    error 
  } = useBoardStore()

  const handleFetchBoardData = useCallback(() => {
    if (slug) {
      fetchBoardData(slug)
    }
  }, [slug, fetchBoardData])

  useEffect(() => {
    handleFetchBoardData()
  }, [handleFetchBoardData])

  // Supabase 연결 상태 확인
  useEffect(() => {
    console.log('🔍 Checking Supabase connection...')
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL)
    console.log('Supabase client:', supabase)
    
    // 간단한 연결 테스트
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('boards').select('count').limit(1)
        if (error) {
          console.error('❌ Supabase connection test failed:', error)
        } else {
          console.log('✅ Supabase connection test successful:', data)
        }
      } catch (err) {
        console.error('❌ Supabase connection error:', err)
      }
    }
    
    testConnection()
  }, [])

  // 단순화된 포커스 이벤트 처리
  useEffect(() => {
    let focusTimeout = null
    let lastFocusTime = 0

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastFocusTime < 3000) return // 3초 내 중복 방지
      
      lastFocusTime = now
      console.log('🔍 Window focused - will refresh in 2 seconds')
      
      if (focusTimeout) clearTimeout(focusTimeout)
      focusTimeout = setTimeout(() => {
        if (currentBoard) {
          console.log('🔄 Executing focus refresh')
          handleFetchBoardData()
        }
      }, 2000) // 2초 지연
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && currentBoard) {
        const now = Date.now()
        if (now - lastFocusTime < 3000) return
        
        lastFocusTime = now
        console.log('👁️ Page became visible - will refresh in 2 seconds')
        
        if (focusTimeout) clearTimeout(focusTimeout)
        focusTimeout = setTimeout(() => {
          console.log('🔄 Executing visibility refresh')
          handleFetchBoardData()
        }, 2000) // 2초 지연
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (focusTimeout) clearTimeout(focusTimeout)
    }
  }, [currentBoard, handleFetchBoardData])

  // 주기적 데이터 새로고침 (백업 동기화)
  useEffect(() => {
    if (!currentBoard) return

    const interval = setInterval(() => {
      console.log('Periodic data refresh')
      handleFetchBoardData()
    }, 30000) // 30초마다 새로고침

    return () => clearInterval(interval)
  }, [currentBoard, handleFetchBoardData])

  useEffect(() => {
    if (!currentBoard) return

    console.log(`🚀 Setting up realtime subscription for board: ${currentBoard.name} (ID: ${currentBoard.id})`)
    
    // Supabase Realtime 구독 설정
    let updateTimeout = null
    
    const debouncedUpdate = (source) => {
      if (updateTimeout) clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        console.log(`⚡ ${source} change detected - fetching updated board data...`)
        handleFetchBoardData()
      }, 500) // 500ms 디바운싱
    }

    const channelName = `board-${currentBoard.id}`
    console.log(`📡 Creating channel: ${channelName}`)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${currentBoard.id}`
        },
        (payload) => {
          console.log('📋 Column change received:', {
            eventType: payload.eventType,
            table: payload.table,
            new: payload.new,
            old: payload.old
          })
          debouncedUpdate('Column')
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards'
        },
        (payload) => {
          console.log('🃏 Card change received:', {
            eventType: payload.eventType,
            table: payload.table,
            new: payload.new,
            old: payload.old
          })
          debouncedUpdate('Card')
        }
      )
      .subscribe((status) => {
        console.log(`📶 Realtime subscription status: ${status}`)
        setRealtimeStatus(status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates')
          showToast('실시간 동기화가 활성화되었습니다', 'success', 2000)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error')
          showToast('실시간 동기화 연결에 문제가 발생했습니다', 'error', 4000)
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Realtime subscription timed out')
          showToast('실시간 동기화 연결 시간 초과', 'warning', 3000)
        } else if (status === 'CLOSED') {
          console.log('🔌 Realtime subscription closed')
        }
      })

    return () => {
      console.log(`🧹 Cleaning up realtime subscription for ${channelName}`)
      if (updateTimeout) clearTimeout(updateTimeout)
      supabase.removeChannel(channel)
      setRealtimeStatus('DISCONNECTED')
    }
  }, [currentBoard, handleFetchBoardData, showToast])

  // 에러가 있을 때 토스트로 표시하고 자동으로 재시도
  useEffect(() => {
    if (!error) return

    showToast(`오류 발생: ${error}`, 'error', 5000)
    // 3초 후 자동 재시도
    const retryTimer = setTimeout(() => {
      console.log('Auto retrying due to error...')
      handleFetchBoardData()
    }, 3000)
    
    return () => clearTimeout(retryTimer)
  }, [error, handleFetchBoardData, showToast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">보드를 불러오는 중...</div>
      </div>
    )
  }

  if (error && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">
            오류가 발생했습니다: {error}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            3초 후 자동으로 재시도합니다...
          </div>
          <div className="space-x-4">
            <Button onClick={handleFetchBoardData}>
              지금 다시 시도
            </Button>
            <Link to="/">
              <Button variant="secondary">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">
            보드를 찾을 수 없습니다.
          </div>
          <Link to="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 보드 목록
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentBoard.name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered')
                  handleFetchBoardData()
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                title="수동 새로고침"
              >
                🔄 새로고침
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {realtimeStatus === 'SUBSCRIBED' ? '실시간 동기화 활성화' : 
                   realtimeStatus === 'CONNECTING' ? '연결 중...' : 
                   realtimeStatus === 'CHANNEL_ERROR' ? '연결 오류' : 
                   realtimeStatus === 'TIMED_OUT' ? '연결 시간 초과' :
                   '연결 대기 중'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 
                  realtimeStatus === 'CONNECTING' ? 'bg-yellow-500' : 
                  realtimeStatus === 'CHANNEL_ERROR' ? 'bg-red-500' : 
                  realtimeStatus === 'TIMED_OUT' ? 'bg-orange-500' :
                  'bg-gray-400'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 보드 콘텐츠 */}
      <Board />
      
      {/* Toast 컴포넌트 */}
      <ToastComponent />
    </div>
  )
}

export default BoardPage