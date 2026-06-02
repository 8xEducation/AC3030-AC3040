import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { BudgetController, BudgetProgress } from '../controllers/BudgetController'
import { BudgetTimeframe } from '../types'
import { formatCurrency } from '../utils/currencyFormatter'
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react-native'

export const SmartBudgetScreen: React.FC = () => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition } = useAppStore()

  const [refreshing, setRefreshing] = useState(false)
  const [budgets, setBudgets] = useState<BudgetProgress[]>([])
  
  // Creation Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [timeframe, setTimeframe] = useState<BudgetTimeframe>(BudgetTimeframe.MONTHLY)
  const [anchorDayStr, setAnchorDayStr] = useState('1')

  const loadBudgets = useCallback(async () => {
    setRefreshing(true)
    const res = await BudgetController.getBudgetsProgress()
    if (res.success && res.data) {
      setBudgets(res.data)
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const handleCreateBudget = async () => {
    const amountVal = parseFloat(amountStr)
    const anchorVal = parseInt(anchorDayStr)

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a budget name')
      return
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount')
      return
    }
    if (isNaN(anchorVal) || anchorVal <= 0) {
      Alert.alert('Error', 'Please enter a valid positive anchor day')
      return
    }

    // Convert decimal to cents
    const amountInCents = Math.round(amountVal * 100)

    const res = await BudgetController.createBudget({
      name,
      amountInCents,
      timeframe,
      anchorDay: anchorVal,
    })

    if (res.success) {
      setIsModalOpen(false)
      setName('')
      setAmountStr('')
      setAnchorDayStr('1')
      loadBudgets()
    } else {
      Alert.alert('Error', res.error || 'Failed to create budget')
    }
  }

  const handleDeleteBudget = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await BudgetController.deleteBudget(id)
          if (res.success) {
            loadBudgets()
          } else {
            Alert.alert('Error', res.error || 'Failed to delete budget')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Manage & Save</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Smart Budgets</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentPrimary }]}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadBudgets} tintColor={colors.accentPrimary} />
        }
      >
        {budgets.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
            <Info size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Budgets Set</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Define a weekly or monthly budget limit to monitor your spending automatically.
            </Text>
            <TouchableOpacity
              style={[styles.createFirstBtn, { backgroundColor: colors.accentPrimary }]}
              onPress={() => setIsModalOpen(true)}
            >
              <Text style={styles.createFirstBtnText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetList}>
            {budgets.map((b) => {
              const formattedSpent = formatCurrency(b.spentAmount, currencySymbol, currencyPosition)
              const formattedLimit = formatCurrency(b.limitAmount, currencySymbol, currencyPosition)
              const formattedRem = formatCurrency(b.remainingAmount, currencySymbol, currencyPosition)
              const pct = b.progressPercent

              // Multi-Tier alert styling
              let progressBarColor = colors.accentPrimary
              let statusLabel = 'Within Budget'
              let StatusIcon = CheckCircle
              let statusColor = colors.stateSuccess

              if (pct >= 100) {
                progressBarColor = colors.stateError
                statusLabel = 'Budget Exceeded!'
                StatusIcon = AlertTriangle
                statusColor = colors.stateError
              } else if (pct >= 80) {
                progressBarColor = colors.stateWarning
                statusLabel = 'Warning (Over 80%)'
                StatusIcon = AlertTriangle
                statusColor = colors.stateWarning
              }

              return (
                <View
                  key={b.id}
                  style={[
                    styles.budgetCard,
                    { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
                  ]}
                >
                  <View style={styles.budgetCardHeader}>
                    <View>
                      <Text style={[styles.budgetName, { color: colors.textPrimary }]}>{b.name}</Text>
                      <View style={styles.cycleContainer}>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={[styles.budgetDates, { color: colors.textMuted }]}>
                          {new Date(b.startDate * 1000).toLocaleDateString()} -{' '}
                          {new Date(b.endDate * 1000).toLocaleDateString()} ({b.timeframe.toLowerCase()})
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteBudget(b.id)}>
                      <Trash2 size={16} color={colors.stateError} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.amountRow}>
                    <View>
                      <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Spent</Text>
                      <Text style={[styles.spentText, { color: colors.textPrimary }]}>{formattedSpent}</Text>
                    </View>
                    <View style={styles.alignRight}>
                      <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Limit</Text>
                      <Text style={[styles.limitText, { color: colors.textMuted }]}>{formattedLimit}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={[styles.progressBarBg, { backgroundColor: colors.bgElevated }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor: progressBarColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetCardFooter}>
                    <View style={styles.statusLabelContainer}>
                      <StatusIcon size={14} color={statusColor} />
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                    <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                      {formattedRem} remaining
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Creation Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Budget</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Name</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. Monthly Grocery"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Amount (Limit)</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 500"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              value={amountStr}
              onChangeText={setAmountStr}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Timeframe</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  timeframe === BudgetTimeframe.WEEKLY && { backgroundColor: colors.accentPrimary },
                ]}
                onPress={() => {
                  setTimeframe(BudgetTimeframe.WEEKLY)
                  setAnchorDayStr('1') // default Monday
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: timeframe === BudgetTimeframe.WEEKLY ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  timeframe === BudgetTimeframe.MONTHLY && { backgroundColor: colors.accentPrimary },
                ]}
                onPress={() => {
                  setTimeframe(BudgetTimeframe.MONTHLY)
                  setAnchorDayStr('1') // default 1st
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: timeframe === BudgetTimeframe.MONTHLY ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
              {timeframe === BudgetTimeframe.WEEKLY
                ? 'Anchor Day (1 = Mon, 7 = Sun)'
                : 'Anchor Day of Month (1 - 31)'}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 1"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              value={anchorDayStr}
              onChangeText={setAnchorDayStr}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderDefault }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={handleCreateBudget}
              >
                <Text style={styles.submitBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    gap: 12,
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
  createFirstBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createFirstBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  budgetList: {
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 12,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  cycleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  budgetDates: {
    fontSize: 11,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spentText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  limitText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '500',
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
