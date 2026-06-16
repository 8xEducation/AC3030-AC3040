import React from 'react'
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { useThemeColors } from '../utils/theme'
import { formatCurrency } from '../utils/currencyFormatter'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../utils/i18n'
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react-native'

interface NetWorthCardProps {
  totalAssets: number // in cents
  totalLiabilities: number // in cents
}



export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  totalAssets,
  totalLiabilities,
}) => {
  const colors = useThemeColors()
  const { currencySymbol, currencyPosition, showDecimals } = useAppStore()
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()

  const netWorth = totalAssets - totalLiabilities
  const formattedNetWorth = formatCurrency(netWorth, currencySymbol, currencyPosition, showDecimals)
  const formattedAssets = formatCurrency(totalAssets, currencySymbol, currencyPosition, showDecimals)
  const formattedLiabilities = formatCurrency(totalLiabilities, currencySymbol, currencyPosition, showDecimals)

  return (
    <View style={[styles.container, { width: screenWidth - 32, boxShadow: `0 4px 12px ${colors.accentPrimary}4D` }]}>
      {/* SVG Gradient Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#4F46E5" stopOpacity="1" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={16} ry={16} fill="url(#grad)" />
        </Svg>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.label}>{t('networth.title')}</Text>
          <View style={styles.badge}>
            <TrendingUp size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>{t('networth.live_balance')}</Text>
          </View>
        </View>

        <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
          {formattedNetWorth}
        </Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.flowContainer}>
            <View style={styles.iconContainerSuccess}>
              <ArrowUpRight size={14} color="#10B981" />
            </View>
            <View>
              <Text style={styles.flowLabel}>{t('networth.total_assets')}</Text>
              <Text style={styles.flowAmount}>{formattedAssets}</Text>
            </View>
          </View>

          <View style={styles.flowContainer}>
            <View style={styles.iconContainerError}>
              <ArrowDownRight size={14} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.flowLabel}>{t('networth.liabilities')}</Text>
              <Text style={styles.flowAmount}>{formattedLiabilities}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    marginVertical: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainerSuccess: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerError: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '500',
  },
  flowAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
})
