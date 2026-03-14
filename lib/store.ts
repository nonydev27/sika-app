import { create } from 'zustand'

interface UIState {
  isChatOpen: boolean
  isAddTransactionOpen: boolean
  isAddBudgetOpen: boolean
  setChatOpen: (open: boolean) => void
  setAddTransactionOpen: (open: boolean) => void
  setAddBudgetOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isAddTransactionOpen: false,
  isAddBudgetOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  setAddTransactionOpen: (open) => set({ isAddTransactionOpen: open }),
  setAddBudgetOpen: (open) => set({ isAddBudgetOpen: open }),
}))
