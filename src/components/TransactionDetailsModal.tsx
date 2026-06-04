import React, { useEffect, useState } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { X, ArrowDownLeft, ArrowUpRight, Wallet, Tag } from 'lucide-react-native'
import { useThemeColors } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import { useAppStore } from '../store/appStore'
import Transaction from '../database/models/Transaction'
import Account from '../database/models/Account'
import Category from '../database/models/Category'
import { database } from '../database'
import { TransactionType } from '../types'
import { formatCurrency } from '../utils/currencyFormatter'

interface TransactionDetailsModalProps {
  visible: boolean
  transaction: Transaction | null
  onClose: () => void
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  const colors = useThemeColors()
  const { t } = useTranslation()
  const { currencySymbol, currencyPosition } = useAppStore()

  const [account, setAccount] = useState<Account | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (visible && transaction) {
      loadDetails()
    }
  }, [visible, transaction])

  const loadDetails = async () => {
    if (!transaction) return
    try {
      const acc = await database.get<Account>('accounts').find(transaction.accountId)
      setAccount(acc)
    } catch (e) {
      console.warn('Account not found')
    }
    
    if (transaction.categoryId) {
      try {
        const cat = await database.get<Category>('categories').find(transaction.categoryId)
        setCategory(cat)
      } catch (e) {
        console.warn('Category not found')
      }
    } else {
      setCategory(null)
    }
  }

  if (!transaction) return null

  const isIncome = transaction.type === TransactionType.INCOME
  const formattedAmt = formatCurrency(transaction.amount, currencySymbol, currencyPosition)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.bgBase }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.borderDefault }]}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {t('tx.details')}
              </Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.bgSurface }]}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Amount & Type Banner */}
              <View style={[styles.banner, { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                {isIncome ? (
                  <ArrowDownLeft size={32} color="#10B981" />
                ) : (
                  <ArrowUpRight size={32} color="#EF4444" />
                )}
                <Text style={[styles.bannerAmount, { color: isIncome ? '#10B981' : '#EF4444' }]}>
                  {isIncome ? '+' : '-'}{formattedAmt}
                </Text>
                <Text style={[styles.bannerType, { color: isIncome ? '#10B981' : '#EF4444' }]}>
                  {isIncome ? t('tx.income') : t('tx.expense')}
                </Text>
              </View>

              {/* Details List */}
              <View style={[styles.detailsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
                
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('modal.desc')}</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {transaction.description || t('tx.no_description')}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Date</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {new Date(transaction.date * 1000).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.labelWithIcon}>
                    <Wallet size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted, marginTop: 0 }]}>{t('tx.account')}</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {account?.name || '---'}
                  </Text>
                </View>

                {category && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <View style={styles.labelWithIcon}>
                        <Tag size={16} color={colors.textMuted} />
                        <Text style={[styles.detailLabel, { color: colors.textMuted, marginTop: 0 }]}>{t('tx.category')}</Text>
                      </View>
                      <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                        {category.name}
                      </Text>
                    </View>
                  </>
                )}

              </View>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={onClose}
              >
                <Text style={styles.actionBtnText}>{t('tx.close')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 20,
    marginBottom: 24,
  },
  bannerAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 12,
  },
  bannerType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
    opacity: 0.8,
  },
  detailsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4,
  },
  actionBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
