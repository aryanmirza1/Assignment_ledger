import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { addFileRecord, importSnapshot } from '../data/database';
import { sanitizeFileName } from '../utils/format';

const attachmentDirectory = `${FileSystem.documentDirectory}project-tracker-files/`;
const backupDirectory = `${FileSystem.documentDirectory}project-tracker-backups/`;

export const ensureStorage = async () => {
  await FileSystem.makeDirectoryAsync(attachmentDirectory, { intermediates: true }).catch(() => {});
  await FileSystem.makeDirectoryAsync(backupDirectory, { intermediates: true }).catch(() => {});
};

export const pickAndAttachFiles = async (projectId: number) => {
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
      projectId,
      asset.name,
      destination,
      asset.mimeType ?? getTypeFromName(asset.name),
      asset.size ?? 0,
    );
    saved += 1;
  }

  return saved;
};

const getUTIFromMime = (mimeType: string) => {
  if (mimeType.includes('pdf')) return 'com.adobe.pdf';
  if (mimeType.includes('json')) return 'public.json';
  if (mimeType.includes('image')) return 'public.image';
  if (mimeType.includes('document') || mimeType.includes('msword')) return 'com.microsoft.word.doc';
  return undefined;
};

export const openFileLocally = async (localUri: string, mimeType: string) => {
  try {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: mimeType,
      });
    } else {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri, {
          mimeType,
          UTI: getUTIFromMime(mimeType),
        });
      }
    }
  } catch (error) {
    console.error('Error opening file:', error);
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri);
      }
    } catch (shareError) {
      console.error('Sharing fallback failed:', shareError);
    }
  }
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
        const fileContent = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimeType
        );
        
        await FileSystem.writeAsStringAsync(safUri, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        Alert.alert('Download Successful', `Saved "${fileName}" to your selected folder.`);
        
        void openFileLocally(localUri, mimeType);
        
        return safUri;
      }
    }
  } catch (error) {
    console.error('Error saving file directly:', error);
  }

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
  const name = `project-tracker-backup-${Date.now()}.json`;
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
