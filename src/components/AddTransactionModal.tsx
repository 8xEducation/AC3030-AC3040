import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react'
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ScrollView, FlatList } from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import { TransactionController } from '../controllers/TransactionController'
import { TransactionType, CategoryType, AccountType } from '../types'
import { toCents, formatCurrency } from '../utils/currencyFormatter'
import { useAppStore } from '../store/appStore'
import { X, TrendingDown, TrendingUp, RefreshCw, Wallet, Tag } from 'lucide-react-native'
import { database } from '../database'
import Account from '../database/models/Account'
import Category from '../database/models/Category'

interface AddTransactionModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const AccountPill = React.memo(({ acc, isSelected, onPress, colors }: any) => {
  const dynamicStyle = useMemo(() => ({
    backgroundColor: isSelected ? colors.accentPrimary : colors.bgBase,
    borderColor: isSelected ? colors.accentPrimary : colors.borderDefault
  }), [isSelected, colors])

  const textStyle = useMemo(() => ({
    color: isSelected ? '#FFF' : colors.textMuted
  }), [isSelected, colors])

  return (
    <Pressable style={[styles.pill, dynamicStyle]} onPress={() => onPress(acc.id)}>
      <Wallet size={14} color={isSelected ? '#FFF' : colors.textMuted} />
      <Text style={[styles.pillText, textStyle]}>{acc.name}</Text>
    </Pressable>
  )
})

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

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSuccess }) => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition } = useAppStore()
  const { t } = useTranslation()

  const [state, setState] = useReducer(
    (s: any, a: any) => ({ ...s, ...(typeof a === 'function' ? a(s) : a) }),
    {
      type: TransactionType.EXPENSE,
      amount: '',
      selectedAccountId: '',
      selectedCategoryId: '',
      accounts: [] as Account[],
      categories: [] as Category[],
      loading: false,
      error: ''
    }
  )

  const descRef = useRef('')

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const accs = await database.get<Account>('accounts').query().fetch()
        const activeAccs = accs.filter(a => a.isActive)

        let newSelectedAccountId = state.selectedAccountId
        if (activeAccs.length > 0 && !newSelectedAccountId) {
          newSelectedAccountId = activeAccs[0].id
        }

        let filteredCats: Category[] = []
        let newSelectedCategoryId = state.selectedCategoryId
        if (state.type !== TransactionType.TRANSFER) {
          const cats = await database.get<Category>('categories').query().fetch()
          const targetType = state.type === TransactionType.EXPENSE ? CategoryType.EXPENSE : CategoryType.INCOME
          filteredCats = cats.filter(c => c.type === targetType && c.isActive)

          if (filteredCats.length > 0 && (!newSelectedCategoryId || !filteredCats.find(c => c.id === newSelectedCategoryId))) {
            newSelectedCategoryId = filteredCats[0].id
          } else if (filteredCats.length === 0) {
            newSelectedCategoryId = ''
          }
        }

        setState({
          accounts: activeAccs,
          selectedAccountId: newSelectedAccountId,
          categories: filteredCats,
          selectedCategoryId: newSelectedCategoryId
        })
      } catch (err) {
        console.error(err)
      }
    }

    loadDependencies()
  }, [state.type])

  const handleSave = async () => {
    if (!state.amount.trim() || isNaN(parseFloat(state.amount.replace(/,/g, '')))) {
      setState({ error: 'Please enter a valid amount' })
      return
    }
    if (!state.selectedAccountId) {
      setState({ error: 'Please select an account' })
      return
    }
    if (state.type !== TransactionType.TRANSFER && !state.selectedCategoryId) {
      setState({ error: 'Please select a category' })
      return
    }

    setState({ loading: true, error: '' })

    const amountInCents = toCents(parseFloat(state.amount.replace(/,/g, '')))

    const res = await TransactionController.createTransaction({
      accountId: state.selectedAccountId,
      type: state.type,
      amount: amountInCents,
      description: descRef.current.trim() || (state.type === TransactionType.EXPENSE ? 'Expense' : 'Income'),
      date: Math.floor(Date.now() / 1000),
      categoryId: state.type !== TransactionType.TRANSFER ? state.selectedCategoryId : undefined,
    })

    setState({ loading: false })

    if (res.success) {
      setState({ amount: '' })
      descRef.current = ''
      onSuccess()
      onClose()
    } else {
      setState({ error: res.error || 'Failed to save transaction' })
    }
  }

  const renderAccountItem = useCallback(({ item: acc }: any) => (
    <AccountPill
      acc={acc}
      isSelected={state.selectedAccountId === acc.id}
      onPress={(id: string) => setState({ selectedAccountId: id })}
      colors={colors}
    />
  ), [state.selectedAccountId, colors])

  const renderCategoryItem = useCallback(({ item: cat }: any) => (
    <CategoryPill
      cat={cat}
      isSelected={state.selectedCategoryId === cat.id}
      onPress={(id: string) => setState({ selectedCategoryId: id })}
      colors={colors}
    />
  ), [state.selectedCategoryId, colors])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.borderDefault }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('tx.add')}</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

                {state.error ? (
                  <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <Text style={{ color: '#EF4444', fontSize: 13 }}>{state.error}</Text>
                  </View>
                ) : null}

                {/* Transaction Type Selection */}
                <View style={styles.typeSelector}>
                  <Pressable
                    style={[
                      styles.typeBtn,
                      state.type === TransactionType.EXPENSE && { backgroundColor: colors.bgSurface, borderColor: '#EF4444', borderWidth: 1 }
                    ]}
                    onPress={() => setState({ type: TransactionType.EXPENSE })}
                  >
                    <TrendingDown size={16} color={state.type === TransactionType.EXPENSE ? '#EF4444' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: state.type === TransactionType.EXPENSE ? '#EF4444' : colors.textMuted }]}>{t('tx.expense')}</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.typeBtn,
                      state.type === TransactionType.INCOME && { backgroundColor: colors.bgSurface, borderColor: '#10B981', borderWidth: 1 }
                    ]}
                    onPress={() => setState({ type: TransactionType.INCOME })}
                  >
                    <TrendingUp size={16} color={state.type === TransactionType.INCOME ? '#10B981' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: state.type === TransactionType.INCOME ? '#10B981' : colors.textMuted }]}>{t('tx.income')}</Text>
                  </Pressable>
                </View>

                {/* Input Fields */}
                <Text style={[styles.label, { color: colors.textPrimary }]}>{t('modal.amount')}</Text>
                <TextInput
                  style={[styles.input, styles.amountInput, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder={t('tx.placeholder.amount')}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={state.amount}
                  onChangeText={(val) => setState({ amount: val.replace(/[^0-9.]/g, '') })}
                />

                <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>{t('modal.desc')}</Text>
                <TextInput
                  key={visible ? 'desc-open' : 'desc-closed'}
                  style={[styles.input, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder={t('tx.placeholder.desc')}
                  placeholderTextColor={colors.textMuted}
                  defaultValue=""
                  onChangeText={(val) => { descRef.current = val }}
                  autoCorrect={false}
                  spellCheck={false}
                />

                {/* Account Selection */}
                <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>{t('tx.account')}</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.pillContainer}
                  data={state.accounts}
                  keyExtractor={acc => acc.id}
                  ListEmptyComponent={<Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 8 }}>No accounts available. Create one first.</Text>}
                  renderItem={renderAccountItem}
                />

                {/* Category Selection */}
                {state.type !== TransactionType.TRANSFER && (
                  <>
                    <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>{t('tx.category')}</Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.pillContainer}
                      data={state.categories}
                      keyExtractor={cat => cat.id}
                      ListEmptyComponent={<Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 8 }}>No categories configured yet.</Text>}
                      renderItem={renderCategoryItem}
                    />
                  </>
                )}

                <View style={{ height: 40 }} />

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.cancelBtn, { borderColor: colors.borderDefault }]}
                    onPress={onClose}
                    disabled={state.loading}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t('modal.cancel')}</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.saveBtn, { backgroundColor: colors.accentPrimary, opacity: state.loading ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={state.loading}
                  >
                    <Text style={styles.saveBtnText}>{state.loading ? 'Saving...' : t('modal.save')}</Text>
                  </Pressable>
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700',
    height: 56,
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
