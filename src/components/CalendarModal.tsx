import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/theme';

type CalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  value?: string; // YYYY-MM-DD format
};

export function CalendarModal({ visible, onClose, onSelectDate, value }: CalendarModalProps) {
  // If value is provided, initialize to that date, else today
  const initialDate = value ? new Date(value) : new Date();
  
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle month increment/decrement
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate date grid items
  const gridItems = [];
  
  // Empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    gridItems.push(<View key={`empty-${i}`} style={styles.dayCell} />);
  }

  // Day buttons
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = value === dateString;
    const today = new Date();
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;

    gridItems.push(
      <TouchableOpacity
        key={`day-${day}`}
        style={[
          styles.dayCell,
          isSelected && styles.selectedDayCell,
        ]}
        onPress={() => {
          onSelectDate(dateString);
          onClose();
        }}
      >
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayText
        ]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.container} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
              <ChevronLeft color={colors.text} size={20} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {months[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
              <ChevronRight color={colors.text} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {gridItems}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arrowButton: {
    padding: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
  },
  weekdayText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    width: 38,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayCell: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: radii.md,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: '900',
  },
  todayText: {
    color: colors.primary,
    fontWeight: '900',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  closeButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.md,
  },
  closeButtonText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 15,
  },
});
