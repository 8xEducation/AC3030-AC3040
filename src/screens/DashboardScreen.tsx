/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/prefer-useReducer */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { TimeService } from '../services/TimeService'
import { NetWorthCard } from '../components/NetWorthCard'
import { AccountController } from '../controllers/AccountController'
import { TransactionController } from '../controllers/TransactionController'
import { DebtController } from '../controllers/DebtController'
import { seedDefaultCategories } from '../utils/seedCategories'
import { AddAccountModal } from '../components/AddAccountModal'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { TransactionHistoryModal } from '../components/TransactionHistoryModal'
import { TransactionDetailsModal } from '../components/TransactionDetailsModal'
import { ReportFacade, CategoryExpenseReportItem, DailyExpenseReportItem } from '../patterns/ReportFacade'
import { database } from '../database'
import Account from '../database/models/Account'
import Transaction from '../database/models/Transaction'
import Category from '../database/models/Category'
import { AccountType, TransactionType, DebtType, CategoryType } from '../types'
import { useTranslation } from '../utils/i18n'
import { formatCurrency, fromCents } from '../utils/currencyFormatter'
import { BarChart, PieChart } from 'react-native-gifted-charts'
import {
  Wallet,
  CreditCard,
  Plus,
  Moon,
  Sun,
  Laptop,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  PieChart as PieIcon,
  BarChart2,
} from 'lucide-react-native'


export const DashboardScreen: React.FC = () => {
  const colors = useThemeColors()
  const { theme, setTheme, currencySymbol, currencyPosition, language } = useAppStore()
  const { t } = useTranslation()
  const [currentDateString, setCurrentDateString] = useState('')
  const [greetingKey, setGreetingKey] = useState<any>('dashboard.hello')
  
  const [refreshing, setRefreshing] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // Analytics reports state
  const [chartTab, setChartTab] = useState<'trend' | 'categories'>('trend')
  const [dailyTrend, setDailyTrend] = useState<DailyExpenseReportItem[]>([])
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpenseReportItem[]>([])

  const [isAddAccountVisible, setAddAccountVisible] = useState(false)
  const [isAddTransactionVisible, setAddTransactionVisible] = useState(false)
  const [isTxHistoryVisible, setTxHistoryVisible] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  // Calculate Net Worth Totals
  const totalAssets = accounts
    .filter((acc) => acc.accountType === AccountType.ASSET)
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  const totalLiabilities = accounts
    .filter((acc) => acc.accountType === AccountType.LIABILITY)
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  // Fetch accounts, transactions, and report data
  const loadData = useCallback(async () => {
    setRefreshing(true)
    // Aggregate monthly dates for Category Reports
    const now = TimeService.getNow()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    const [accountsRes, txRes, catData, trendData] = await Promise.all([
      AccountController.getActiveAccounts(),
      TransactionController.getTransactions(),
      ReportFacade.getExpensesByCategory(
        Math.floor(startOfMonth.getTime() / 1000),
        Math.floor(endOfMonth.getTime() / 1000)
      ),
      ReportFacade.getDailyExpenseTrend(7)
    ])

    if (accountsRes.success && accountsRes.data) {
      setAccounts(accountsRes.data)
    }
    if (txRes.success && txRes.data) {
      setTransactions(txRes.data)
    }
    
    setCategoryExpenses(catData)
    setDailyTrend(trendData)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    seedDefaultCategories().then(loadData)
  }, [loadData])

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [language])

  useEffect(() => {
    const updateDateAndGreeting = () => {
      const now = TimeService.getNow()
      
      // Update Date
      const formatted = dateFormatter.format(now)
      setCurrentDateString(formatted)

      // Update Greeting
      const hour = now.getHours()
      if (hour >= 5 && hour < 12) setGreetingKey('dashboard.morning')
      else if (hour >= 12 && hour < 18) setGreetingKey('dashboard.afternoon')
      else if (hour >= 18 && hour < 22) setGreetingKey('dashboard.evening')
      else setGreetingKey('dashboard.night')
    }
    updateDateAndGreeting()
    const interval = setInterval(updateDateAndGreeting, 60000)
    return () => clearInterval(interval)
  }, [dateFormatter])


  // Cycle Themes
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  // Format data specifically for Gifted Charts components
  const getFormattedBarData = () => {
    return dailyTrend.map((item) => ({
      value: fromCents(item.value),
      label: item.label,
      frontColor: colors.accentPrimary,
    }))
  }

  const getFormattedPieData = () => {
    return categoryExpenses.map((item) => ({
      value: fromCents(item.value),
      color: item.color,
      text: item.text,
    }))
  }

  const formattedBarData = getFormattedBarData()
  const formattedPieData = getFormattedPieData()

  // Calculate totals for Pie Chart helper text
  const totalPieExpense = categoryExpenses.reduce((sum, item) => sum + fromCents(item.value), 0)

  const refreshControlNode = useMemo(() => (
    <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.accentPrimary} />
  ), [refreshing, loadData, colors.accentPrimary])

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>{t(greetingKey)}</Text>
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>{currentDateString || t('dashboard.title')}</Text>
        </View>
        <Pressable
          style={[styles.iconButton, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}
          onPress={toggleTheme}
        >
          {theme === 'light' && <Sun size={20} color={colors.textPrimary} />}
          {theme === 'dark' && <Moon size={20} color={colors.textPrimary} />}
          {theme === 'system' && <Laptop size={20} color={colors.textPrimary} />}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControlNode}
      >
        {/* Net Worth Dashboard Card */}
        <NetWorthCard totalAssets={totalAssets} totalLiabilities={totalLiabilities} />

        {/* Action Center (Quick Demo Tools) */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('dashboard.action_center')}</Text>
        </View>
        
        <View style={styles.actionGrid}>
          {accounts.length === 0 ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.accentPrimary }]}
              onPress={() => setAddAccountVisible(true)}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t('dashboard.add_account')}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.accentPrimary }]}
                onPress={() => setAddTransactionVisible(true)}
              >
                <TrendingDown size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('dashboard.add_transaction')}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Visual Reports section */}
        {accounts.length > 0 && (
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('dashboard.analytics')}</Text>
              <View style={[styles.chartTabs, { backgroundColor: colors.bgElevated }]}>
                <Pressable
                  style={[styles.chartTabBtn, chartTab === 'trend' && { backgroundColor: colors.bgSurface }]}
                  onPress={() => setChartTab('trend')}
                >
                  <BarChart2 size={14} color={chartTab === 'trend' ? colors.accentPrimary : colors.textMuted} />
                </Pressable>
                <Pressable
                  style={[styles.chartTabBtn, chartTab === 'categories' && { backgroundColor: colors.bgSurface }]}
                  onPress={() => setChartTab('categories')}
                >
                  <PieIcon size={14} color={chartTab === 'categories' ? colors.accentPrimary : colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.chartContainer, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              {chartTab === 'trend' ? (
                // Daily Trend Bar Chart
                <View style={styles.barChartWrapper}>
                  <Text style={[styles.chartHeader, { color: colors.textPrimary }]}>{t('dashboard.trend')}</Text>
                  {formattedBarData.length > 0 && formattedBarData.some(d => d.value > 0) ? (
                    <BarChart
                      data={formattedBarData}
                      barWidth={22}
                      spacing={18}
                      noOfSections={3}
                      barBorderRadius={6}
                      frontColor={colors.accentPrimary}
                      yAxisThickness={0}
                      xAxisThickness={0}
                      hideRules
                      showGradient
                      yAxisTextStyle={{ fontSize: 9, fontWeight: '600', color: colors.textMuted }}
                      xAxisLabelTextStyle={{ fontSize: 9, fontWeight: '600', color: colors.textMuted }}
                      height={120}
                    />
                  ) : (
                    <Text style={[styles.noChartDataText, { color: colors.textMuted }]}>
                      No expenses in the past 7 days to display.
                    </Text>
                  )}
                </View>
              ) : (
                // Category Expenses Pie/Donut Chart
                <View style={styles.pieChartWrapper}>
                  <Text style={[styles.chartHeader, { color: colors.textPrimary }]}>{t('dashboard.monthly')}</Text>
                  {formattedPieData.length > 0 ? (
                    <View style={styles.pieAndLegendRow}>
                      <PieChart
                        data={formattedPieData}
                        donut
                        radius={60}
                        innerRadius={42}
                        innerCircleColor={colors.bgSurface}
                        centerLabelComponent={() => (
                          <View style={styles.pieCenterLabel}>
                            <Text style={[styles.pieCenterTotal, { color: colors.textPrimary }]}>
                              {currencySymbol}
                              {Math.round(totalPieExpense)}
                            </Text>
                            <Text style={[styles.pieCenterText, { color: colors.textMuted }]}>Total</Text>
                          </View>
                        )}
                      />
                      
                      {/* Legend List */}
                      <View style={styles.pieLegendList}>
                        {categoryExpenses.map((item, idx) => {
                          const valStr = formatCurrency(item.value, currencySymbol, currencyPosition)
                          const sharePct = totalPieExpense > 0 ? Math.round((fromCents(item.value) / totalPieExpense) * 100) : 0
                          
                          return (
                            <View key={item.categoryId || idx} style={styles.legendItem}>
                              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                              <View style={styles.legendTextContainer}>
                                <Text style={[styles.legendName, { color: colors.textPrimary }]} numberOfLines={1}>
                                  {item.text}
                                </Text>
                                <Text style={[styles.legendAmount, { color: colors.textMuted }]}>
                                  {valStr} ({sharePct}%)
                                </Text>
                              </View>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.noChartDataText, { color: colors.textMuted }]}>
                      No monthly expenses recorded to categorize.
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Accounts / Wallets List */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('dashboard.my_wallets')}</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Pressable onPress={() => setAddAccountVisible(true)}>
              <Plus size={20} color={colors.accentPrimary} />
            </Pressable>
            <Pressable onPress={loadData}>
              <RefreshCw size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {accounts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
            <Wallet size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('dashboard.no_accounts')}
            </Text>
          </View>
        ) : (
          <View style={styles.accountsContainer}>
            {accounts.map((acc) => {
              const isAsset = acc.accountType === AccountType.ASSET
              const formattedBal = formatCurrency(acc.currentBalance, currencySymbol, currencyPosition)
              return (
                <View
                  key={acc.id}
                  style={[
                    styles.accountCard,
                    { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
                  ]}
                >
                  <View style={styles.accountCardLeft}>
                    <View
                      style={[
                        styles.accountIconBg,
                        { backgroundColor: isAsset ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
                      ]}
                    >
                      {isAsset ? (
                        <Wallet size={18} color="#10B981" />
                      ) : (
                        <CreditCard size={18} color="#EF4444" />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.accountName, { color: colors.textPrimary }]}>{acc.name}</Text>
                      <Text style={[styles.accountTypeLabel, { color: colors.textMuted }]}>
                        {acc.accountType}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.accountBalance,
                      { color: isAsset ? colors.textPrimary : colors.stateError },
                    ]}
                  >
                    {formattedBal}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Recent Transactions List */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('dashboard.recent_tx')}</Text>
          {transactions.length > 0 && (
            <Pressable onPress={() => setTxHistoryVisible(true)}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accentPrimary }}>
                {t('tx.see_all')}
              </Text>
            </Pressable>
          )}
        </View>

        {transactions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
            <ArrowDownLeft size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t('dashboard.no_tx')}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === TransactionType.INCOME
              const formattedAmt = formatCurrency(tx.amount, currencySymbol, currencyPosition)
              
              return (
                <Pressable
                  key={tx.id}
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
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AddAccountModal
        visible={isAddAccountVisible}
        onClose={() => setAddAccountVisible(false)}
        onSuccess={loadData}
      />
      <AddTransactionModal
        visible={isAddTransactionVisible}
        onClose={() => setAddTransactionVisible(false)}
        onSuccess={loadData}
      />
      <TransactionHistoryModal
        visible={isTxHistoryVisible}
        onClose={() => setTxHistoryVisible(false)}
      />
      <TransactionDetailsModal
        visible={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
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
  welcomeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  reportsSection: {
    width: '100%',
  },
  chartTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  chartTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    minHeight: 180,
    justifyContent: 'center',
  },
  chartHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
  },
  barChartWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  pieChartWrapper: {
    width: '100%',
  },
  pieAndLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  pieCenterLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  pieCenterText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pieLegendList: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendAmount: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  noChartDataText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  accountsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  accountCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  txCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  txIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  txDescription: {
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
})
