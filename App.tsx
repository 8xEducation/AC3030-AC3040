import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { SmartBudgetScreen } from './src/screens/SmartBudgetScreen'
import { DebtLedgerScreen } from './src/screens/DebtLedgerScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { BiometricLockScreen } from './src/screens/BiometricLockScreen'
import { useThemeColors } from './src/utils/theme'
import { useAppStore } from './src/store/appStore'
import { useTranslation } from './src/utils/i18n'
import { TimeService } from './src/services/TimeService'
import { Wallet, TrendingDown, ArrowUpRight, Settings as SettingsIcon } from 'lucide-react-native'

type Tab = 'home' | 'budgets' | 'debts' | 'settings'

export default function App() {
  const colors = useThemeColors()
  const { theme, hasCompletedOnboarding, isBiometricEnabled } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isUnlocked, setIsUnlocked] = useState(false)

  React.useEffect(() => {
    TimeService.init()
  }, [])

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



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.screenContainer}>
        {activeTab === 'home' ? <DashboardScreen /> :
          activeTab === 'budgets' ? <SmartBudgetScreen /> :
            activeTab === 'debts' ? <DebtLedgerScreen /> :
              <SettingsScreen />}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgSurface, borderTopColor: colors.borderDefault }]}>
        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <Wallet size={20} color={activeTab === 'home' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.home')}
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab('budgets')}
        >
          <TrendingDown size={20} color={activeTab === 'budgets' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'budgets' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.budgets')}
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab('debts')}
        >
          <ArrowUpRight size={20} color={activeTab === 'debts' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'debts' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.debts')}
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} color={activeTab === 'settings' ? colors.accentPrimary : colors.textMuted} />
          <Text style={[styles.tabLabel, { color: activeTab === 'settings' ? colors.accentPrimary : colors.textMuted }]}>
            {t('nav.settings')}
          </Text>
        </Pressable>
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
    boxShadow: '0 -4px 8px rgba(15, 23, 42, 0.05)',
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

