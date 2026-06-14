import React, { useState, useEffect, useRef, useReducer } from 'react'
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Alert } from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import { CategoryController } from '../controllers/CategoryController'
import { CategoryType } from '../types'
import { X, TrendingDown, TrendingUp, Tag, Trash2 } from 'lucide-react-native'
import Category from '../database/models/Category'

interface CategoryManagerModalProps {
  visible: boolean
  onClose: () => void
}

const PREDEFINED_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899']

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ visible, onClose }) => {
  const colors = useThemeColors()
  const { t } = useTranslation()

  const [categories, setCategories] = useState<Category[]>([])

  // New Category State
  const [state, setState] = useReducer(
    (s: any, a: any) => ({ ...s, ...(typeof a === 'function' ? a(s) : a) }),
    {
      newCatType: CategoryType.EXPENSE,
      newCatColor: PREDEFINED_COLORS[3],
      loading: false,
      resetKey: 0
    }
  )

  const newCatNameRef = useRef('')

  const loadCategories = async () => {
    try {
      const cats = await CategoryController.getActiveCategories()
      setCategories(cats)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatNameRef.current.trim()) {
      Alert.alert('Error', 'Please enter a category name')
      return
    }

    setState({ loading: true })
    try {
      await CategoryController.createCategory(newCatNameRef.current.trim(), state.newCatType, state.newCatColor, 'Tag')
      newCatNameRef.current = ''
      setState((s: any) => ({ resetKey: s.resetKey + 1 }))
      await loadCategories()
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add category')
    } finally {
      setState({ loading: false })
    }
  }

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Existing transactions will keep it, but it will be hidden from new options.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoryController.deleteCategory(cat.id)
              await loadCategories()
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete category')
            }
          }
        }
      ]
    )
  }

  const expenses = categories.filter(c => c.type === CategoryType.EXPENSE)
  const incomes = categories.filter(c => c.type === CategoryType.INCOME)

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={loadCategories}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.bgSurface }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.borderDefault }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Manage Categories</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {/* Add New Category Section */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Add New Category</Text>

                <View style={styles.typeSelector}>
                  <Pressable
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: state.newCatType === CategoryType.EXPENSE ? 'rgba(239, 68, 68, 0.1)' : colors.bgBase,
                        borderColor: state.newCatType === CategoryType.EXPENSE ? '#EF4444' : colors.borderDefault
                      }
                    ]}
                    onPress={() => setState({ newCatType: CategoryType.EXPENSE })}
                  >
                    <TrendingDown size={16} color={state.newCatType === CategoryType.EXPENSE ? '#EF4444' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: state.newCatType === CategoryType.EXPENSE ? '#EF4444' : colors.textMuted }]}>{t('tx.expense')}</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: state.newCatType === CategoryType.INCOME ? 'rgba(16, 185, 129, 0.1)' : colors.bgBase,
                        borderColor: state.newCatType === CategoryType.INCOME ? '#10B981' : colors.borderDefault
                      }
                    ]}
                    onPress={() => setState({ newCatType: CategoryType.INCOME })}
                  >
                    <TrendingUp size={16} color={state.newCatType === CategoryType.INCOME ? '#10B981' : colors.textMuted} />
                    <Text style={[styles.typeBtnText, { color: state.newCatType === CategoryType.INCOME ? '#10B981' : colors.textMuted }]}>{t('tx.income')}</Text>
                  </Pressable>
                </View>

                <TextInput
                  key={`new-cat-name-${state.resetKey}`}
                  style={[styles.input, { backgroundColor: colors.bgBase, color: colors.textPrimary, borderColor: colors.borderDefault }]}
                  placeholder="Category Name"
                  placeholderTextColor={colors.textMuted}
                  defaultValue=""
                  onChangeText={(val) => { newCatNameRef.current = val }}
                  autoCorrect={false}
                  spellCheck={false}
                />

                <View style={styles.colorPicker}>
                  {PREDEFINED_COLORS.map(color => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        state.newCatColor === color && { borderWidth: 3, borderColor: colors.textPrimary }
                      ]}
                      onPress={() => setState({ newCatColor: color })}
                    />
                  ))}
                </View>

                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.accentPrimary, opacity: state.loading ? 0.7 : 1 }]}
                  onPress={handleAddCategory}
                  disabled={state.loading}
                >
                  <Text style={styles.saveBtnText}>{state.loading ? 'Adding...' : 'Add Category'}</Text>
                </Pressable>

                <View style={styles.divider} />

                {/* Existing Categories */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Existing Expense Categories</Text>
                <View style={styles.list}>
                  {expenses.map(cat => (
                    <View key={cat.id} style={[styles.categoryItem, { borderColor: colors.borderDefault }]}>
                      <View style={styles.catLeft}>
                        <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
                          <Tag size={14} color="#FFF" />
                        </View>
                        <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.name}</Text>
                      </View>
                      <Pressable onPress={() => handleDeleteCategory(cat)} style={styles.deleteBtn}>
                        <Trash2 size={18} color={colors.stateError} />
                      </Pressable>
                    </View>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Existing Income Categories</Text>
                <View style={styles.list}>
                  {incomes.map(cat => (
                    <View key={cat.id} style={[styles.categoryItem, { borderColor: colors.borderDefault }]}>
                      <View style={styles.catLeft}>
                        <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
                          <Tag size={14} color="#FFF" />
                        </View>
                        <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.name}</Text>
                      </View>
                      <Pressable onPress={() => handleDeleteCategory(cat)} style={styles.deleteBtn}>
                        <Trash2 size={18} color={colors.stateError} />
                      </Pressable>
                    </View>
                  ))}
                </View>

                <View style={{ height: 40 }} />
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  saveBtn: {
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 24,
  },
  list: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
})
