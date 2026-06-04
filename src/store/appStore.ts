import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'
type CurrencyPosition = 'prefix' | 'suffix'
type TimeSyncMode = 'device' | 'network'

interface AppState {
  theme: Theme
  currencySymbol: string
  currencyPosition: CurrencyPosition
  language: string
  hasCompletedOnboarding: boolean
  isBiometricEnabled: boolean
  firstDayOfWeek: number // 0 for Sunday, 1 for Monday
  timeSyncMode: TimeSyncMode
  networkTimezone: string | null
  setTheme: (theme: Theme) => void
  setCurrencySymbol: (symbol: string) => void
  setCurrencyPosition: (position: CurrencyPosition) => void
  setLanguage: (lang: string) => void
  setHasCompletedOnboarding: (completed: boolean) => void
  setIsBiometricEnabled: (enabled: boolean) => void
  setFirstDayOfWeek: (day: number) => void
  setTimeSyncMode: (mode: TimeSyncMode) => void
  setNetworkTimezone: (timezone: string | null) => void
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
      firstDayOfWeek: 1, // Default Monday
      timeSyncMode: 'device',
      networkTimezone: null,
      setTheme: (theme) => set({ theme }),
      setCurrencySymbol: (currencySymbol) => set({ currencySymbol }),
      setCurrencyPosition: (currencyPosition) => set({ currencyPosition }),
      setLanguage: (language) => set({ language }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setIsBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
      setFirstDayOfWeek: (firstDayOfWeek) => set({ firstDayOfWeek }),
      setTimeSyncMode: (timeSyncMode) => set({ timeSyncMode }),
      setNetworkTimezone: (networkTimezone) => set({ networkTimezone }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
