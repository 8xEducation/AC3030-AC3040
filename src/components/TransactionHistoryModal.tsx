import React, { useState, useEffect } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native'
import { useThemeColors } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import { useAppStore } from '../store/appStore'
import { TransactionController } from '../controllers/TransactionController'
import Transaction from '../database/models/Transaction'
import { TransactionType } from '../types'
import { formatCurrency } from '../utils/currencyFormatter'
import { TransactionDetailsModal } from './TransactionDetailsModal'

interface TransactionHistoryModalProps {
  visible: boolean
  onClose: () => void
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const colors = useThemeColors()
  const { t } = useTranslation()
  const { currencySymbol, currencyPosition } = useAppStore()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    if (visible) {
      loadTransactions()
    }
  }, [visible])

  const loadTransactions = async () => {
    setLoading(true)
    const res = await TransactionController.getTransactions()
    if (res.success && res.data) {
      setTransactions(res.data)
    }
    setLoading(false)
  }

  const renderItem = ({ item: tx }: { item: Transaction }) => {
    const isIncome = tx.type === TransactionType.INCOME
    const formattedAmt = formatCurrency(tx.amount, currencySymbol, currencyPosition)
    
    return (
      <TouchableOpacity
        style={[
          styles.txCard,
          { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
        ]}
        onPress={() => setSelectedTx(tx)}
      >
        <View style={styles.txCardLeft}>
          <View
            style={[
              styles.txIconBg,
              { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
            ]}
          >
            {isIncome ? (
              <ArrowDownLeft size={16} color="#10B981" />
            ) : (
              <ArrowUpRight size={16} color="#EF4444" />
            )}
          </View>
          <View style={styles.txTextContainer}>
            <Text style={[styles.txDescription, { color: colors.textPrimary }]} numberOfLines={1}>
              {tx.description || t('tx.no_description')}
            </Text>
            <Text style={[styles.txDate, { color: colors.textMuted }]}>
              {new Date(tx.date * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isIncome ? '#10B981' : '#EF4444' },
          ]}
        >
          {isIncome ? '+' : '-'}{formattedAmt}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderDefault }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('tx.history')}
          </Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.bgSurface }]}>
            <X size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.listContainer}>
          {transactions.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t('dashboard.no_tx')}
              </Text>
            </View>
          ) : (
            <FlashList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              estimatedItemSize={60}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </SafeAreaView>

      <TransactionDetailsModal
        visible={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  txCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  txIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
})
