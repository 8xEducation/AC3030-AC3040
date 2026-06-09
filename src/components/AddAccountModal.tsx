import React, { useState, useRef } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useThemeColors } from '../utils/theme'
import { AccountController } from '../controllers/AccountController'
import { AccountType } from '../types'
import { toCents } from '../utils/currencyFormatter'
import { useTranslation } from '../utils/i18n'
import { X, Wallet, CreditCard } from 'lucide-react-native'

interface AddAccountModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ visible, onClose, onSuccess }) => {
  const colors = useThemeColors()
  const { t } = useTranslation()
  
  const nameRef = useRef('')
  const [type, setType] = useState<AccountType>(AccountType.ASSET)
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!nameRef.current.trim()) {
      setError('Account name is required')
      return
    }
    
    let balanceInCents = 0
    if (balance.trim()) {
      const parsed = parseFloat(balance.replace(/,/g, ''))
      if (isNaN(parsed)) {
        setError('Invalid balance amount')
        return
      }
      balanceInCents = toCents(parsed)
    }

    setLoading(true)
    setError('')
    
    const res = await AccountController.createAccount(nameRef.current.trim(), type, balanceInCents)
    setLoading(false)
    
    if (res.success) {
      nameRef.current = ''
      setBalance('')
      setType(AccountType.ASSET)
      onSuccess()
      onClose()
    } else {
      setError(res.error || 'Failed to create account')
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
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('acc.add')}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {error ? <Text style={[styles.errorText, { color: colors.stateError }]}>{error}</Text> : null}

                {/* Account Type Selector */}
                <View style={styles.typeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.typeBtn, 
                      { 
                        backgroundColor: type === AccountType.ASSET ? 'rgba(16, 185, 129, 0.1)' : colors.bgBase,
                        borderColor: type === AccountType.ASSET ? '#10B981' : colors.borderDefault 
                      }
                    ]}
                    onPress={() => setType(AccountType.ASSET)}
                  >
                    <Wallet size={18} color={type === AccountType.ASSET ? '#10B981' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: type === AccountType.ASSET ? '#10B981' : colors.textMuted }]}>
                      {t('acc.wallet')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.typeBtn, 
                      { 
                        backgroundColor: type === AccountType.LIABILITY ? 'rgba(239, 68, 68, 0.1)' : colors.bgBase,
                        borderColor: type === AccountType.LIABILITY ? '#EF4444' : colors.borderDefault 
                      }
                    ]}
                    onPress={() => setType(AccountType.LIABILITY)}
                  >
                    <CreditCard size={18} color={type === AccountType.LIABILITY ? '#EF4444' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: type === AccountType.LIABILITY ? '#EF4444' : colors.textMuted }]}>
                      {t('acc.credit')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <Text style={[styles.label, { color: colors.textPrimary }]}>{t('acc.name')}</Text>
                <TextInput
                  key={visible ? 'name-open' : 'name-closed'}
                  style={[styles.input, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder="e.g. Cash Wallet"
                  placeholderTextColor={colors.textMuted}
                  defaultValue=""
                  onChangeText={(val) => { nameRef.current = val }}
                  autoCorrect={false}
                  spellCheck={false}
                />

                <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>{t('acc.balance')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={balance}
                  onChangeText={(val) => setBalance(val.replace(/[^0-9.]/g, ''))}
                />
                
                <Text style={[styles.helpText, { color: colors.textMuted }]}>
                  {type === AccountType.ASSET 
                    ? t('acc.balance_desc_asset') 
                    : t('acc.balance_desc_liability')}
                </Text>

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
              </View>
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
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
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
    gap: 8,
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
  helpText: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 24,
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
