import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
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

export const saveFileToDevice = async (localUri: string, fileName: string, mimeType: string) => {
  try {
    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        // Read local file as base64
        const fileContent = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Create file in the chosen directory
        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimeType
        );
        
        // Write base64 content
        await FileSystem.writeAsStringAsync(safUri, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        Alert.alert('Download Successful', `Saved "${fileName}" to your selected folder.`);
        return safUri;
      }
    }
  } catch (error) {
    console.error('Error saving file directly:', error);
  }

  // Fallback to Sharing sheet (iOS or if Android permissions denied / failed)
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Download failed', 'This device cannot save or share files.');
    return null;
  }
  await Sharing.shareAsync(localUri);
  return localUri;
};

export const writeBackupFile = async (snapshot: unknown) => {
  await ensureStorage();
  const name = `assignment-ledger-backup-${Date.now()}.json`;
  const fileUri = `${backupDirectory}${name}`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(snapshot, null, 2));
  await saveFileToDevice(fileUri, name, 'application/json');
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
