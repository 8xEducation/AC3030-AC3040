import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { database } from '../database'
import { Globe, Settings, Sun, Moon, Laptop, Landmark, Shield, Clock, Calendar } from 'lucide-react-native'
import { TimeService } from '../services/TimeService'
import * as LocalAuthentication from 'expo-local-authentication'
import { useTranslation } from '../utils/i18n'

export const SettingsScreen: React.FC = () => {
  const colors = useThemeColors()
  const {
    theme,
    setTheme,
    currencySymbol,
    setCurrencySymbol,
    currencyPosition,
    setCurrencyPosition,
    language,
    setLanguage,
    isBiometricEnabled,
    setIsBiometricEnabled,
    firstDayOfWeek,
    setFirstDayOfWeek,
    timeSyncMode,
    setTimeSyncMode,
    networkTimezone,
  } = useAppStore()
  const { t } = useTranslation()

  const [symbolInput, setSymbolInput] = useState(currencySymbol)

  const handleUpdateSymbol = () => {
    if (!symbolInput.trim()) {
      Alert.alert('Error', 'Currency symbol cannot be empty')
      return
    }
    setCurrencySymbol(symbolInput.trim())
    Alert.alert('Success', `Currency symbol updated to ${symbolInput.trim()}`)
  }

  const handleClearDatabase = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all transactions, accounts, debts, and budgets. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.unsafeResetDatabase()
              Alert.alert('Success', 'Database has been reset. Please restart the app.')
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to reset database')
            }
          },
        },
      ]
    )
  }

  const handleToggleBiometrics = async () => {
    if (isBiometricEnabled) {
      setIsBiometricEnabled(false)
      Alert.alert('Disabled', 'Biometric lock disabled')
    } else {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync()
        if (!hasHardware) {
          Alert.alert('Not Supported', 'Your device does not support biometric authentication')
          return
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync()
        if (!isEnrolled) {
          Alert.alert(
            'No Biometrics Found',
            'Please register a fingerprint or Face ID in your device settings first'
          )
          return
        }

        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirm biometrics to enable lock',
          disableDeviceFallback: false,
        })

        if (auth.success) {
          setIsBiometricEnabled(true)
          Alert.alert('Enabled', 'Biometric lock enabled')
        } else {
          Alert.alert('Failed', 'Authentication failed')
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Biometric authentication error')
      }
    }
  }

  const handleToggleTimeSync = () => {
    const newMode = timeSyncMode === 'device' ? 'network' : 'device'
    setTimeSyncMode(newMode)
    TimeService.init() // Re-init time service
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{t('settings.pref')}</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
        </View>
        <View style={[styles.headerIconBg, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          <Settings size={20} color={colors.textPrimary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.theme')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.borderDefault },
                theme === 'light' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
              ]}
              onPress={() => setTheme('light')}
            >
              <Sun size={18} color={theme === 'light' ? '#FFFFFF' : colors.textPrimary} />
              <Text style={[styles.themeBtnText, { color: theme === 'light' ? '#FFFFFF' : colors.textPrimary }]}>
                {t('settings.light')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.borderDefault },
                theme === 'dark' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
              ]}
              onPress={() => setTheme('dark')}
            >
              <Moon size={18} color={theme === 'dark' ? '#FFFFFF' : colors.textPrimary} />
              <Text style={[styles.themeBtnText, { color: theme === 'dark' ? '#FFFFFF' : colors.textPrimary }]}>
                {t('settings.dark')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.borderDefault },
                theme === 'system' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
              ]}
              onPress={() => setTheme('system')}
            >
              <Laptop size={18} color={theme === 'system' ? '#FFFFFF' : colors.textPrimary} />
              <Text style={[styles.themeBtnText, { color: theme === 'system' ? '#FFFFFF' : colors.textPrimary }]}>
                {t('settings.system')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.currency')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.currency_symbol')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.symbolInput,
                { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
              ]}
              value={symbolInput}
              onChangeText={setSymbolInput}
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accentPrimary }]}
              onPress={handleUpdateSymbol}
            >
              <Text style={styles.saveBtnText}>{t('modal.save')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('settings.symbol_pos')}</Text>
          <View style={styles.positionRow}>
            <TouchableOpacity
              style={[
                styles.positionBtn,
                { borderColor: colors.borderDefault },
                currencyPosition === 'prefix' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
              ]}
              onPress={() => setCurrencyPosition('prefix')}
            >
              <Text style={{ color: currencyPosition === 'prefix' ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>
                Prefix ({currencySymbol}100)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.positionBtn,
                { borderColor: colors.borderDefault },
                currencyPosition === 'suffix' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
              ]}
              onPress={() => setCurrencyPosition('suffix')}
            >
              <Text style={{ color: currencyPosition === 'suffix' ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}>
                Suffix (100 {currencySymbol})
              </Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* Localization & Info */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.lang')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          <View style={styles.languageRow}>
            <View style={styles.settingItemLeft}>
              <Globe size={18} color={colors.textMuted} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary, marginBottom: 0 }]}>{t('settings.lang')}</Text>
            </View>
            <View style={styles.languageSelectors}>
              <TouchableOpacity
                style={[styles.langBadge, language === 'en' && { backgroundColor: colors.accentPrimary }]}
                onPress={() => setLanguage('en')}
              >
                <Text style={{ color: language === 'en' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 11 }}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBadge, language === 'vi' && { backgroundColor: colors.accentPrimary }]}
                onPress={() => setLanguage('vi')}
              >
                <Text style={{ color: language === 'vi' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 11 }}>
                  VI
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Time & Date Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.time_date')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          
          <View style={styles.languageRow}>
            <View style={styles.settingItemLeft}>
              <Calendar size={18} color={colors.textMuted} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary, marginBottom: 0 }]}>{t('settings.first_day')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t('settings.first_day_desc')}</Text>
              </View>
            </View>
            <View style={styles.languageSelectors}>
              <TouchableOpacity
                style={[styles.langBadge, firstDayOfWeek === 0 && { backgroundColor: colors.accentPrimary }]}
                onPress={() => setFirstDayOfWeek(0)}
              >
                <Text style={{ color: firstDayOfWeek === 0 ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 11 }}>
                  {t('settings.sun')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBadge, firstDayOfWeek === 1 && { backgroundColor: colors.accentPrimary }]}
                onPress={() => setFirstDayOfWeek(1)}
              >
                <Text style={{ color: firstDayOfWeek === 1 ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 11 }}>
                  {t('settings.mon')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.securityRow}>
            <View style={styles.settingItemLeft}>
              <Clock size={18} color={colors.textMuted} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                  {t('settings.sync_network')}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {timeSyncMode === 'network' && networkTimezone 
                    ? `${t('settings.sync_network_desc')} (${networkTimezone})` 
                    : t('settings.sync_network_desc')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.mockToggle,
                {
                  backgroundColor: timeSyncMode === 'network' ? colors.accentPrimary : colors.borderDefault,
                  alignItems: timeSyncMode === 'network' ? 'flex-end' : 'flex-start',
                },
              ]}
              onPress={handleToggleTimeSync}
              activeOpacity={0.8}
            >
              <View style={[styles.mockToggleKnob, { backgroundColor: colors.bgSurface }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security / Biometrics */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.security')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
          <View style={styles.securityRow}>
            <View style={styles.settingItemLeft}>
              <Shield size={18} color={colors.textMuted} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                  {t('settings.biometric')}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {t('settings.biometric_desc')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.mockToggle,
                {
                  backgroundColor: isBiometricEnabled ? colors.accentPrimary : colors.borderDefault,
                  alignItems: isBiometricEnabled ? 'flex-end' : 'flex-start',
                },
              ]}
              onPress={handleToggleBiometrics}
              activeOpacity={0.8}
            >
              <View style={[styles.mockToggleKnob, { backgroundColor: colors.bgSurface }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: colors.stateError }]}>{t('settings.danger')}</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.bgSurface, borderColor: colors.stateError }]}>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}
            onPress={handleClearDatabase}
            activeOpacity={0.7}
          >
            <Landmark size={18} color={colors.stateError} />
            <Text style={[styles.resetBtnText, { color: colors.stateError }]}>{t('settings.reset')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creditContainer}>
          <Text style={[styles.creditText, { color: colors.textMuted }]}>
            {t('settings.credit')}
          </Text>
        </View>
      </ScrollView>


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
  headerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
  settingsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: -4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  symbolInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    width: 72,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  positionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  positionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  languageSelectors: {
    flexDirection: 'row',
    gap: 6,
  },
  langBadge: {
    width: 32,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  mockToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  resetBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  footerSpacing: {
    height: 32,
  },
  creditContainer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  creditText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    textAlign: 'center',
  },
})
