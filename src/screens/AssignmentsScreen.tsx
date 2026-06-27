import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { AssignmentCard } from '../components/AssignmentCard';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { Assignment } from '../data/types';
import { listAssignments } from '../data/database';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { isOverdue } from '../utils/format';

type Filter = 'All' | 'Active' | 'Completed' | 'Pending Payment' | 'Overdue';
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const filters: Filter[] = ['All', 'Active', 'Completed', 'Pending Payment', 'Overdue'];

export function AssignmentsScreen() {
  const navigation = useNavigation<Navigation>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const load = useCallback(async () => {
    setAssignments(await listAssignments());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesSearch =
        !needle ||
        [assignment.studentName, assignment.subject, assignment.title]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Active' && assignment.status !== 'Completed' && assignment.status !== 'Cancelled') ||
        (filter === 'Completed' && assignment.status === 'Completed') ||
        (filter === 'Pending Payment' && assignment.remainingAmount > 0) ||
        (filter === 'Overdue' && isOverdue(assignment));
      return matchesSearch && matchesFilter;
    });
  }, [assignments, filter, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Assignments" subtitle={`${assignments.length} records`} rightIcon={SlidersHorizontal} />
      <View style={styles.mainContainer}>
        <View style={styles.searchWrap}>
          <Search color={colors.muted} size={20} />
          <TextInput
            placeholder="Search by student, subject, title..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {filters.map((item) => (
            <FilterChip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length ? (
            <View style={styles.list}>
              {filtered.map((assignment) => (
                <AssignmentCard
                  assignment={assignment}
                  key={assignment.id}
                  onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: assignment.id })}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={Search}
              title="No assignments found"
              description="Try another filter or create a new assignment record."
              actionLabel="Add Assignment"
              onAction={() => navigation.navigate('AssignmentForm')}
            />
          )}
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AssignmentForm')}>
          <Plus color={colors.white} size={30} />
        </TouchableOpacity>
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
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  search: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  list: {
    gap: spacing.md,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 5,
    bottom: 104,
    height: 68,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 68,
    ...shadows.card,
  },
});
