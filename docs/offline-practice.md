# Offline practice slice (#2)

## Storage and application boundaries

Expo SDK 58 and Expo Router are preserved. `expo-sqlite` 58 stores the journal in
`fret.db` in the native app's default persistent database directory. No account,
backend, network request, or profile setup is required. A development build made
before adding SQLite must be rebuilt to include the native module.

`src/practice/model.ts` defines PracticeSession, validation, and derived totals.
`database.ts` owns parameterized SQL and ordered transactional migrations using
SQLite `user_version`. A database newer than this app supports is rejected;
initialization errors offer retry without deleting data. Append new migrations
rather than editing a released migration. Each session write is a single atomic
SQL statement; daily totals are never persisted independently.

`provider.tsx` owns loaded sessions and publishes refreshed data after awaited
writes. React context and local form state are sufficient for this slice; no
additional query or state library is needed. Route files compose presentation;
shared session UI and domain behavior live outside `src/app/`.

The four destinations are Home, History, Library, and Settings. Library is an
honest empty state until later tickets add song and skill workflows. Settings
explains local storage and calendar conventions. Manual sessions have no
mandatory duration minimum beyond a finite positive number of minutes; decimal
minutes are supported. Intent and activity are independent. Focus areas are
labels on a single elapsed duration, never additional copies of time. Editing a
date moves the same session rather than adding another. Deletion asks for
confirmation; canceling a form does not write anything.

## Calendar conventions

- Dates are local calendar dates stored as `YYYY-MM-DD`, not UTC timestamps.
- The form defaults to the device's current local day; historical sessions retain
  their entered dates if the device timezone later changes.
- Today refreshes on foregrounding and at most 30 seconds after local midnight.
- Weeks run Monday–Sunday. This slice does not yet compute weekly summaries.
- History shows recorded sessions by date, newest dates and newest logs first.
  Missing logs mean no recorded practice, not proof of no practice.

## Shared application test seam

Run `npm test` (or `npx playwright test tests/practice.spec.ts` while iterating).
Install Chromium once with `npx playwright install chromium` if necessary.
The runner starts Expo web on port 8092. Tests drive public controls and assert
visible screens. Every browser context has an isolated **real SQLite** database
in OPFS, using the same migrations and SQL as native, with no database mocks.
Dates are controlled through the browser clock in the Asia/Kolkata timezone.
Future feature tests should extend this application seam.

The suite verifies empty destinations, fractional manual logging, independent
intent/activity, combined focus totals, multiple sessions, correction across
dates, deletion/cancellation, unchanged unrelated sessions, invalid input,
calendar rollover, offline logging, reload, and reopening a new page against the
same persisted database. The offline launch test caches the web JS/WASM bundle
from localhost, then blocks the network and supplies only those cached files
on cold start, standing in for an installed native bundle. Browser tests establish
application and database behavior; they do not establish Android platform behavior.

Web SQLite requires WASM assets and cross-origin isolation headers. Metro provides
these in development. A web deployment must also provide COEP `credentialless`
and COOP `same-origin` response headers. Routes are bundled together so navigating
to the manual log does not require a network fetch for a deferred route.

Run `npm run lint` and `npm run typecheck` before committing.

## Android acceptance still required before release

On a real Android device with a current development/release build, enable airplane
mode, cold-launch, log two sessions including a fractional and combined session,
force-stop/reopen, edit one session onto yesterday, and confirm/delete it. Check
Home and History totals and preservation of the other session. Check the form
with the software keyboard open, large system text, and Android back navigation.
The host's browser tests cannot substitute for these physical-device checks.

Documentation consulted: [SDK 58](https://docs.expo.dev/versions/v58.0.0/),
[SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/),
[Expo documentation index](https://docs.expo.dev/llms.txt),
[Router tabs](https://docs.expo.dev/router/advanced/tabs/), and
[React Native core components](https://reactnative.dev/docs/components-and-apis).
