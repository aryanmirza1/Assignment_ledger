import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, FilePlus2, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { FilterChip } from '../components/FilterChip';
import { TextInputField } from '../components/TextInputField';
import { createProject, getProject, updateProject } from '../data/database';
import {
  projectStatuses,
  projectTypes,
  ProjectInput,
  ProjectStatus,
  ProjectType,
  priorities,
  Priority,
} from '../data/types';
import { RootStackParamList } from '../navigation/types';
import { pickAndAttachFiles } from '../services/fileService';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { displayDate, safeNumber, todayISO } from '../utils/format';
import { CalendarModal } from '../components/CalendarModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectForm'>;

const baseForm: ProjectInput = {
  studentName: '',
  studentPhone: '',
  studentEmail: '',
  title: '',
  subject: '',
  institution: '',
  projectType: 'Report',
  deadline: '',
  startDate: todayISO(),
  status: 'Not Started',
  priority: 'Medium',
  totalAmount: 0,
  paidAmount: 0,
  notes: '',
};

export function ProjectFormScreen({ navigation, route }: Props) {
  const projectId = route.params?.projectId;
  const [form, setForm] = useState<ProjectInput>(baseForm);
  const [totalText, setTotalText] = useState('');
  const [paidText, setPaidText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;
      const project = await getProject(projectId);
      if (!project) return;
      setForm({
        studentName: project.studentName,
        studentPhone: project.studentPhone,
        studentEmail: project.studentEmail,
        title: project.title,
        subject: project.subject,
        institution: project.institution,
        projectType: project.projectType,
        deadline: project.deadline,
        startDate: project.startDate,
        status: project.status,
        priority: project.priority,
        totalAmount: project.totalAmount,
        paidAmount: project.paidAmount,
        notes: project.notes,
      });
      setTotalText(String(project.totalAmount));
      setPaidText(String(project.paidAmount));
    };
    void load();
  }, [projectId]);

  const remaining = useMemo(() => Math.max(0, safeNumber(totalText) - safeNumber(paidText)), [paidText, totalText]);

  const setField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.studentName.trim()) next.studentName = 'Student/client name is required.';
    if (!form.title.trim()) next.title = 'Project title is required.';
    if (!form.deadline.trim()) next.deadline = 'Deadline is required.';
    if (safeNumber(totalText) < 0) next.totalAmount = 'Total amount cannot be negative.';
    if (safeNumber(paidText) < 0) next.paidAmount = 'Paid amount cannot be negative.';
    if (!totalText.trim()) next.totalAmount = 'Total amount is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    const payload: ProjectInput = {
      ...form,
      totalAmount: safeNumber(totalText),
      paidAmount: Math.min(safeNumber(paidText), safeNumber(totalText)),
    };

    if (projectId) {
      await updateProject(projectId, payload);
      navigation.goBack();
      return;
    }

    const id = await createProject(payload);
    Alert.alert('Project saved', 'You can attach reference files from the detail screen.');
    navigation.replace('ProjectDetail', { projectId: id });
  };

  const attachFiles = async () => {
    if (!projectId) {
      Alert.alert('Save first', 'Open the saved project detail screen to attach files.');
      return;
    }
    const count = await pickAndAttachFiles(projectId);
    if (count > 0) {
      Alert.alert('Files attached', `${count} file${count === 1 ? '' : 's'} saved locally.`);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader
        title={projectId ? 'Edit Project' : 'Add Project'}
        subtitle="Client, deadline, payment, and notes"
        onBack={() => navigation.goBack()}
        rightIcon={Save}
      />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section title="Client Details">
            <TextInputField
              label="Student/client name"
              value={form.studentName}
              onChangeText={(value) => setField('studentName', value)}
              error={errors.studentName}
            />
            <TextInputField
              label="Phone number (optional)"
              value={form.studentPhone}
              keyboardType="phone-pad"
              onChangeText={(value) => setField('studentPhone', value)}
            />
            <TextInputField
              label="Email (optional)"
              value={form.studentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => setField('studentEmail', value)}
            />
          </Section>

          <Section title="Project Details">
            <TextInputField
              label="Project title"
              value={form.title}
              onChangeText={(value) => setField('title', value)}
              error={errors.title}
            />
            <TextInputField label="Subject/course (optional)" value={form.subject} onChangeText={(value) => setField('subject', value)} />
            
            <View style={styles.datePickerField}>
              <Text style={styles.datePickerLabel}>Start Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowStartDate(true)}
                style={styles.datePickerButton}
              >
                <Text style={styles.datePickerValueText}>
                  {form.startDate ? displayDate(form.startDate) : 'Select start date'}
                </Text>
                <Calendar color={colors.primary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerField}>
              <Text style={styles.datePickerLabel}>Deadline Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowEndDate(true)}
                style={[styles.datePickerButton, errors.deadline && styles.datePickerError]}
              >
                <Text style={styles.datePickerValueText}>
                  {form.deadline ? displayDate(form.deadline) : 'Select deadline date'}
                </Text>
                <Calendar color={colors.primary} size={20} />
              </TouchableOpacity>
              {errors.deadline ? <Text style={styles.errorText}>{errors.deadline}</Text> : null}
            </View>

            <ChipGroup title="Project Type">
              {projectTypes.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={form.projectType === type}
                  onPress={() => setField('projectType', type as ProjectType)}
                />
              ))}
            </ChipGroup>
            <ChipGroup title="Status">
              {projectStatuses.map((status) => (
                <FilterChip
                  key={status}
                  label={status}
                  active={form.status === status}
                  onPress={() => setField('status', status as ProjectStatus)}
                />
              ))}
            </ChipGroup>
          </Section>

          <Section title="Payment Details">
            <TextInputField
              label="Total amount"
              value={totalText}
              keyboardType="numeric"
              onChangeText={setTotalText}
              error={errors.totalAmount}
            />
            <TextInputField
              label="Paid amount"
              value={paidText}
              keyboardType="numeric"
              onChangeText={setPaidText}
              error={errors.paidAmount}
            />
            <View style={styles.remainingBox}>
              <Text style={styles.remainingLabel}>Remaining amount</Text>
              <Text style={styles.remainingValue}>Rs {remaining.toLocaleString('en-PK')}</Text>
            </View>
          </Section>

          <Section title="Files & Notes">
            <TextInputField
              label="Notes/instructions"
              multiline
              value={form.notes}
              onChangeText={(value) => setField('notes', value)}
              style={styles.textArea}
            />
            <SecondaryButton
              title={projectId ? 'Attach Reference Files' : 'Attach after saving'}
              icon={FilePlus2}
              onPress={attachFiles}
            />
          </Section>

          <View style={styles.actions}>
            <PrimaryButton title="Save Project" icon={Save} onPress={save} />
            <SecondaryButton title="Cancel" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </View>
      <CalendarModal
        visible={showStartDate}
        onClose={() => setShowStartDate(false)}
        value={form.startDate}
        onSelectDate={(date) => setField('startDate', date)}
      />
      <CalendarModal
        visible={showEndDate}
        onClose={() => setShowEndDate(false)}
        value={form.deadline}
        onSelectDate={(date) => setField('deadline', date)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ChipGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.chipTitle}>{title}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
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
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 36,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.soft,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionBody: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  chipTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  remainingBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  remainingLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  remainingValue: {
    color: colors.warning,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  textArea: {
    minHeight: 130,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  actions: {
    gap: spacing.sm,
  },
  datePickerField: {
    gap: spacing.xs,
  },
  datePickerLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  datePickerButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  datePickerValueText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
