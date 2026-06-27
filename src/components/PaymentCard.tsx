import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Trash2, WalletCards } from 'lucide-react-native';
import { Payment } from '../data/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, displayDate } from '../utils/format';

type Props = {
  payment: Payment;
  onDelete?: () => void;
};

export function PaymentCard({ payment, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <WalletCards color={colors.accent} size={23} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.title}>{payment.studentName}</Text>
        <Text style={styles.subtitle}>{payment.projectTitle}</Text>
        <Text style={styles.note}>
          {payment.paymentMethod} · {displayDate(payment.paymentDate)}
          {payment.note ? ` · ${payment.note}` : ''}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>{currency(payment.amount)}</Text>
        {onDelete ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
            <Trash2 color={colors.danger} size={18} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  flex: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
  amount: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '900',
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  deleteBtn: {
    alignItems: 'center',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
