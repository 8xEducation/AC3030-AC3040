import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { DebtController } from '../controllers/DebtController'
import { AccountController } from '../controllers/AccountController'
import Debt from '../database/models/Debt'
import Account from '../database/models/Account'
import { DebtType, DebtStatus, AccountType } from '../types'
import { formatCurrency } from '../utils/currencyFormatter'
import { useTranslation } from '../utils/i18n'
import { Plus, Check, Calendar, ArrowUpRight, ArrowDownLeft, Info, Landmark } from 'lucide-react-native'

export const DebtLedgerScreen: React.FC = () => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition } = useAppStore()
  const { t } = useTranslation()

  const [refreshing, setRefreshing] = useState(false)
  const [debts, setDebts] = useState<Debt[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activeSegment, setActiveSegment] = useState<'OPEN' | 'SETTLED'>('OPEN')

  // Debt Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const personNameRef = useRef('')
  const [amountStr, setAmountStr] = useState('')
  const [debtType, setDebtType] = useState<DebtType>(DebtType.BORROWED)
  const [dueDateDays, setDueDateDays] = useState('14')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [linkToAccount, setLinkToAccount] = useState(true)

  // Repayment State
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [repayAmountStr, setRepayAmountStr] = useState('')
  const [repayAccountId, setRepayAccountId] = useState('')

  const loadData = useCallback(async () => {
    setRefreshing(true)
    const debtsRes = await DebtController.getDebts()
    const accRes = await AccountController.getActiveAccounts()

    if (debtsRes.success && debtsRes.data) {
      setDebts(debtsRes.data)
    }
    if (accRes.success && accRes.data) {
      setAccounts(accRes.data)
      if (accRes.data.length > 0) {
        setSelectedAccountId(accRes.data[0].id)
        setRepayAccountId(accRes.data[0].id)
      }
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateDebt = async () => {
    const amountVal = parseFloat(amountStr)
    const daysVal = parseInt(dueDateDays)

    if (!personNameRef.current.trim()) {
      Alert.alert('Error', 'Please enter a person\'s name')
      return
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount')
      return
    }
    if (isNaN(daysVal) || daysVal <= 0) {
      Alert.alert('Error', 'Please enter due date offset in days')
      return
    }
    if (!selectedAccountId) {
      Alert.alert('Error', 'Please select a linked wallet')
      return
    }

    const amountInCents = Math.round(amountVal * 100)
    const dueDateSeconds = Math.floor(Date.now() / 1000) + daysVal * 24 * 60 * 60

    const res = await DebtController.createDebt({
      personName: personNameRef.current.trim(),
      type: debtType,
      totalAmountInCents: amountInCents,
      dueDate: dueDateSeconds,
      accountId: selectedAccountId,
      linkToAccount,
    })

    if (res.success) {
      setIsCreateModalOpen(false)
      personNameRef.current = ''
      setAmountStr('')
      setDueDateDays('14')
      loadData()
    } else {
      Alert.alert('Error', res.error || 'Failed to create debt')
    }
  }

  const handleRecordRepayment = async () => {
    const amountVal = parseFloat(repayAmountStr)
    if (!selectedDebt) return

    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount')
      return
    }
    if (!repayAccountId) {
      Alert.alert('Error', 'Please select a wallet to pay from')
      return
    }

    const amountInCents = Math.round(amountVal * 100)

    const res = await DebtController.recordRepayment(
      selectedDebt.id,
      amountInCents,
      repayAccountId
    )

    if (res.success) {
      setIsRepayModalOpen(false)
      setSelectedDebt(null)
      setRepayAmountStr('')
      loadData()
    } else {
      Alert.alert('Error', res.error || 'Failed to record repayment')
    }
  }

  const filteredDebts = debts.filter((d) => d.status === activeSegment)

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{t('debt.manage')}</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('debt.title')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentPrimary }]}
          onPress={() => setIsCreateModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs / Segments */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeSegment === 'OPEN' && { borderBottomColor: colors.accentPrimary }]}
          onPress={() => setActiveSegment('OPEN')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeSegment === 'OPEN' ? colors.accentPrimary : colors.textMuted },
            ]}
          >
            {t('debt.active')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeSegment === 'SETTLED' && { borderBottomColor: colors.accentPrimary }]}
          onPress={() => setActiveSegment('SETTLED')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeSegment === 'SETTLED' ? colors.accentPrimary : colors.textMuted },
            ]}
          >
            {t('debt.settled')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.accentPrimary} />
        }
      >
        {filteredDebts.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
            <Info size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('debt.no_debts')}</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeSegment === 'OPEN'
                ? 'Create a debt entry to monitor your borrowings and lendings.'
                : 'Any fully repaid debts will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.debtList}>
            {filteredDebts.map((d) => {
              const isLent = d.type === DebtType.LENT
              const formattedTotal = formatCurrency(d.totalAmount, currencySymbol, currencyPosition)
              const formattedRem = formatCurrency(d.remainingAmount, currencySymbol, currencyPosition)
              
              const isOverdue = d.status === DebtStatus.OPEN && d.dueDate < Math.floor(Date.now() / 1000)
              const matchedAccount = accounts.find((a) => a.id === d.accountId)

              return (
                <View
                  key={d.id}
                  style={[
                    styles.debtCard,
                    { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
                  ]}
                >
                  <View style={styles.debtCardHeader}>
                    <View style={styles.debtorInfo}>
                      <View
                        style={[
                          styles.typeIconBg,
                          { backgroundColor: isLent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
                        ]}
                      >
                        {isLent ? (
                          <ArrowUpRight size={16} color="#10B981" />
                        ) : (
                          <ArrowDownLeft size={16} color="#EF4444" />
                        )}
                      </View>
                      <View>
                        <Text style={[styles.personName, { color: colors.textPrimary }]}>{d.personName}</Text>
                        <Text style={[styles.debtTypeLabel, { color: colors.textMuted }]}>
                          {isLent ? t('debt.lent') : t('debt.borrowed')}
                        </Text>
                      </View>
                    </View>

                    {d.status === DebtStatus.SETTLED && (
                      <View style={styles.settledBadge}>
                        <Check size={12} color="#10B981" />
                        <Text style={styles.settledBadgeText}>Paid</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailsGrid}>
                    <View>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('debt.remaining')}</Text>
                      <Text
                        style={[
                          styles.remainingAmountText,
                          { color: isLent ? colors.stateSuccess : colors.stateError },
                        ]}
                      >
                        {formattedRem}
                      </Text>
                    </View>
                    <View style={styles.alignRight}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('debt.total')}</Text>
                      <Text style={[styles.totalAmountText, { color: colors.textMuted }]}>
                        {formattedTotal}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.footerDetail}>
                      <Calendar size={12} color={isOverdue ? colors.stateError : colors.textMuted} />
                      <Text
                        style={[
                          styles.footerDetailText,
                          { color: isOverdue ? colors.stateError : colors.textMuted },
                          isOverdue && { fontWeight: '700' },
                        ]}
                      >
                        Due: {new Date(d.dueDate * 1000).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </Text>
                    </View>

                    {matchedAccount && (
                      <View style={styles.footerDetail}>
                        <Landmark size={12} color={colors.textMuted} />
                        <Text style={[styles.footerDetailText, { color: colors.textMuted }]}>
                          Wallet: {matchedAccount.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {d.status === DebtStatus.OPEN && (
                    <TouchableOpacity
                      style={[styles.repayButton, { backgroundColor: colors.accentPrimary }]}
                      onPress={() => {
                        setSelectedDebt(d)
                        setRepayAmountStr((d.remainingAmount / 100).toString()) // default to full amount
                        setIsRepayModalOpen(true)
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.repayButtonText}>{t('debt.repay')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Creation Modal */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('debt.record_new')}</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.person_name')}</Text>
            <TextInput
              key={isCreateModalOpen ? 'debt-person-open' : 'debt-person-closed'}
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textMuted}
              defaultValue=""
              onChangeText={(val) => { personNameRef.current = val }}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.loan_amount')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 150"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
              value={amountStr}
              onChangeText={(val) => setAmountStr(val.replace(/[^0-9.]/g, ''))}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.type')}</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  debtType === DebtType.LENT && { backgroundColor: colors.stateSuccess },
                ]}
                onPress={() => setDebtType(DebtType.LENT)}
              >
                <Text style={[styles.segmentText, { color: debtType === DebtType.LENT ? '#FFFFFF' : colors.textPrimary }]}>
                  {t('debt.lent')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  debtType === DebtType.BORROWED && { backgroundColor: colors.stateError },
                ]}
                onPress={() => setDebtType(DebtType.BORROWED)}
              >
                <Text style={[styles.segmentText, { color: debtType === DebtType.BORROWED ? '#FFFFFF' : colors.textPrimary }]}>
                  {t('debt.borrowed')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.due_offset')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 14"
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
              value={dueDateDays}
              onChangeText={(val) => setDueDateDays(val.replace(/[^0-9]/g, ''))}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.associated_wallet')}</Text>
            <View style={styles.accountSelectors}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.accountSelectorItem,
                    { borderColor: colors.borderDefault },
                    selectedAccountId === acc.id && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                  ]}
                  onPress={() => setSelectedAccountId(acc.id)}
                >
                  <Text style={{ color: selectedAccountId === acc.id ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setLinkToAccount(!linkToAccount)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.borderDefault },
                  linkToAccount && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
              >
                {linkToAccount && <Check size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.toggleText, { color: colors.textPrimary }]}>
                {t('debt.deduct_add')}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderDefault }]}
                onPress={() => setIsCreateModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t('modal.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={handleCreateDebt}
              >
                <Text style={styles.submitBtnText}>{t('debt.add_debt')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Repayment Modal */}
      <Modal visible={isRepayModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('debt.record_repayment')}</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('debt.repay_amount')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 50"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
              value={repayAmountStr}
              onChangeText={(val) => setRepayAmountStr(val.replace(/[^0-9.]/g, ''))}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Pay From Wallet</Text>
            <View style={styles.accountSelectors}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.accountSelectorItem,
                    { borderColor: colors.borderDefault },
                    repayAccountId === acc.id && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                  ]}
                  onPress={() => setRepayAccountId(acc.id)}
                >
                  <Text style={{ color: repayAccountId === acc.id ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderDefault }]}
                onPress={() => {
                  setIsRepayModalOpen(false)
                  setSelectedDebt(null)
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={handleRecordRepayment}
              >
                <Text style={styles.submitBtnText}>Record Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  debtList: {
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 16,
  },
  debtCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  debtCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
  },
  debtTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  settledBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remainingAmountText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  totalAmountText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDetailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  repayButton: {
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  repayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -8,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accountSelectors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountSelectorItem: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
})
