import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, UserRound } from 'lucide-react-native';
import { Assignment } from '../data/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, displayDate, isOverdue } from '../utils/format';
import { PaymentProgressBar } from './PaymentProgressBar';
import { StatusBadge } from './StatusBadge';
import { PrimaryButton } from './Buttons';

type Props = {
  assignment: Assignment;
  onPress: () => void;
};

export function AssignmentCard({ assignment, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{assignment.studentName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.subject}>{assignment.subject}</Text>
        </View>
        <StatusBadge label={isOverdue(assignment) ? 'Overdue' : assignment.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <UserRound size={15} color={colors.muted} />
          <Text style={styles.metaText}>{assignment.studentName}</Text>
        </View>
        <View style={styles.meta}>
          <CalendarDays size={15} color={colors.muted} />
          <Text style={styles.metaText}>{displayDate(assignment.deadline)}</Text>
        </View>
      </View>

      <View style={styles.amounts}>
        <Text style={styles.amountText}>Total {currency(assignment.totalAmount)}</Text>
        <Text style={styles.amountText}>Paid {currency(assignment.paidAmount)}</Text>
        <Text style={[styles.amountText, assignment.remainingAmount > 0 && styles.warning]}>
          Due {currency(assignment.remainingAmount)}
        </Text>
      </View>
      <PaymentProgressBar paid={assignment.paidAmount} total={assignment.totalAmount} />
      <PrimaryButton title="View Details" onPress={onPress} style={styles.button} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subject: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  amounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  amountText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  warning: {
    color: colors.warning,
  },
  button: {
    marginTop: spacing.md,
  },
});
