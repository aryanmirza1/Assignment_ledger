import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { Project } from '../data/types';
import { listProjects } from '../data/database';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { isOverdue } from '../utils/format';

type Filter = 'All' | 'Active' | 'Completed' | 'Pending Payment' | 'Overdue';
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const filters: Filter[] = ['All', 'Active', 'Completed', 'Pending Payment', 'Overdue'];

export function ProjectsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  React.useEffect(() => {
    const params = route.params as { filter?: Filter } | undefined;
    if (params?.filter) {
      setFilter(params.filter);
      navigation.setParams({ filter: undefined } as any);
    }
  }, [route.params, navigation]);

  const load = useCallback(async () => {
    setProjects(await listProjects());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !needle ||
        [project.studentName, project.subject, project.title]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Active' && project.status !== 'Completed' && project.status !== 'Cancelled') ||
        (filter === 'Completed' && project.status === 'Completed') ||
        (filter === 'Pending Payment' && project.remainingAmount > 0) ||
        (filter === 'Overdue' && isOverdue(project));
      return matchesSearch && matchesFilter;
    });
  }, [projects, filter, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Projects" subtitle={`${projects.length} records`} rightIcon={SlidersHorizontal} />
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
              {filtered.map((project) => (
                <ProjectCard
                  project={project}
                  key={project.id}
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={Search}
              title="No projects found"
              description="Try another filter or create a new project record."
              actionLabel="Add Project"
              onAction={() => navigation.navigate('ProjectForm')}
            />
          )}
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProjectForm')}>
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
