import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme';

const moneyCards = [
  {
    title: 'Monthly essentials',
    value: '$2,140',
    subtitle: 'Keep your core costs visible so planning feels manageable.',
    icon: 'card-outline',
    accent: '#0F766E',
  },
  {
    title: 'Savings goal',
    value: '$620 / $1,000',
    subtitle: 'A simple target that keeps momentum visible week to week.',
    icon: 'wallet-outline',
    accent: '#2563EB',
  },
  {
    title: 'Upcoming payments',
    value: '3 this week',
    subtitle: 'See what is due soon and what needs attention first.',
    icon: 'calendar-outline',
    accent: '#F97316',
  },
];

const moneyActions = [
  'Set a weekly budget check-in',
  'Track recurring subscriptions',
  'Keep business and personal costs separate',
  'Save notes for grants, invoices, and important deadlines',
];

export default function MoneyToolsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Ionicons name="wallet-outline" size={16} color="#FED7AA" />
          <Text style={styles.heroBadgeText}>Money Tools</Text>
        </View>
        <Text style={styles.heroTitle}>Track money with less pressure.</Text>
        <Text style={styles.heroBody}>
          Nexta keeps money tools practical: simple planning, better visibility, and calmer
          next steps for everyday life and business.
        </Text>
      </View>

      <View style={styles.cardsGrid}>
        {moneyCards.map((card) => (
          <View key={card.title} style={styles.moneyCard}>
            <View style={[styles.moneyIcon, { backgroundColor: `${card.accent}18` }]}>
              <Ionicons name={card.icon as any} size={22} color={card.accent} />
            </View>
            <Text style={styles.moneyTitle}>{card.title}</Text>
            <Text style={styles.moneyValue}>{card.value}</Text>
            <Text style={styles.moneySubtitle}>{card.subtitle}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Practical next steps</Text>
        <View style={styles.actionList}>
          {moneyActions.map((item) => (
            <View key={item} style={styles.actionItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#34D399" />
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>Build a simple money plan</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F2937',
    ...shadows.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBadgeText: {
    color: '#FED7AA',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: spacing.md,
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  heroBody: {
    marginTop: 10,
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  cardsGrid: {
    gap: spacing.md,
  },
  moneyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  moneyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moneyTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  moneyValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  moneySubtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  actionsTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  actionList: {
    gap: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryCta: {
    marginTop: spacing.lg,
    borderRadius: 18,
    backgroundColor: '#0F766E',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryCtaText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
