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
  setTheme: (theme: Theme) => void
  setCurrencySymbol: (symbol: string) => void
  setCurrencyPosition: (position: CurrencyPosition) => void
  setLanguage: (lang: string) => void
  setHasCompletedOnboarding: (completed: boolean) => void
  setIsBiometricEnabled: (enabled: boolean) => void
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
      setTheme: (theme) => set({ theme }),
      setCurrencySymbol: (currencySymbol) => set({ currencySymbol }),
      setCurrencyPosition: (currencyPosition) => set({ currencyPosition }),
      setLanguage: (language) => set({ language }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setIsBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
