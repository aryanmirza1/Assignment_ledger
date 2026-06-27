import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { Assignment, Analytics } from '../data/types';
import { getAnalytics, listAssignments, listPayments } from '../data/database';
import { RootStackParamList } from '../navigation/types';
import { exportFullRecordsPdf } from '../services/pdfService';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, displayDate, isDueSoon, isOverdue } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const load = useCallback(async () => {
    const [analyticsResult, assignmentResult] = await Promise.all([getAnalytics(), listAssignments()]);
    setAnalytics(analyticsResult);
    setAssignments(assignmentResult);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const dueSoon = assignments.filter((item) => isDueSoon(item) || isOverdue(item)).slice(0, 4);

  const exportReport = async () => {
    const [freshAnalytics, freshAssignments, payments] = await Promise.all([
      getAnalytics(),
      listAssignments(),
      listPayments(),
    ]);
    await exportFullRecordsPdf(freshAnalytics, freshAssignments, payments);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Assignment Ledger" subtitle="Hello, Aryan!" rightIcon={CalendarClock} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.greeting}>Track your work, payments, and deadlines</Text>
            <Text style={styles.heroSub}>Local-only records for assignments and client payments.</Text>
          </View>

          <View style={styles.grid}>
            <SummaryCard label="Total Assignments" value={analytics?.totalAssignments ?? 0} icon={ReceiptText} />
            <SummaryCard label="Active Assignments" value={analytics?.activeAssignments ?? 0} icon={ListPlus} tone="dark" />
            <SummaryCard label="Completed" value={analytics?.completedAssignments ?? 0} icon={CheckCircle2} tone="green" />
            <SummaryCard label="Pending Payment" value={currency(analytics?.totalRemaining ?? 0)} icon={WalletCards} tone="orange" />
            <SummaryCard label="Total Received" value={currency(analytics?.totalReceived ?? 0)} icon={WalletCards} tone="green" />
            <SummaryCard label="Overdue Tasks" value={analytics?.overdueAssignments ?? 0} icon={AlertTriangle} tone="red" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Due Soon</Text>
          </View>

          {dueSoon.length ? (
            <View style={styles.list}>
              {dueSoon.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.dueCard}
                  onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: assignment.id })}
                >
                  <View style={styles.dueTop}>
                    <View style={styles.flex}>
                      <Text style={styles.dueTitle}>{assignment.title}</Text>
                      <Text style={styles.dueMeta}>{assignment.studentName}</Text>
                    </View>
                    <StatusBadge label={isOverdue(assignment) ? 'Overdue' : assignment.status} />
                  </View>
                  <Text style={styles.dueMeta}>Deadline {displayDate(assignment.deadline)}</Text>
                  {assignment.remainingAmount > 0 ? (
                    <Text style={styles.remaining}>Remaining {currency(assignment.remainingAmount)}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : assignments.length > 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              description="No urgent assignments due soon or overdue."
            />
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No assignments yet"
              description="Create your first assignment to start tracking work and payments."
              actionLabel="Add Assignment"
              onAction={() => navigation.navigate('AssignmentForm')}
            />
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <PrimaryButton title="Add Assignment" icon={ListPlus} onPress={() => navigation.navigate('AssignmentForm')} />
            <SecondaryButton title="Add Payment" icon={WalletCards} onPress={() => navigation.navigate('AddPayment')} />
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
    ...shadows.card,
  },
  greeting: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  heroSub: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  sectionHeader: {
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
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  dueTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  dueMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  remaining: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
