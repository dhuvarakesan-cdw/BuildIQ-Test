# Architecture Requirements Document (ARD)

> Replace all `<PLACEHOLDER>` values. Every material architecture decision or constraint should have a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** Personal Task Management Application
- **Document ID:** ARD-PTMA
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD — see ARC-OQ-001
- **Contributors:** Product Owner TBD, Engineering Lead TBD
- **Last Updated:** 2026-11-26
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

The Personal Task Management Application will be a static, browser-only React MVP built with Vite, React, and TypeScript. It will provide personal task creation, editing, deletion with confirmation, completion tracking, filtering, overdue identification, responsive layout, and basic accessible interactions for individual employees.

The architecture intentionally avoids backend services, account management, authentication, synchronization, collaboration, notifications, and analytics. Task state will be managed in the React client and persisted to browser `localStorage` through a dedicated storage adapter. The app will be deployed as static assets to Netlify or Vercel, with the final provider TBD. CI will build, lint, typecheck, test, run accessibility checks, scan dependencies, and generate an SBOM for release artifacts.

Key drivers are the 2-week MVP constraint, small-business operational simplicity, local data privacy, and reliable completion of the core task flows during manual usability testing.

## 2. Architecture Drivers

- PRD-FR-001 — Users must be able to create personal tasks with title, description, due date, priority, and completion status.
- PRD-FR-002 — Users must be able to view tasks in a single list and filter by all, active, and completed.
- PRD-FR-003 — Users must be able to edit supported task fields while preserving validation behavior.
- PRD-FR-004 — Users must confirm before a task is deleted.
- PRD-FR-005 — Users must be able to mark tasks completed or active.
- PRD-FR-006 — Task data must persist locally in browser storage with no backend, login, or authentication.
- PRD-FR-007 — Active overdue tasks should be visually distinguished.
- PRD-NFR-001 — Core flows must support labeled controls and keyboard operation.
- PRD-NFR-002 — The app must be usable on desktop and mobile-width browsers without horizontal scrolling.
- PRD-NFR-003 — Task data must remain in browser local storage and must not be sent to backend services.
- CON-001 — The MVP is for a small business context and should avoid unnecessary operational complexity.
- CON-002 — The application must be React-based.
- CON-003 — The initial release must use browser local storage only, with no backend, user accounts, or authentication.
- CON-004 — The MVP target release expectation is within 2 weeks.
- CON-005 — Collaboration, assignments, notifications, reporting, manager workflows, external customer use, and team shared boards are out of scope.

## 3. Architecture Principles

1. Prefer the simplest browser-only design that satisfies the MVP requirements.
2. Keep task data local to the user’s browser profile and do not transmit task content to backend systems.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Make core task flows testable through isolated domain utilities, state hooks, and storage adapters.
6. Preserve accessibility and responsive behavior as first-class implementation constraints rather than final polish.

## 4. System Context

### 4.1 Actors

- Individual Employee — Uses the React app in a browser to create, view, edit, delete, complete, filter, and review personal tasks.
- Browser Runtime — Executes the static React application and provides `localStorage` for task persistence.
- Static Hosting Provider — Serves the compiled application assets over HTTPS.
- CI/CD System — Builds, tests, scans, packages, and deploys static assets.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Browser `localStorage` | Persist task data within the current browser profile | Browser Storage API | Browser vendor and user device owner |
| EXT-002 | Static hosting provider, Netlify or Vercel | Serve compiled static assets for preview and production environments | REST/static asset delivery | Provider TBD — see ARC-OQ-002 |
| EXT-003 | CI/CD platform | Run build, lint, typecheck, tests, scans, SBOM generation, and deployment | Pipeline | Engineering Lead TBD — see ARC-OQ-001 |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | React with TypeScript | React version TBD by project setup; TypeScript required | Satisfies React mandate and improves maintainability for task models and validation |
| Build Tooling | Vite | Version TBD by project setup | Fast static React build suitable for a 2-week MVP |
| UI Styling | Plain React components with lightweight CSS modules or app CSS | No full component library required for MVP | Minimizes dependency and design-system overhead while supporting responsive layout |
| Backend | None | Backend services, user accounts, authentication, and APIs are out of scope | Enforces PRD local-only architecture and reduces operational complexity |
| Data | Browser `localStorage` | One user per browser profile; no cross-device sync | Directly satisfies local persistence and privacy requirements |
| Hosting | Netlify or Vercel static hosting | Final provider TBD; HTTPS required | Simple static hosting with preview and production workflows |
| CI/CD | Repository pipeline | Must run build, lint, typecheck, tests, accessibility checks, dependency scan, and SBOM generation | Creates release confidence without introducing backend operations |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Static React Application Shell

- **Responsibility:** Bootstraps the React application, wires top-level layout, loads task state, and composes task management components.
- **Inputs:** Browser page load, compiled static assets, user interactions.
- **Outputs:** Rendered application UI and calls to task state actions.
- **Dependencies:** COMP-002, COMP-003, COMP-004, COMP-005, EXT-002.
- **Repository Area:** `src/App.tsx` and `src/main.tsx`.

#### COMP-002 — Task UI Components

- **Responsibility:** Render task form, task list, filters, task item actions, validation messages, empty states, overdue indicators, and deletion confirmation.
- **Inputs:** Task view model, filter state, validation results, user events.
- **Outputs:** Create, edit, delete, complete, and filter commands.
- **Dependencies:** COMP-003, COMP-004.
- **Repository Area:** `src/components/`.

#### COMP-003 — Task State Hook

- **Responsibility:** Own client-side task collection state, expose task commands, coordinate validation, filtering, and persistence.
- **Inputs:** UI commands, persisted task records from COMP-005.
- **Outputs:** Current tasks, active filter, validation state, persistence writes.
- **Dependencies:** COMP-004, COMP-005.
- **Repository Area:** `src/hooks/useTasks.ts`.

#### COMP-004 — Task Domain Utilities

- **Responsibility:** Define task types, validation rules, filter logic, completion transitions, overdue calculation, and task update semantics.
- **Inputs:** Task records, current date, user-provided task fields, filter selection.
- **Outputs:** Validated task objects, filtered task lists, overdue flags, domain errors.
- **Dependencies:** None.
- **Repository Area:** `src/domain/task.ts`.

#### COMP-005 — Local Storage Adapter

- **Responsibility:** Serialize, deserialize, read, write, and remove task data in browser `localStorage` behind a narrow interface.
- **Inputs:** Task collection from COMP-003 and browser storage availability.
- **Outputs:** Persisted task collection or recoverable persistence errors.
- **Dependencies:** EXT-001.
- **Repository Area:** `src/storage/localTaskStorage.ts`.

#### COMP-006 — Static Deployment Pipeline

- **Responsibility:** Build, validate, scan, generate SBOM artifacts, and deploy static assets to preview and production hosting.
- **Inputs:** Repository changes, CI secrets for hosting deployment, dependency manifest.
- **Outputs:** Preview deployment, production deployment, build artifacts, scan results, SBOM.
- **Dependencies:** EXT-002, EXT-003.
- **Repository Area:** `.github/workflows/` or provider-equivalent CI configuration.

### 6.2 Data Flow

1. Individual Employee loads the application from EXT-002 into the browser runtime.
2. COMP-001 initializes the app and asks COMP-003 to load existing tasks.
3. COMP-003 calls COMP-005 to read serialized task data from EXT-001.
4. COMP-005 deserializes stored data and returns task records to COMP-003.
5. COMP-002 sends create, edit, delete, complete, and filter commands to COMP-003 based on user interaction.
6. COMP-003 validates and processes task changes through COMP-004.
7. COMP-003 updates React state and calls COMP-005 to persist changes to EXT-001.
8. COMP-002 renders the current filtered task list, validation messages, empty states, and overdue indicators.
9. No task data is transmitted to backend APIs, analytics services, or external task systems.

## 7. Architecture Decisions

### ARD-DEC-001 — Use a Static Browser-Only React Architecture

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-NFR-003

**Decision**

Build the MVP as a static React application with no backend services, no user accounts, no authentication, and no server-side task API.

**Rationale**

The PRD requires a simple React-based MVP with browser local storage only. A static browser-only architecture minimizes delivery risk for the 2-week target and avoids unnecessary small-business operational complexity.

**Consequences**

- Lower hosting and operations complexity.
- Task data is not synchronized across devices or browser profiles.
- Backend-backed collaboration, reporting, notifications, authentication, and manager workflows remain out of scope.

**Alternatives Considered**

- Backend API with database and authentication — not selected because CON-003 excludes backend services and accounts.
- Next.js server-rendered application — not selected because server capabilities are unnecessary for a local-only MVP.

### ARD-DEC-002 — Use Vite, React, and TypeScript

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-FR-006, PRD-NFR-001, PRD-NFR-002

**Decision**

Use Vite with React and TypeScript as the frontend project stack.

**Rationale**

Vite supports fast local development and static builds. TypeScript provides stronger modeling for task entities, validation, persistence contracts, and component props without adding backend complexity.

**Consequences**

- Developers must maintain type definitions for tasks and domain utilities.
- CI must include TypeScript typechecking as a blocking release check.

**Alternatives Considered**

- Vite with JavaScript — not selected because it provides less compile-time protection for task data shapes.
- Create React App — not selected because Vite is lighter and more current for static React MVPs.
- Next.js static export — not selected because routing and framework features are not needed for the MVP.

### ARD-DEC-003 — Separate UI, State, Domain, and Persistence Concerns

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-007

**Decision**

Structure the app with plain React UI components, a task state hook, task domain utilities, and a local storage adapter.

**Rationale**

This separation keeps the app simple while making validation, filtering, overdue logic, and persistence independently testable.

**Consequences**

- Slightly more structure than a single-file prototype.
- Easier unit and integration testing for the task domain and storage behavior.

**Alternatives Considered**

- All logic in one `App` component — not selected because it would make validation and persistence harder to test.
- Redux or another global state library — not selected because MVP state is small and local.

### ARD-DEC-004 — Persist Tasks in Browser `localStorage`

- **Status:** Accepted
- **Related Requirements:** PRD-FR-006, PRD-NFR-003

**Decision**

Persist task data in browser `localStorage` using a dedicated adapter and a stable storage key.

**Rationale**

The PRD explicitly requires browser local storage persistence and prohibits backend transmission of task data.

**Consequences**

- Data remains local to the browser profile.
- Users can lose data if browser storage is cleared or unavailable.
- Storage read/write failures must be handled with user-visible messaging where they affect task persistence.

**Alternatives Considered**

- IndexedDB — not selected because the task data model is small and `localStorage` is explicitly required.
- Backend database — not selected because backend storage is out of scope.

### ARD-DEC-005 — Use Static Hosting with CI-Driven Deployment

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-002, PRD-NFR-003

**Decision**

Deploy compiled static assets to Netlify or Vercel using CI, with rollback by redeploying the previous successful build.

**Rationale**

Static hosting matches the browser-only architecture and supports simple preview and production delivery without server operations.

**Consequences**

- Final provider selection remains open.
- Environment configuration should remain minimal and repository-managed where the chosen provider supports it.

**Alternatives Considered**

- Developer-run local build only — not selected because pilot users need an accessible hosted app.
- Blue-green backend deployment — not selected because there is no backend service.

### ARD-DEC-006 — Avoid Analytics and Remote Error Telemetry in the MVP

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-003

**Decision**

Use client-side console/error logging only and do not transmit task data, analytics events, session replay, or telemetry to external services for the MVP.

**Rationale**

The PRD emphasizes local data privacy and no backend data transmission. Manual usability testing is the MVP measurement method.

**Consequences**

- Production diagnostics are limited.
- Usability evidence must be gathered manually rather than through analytics.

**Alternatives Considered**

- Frontend monitoring service — not selected for MVP because privacy and simplicity are higher priorities.
- Full analytics/session replay — not selected because it conflicts with the privacy-focused MVP scope.

## 8. API and Integration Architecture

### ARD-API-001 — Browser Local Task Storage Contract

- **Type:** File
- **Operation/Topic:** `localStorage[