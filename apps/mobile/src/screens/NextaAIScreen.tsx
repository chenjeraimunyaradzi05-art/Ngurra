import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme';

const promptGroups = [
  {
    title: 'Work',
    prompts: [
      'What should I do next to find better opportunities?',
      'Help me prepare for applications this week.',
      'Show me a simple plan for interview readiness.',
    ],
  },
  {
    title: 'Learning',
    prompts: [
      'Which skills should I strengthen first?',
      'Create a short study plan I can follow this week.',
      'What can I finish in the next 30 days?',
    ],
  },
  {
    title: 'Business',
    prompts: [
      'What is the next step for my business idea?',
      'Help me get organised with practical tools.',
      'What should I set up first to start earning?',
    ],
  },
];

export default function NextaAIScreen() {
  const [selectedPrompt, setSelectedPrompt] = useState(promptGroups[0].prompts[0]);

  const response = useMemo(
    () => [
      'Pick one priority for this week and make it specific.',
      'Set a clear time block for the task that matters most.',
      'Use support tools or a mentor to remove the next blocker quickly.',
    ],
    [selectedPrompt]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles-outline" size={16} color="#A7F3D0" />
          <Text style={styles.heroBadgeText}>Nexta AI</Text>
        </View>
        <Text style={styles.heroTitle}>Personalised next steps, anytime.</Text>
        <Text style={styles.heroBody}>
          Use Nexta AI for planning, readiness, prompt coaching, and practical momentum when
          you're not sure what comes next.
        </Text>
      </View>

      {promptGroups.map((group) => (
        <View key={group.title} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          <View style={styles.promptWrap}>
            {group.prompts.map((prompt) => {
              const active = prompt === selectedPrompt;
              return (
                <TouchableOpacity
                  key={prompt}
                  style={[styles.promptChip, active && styles.promptChipActive]}
                  onPress={() => setSelectedPrompt(prompt)}
                >
                  <Text style={[styles.promptChipText, active && styles.promptChipTextActive]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.responseCard}>
        <Text style={styles.responseLabel}>Selected prompt</Text>
        <Text style={styles.responsePrompt}>{selectedPrompt}</Text>

        <View style={styles.responseList}>
          {response.map((item) => (
            <View key={item} style={styles.responseItem}>
              <View style={styles.responseBullet} />
              <Text style={styles.responseText}>{item}</Text>
            </View>
          ))}
        </View>
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
    color: '#A7F3D0',
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  promptWrap: {
    gap: 10,
  },
  promptChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  promptChipActive: {
    borderColor: '#0F766E',
    backgroundColor: 'rgba(15,118,110,0.16)',
  },
  promptChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  promptChipTextActive: {
    color: colors.text,
  },
  responseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  responseLabel: {
    color: '#5EEAD4',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  responsePrompt: {
    marginTop: 10,
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  responseList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  responseBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginTop: 7,
  },
  responseText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
