import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssignmentStatus, PaymentStatus, Priority } from '../data/types';
import { colors, radii } from '../theme/theme';

type Props = {
  label: AssignmentStatus | PaymentStatus | Priority | string;
  type?: 'status' | 'payment' | 'priority';
};

export function StatusBadge({ label, type = 'status' }: Props) {
  const tone = colorFor(label, type);
  return (
    <View style={[styles.wrap, { backgroundColor: `${tone}18`, borderColor: `${tone}44` }]}>
      <Text style={[styles.text, { color: tone }]}>{label}</Text>
    </View>
  );
}

const colorFor = (label: string, type: string) => {
  if (type === 'payment') {
    if (label === 'Fully Paid') return colors.success;
    if (label === 'Partially Paid') return colors.warning;
    return colors.danger;
  }
  if (type === 'priority') {
    if (label === 'Urgent') return colors.danger;
    if (label === 'High') return colors.warning;
    if (label === 'Medium') return colors.primary;
    return colors.accent;
  }
  if (label === 'Completed' || label === 'Submitted') return colors.success;
  if (label === 'Cancelled') return colors.danger;
  if (label === 'In Progress') return colors.primary;
  return colors.warning;
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
