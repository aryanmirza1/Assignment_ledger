import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { addFileRecord, importSnapshot } from '../data/database';
import { sanitizeFileName } from '../utils/format';

const attachmentDirectory = `${FileSystem.documentDirectory}assignment-ledger-files/`;
const backupDirectory = `${FileSystem.documentDirectory}assignment-ledger-backups/`;

export const ensureStorage = async () => {
  await FileSystem.makeDirectoryAsync(attachmentDirectory, { intermediates: true }).catch(() => {});
  await FileSystem.makeDirectoryAsync(backupDirectory, { intermediates: true }).catch(() => {});
};

export const pickAndAttachFiles = async (assignmentId: number) => {
  await ensureStorage();
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '*/*'],
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return 0;
  }

  let saved = 0;
  for (const asset of result.assets) {
    const safeName = `${Date.now()}-${sanitizeFileName(asset.name)}`;
    const destination = `${attachmentDirectory}${safeName}`;
    await FileSystem.copyAsync({ from: asset.uri, to: destination });
    await addFileRecord(
      assignmentId,
      asset.name,
      destination,
      asset.mimeType ?? getTypeFromName(asset.name),
      asset.size ?? 0,
    );
    saved += 1;
  }

  return saved;
};

export const shareFile = async (uri: string) => {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Sharing unavailable', 'This device cannot open the sharing sheet.');
    return;
  }
  await Sharing.shareAsync(uri);
};

export const writeBackupFile = async (snapshot: unknown) => {
  await ensureStorage();
  const fileUri = `${backupDirectory}assignment-ledger-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(snapshot, null, 2));
  await shareFile(fileUri);
  return fileUri;
};

export const importBackupFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) {
    return false;
  }

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const parsed = JSON.parse(content);
  await importSnapshot(parsed);
  return true;
};

const getTypeFromName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
    return 'document';
  }
  if (lower.match(/\.(png|jpe?g|webp|gif)$/)) {
    return 'image';
  }
  return 'other';
};
