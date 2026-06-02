import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { SmartBudgetScreen } from './src/screens/SmartBudgetScreen'
import { DebtLedgerScreen } from './src/screens/DebtLedgerScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { BiometricLockScreen } from './src/screens/BiometricLockScreen'
import { useThemeColors } from './src/utils/theme'
import { useAppStore } from './src/store/appStore'
import { useTranslation } from './src/utils/i18n'
import { Wallet, TrendingDown, ArrowUpRight, Settings as SettingsIcon } from 'lucide-react-native'

type Tab = 'home' | 'budgets' | 'debts' | 'settings'

export default function App() {
  const colors = useThemeColors()
  const { theme, hasCompletedOnboarding, isBiometricEnabled } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Determine status bar style based on active theme
  const statusBarStyle = theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'auto'

  // If onboarding not completed, render Onboarding Screen
  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
        <OnboardingScreen />
        <StatusBar style={statusBarStyle} />
      </SafeAreaView>
    )
  }

  // If biometrics enabled and not unlocked, render Biometric Lock Screen
  if (isBiometricEnabled && !isUnlocked) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
        <BiometricLockScreen onUnlock={() => setIsUnlocked(true)} />
        <StatusBar style={statusBarStyle} />
      </SafeAreaView>
    )
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardScreen />
      case 'budgets':
        return <SmartBudgetScreen />
      case 'debts':
        return <DebtLedgerScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgSurface, borderTopColor: colors.borderDefault }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Wallet size={20} color={activeTab === 'home' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.home')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('budgets')}
          activeOpacity={0.7}
        >
          <TrendingDown size={20} color={activeTab === 'budgets' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'budgets' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.budgets')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('debts')}
          activeOpacity={0.7}
        >
          <ArrowUpRight size={20} color={activeTab === 'debts' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'debts' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.debts')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <SettingsIcon size={20} color={activeTab === 'settings' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'settings' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.settings')}
          </Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={statusBarStyle} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
})
