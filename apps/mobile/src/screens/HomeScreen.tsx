import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSession } from '../hooks/useSession';
import { memberApi, jobsApi } from '../services/api';
import { colors, spacing, borderRadius, shadows } from '../theme';

type RootStackParamList = {
  Jobs: undefined;
  Courses: undefined;
  Mentorship: undefined;
  Community: undefined;
  MyApplications: undefined;
  Profile: undefined;
  JobDetail: { id: string };
  NextaAI: undefined;
  MoneyTools: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  location: string;
  employmentType: string;
  postedAt: string;
}

interface Profile {
  firstName: string;
  lastName: string;
  profileCompletionPercent: number;
  avatarUrl?: string;
}

const WEEKLY_PROGRESS = 62;
const featureChips = ['Jobs', 'Learning', 'Mentors', 'Community', 'Money Tools', 'Business'];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [profileData, jobsData] = await Promise.all([
        memberApi.getProfile().catch(() => null),
        jobsApi.getJobs({ limit: 4 }).catch(() => ({ jobs: [] })),
      ]);

      if (profileData?.profile) {
        setProfile(profileData.profile);
      }

      if (jobsData?.jobs) {
        setRecentJobs(jobsData.jobs);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const quickActions = [
    { icon: 'briefcase-outline', label: 'Find Opportunities', screen: 'Jobs' as const, color: '#0F766E' },
    { icon: 'school-outline', label: 'Upgrade Skills', screen: 'Courses' as const, color: '#2563EB' },
    { icon: 'sparkles-outline', label: 'Ask Nexta AI', screen: 'NextaAI' as const, color: '#7C3AED' },
    { icon: 'people-outline', label: 'Book a Mentor', screen: 'Mentorship' as const, color: '#0EA5E9' },
    { icon: 'wallet-outline', label: 'Track Money', screen: 'MoneyTools' as const, color: '#F97316' },
    { icon: 'chatbubbles-outline', label: 'Post / Connect', screen: 'Community' as const, color: '#EC4899' },
  ];

  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Nexta Home</Text>
          <Text style={styles.greeting}>Welcome back - ready for your next step?</Text>
          <Text style={styles.subheading}>
            Jobs, learning, mentors, tools, and support that help you keep moving.
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {(profile?.firstName?.[0] || user?.email?.[0] || 'N').toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Your next step, connected.</Text>
          </View>
          <Text style={styles.heroName}>{displayName}</Text>
        </View>

        <Text style={styles.heroTitle}>Continue your Pathway</Text>
        <Text style={styles.heroBody}>
          Personalised pathways. Practical tools. Real momentum.
        </Text>

        <View style={styles.progressPanel}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>You're {WEEKLY_PROGRESS}% through this week's plan</Text>
            <Text style={styles.progressValue}>{WEEKLY_PROGRESS}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${WEEKLY_PROGRESS}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryCta}
          onPress={() => navigation.navigate('MyApplications')}
        >
          <Text style={styles.primaryCtaText}>Continue your Pathway</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.chipsWrap}>
          {featureChips.map((chip) => (
            <View key={chip} style={styles.featureChip}>
              <Text style={styles.featureChipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>

      {profile && profile.profileCompletionPercent < 100 && (
        <TouchableOpacity
          style={styles.setupCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.setupRow}>
            <View style={styles.setupIcon}>
              <Ionicons name="person-circle-outline" size={22} color="#F97316" />
            </View>
            <View style={styles.setupCopy}>
              <Text style={styles.setupTitle}>Finish your Nexta setup</Text>
              <Text style={styles.setupSubtitle}>
                {profile.profileCompletionPercent}% complete. A stronger profile unlocks better matches.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
      </View>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionItem}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Opportunity radar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
          <Text style={styles.seeAll}>Explore all</Text>
        </TouchableOpacity>
      </View>

      {recentJobs.length > 0 ? (
        <View style={styles.jobsList}>
          {recentJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => navigation.navigate('JobDetail', { id: job.id })}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobIcon}>
                  <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.companyName}>{job.company?.name || 'Company'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
              <View style={styles.jobFooter}>
                <View style={styles.jobMeta}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
                <View style={styles.jobMeta}>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.metaText}>{job.employmentType}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={42} color={colors.textMuted} />
          <Text style={styles.emptyText}>No opportunities to show right now.</Text>
        </View>
      )}

      <View style={styles.footerSpacer} />
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
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#5EEAD4',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F2937',
    ...shadows.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '700',
  },
  heroName: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroTitle: {
    marginTop: spacing.md,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: '#CBD5E1',
  },
  progressPanel: {
    marginTop: spacing.lg,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#34D399',
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
  chipsWrap: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  featureChipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  setupCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setupIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(249,115,22,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  setupCopy: {
    flex: 1,
  },
  setupTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  setupSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    color: '#5EEAD4',
    fontSize: 14,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionItem: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  jobsList: {
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  companyName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingLeft: 52,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  footerSpacer: {
    height: 80,
  },
});
