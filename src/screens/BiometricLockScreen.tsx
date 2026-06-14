import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useThemeColors } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import { Lock } from 'lucide-react-native'

interface BiometricLockScreenProps {
  onUnlock: () => void
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const colors = useThemeColors()
  const { t } = useTranslation()
  const [authenticating, setAuthenticating] = useState(false)

  const authenticate = async () => {
    setAuthenticating(true)
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        // Fallback: If hardware is not available or no biometrics enrolled, unlock automatically
        onUnlock()
        return
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric.prompt'),
        disableDeviceFallback: false,
      })

      if (result.success) {
        onUnlock()
      }
    } catch (error) {
      Alert.alert(t('biometric.error_title'), t('biometric.error_desc'))
    } finally {
      setAuthenticating(false)
    }
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault }]}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
          <Lock size={48} color={colors.accentPrimary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('biometric.app_locked')}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {t('biometric.description')}
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: colors.accentPrimary }]}
          onPress={authenticate}
          disabled={authenticating}
        >
          {authenticating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>{t('biometric.unlock_app')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.05)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
})
