# Dynamic form test

## Key Features
- **Dynamic Reactive forms** with per-section dynamic FormGroup.
- **Autosave**: debounced, sequential, with retries and status UI.
- **Mock API**: `GET /api/schemas`, `PUT /api/requests/:id/question/:questionId` with latency + random failures.
- **Clean Architecture**: RequestService, AutosaveService, presentational Sidebar/Footer, Wizard.
- **Mobile-ready** sidebar for Mobile and Desktop.

## Architecture

- **Schema JSON**: ./src/app/core/data/data.json file for fields/sections.
- **RequestService**: loads schemas and persists answers (in-memory).
- **AutosaveService**: orchestrates debounced sequential saves + retry + status.
- **Wizard Component**: builds FormGroup from schema and drives navigation.
- **Summary**: read-only view of answers after Submit.

### 🚀 Tech Stack
- Angular v20
- Standalone Components
- Reactive Forms
- RxJS (valueChanges, debounceTime, retry, concatMap)
- Angular Material v20
- Mocked API (no backend required)

## Autosave Contract
- Debounce: 400–600ms
- Retry: `retry count: 2`. see retry logs in browser console
- UI states: _Saving…_, _Saved_, _Error — retrying…_

## API Mock
- `GET /api/schemas` → returns both schemas.
- `PUT /api/requests/:id/question/:questionId` → for section saving. 600–1000ms latency, 10–20% random failure.

## Run
- npm i
- npm run start
