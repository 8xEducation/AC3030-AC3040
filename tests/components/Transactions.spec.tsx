import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'
import { AddTransactionModal } from '../../src/components/AddTransactionModal'
import { TransactionDetailsModal } from '../../src/components/TransactionDetailsModal'
import { TransactionHistoryModal } from '../../src/components/TransactionHistoryModal'
import { TransactionType, CategoryType, AccountType } from '../../src/types'
import { database } from '../../src/database'

// --- Mocks ---
jest.mock('../../src/utils/theme', () => ({
  useThemeColors: () => ({
    bgBase: '#FFFFFF', bgSurface: '#F3F4F6', textPrimary: '#111827', textMuted: '#6B7280', accentPrimary: '#4F46E5', borderDefault: '#E5E7EB', stateError: '#EF4444'
  }),
}))

jest.mock('../../src/utils/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock('lucide-react-native', () => ({
  X: 'MockX', TrendingDown: 'MockTrendingDown', TrendingUp: 'MockTrendingUp', 
  RefreshCw: 'MockRefreshCw', Calendar: 'MockCalendar', Save: 'MockSave', 
  ArrowDownLeft: 'MockArrowDownLeft', ArrowUpRight: 'MockArrowUpRight',
  Wallet: 'MockWallet', Tag: 'MockTag', Pencil: 'MockPencil', Trash2: 'MockTrash2', Search: 'MockSearch'
}))

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react')
  const { View } = require('react-native')
  function MockModal(props: any) {
    return <View testID="mock-modal">{props.visible ? props.children : null}</View>
  }
  return { default: MockModal }
})

// Mock WatermelonDB
jest.mock('../../src/database', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
      find: jest.fn().mockResolvedValue({}),
    }),
    write: jest.fn((callback) => callback()),
  },
}))

jest.mock('../../src/controllers/TransactionController', () => ({
  TransactionController: {
    createTransaction: jest.fn().mockResolvedValue(true),
    deleteTransaction: jest.fn().mockResolvedValue(true),
    getTransactions: jest.fn().mockResolvedValue({ success: true, data: [] }),
  },
}))

jest.mock('../../src/store/appStore', () => ({
  useAppStore: () => ({
    currencySymbol: '$', currencyPosition: 'prefix'
  }),
}))

describe('Transactions Components', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('AddTransactionModal', () => {
    beforeEach(() => {
      // Setup mock data for accounts and categories
      const mockAccounts = [{ id: 'acc1', name: 'Wallet', isActive: true }]
      const mockCategories = [
        { id: 'cat1', name: 'Food', type: CategoryType.EXPENSE, isActive: true },
        { id: 'cat2', name: 'Salary', type: CategoryType.INCOME, isActive: true }
      ]
      
      ;(database.get as jest.Mock).mockImplementation((tableName) => ({
        query: () => ({
          fetch: () => {
            if (tableName === 'accounts') return Promise.resolve(mockAccounts)
            if (tableName === 'categories') return Promise.resolve(mockCategories)
            return Promise.resolve([])
          }
        })
      }))
    })

    it('cho phép thêm giao dịch chi tiêu (Expense)', async () => {
      render(
        <AddTransactionModal visible={true} onClose={jest.fn()} />
      )

      await waitFor(() => {
        expect(screen.getByText('Wallet')).toBeTruthy()
        expect(screen.getByText('Food')).toBeTruthy()
      })

      await waitFor(() => {
        expect(screen.getByText('Wallet')).toBeTruthy()
        expect(screen.getByText('Food')).toBeTruthy()
      })

      await act(async () => {
        fireEvent.changeText(screen.getByPlaceholderText('tx.placeholder.amount'), '150.50')
        fireEvent.changeText(screen.getByPlaceholderText('tx.placeholder.desc'), 'Lunch')
      })

      // Ấn lưu
      await act(async () => {
        fireEvent.press(screen.getByText('modal.save'))
      })

      const { TransactionController } = require('../../src/controllers/TransactionController')
      await waitFor(() => {
        expect(TransactionController.createTransaction).toHaveBeenCalled()
      })
    })

    it('cho phép thêm giao dịch thu nhập (Income)', async () => {
      render(
        <AddTransactionModal visible={true} onClose={jest.fn()} />
      )

      await waitFor(() => {
        expect(screen.getByText('Wallet')).toBeTruthy()
        expect(screen.getByText('Food')).toBeTruthy()
      })

      await act(async () => {
        fireEvent.press(screen.getByText('tx.income'))
      })

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeTruthy()
      })

      await waitFor(() => {
        expect(screen.getByText('Wallet')).toBeTruthy()
        expect(screen.getByText('Salary')).toBeTruthy()
      })

      await act(async () => {
        fireEvent.changeText(screen.getByPlaceholderText('tx.placeholder.amount'), '2000')
      })

      // Nhấn lưu
      await act(async () => {
        fireEvent.press(screen.getByText('modal.save'))
      })

      const { TransactionController } = require('../../src/controllers/TransactionController')
      await waitFor(() => {
        expect(TransactionController.createTransaction).toHaveBeenCalled()
      })
    })
  })

  describe('TransactionDetailsModal', () => {
    it('render chi tiết giao dịch thành công', async () => {
      const mockTx = {
        id: 'tx1',
        amount: 50000,
        type: TransactionType.EXPENSE,
        date: new Date().getTime() / 1000,
        description: 'Mua sắm',
        accountId: 'a1',
        categoryId: 'c1'
      }

      ;(database.get as jest.Mock).mockImplementation((tableName) => ({
        find: (id: string) => {
          if (tableName === 'accounts' && id === 'a1') return Promise.resolve({ id: 'a1', name: 'Ví tiền mặt' })
          if (tableName === 'categories' && id === 'c1') return Promise.resolve({ id: 'c1', name: 'Mua sắm', color: '#EF4444' })
          return Promise.resolve(null)
        }
      }))

      render(
        <TransactionDetailsModal visible={true} transaction={mockTx as any} onClose={jest.fn()} />
      )

      // Kiểm tra render các thông tin
      await waitFor(() => {
        expect(screen.getAllByText('Mua sắm').length).toBeGreaterThan(0)
        expect(screen.getByText('Ví tiền mặt')).toBeTruthy()
      })
    })
  })

  describe('TransactionHistoryModal', () => {
    it('render danh sách lịch sử giao dịch', async () => {
      const mockTransactions = [
        { id: 'tx1', amount: 1000, type: TransactionType.EXPENSE, description: 'My Lunch', date: new Date().getTime() / 1000, accountId: 'a1', categoryId: 'c1' }
      ]

      const { TransactionController } = require('../../src/controllers/TransactionController')
      TransactionController.getTransactions.mockResolvedValueOnce({ success: true, data: mockTransactions })

      render(
        <TransactionHistoryModal visible={true} onClose={jest.fn()} />
      )

      await waitFor(() => {
        expect(screen.getByText('My Lunch')).toBeTruthy()
      })
    })
  })
})
