import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView } from 'react-native'
import { useThemeColors } from '../utils/theme'
import { useAppStore } from '../store/appStore'
import { Wallet, Compass, ShieldCheck, Moon, Sun, Laptop } from 'lucide-react-native'

export const OnboardingScreen: React.FC = () => {
  const colors = useThemeColors()
  const {
    setHasCompletedOnboarding,
    currencySymbol,
    setCurrencySymbol,
    currencyPosition,
    setCurrencyPosition,
    language,
    setLanguage,
    theme,
    setTheme,
  } = useAppStore()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [customSymbol, setCustomSymbol] = useState(currencySymbol)

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrencySymbol(customSymbol.trim() || '$')
      setHasCompletedOnboarding(true)
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* ProgressBar/Indicator */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map((idx) => (
          <View
            key={idx}
            style={[
              styles.indicatorDot,
              {
                backgroundColor: currentSlide === idx ? colors.accentPrimary : colors.borderDefault,
                width: currentSlide === idx ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.slideContent}>
        {currentSlide === 0 && (
          <View style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.08)' }]}>
              <Wallet size={48} color={colors.accentPrimary} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Welcome to Cash Flow Wave</Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted }]}>
              A professional, offline-first personal financial manager built with strict mathematical invariants.
            </Text>

            {/* Quick Preferences */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Choose Language</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { borderColor: colors.borderDefault },
                  language === 'en' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.optionText, { color: language === 'en' ? '#FFFFFF' : colors.textPrimary }]}>
                  English (EN)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { borderColor: colors.borderDefault },
                  language === 'vi' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setLanguage('vi')}
              >
                <Text style={[styles.optionText, { color: language === 'vi' ? '#FFFFFF' : colors.textPrimary }]}>
                  Tiếng Việt (VI)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Select Theme</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { borderColor: colors.borderDefault },
                  theme === 'light' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setTheme('light')}
              >
                <Sun size={16} color={theme === 'light' ? '#FFFFFF' : colors.textPrimary} />
                <Text style={[styles.optionText, { color: theme === 'light' ? '#FFFFFF' : colors.textPrimary }]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { borderColor: colors.borderDefault },
                  theme === 'dark' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setTheme('dark')}
              >
                <Moon size={16} color={theme === 'dark' ? '#FFFFFF' : colors.textPrimary} />
                <Text style={[styles.optionText, { color: theme === 'dark' ? '#FFFFFF' : colors.textPrimary }]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { borderColor: colors.borderDefault },
                  theme === 'system' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setTheme('system')}
              >
                <Laptop size={16} color={theme === 'system' ? '#FFFFFF' : colors.textPrimary} />
                <Text style={[styles.optionText, { color: theme === 'system' ? '#FFFFFF' : colors.textPrimary }]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentSlide === 1 && (
          <View style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
              <Compass size={48} color={colors.stateSuccess} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Configure Currency</Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted }]}>
              Set up your primary currency symbol and formatting position. All financial values are stored as integers to prevent float rounding errors.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Currency Symbol</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.textPrimary, borderColor: colors.borderDefault, backgroundColor: colors.bgElevated },
                ]}
                value={customSymbol}
                onChangeText={setCustomSymbol}
                maxLength={6}
                placeholder="e.g. $, VNĐ, đ"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Symbol Position</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { borderColor: colors.borderDefault },
                  currencyPosition === 'prefix' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setCurrencyPosition('prefix')}
              >
                <Text style={[styles.optionText, { color: currencyPosition === 'prefix' ? '#FFFFFF' : colors.textPrimary }]}>
                  Prefix ({customSymbol}100)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { borderColor: colors.borderDefault },
                  currencyPosition === 'suffix' && { backgroundColor: colors.accentPrimary, borderColor: 'transparent' },
                ]}
                onPress={() => setCurrencyPosition('suffix')}
              >
                <Text style={[styles.optionText, { color: currencyPosition === 'suffix' ? '#FFFFFF' : colors.textPrimary }]}>
                  Suffix (100 {customSymbol})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentSlide === 2 && (
          <View style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
              <ShieldCheck size={48} color={colors.stateError} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Ready to Launch</Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted }]}>
              You are ready to manage your wallets, liabilities, budgets, and peer-to-peer debts securely and fully offline.
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
              <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
                🌐 Language: <Text style={{ fontWeight: '700' }}>{language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
              </Text>
              <Text style={[styles.summaryText, { color: colors.textPrimary, marginTop: 8 }]}>
                💰 Currency: <Text style={{ fontWeight: '700' }}>{customSymbol} ({currencyPosition})</Text>
              </Text>
              <Text style={[styles.summaryText, { color: colors.textPrimary, marginTop: 8 }]}>
                🎨 Theme: <Text style={{ fontWeight: '700' }}>{theme}</Text>
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {currentSlide > 0 ? (
          <TouchableOpacity
            style={[styles.navButton, { borderColor: colors.borderDefault, borderWidth: 1 }]}
            onPress={handleBack}
          >
            <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.accentPrimary }]}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
            {currentSlide === 2 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '600',
    fontSize: 13,
  },
  themeOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 32,
  },
  navButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
})
