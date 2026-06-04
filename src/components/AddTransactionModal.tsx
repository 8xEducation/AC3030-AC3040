import React, { useState, useEffect, useRef } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native'
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

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSuccess }) => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition } = useAppStore()
  const { t } = useTranslation()
  
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE)
  const [amount, setAmount] = useState('')
  const descRef = useRef('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (visible) {
      loadDependencies()
    }
  }, [visible, type])

  const loadDependencies = async () => {
    try {
      const accs = await database.get<Account>('accounts').query().fetch()
      setAccounts(accs.filter(a => a.isActive))
      
      if (accs.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accs[0].id)
      }

      if (type !== TransactionType.TRANSFER) {
        const cats = await database.get<Category>('categories').query().fetch()
        const targetType = type === TransactionType.EXPENSE ? CategoryType.EXPENSE : CategoryType.INCOME
        const filteredCats = cats.filter(c => c.type === targetType && c.isActive)
        setCategories(filteredCats)
        
        if (filteredCats.length > 0) {
          setSelectedCategoryId(filteredCats[0].id)
        } else {
          setSelectedCategoryId('')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    if (!amount.trim() || isNaN(parseFloat(amount.replace(/,/g, '')))) {
      setError('Please enter a valid amount')
      return
    }
    if (!selectedAccountId) {
      setError('Please select an account')
      return
    }
    if (type !== TransactionType.TRANSFER && !selectedCategoryId) {
      setError('Please select a category')
      return
    }

    setLoading(true)
    setError('')
    
    const amountInCents = toCents(parseFloat(amount.replace(/,/g, '')))
    
    const res = await TransactionController.createTransaction({
      accountId: selectedAccountId,
      type,
      amount: amountInCents,
      description: descRef.current.trim() || (type === TransactionType.EXPENSE ? 'Expense' : 'Income'),
      date: Math.floor(Date.now() / 1000),
      categoryId: type !== TransactionType.TRANSFER ? selectedCategoryId : undefined,
    })
    
    setLoading(false)
    
    if (res.success) {
      setAmount('')
      descRef.current = ''
      onSuccess()
      onClose()
    } else {
      setError(res.error || 'Failed to save transaction')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardView}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.borderDefault }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('tx.add')}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {error ? <Text style={[styles.errorText, { color: colors.stateError }]}>{error}</Text> : null}

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.typeBtn, 
                      { 
                        backgroundColor: type === TransactionType.EXPENSE ? 'rgba(239, 68, 68, 0.1)' : colors.bgBase,
                        borderColor: type === TransactionType.EXPENSE ? '#EF4444' : colors.borderDefault 
                      }
                    ]}
                    onPress={() => setType(TransactionType.EXPENSE)}
                  >
                    <TrendingDown size={16} color={type === TransactionType.EXPENSE ? '#EF4444' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: type === TransactionType.EXPENSE ? '#EF4444' : colors.textMuted }]}>{t('tx.expense')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.typeBtn, 
                      { 
                        backgroundColor: type === TransactionType.INCOME ? 'rgba(16, 185, 129, 0.1)' : colors.bgBase,
                        borderColor: type === TransactionType.INCOME ? '#10B981' : colors.borderDefault 
                      }
                    ]}
                    onPress={() => setType(TransactionType.INCOME)}
                  >
                    <TrendingUp size={16} color={type === TransactionType.INCOME ? '#10B981' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: type === TransactionType.INCOME ? '#10B981' : colors.textMuted }]}>{t('tx.income')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <Text style={[styles.label, { color: colors.textPrimary }]}>{t('modal.amount')}</Text>
                <TextInput
                  style={[styles.input, styles.amountInput, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder={t('tx.placeholder.amount')}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(val) => setAmount(val.replace(/[^0-9.]/g, ''))}
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
                  {accounts.map(acc => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.pill,
                        { 
                          backgroundColor: selectedAccountId === acc.id ? colors.accentPrimary : colors.bgBase,
                          borderColor: selectedAccountId === acc.id ? colors.accentPrimary : colors.borderDefault
                        }
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                    >
                      <Wallet size={14} color={selectedAccountId === acc.id ? '#FFF' : colors.textMuted} />
                      <Text style={[
                        styles.pillText,
                        { color: selectedAccountId === acc.id ? '#FFF' : colors.textMuted }
                      ]}>
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {accounts.length === 0 && (
                    <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 8 }}>No accounts available. Create one first.</Text>
                  )}
                </ScrollView>

                {/* Category Selection */}
                {type !== TransactionType.TRANSFER && (
                  <>
                    <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>{t('tx.category')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.pill,
                            { 
                              backgroundColor: selectedCategoryId === cat.id ? cat.color : colors.bgBase,
                              borderColor: selectedCategoryId === cat.id ? cat.color : colors.borderDefault
                            }
                          ]}
                          onPress={() => setSelectedCategoryId(cat.id)}
                        >
                          <Tag size={14} color={selectedCategoryId === cat.id ? '#FFF' : cat.color} />
                          <Text style={[
                            styles.pillText,
                            { color: selectedCategoryId === cat.id ? '#FFF' : colors.textMuted }
                          ]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {categories.length === 0 && (
                        <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 8 }}>No categories configured yet.</Text>
                      )}
                    </ScrollView>
                  </>
                )}

                <View style={{ height: 40 }} />
                
                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.cancelBtn, { borderColor: colors.borderDefault }]} 
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t('modal.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: colors.accentPrimary, opacity: loading ? 0.7 : 1 }]} 
                    onPress={handleSave}
                    disabled={loading}
                  >
                    <Text style={styles.saveBtnText}>{loading ? t('modal.saving') : t('modal.save')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
