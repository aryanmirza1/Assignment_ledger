# Assignment Ledger

A personal, offline-first React Native app for tracking assignments, clients, payments, files, and PDF reports.

## Tech Stack

- Expo + React Native + TypeScript
- Local SQLite with `expo-sqlite`
- Local files with `expo-file-system`
- Document picker with `expo-document-picker`
- PDF export with `expo-print`
- Share/export with `expo-sharing`
- Icons with `lucide-react-native`
- Navigation with React Navigation

## Run Locally

```bash
npm install
npx expo start
```

Open the app in Expo Go, an Android emulator, or a development build.

## Android APK Build

Install EAS CLI:

```bash
npm install -g eas-cli
```

Log in and configure the project:

```bash
eas login
eas build:configure
```

Build an Android APK:

```bash
eas build -p android --profile preview
```

If EAS asks for Android credentials, let it generate them. The app stores data locally on the device only; no Firebase, Supabase, auth, or cloud backend is used.

## Notes

- The app seeds three sample assignments on first launch.
- Settings includes PDF export, JSON backup export/import, clear all data, and seed-data restore.
- Picked reference files are copied into the app document directory and linked from SQLite.
