import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FileSearch, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { FileCard } from '../components/FileCard';
import { FilterChip } from '../components/FilterChip';
import { LedgerFile } from '../data/types';
import { deleteFileRecord, listFiles } from '../data/database';
import { shareFile } from '../services/fileService';
import { colors, radii, spacing } from '../theme/theme';

type Filter = 'All' | 'PDF' | 'DOC/DOCX' | 'Images' | 'Other';
const filters: Filter[] = ['All', 'PDF', 'DOC/DOCX', 'Images', 'Other'];

export function FilesScreen() {
  const [files, setFiles] = useState<LedgerFile[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const load = useCallback(async () => {
    setFiles(await listFiles());
  }, []);

  const removeFile = async (fileId: number) => {
    await deleteFileRecord(fileId);
    await load();
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return files.filter((file) => {
      const search = [file.fileName, file.assignmentTitle, file.studentName]
        .join(' ')
        .toLowerCase()
        .includes(needle);
      const type = file.fileType.toLowerCase();
      const matchesType =
        filter === 'All' ||
        (filter === 'PDF' && type.includes('pdf')) ||
        (filter === 'DOC/DOCX' && (type.includes('document') || file.fileName.match(/\.docx?$/i))) ||
        (filter === 'Images' && type.includes('image')) ||
        (filter === 'Other' && !type.includes('pdf') && !type.includes('document') && !type.includes('image'));
      return (!needle || search) && matchesType;
    });
  }, [files, filter, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Files" subtitle={`${files.length} uploaded`} rightIcon={FileSearch} />
      <View style={styles.mainContainer}>
        <View style={styles.searchWrap}>
          <Search color={colors.muted} size={20} />
          <TextInput
            placeholder="Search files, assignments, students..."
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
              {filtered.map((file) => (
                <FileCard file={file} key={file.id} onShare={() => shareFile(file.fileUri)} onDelete={() => removeFile(file.id)} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={FileSearch}
              title="No files uploaded yet"
              description="Attach PDFs, DOCX, images, or documents from an assignment detail screen."
            />
          )}
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
});
