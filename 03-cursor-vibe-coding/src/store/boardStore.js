import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

const useBoardStore = create((set, get) => ({
  // 상태
  currentBoard: null,
  columns: [],
  cards: [],
  isLoading: false,
  error: null,

  // 액션들
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // 보드 관련 액션
  setCurrentBoard: (board) => set({ currentBoard: board }),
  
  // 보드 데이터 가져오기
  fetchBoardData: async (slug) => {
    set({ isLoading: true, error: null })
    
    try {
      // 1. slug로 보드 정보 가져오기
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('slug', slug)
        .single()

      if (boardError) throw boardError

      // 2. 보드의 컬럼들 가져오기
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', board.id)
        .order('position')

      if (columnsError) throw columnsError

      // 3. 보드의 카드들 가져오기 (컬럼이 없으면 빈 배열)
      let cards = []
      if (columns && columns.length > 0) {
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .in('column_id', columns.map(col => col.id))
          .order('position')

        if (cardsError) throw cardsError
        cards = cardsData || []
      }

      set({
        currentBoard: board,
        columns: columns || [],
        cards: cards,
        isLoading: false
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // 컬럼 관련 액션
  addColumn: async (title) => {
    const { currentBoard, columns } = get()
    if (!currentBoard) return

    try {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          title,
          position: columns.length,
          board_id: currentBoard.id
        })
        .select()
        .single()

      if (error) throw error

      set({ columns: [...columns, data] })
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateColumn: async (columnId, updates) => {
    try {
      const { error } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', columnId)

      if (error) throw error

      set({
        columns: get().columns.map(col =>
          col.id === columnId ? { ...col, ...updates } : col
        )
      })
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteColumn: async (columnId) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId)

      if (error) throw error

      set({
        columns: get().columns.filter(col => col.id !== columnId),
        cards: get().cards.filter(card => card.column_id !== columnId)
      })
    } catch (error) {
      set({ error: error.message })
    }
  },

  // 카드 관련 액션
  addCard: async (columnId, title, description = null) => {
    const { cards } = get()
    const columnCards = cards.filter(card => card.column_id === columnId)

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          title,
          description,
          position: columnCards.length,
          column_id: columnId
        })
        .select()
        .single()

      if (error) throw error

      set({ cards: [...cards, data] })
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)

      if (error) throw error

      set({
        cards: get().cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        )
      })
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteCard: async (cardId) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error

      set({
        cards: get().cards.filter(card => card.id !== cardId)
      })
    } catch (error) {
      set({ error: error.message })
    }
  },

  // 드래그 앤 드롭 관련 액션
  moveCard: async (cardId, newColumnId, newPosition) => {
    try {
      // newColumnId가 null이면 position만 업데이트
      const updateData = newColumnId 
        ? { column_id: newColumnId, position: newPosition }
        : { position: newPosition }

      const { error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', cardId)

      if (error) throw error

      // 로컬 상태 업데이트
      set({
        cards: get().cards.map(card => {
          if (card.id === cardId) {
            return newColumnId 
              ? { ...card, column_id: newColumnId, position: newPosition }
              : { ...card, position: newPosition }
          }
          return card
        })
      })
    } catch (error) {
      set({ error: error.message })
    }
  },

  // 카드 위치 일괄 업데이트 (드래그 앤 드롭 시 사용)
  updateCardPositions: async (updates) => {
    try {
      // 여러 카드의 위치를 한 번에 업데이트
      for (const update of updates) {
        const { error } = await supabase
          .from('cards')
          .update({ position: update.position })
          .eq('id', update.cardId)

        if (error) throw error
      }

      // 로컬 상태 업데이트
      const updatedCards = get().cards.map(card => {
        const update = updates.find(u => u.cardId === card.id)
        return update ? { ...card, position: update.position } : card
      })

      set({ cards: updatedCards })
    } catch (error) {
      set({ error: error.message })
    }
  }
}))

export default useBoardStore