# Fret

Fret is an offline musical practice journal built with Expo SDK 58, React Native,
TypeScript, and Expo Router. You can start without an account and manually record
short, unplanned practice. Home and History show totals derived from saved
sessions. The Library and Settings destinations are ready for later parts of the
MVP.

## Develop

```bash
npm install
npx expo start
```

SQLite is included in Expo Go. If using an existing development build made
before adding `expo-sqlite`, rebuild it so the native module is available.

```bash
npm run lint
npm run typecheck
npm test
```

The browser application suite uses Playwright Chromium. If Chromium is missing,
run `npx playwright install chromium`. See [offline practice design](docs/offline-practice.md)
for storage, calendar, test seam, and Android acceptance details.
