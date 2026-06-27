import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssignmentStatus, PaymentStatus, Priority } from '../data/types';
import { colors, radii } from '../theme/theme';

type Props = {
  label: AssignmentStatus | PaymentStatus | Priority | string;
  type?: 'status' | 'payment' | 'priority';
};

export function StatusBadge({ label, type = 'status' }: Props) {
  const stylesObj = getBadgeStyles(label, type);
  return (
    <View style={[styles.wrap, { backgroundColor: stylesObj.bg, borderColor: stylesObj.border }]}>
      <Text style={[styles.text, { color: stylesObj.text }]}>{label}</Text>
    </View>
  );
}

const getBadgeStyles = (label: string, type: string) => {
  // Defaults
  let text = colors.primary;
  let bg = '#eff6ff';
  let border = '#dbeafe';

  if (type === 'payment') {
    if (label === 'Fully Paid') {
      text = '#15803d'; // Darker success green
      bg = '#f0fdf4';   // Light green
      border = '#dcfce7';
    } else if (label === 'Partially Paid') {
      text = '#b45309'; // Darker warning amber
      bg = '#fffbeb';   // Light amber
      border = '#fef3c7';
    } else {
      // Not Paid
      text = '#b91c1c'; // Darker danger red
      bg = '#fef2f2';   // Light red
      border = '#fee2e2';
    }
  } else if (type === 'priority') {
    if (label === 'Urgent') {
      text = '#b91c1c';
      bg = '#fef2f2';
      border = '#fee2e2';
    } else if (label === 'High') {
      text = '#b45309';
      bg = '#fffbeb';
      border = '#fef3c7';
    } else if (label === 'Medium') {
      text = '#1d4ed8';
      bg = '#eff6ff';
      border = '#dbeafe';
    } else {
      // Low
      text = '#0f766e';
      bg = '#f0fdfa';
      border = '#ccfbf1';
    }
  } else {
    // Status
    if (label === 'Completed' || label === 'Submitted') {
      text = '#15803d';
      bg = '#f0fdf4';
      border = '#dcfce7';
    } else if (label === 'Cancelled') {
      text = '#b91c1c';
      bg = '#fef2f2';
      border = '#fee2e2';
    } else if (label === 'In Progress') {
      text = '#1d4ed8';
      bg = '#eff6ff';
      border = '#dbeafe';
    } else {
      // Not Started / Other
      text = '#4b5563'; // Gray
      bg = '#f3f4f6';
      border = '#e5e7eb';
    }
  }

  return { text, bg, border };
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
