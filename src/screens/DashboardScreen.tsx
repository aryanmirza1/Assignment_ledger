import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileDown,
  ListPlus,
  ReceiptText,
  WalletCards,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { StatusBadge } from '../components/StatusBadge';
import { SummaryCard } from '../components/SummaryCard';
import { Project, Analytics } from '../data/types';
import { getAnalytics, listProjects, listPayments } from '../data/database';
import { exportFullRecordsPdf } from '../services/pdfService';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, displayDate, isDueSoon, isOverdue } from '../utils/format';

type Navigation = any;

export function DashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async () => {
    const [analyticsResult, projectResult] = await Promise.all([getAnalytics(), listProjects()]);
    setAnalytics(analyticsResult);
    setProjects(projectResult);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const dueSoon = projects.filter((item) => isDueSoon(item) || isOverdue(item)).slice(0, 4);

  const exportReport = async () => {
    const [freshAnalytics, freshProjects, payments] = await Promise.all([
      getAnalytics(),
      listProjects(),
      listPayments(),
    ]);
    await exportFullRecordsPdf(freshAnalytics, freshProjects, payments);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Project Tracker" subtitle="Hello, Aryan!" rightIcon={CalendarClock} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.greeting}>Track your work, payments, and deadlines</Text>
            <Text style={styles.heroSub}>Local-only records for projects and client payments.</Text>
          </View>

          <View style={styles.grid}>
            <SummaryCard
              label="Total Projects"
              value={analytics?.totalProjects ?? 0}
              icon={ReceiptText}
              onPress={() => navigation.navigate('Projects', { filter: 'All' })}
            />
            <SummaryCard
              label="Active Projects"
              value={analytics?.activeProjects ?? 0}
              icon={ListPlus}
              tone="dark"
              onPress={() => navigation.navigate('Projects', { filter: 'Active' })}
            />
            <SummaryCard
              label="Completed"
              value={analytics?.completedProjects ?? 0}
              icon={CheckCircle2}
              tone="green"
              onPress={() => navigation.navigate('Projects', { filter: 'Completed' })}
            />
            <SummaryCard
              label="Pending Payment"
              value={currency(analytics?.totalRemaining ?? 0)}
              icon={WalletCards}
              tone="orange"
              onPress={() => navigation.navigate('Projects', { filter: 'Pending Payment' })}
            />
            <SummaryCard
              label="Total Received"
              value={currency(analytics?.totalReceived ?? 0)}
              icon={WalletCards}
              tone="green"
              onPress={() => navigation.navigate('Payments')}
            />
            <SummaryCard
              label="Overdue Tasks"
              value={analytics?.overdueProjects ?? 0}
              icon={AlertTriangle}
              tone="red"
              onPress={() => navigation.navigate('Projects', { filter: 'Overdue' })}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Due Soon</Text>
          </View>

          {dueSoon.length ? (
            <View style={styles.list}>
              {dueSoon.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.dueCard}
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
                >
                  <View style={styles.dueTop}>
                    <View style={styles.flex}>
                      <Text style={styles.dueTitle}>{project.title}</Text>
                      <Text style={styles.dueMeta}>{project.studentName}</Text>
                    </View>
                    <StatusBadge label={isOverdue(project) ? 'Overdue' : project.status} />
                  </View>
                  <Text style={styles.dueMeta}>Deadline {displayDate(project.deadline)}</Text>
                  {project.remainingAmount > 0 ? (
                    <Text style={styles.remaining}>Remaining {currency(project.remainingAmount)}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : projects.length > 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              description="No urgent projects due soon or overdue."
            />
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No projects yet"
              description="Create your first project to start tracking work and payments."
              actionLabel="Add Project"
              onAction={() => navigation.navigate('ProjectForm')}
            />
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <PrimaryButton title="Add Project" icon={ListPlus} onPress={() => navigation.navigate('ProjectForm')} />
            <PrimaryButton title="Add Payment" icon={WalletCards} onPress={() => navigation.navigate('AddPayment')} style={{ backgroundColor: colors.primary }} />
            <SecondaryButton title="Export Report" icon={FileDown} onPress={exportReport} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  greeting: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  heroSub: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  dueCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.soft,
  },
  dueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dueTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  dueMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  remaining: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
  },
  flex: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
