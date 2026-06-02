import { useColorScheme } from 'react-native'
import { useAppStore } from '../store/appStore'

export const themeTokens = {
  light: {
    bgBase: '#F8FAFC',       // Slate 50
    bgSurface: '#FFFFFF',    // White
    bgElevated: '#F1F5F9',   // Slate 100
    textPrimary: '#0F172A',  // Slate 900
    textMuted: '#64748B',    // Slate 500
    accentPrimary: '#4F46E5',// Indigo 600
    borderDefault: '#E2E8F0',// Slate 200
    stateError: '#EF4444',   // Red 500
    stateSuccess: '#10B981', // Emerald 500
    stateWarning: '#F59E0B', // Amber 500
  },
  dark: {
    bgBase: '#0F172A',       // Slate 900
    bgSurface: '#1E293B',    // Slate 800
    bgElevated: '#334155',   // Slate 700
    textPrimary: '#F8FAFC',  // Slate 50
    textMuted: '#94A3B8',    // Slate 400
    accentPrimary: '#6366F1',// Indigo 500
    borderDefault: '#334155',// Slate 700
    stateError: '#F87171',   // Red 400
    stateSuccess: '#34D399', // Emerald 400
    stateWarning: '#FBBF24', // Amber 400
  }
}

export type ThemeColors = typeof themeTokens.light

export function useThemeColors(): ThemeColors {
  const userTheme = useAppStore((state) => state.theme)
  const systemScheme = useColorScheme()

  const activeTheme = userTheme === 'system' ? (systemScheme || 'light') : userTheme
  return themeTokens[activeTheme] || themeTokens.light
}
