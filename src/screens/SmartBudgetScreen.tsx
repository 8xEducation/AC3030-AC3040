/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/prefer-useReducer */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  FlatList,
} from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../utils/i18n'
import { BudgetController, BudgetProgress } from '../controllers/BudgetController'
import { BudgetTimeframe, CategoryType } from '../types'
import { formatCurrency } from '../utils/currencyFormatter'
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Info, Tag } from 'lucide-react-native'
import { database } from '../database'
import Category from '../database/models/Category'
import { CategoryManagerModal } from '../components/CategoryManagerModal'
const CategoryPill = React.memo(({ cat, isSelected, onPress, colors }: any) => {
  const dynamicStyle = useMemo(() => ({
    backgroundColor: isSelected ? cat.color : colors.bgBase,
    borderColor: isSelected ? cat.color : colors.borderDefault
  }), [isSelected, cat.color, colors])

  const textStyle = useMemo(() => ({
    color: isSelected ? '#FFF' : colors.textMuted
  }), [isSelected, colors])

  return (
    <Pressable style={[styles.pill, dynamicStyle]} onPress={() => onPress(cat.id)}>
      <Tag size={14} color={isSelected ? '#FFF' : cat.color} />
      <Text style={[styles.pillText, textStyle]}>{cat.name}</Text>
    </Pressable>
  )
})

export const SmartBudgetScreen: React.FC = () => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition } = useAppStore()
  const { t } = useTranslation()

  const [refreshing, setRefreshing] = useState(false)
  const [budgets, setBudgets] = useState<BudgetProgress[]>([])
  
  // Creation Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const nameRef = useRef('')
  const [amountStr, setAmountStr] = useState('')
  const [timeframe, setTimeframe] = useState<BudgetTimeframe>(BudgetTimeframe.MONTHLY)
  const [anchorDayStr, setAnchorDayStr] = useState('1')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      const allCategories = await database.get<Category>('categories').query().fetch()
      const expenseCats = allCategories.filter(c => c.type === CategoryType.EXPENSE && c.isActive)
      setCategories(expenseCats)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadBudgets = useCallback(async () => {
    setRefreshing(true)
    const res = await BudgetController.getBudgetsProgress()
    if (res.success && res.data) {
      setBudgets(res.data)
    } else {
      Alert.alert('Load Error', res.error || 'Failed to load budgets')
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [loadBudgets, loadCategories])

  const handleCreateBudget = async () => {
    const amountVal = parseFloat(amountStr)
    const anchorVal = parseInt(anchorDayStr)

    if (!nameRef.current.trim()) {
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
      name: nameRef.current.trim(),
      amountInCents,
      timeframe,
      anchorDay: anchorVal,
      categoryId: selectedCategoryId,
    })

    if (res.success) {
      setIsModalOpen(false)
      nameRef.current = ''
      setAmountStr('')
      setAnchorDayStr('1')
      setSelectedCategoryId(undefined)
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

  const refreshControlNode = useMemo(() => (
    <RefreshControl refreshing={refreshing} onRefresh={loadBudgets} tintColor={colors.accentPrimary} />
  ), [refreshing, loadBudgets, colors.accentPrimary])

  const renderCategoryItem = useCallback(({ item: cat }: any) => (
    <CategoryPill
      cat={cat}
      isSelected={selectedCategoryId === cat.id}
      onPress={setSelectedCategoryId}
      colors={colors}
    />
  ), [selectedCategoryId, colors])

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{t('budget.manage')}</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('budget.title')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}
            onPress={() => setIsCategoryManagerVisible(true)}
          >
            <Tag size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.accentPrimary }]}
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('budget.add')}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControlNode}
      >
        {budgets.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
            <Info size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('budget.no_budgets')}</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('budget.no_budgets_desc')}
            </Text>
            <Pressable
              style={[styles.createFirstBtn, { backgroundColor: colors.accentPrimary }]}
              onPress={() => setIsModalOpen(true)}
            >
              <Text style={styles.createFirstBtnText}>{t('budget.create_first')}</Text>
            </Pressable>
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
              let statusLabel = t('budget.within')
              let StatusIcon = CheckCircle
              let statusColor = colors.stateSuccess

              if (pct >= 100) {
                progressBarColor = colors.stateError
                statusLabel = t('budget.exceeded')
                StatusIcon = AlertTriangle
                statusColor = colors.stateError
              } else if (pct >= 80) {
                progressBarColor = colors.stateWarning
                statusLabel = t('budget.warning')
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
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <Text style={[styles.budgetName, { color: colors.textPrimary }]}>{b.name}</Text>
                        {b.categoryId && b.categoryName && (
                          <View style={{ backgroundColor: b.categoryColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Tag size={10} color="#FFF" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{b.categoryName}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.cycleContainer}>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={[styles.budgetDates, { color: colors.textMuted }]}>
                          {new Date(b.startDate * 1000).toLocaleDateString()} -{' '}
                          {new Date(b.endDate * 1000).toLocaleDateString()} ({b.timeframe.toLowerCase()})
                        </Text>
                      </View>
                    </View>
                    <Pressable onPress={() => handleDeleteBudget(b.id)}>
                      <Trash2 size={16} color={colors.stateError} />
                    </Pressable>
                  </View>

                  <View style={styles.amountRow}>
                    <View>
                      <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('budget.spent')}</Text>
                      <Text style={[styles.spentText, { color: colors.textPrimary }]}>{formattedSpent}</Text>
                    </View>
                    <View style={styles.alignRight}>
                      <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('budget.limit')}</Text>
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
                      {formattedRem} {t('budget.remaining')}
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
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('budget.new')}</Text>
            
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('budget.name')}</Text>
            <TextInput
              key={isModalOpen ? 'budget-name-open' : 'budget-name-closed'}
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. Monthly Grocery"
              placeholderTextColor={colors.textMuted}
              defaultValue=""
              onChangeText={(val) => { nameRef.current = val }}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Linked Category (Optional)</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillContainer}
              data={categories}
              keyExtractor={cat => cat.id}
              ListHeaderComponent={
                <Pressable
                  style={[
                    styles.pill,
                    { 
                      backgroundColor: !selectedCategoryId ? colors.accentPrimary : colors.bgBase,
                      borderColor: !selectedCategoryId ? colors.accentPrimary : colors.borderDefault
                    }
                  ]}
                  onPress={() => setSelectedCategoryId(undefined)}
                >
                  <Tag size={14} color={!selectedCategoryId ? '#FFF' : colors.textMuted} />
                  <Text style={[
                    styles.pillText,
                    { color: !selectedCategoryId ? '#FFF' : colors.textMuted }
                  ]}>
                    All Expenses
                  </Text>
                </Pressable>
              }
              renderItem={renderCategoryItem}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('budget.amount')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              placeholder="e.g. 500"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              value={amountStr}
              onChangeText={(val) => setAmountStr(val.replace(/[^0-9.]/g, ''))}
              autoCorrect={false}
              spellCheck={false}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('budget.timeframe')}</Text>
            <View style={styles.segmentedControl}>
              <Pressable
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
                  {t('budget.weekly')}
                </Text>
              </Pressable>
              <Pressable
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
                  {t('budget.monthly')}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
              {timeframe === BudgetTimeframe.WEEKLY
                ? t('budget.anchor_week')
                : t('budget.anchor_month')}
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
              onChangeText={(val) => setAnchorDayStr(val.replace(/[^0-9]/g, ''))}
              autoCorrect={false}
              spellCheck={false}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.borderDefault }]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t('modal.cancel')}</Text>
              </Pressable>
              
              <Pressable
                style={[styles.submitBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={handleCreateBudget}
              >
                <Text style={styles.submitBtnText}>{t('budget.create')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CategoryManagerModal 
        visible={isCategoryManagerVisible} 
        onClose={() => {
          setIsCategoryManagerVisible(false)
          loadCategories()
        }} 
      />
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
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
    fontSize: 12,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
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
  pillContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
