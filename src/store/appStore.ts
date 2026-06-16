import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'
type CurrencyPosition = 'prefix' | 'suffix'

interface AppState {
  theme: Theme
  currencySymbol: string
  currencyPosition: CurrencyPosition
  language: string
  hasCompletedOnboarding: boolean
  isBiometricEnabled: boolean
  showDecimals: boolean
  firstDayOfWeek: number // 0 for Sunday, 1 for Monday
  setTheme: (theme: Theme) => void
  setCurrencySymbol: (symbol: string) => void
  setCurrencyPosition: (position: CurrencyPosition) => void
  setLanguage: (lang: string) => void
  setHasCompletedOnboarding: (completed: boolean) => void
  setIsBiometricEnabled: (enabled: boolean) => void
  setShowDecimals: (show: boolean) => void
  setFirstDayOfWeek: (day: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      currencySymbol: '$',
      currencyPosition: 'prefix',
      language: 'en',
      hasCompletedOnboarding: false,
      isBiometricEnabled: false,
      showDecimals: true,
      firstDayOfWeek: 1, // Default Monday
      setTheme: (theme) => set({ theme }),
      setCurrencySymbol: (currencySymbol) => set({ currencySymbol }),
      setCurrencyPosition: (currencyPosition) => set({ currencyPosition }),
      setLanguage: (language) => set({ language }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setIsBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
      setShowDecimals: (showDecimals) => set({ showDecimals }),
      setFirstDayOfWeek: (firstDayOfWeek) => set({ firstDayOfWeek }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
