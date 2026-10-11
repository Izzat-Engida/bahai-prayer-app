# Bahai Prayer

Bahai Prayer is a mobile app for reading and listening to Bahá’í prayers and other devotional texts. It includes prayer categories, search, favorites, reading history, audio playback, the Hidden Words, and daily reminders.

The app is built with Expo and React Native, with Expo Router handling navigation.

## Features

- Browse prayers by category, including obligatory, general, occasional, and tablet prayers
- Search and filter prayer categories
- Read prayer text with adjustable font size
- Listen to available audio or use text-to-speech reading
- Save prayers to favorites
- Keep a short reading history
- Read The Hidden Words, including Arabic and Persian sections
- Set daily prayer or reflection reminders
- Use the app on Android, iOS, or the web

## Requirements

- Node.js
- npm
- An Android emulator, iOS simulator, physical device, or Expo Go

The project currently uses Expo SDK 57. Some features, such as notifications and audio playback, work best in a development build rather than Expo Go.

## Getting started

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd bahai-prayer-app
npm install
```

Start the development server:

```bash
npm run start
```

From the Expo CLI, you can open the app in Expo Go, an Android emulator, an iOS simulator, or a web browser.

## Development builds

Some native modules used by the app require a development build. To run one locally:

```bash
npm run android
npm run ios
```

You can also create an internal development build with EAS:

```bash
npx eas-cli build --profile development
```

## Other commands

```bash
npm run web             # Start the web version
npx expo lint           # Run the linter
npx tsc --noEmit        # Check TypeScript types
npx expo-doctor         # Check Expo configuration and dependencies
```

## Project layout

```text
src/
  app/          Screens and Expo Router routes
  components/   Reusable UI components
  constants/    Theme and shared constants
  context/      React context providers
  hooks/        Data and feature hooks
  lib/          Small libraries, including reminders
  services/     Local data and database access
  store/        Redux state and slices
  types/        TypeScript types
  utils/        Shared utility functions

assets/data/    Bundled prayer and Hidden Words data
assets/images/  App icons and other images
```

Routes live in `src/app`. Changes to files in that directory create or update screens through Expo Router’s file-based routing system.

## Data and storage

Prayer content is bundled with the app in `assets/data`. Favorites and reading history are stored locally with SQLite. Reminder settings use local device storage and the platform notification system.

The app does not need a backend to browse the bundled prayer content.

## Building with EAS

Build profiles are defined in `eas.json`:

```bash
npx eas-cli build --profile preview
npx eas-cli build --profile production
```

The preview profile creates an Android APK for internal testing. The production profile is intended for store builds.

## License

See [LICENSE](LICENSE) for the project license.
