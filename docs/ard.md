# Architecture Requirements Document (ARD)

> Replace all `<PLACEHOLDER>` values. Every material architecture decision or constraint should have a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** Personal Task Management Application
- **Document ID:** ARD-PTMA
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD — see ARC-OQ-001
- **Contributors:** Product stakeholder, PRD agent, ARD agent
- **Last Updated:** 2026-11-26
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

The Personal Task Management Application will be a frontend-only React application built with Vite, plain JavaScript, CSS, React Hooks, and browser `localStorage`. It will run entirely in the user’s browser with no backend service, external database, account system, cloud sync, collaboration, notifications, recurring tasks, analytics, or external integrations.

The architecture separates presentation components, task orchestration, domain utilities, and persistence concerns. A central `useTasks` hook owns task state and task operations in memory, while a dedicated `localStorage` adapter reads and writes the persisted task collection under an app-owned browser storage key. Task filtering, sorting, validation, summary counts, and storage serialization are isolated from UI components so they can be unit tested.

The primary architecture drivers are simplicity for a small-business context, local-only privacy, reliable browser persistence, responsive UI behavior, accessible task flows, and low operational complexity through static hosting.

## 2. Architecture Drivers

- PRD-FR-001 — Users must create tasks with required title validation and default Pending status.
- PRD-FR-002 — Users must view saved tasks with enough detail and newest-first default ordering.
- PRD-FR-003 — Users must edit task details and status with title validation.
- PRD-FR-004 — Users must delete tasks after confirmation and persist deletion.
- PRD-FR-005 — Users must update status among Pending, In Progress, and Completed.
- PRD-FR-006 — Users must assign Low, Medium, or High priority, or leave priority blank.
- PRD-FR-007 — Users must see dashboard totals by overall count, status, and priority.
- PRD-FR-008 — Users must search tasks by title and description.
- PRD-FR-009 — Users must filter by status, priority, and due date presets.
- PRD-FR-010 — Users should optionally sort by due date and priority.
- PRD-FR-011 — Task data must persist in the same browser through `localStorage`.
- PRD-NFR-001 — The UI must be responsive at common mobile, tablet, and desktop widths.
- PRD-NFR-002 — Task data must remain local and must not be sent to backend, database, or third-party integrations.
- PRD-NFR-003 — Forms, controls, validation, empty states, and core flows should support basic accessibility.
- PRD-NFR-004 — Local persistence must reliably save and restore state where browser storage is available and not cleared.
- CON-001 — The application must be frontend-only with no backend or external database.
- CON-002 — The implementation must use React.js, JavaScript, CSS, React Hooks, and `localStorage`.
- CON-003 — Task data must remain local to the browser and cannot sync across devices.
- CON-004 — The small-business context requires a simple solution without unnecessary operational complexity.
- CON-005 — Release occurs when Must-priority requirements pass acceptance testing; there is no fixed deadline.

## 3. Architecture Principles

1. Keep all task data local to the browser and avoid network transmission of task payloads.
2. Prefer simple browser-native and React-native capabilities over additional libraries unless they materially reduce risk.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Make domain logic testable outside UI components.
6. Fail safely when local browser storage is unavailable, unreadable, or malformed.

## 4. System Context

### 4.1 Actors

- PERSONA-001 Individual Daily Task Manager — Creates, views, edits, deletes, searches, filters, sorts, and updates tasks in one browser profile.
- Browser Runtime — Executes the React application, stores task data in `localStorage`, and enforces browser storage availability and limits.
- Static Hosting Platform — Serves immutable production build assets over HTTPS; exact provider is TBD.
- CI/CD System — Builds, tests, scans, and deploys static assets; exact tooling is TBD.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Browser `localStorage` | Persist task data locally in the same browser profile | File/local browser storage API | User browser/vendor |
| EXT-002 | Static hosting platform | Serve production static assets over HTTPS | File/static asset hosting | TBD — see ARC-OQ-002 |
| EXT-003 | CI/CD system | Run build, lint, tests, dependency scan, optional SBOM generation, and deployment | Pipeline | TBD — see ARC-OQ-003 |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | React.js with Vite, plain JavaScript, React Hooks, and CSS | React/Vite versions TBD by project setup; no TypeScript mandate | Meets PRD stack, enables fast static builds, and supports componentized UI and hooks |
| Backend | None | Frontend-only; no backend APIs or services | Required by CON-001 and PRD-NFR-002 |
| Data | Browser `localStorage` | Same browser profile only; app-owned storage key | Required by PRD-FR-011, PRD-NFR-004, CON-002, and CON-003 |
| Hosting | Static hosting such as Netlify, Vercel, GitHub Pages, or equivalent | Must serve production assets over HTTPS; exact provider TBD | Low-complexity deployment for a small-business frontend-only app |
| CI/CD | Hosted or repository-integrated CI/CD | Must run required checks before release; exact tooling TBD | Supports repeatable build, quality gates, scanning, and rollback |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — App Shell

- **Responsibility:** Compose the application layout, connect high-level components, and provide the responsive page structure.
- **Inputs:** Task state and handlers from COMP-006; user navigation within the single-page app.
- **Outputs:** Rendered dashboard, form, task controls, and task list.
- **Dependencies:** COMP-002, COMP-003, COMP-004, COMP-005, COMP-006.
- **Repository Area:** `src/App.jsx` and `src/styles/`

#### COMP-002 — Task Form

- **Responsibility:** Capture task title, description, due date, priority, and status edits; enforce title validation messaging.
- **Inputs:** User form input; existing task when editing.
- **Outputs:** Validated create or update command to COMP-006.
- **Dependencies:** COMP-006, COMP-007.
- **Repository Area:** `src/components/TaskForm.jsx`

#### COMP-003 — Task List

- **Responsibility:** Display visible tasks, support status changes, edit actions, delete confirmation, empty state, and no-results state.
- **Inputs:** Filtered and sorted task list from COMP-006; user actions.
- **Outputs:** Update, edit, and delete commands to COMP-006.
- **Dependencies:** COMP-006, COMP-007.
- **Repository Area:** `src/components/TaskList.jsx`

#### COMP-004 — Dashboard Summary

- **Responsibility:** Display total task count and counts by status and priority.
- **Inputs:** Task collection or summary values from COMP-006/COMP-007.
- **Outputs:** Rendered summary metrics.
- **Dependencies:** COMP-006, COMP-007.
- **Repository Area:** `src/components/DashboardSummary.jsx`

#### COMP-005 — Search Filter Controls

- **Responsibility:** Capture search query, status filter, priority filter, due date preset filter, and sort selection.
- **Inputs:** User search, filter, and sort selections.
- **Outputs:** Query/filter/sort state updates to COMP-006.
- **Dependencies:** COMP-006, COMP-007.
- **Repository Area:** `src/components/SearchFilterControls.jsx`

#### COMP-006 — `useTasks` Hook

- **Responsibility:** Own central task state, expose task CRUD/status/filter/sort operations, coordinate persistence, and derive visible tasks.
- **Inputs:** Commands from UI components; persisted task records from COMP-008.
- **Outputs:** Current tasks, visible tasks, dashboard summary, operation handlers, validation outcomes.
- **Dependencies:** COMP-007, COMP-008.
- **Repository Area:** `src/hooks/useTasks.js`

#### COMP-007 — Task Utilities

- **Responsibility:** Implement pure task validation, search matching, filter predicates, sorting, dashboard aggregation, and date preset logic.
- **Inputs:** Task records, query/filter/sort values, current date for due date evaluation.
- **Outputs:** Validation results, filtered/sorted task arrays, and summary counts.
- **Dependencies:** None beyond JavaScript runtime.
- **Repository Area:** `src/utils/taskUtils.js`

#### COMP-008 — LocalStorage Adapter

- **Responsibility:** Serialize, deserialize, read, write, and safely recover from invalid `localStorage` data.
- **Inputs:** Task collection from COMP-006; browser `localStorage` content.
- **Outputs:** Parsed task collection or empty collection fallback; persisted task collection.
- **Dependencies:** EXT-001.
- **Repository Area:** `src/storage/taskStorage.js`

### 6.2 Data Flow

1. PERSONA-001 enters task data into COMP-002.
2. COMP-002 validates required title input using COMP-007 and sends a create/update command to COMP-006.
3. COMP-006 updates the in-memory task collection and calls COMP-008 to persist the full task collection to EXT-001.
4. COMP-008 serializes task records and writes them to the app-owned `localStorage` key.
5. On app startup, COMP-006 calls COMP-008 to read tasks from EXT-001; invalid or unreadable stored data returns an empty collection fallback.
6. COMP-005 sends search, filter, and sort settings to COMP-006.
7. COMP-006 uses COMP-007 to derive visible tasks and summary counts.
8. COMP-003 renders matching tasks and sends status update, edit, and delete commands back to COMP-006.
9. COMP-004 renders total, status, and priority counts derived from the current task collection.

## 7. Architecture Decisions

### ARD-DEC-001 — Use Vite React With Plain JavaScript

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-003, CON-002

**Decision**

The application will use Vite with React, plain JavaScript, CSS, and React Hooks.

**Rationale**

This matches the approved PRD stack while providing a lightweight modern build setup for a frontend-only static application.

**Consequences**

- Fast local development and static production builds are available.
- No TypeScript compile-time typing is mandated for the first release.
- JavaScript validation and tests carry more responsibility for preventing model errors.

**Alternatives Considered**

- Create React App — Not selected because Vite is the preferred lightweight modern setup.
- Static hand-built React without a bundler — Not selected because it weakens build, lint, and test integration.

### ARD-DEC-002 — Keep Architecture Frontend-Only

- **Status:** Accepted
- **Related Requirements:** PRD-FR-011, PRD-NFR-002, PRD-NFR-004, CON-001, CON-003

**Decision**

The application will not include a backend, external database, server API, account system, cloud sync, analytics, or third-party task integrations.

**Rationale**

The PRD explicitly requires a frontend-only app with local browser persistence and local-only privacy.

**Consequences**

- Data remains on the user’s device/browser profile.
- Cross-device sync, account recovery, centralized audit, and server-side backup are unavailable.
- Static hosting is sufficient for deployment.

**Alternatives Considered**

- Backend API and database — Rejected by CON-001.
- Cloud sync service — Rejected by PRD scope and CON-003.

### ARD-DEC-003 — Centralize Task State In `useTasks`

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-FR-010, PRD-FR-011

**Decision**

Task state and task operations will be centralized in a custom `useTasks` hook. UI components will consume state and handlers from the hook instead of managing independent copies of task state.

**Rationale**

Centralized state reduces inconsistency between task list, dashboard, filters, and persistence, while staying within React Hooks and avoiding unnecessary state libraries.

**Consequences**

- Dashboard counts, visible task lists, and persisted task data remain synchronized.
- The hook becomes a key unit and integration test target.
- The app avoids Redux/Zustand complexity for first release.

**Alternatives Considered**

- Component-local state spread across components — Not selected due to synchronization risk.
- External state library — Not selected because it adds complexity not needed for this scope.

### ARD-DEC-004 — Isolate LocalStorage Access In An Adapter

- **Status:** Accepted
- **Related Requirements:** PRD-FR-011, PRD-NFR-002, PRD-NFR-004

**Decision**

All reads and writes to browser `localStorage` will go through a dedicated storage adapter.

**Rationale**

A storage boundary makes persistence behavior testable, prevents accidental network persistence alternatives, and isolates serialization/error handling from UI logic.

**Consequences**

- Persistence can be tested without rendering the full UI.
- Invalid storage data handling is centralized.
- Future export/import or migration logic, if approved later, has a defined extension point.

**Alternatives Considered**

- Calling `localStorage` directly from UI components — Not selected due to coupling and repeated error handling.

### ARD-DEC-005 — Fail Safe On Invalid Stored Data

- **Status:** Accepted
- **Related Requirements:** PRD-FR-011, PRD-NFR-004

**Decision**

If stored task data is missing, unreadable, or invalid, the app will ignore the invalid stored data, initialize with an empty task collection, and preserve the user’s ability to create new tasks.

**Rationale**

A frontend-only app cannot rely on server repair. Failing safe preserves usability and avoids blocking the whole application.

**Consequences**

- Corrupted local task data may not be recoverable.
- The app remains usable after malformed storage content.
- Tests must cover invalid JSON and invalid task record shapes.

**Alternatives Considered**

- Blocking the app until browser storage is manually cleared — Not selected because it creates unnecessary support burden.
- Automatic field-by-field repair — Not selected for first release due to complexity.

### ARD-DEC-006 — Deploy Immutable Static Assets Through CI/CD

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-NFR-002, CON-004, CON-005

**Decision**

Production deployment will build immutable static assets through CI/CD and roll back by redeploying the previous successful build.

**Rationale**

This provides repeatable, low-complexity deployment suitable for a small frontend-only app.

**Consequences**

- Rollback does not require database migration handling.
- Exact provider-specific rollback mechanics remain dependent on the selected static host.
- Build artifacts must be reproducible from source.

**Alternatives Considered**

- Manual file upload — Not selected because it weakens repeatability and rollback discipline.
- Developer-machine deployments — Not selected because they reduce release control.

### ARD-DEC-007 — Avoid Task Payload Observability And Analytics

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-002, CON-001, CON-003

**Decision**

The application will not send task payloads, usage analytics, or remote error events. Observability will be limited to development console errors and static host/build status where available.

**Rationale**

The PRD requires local-only privacy and excludes production analytics. Avoiding remote telemetry also minimizes privacy and operational complexity.

**Consequences**

- Production user behavior and runtime errors are not centrally visible.
- Local privacy posture is stronger.
- Troubleshooting relies on reproduction, user reports, and build/deployment status.

**Alternatives Considered**

- Client-side analytics — Rejected by PRD out-of-scope and local-only privacy.
- Remote error tracking with payload capture — Rejected because it could transmit task data.

## 8. API and Integration Architecture

### ARD-API-001 — Task LocalStorage Interface

- **Type:** File
- **Operation/Topic:** `localStorage.getItem(task_storage_key)`, `localStorage.setItem(task_storage_key, serialized_tasks)`
- **Provider:** COMP-008 LocalStorage Adapter
- **Consumers:** COMP-006 `useTasks` Hook
- **Authentication:** Browser profile access; no application authentication
- **Versioning:** Include a storage schema version field in the serialized payload; first release schema version is `1`

**Request/Input Contract**

Writes persist a JSON object under an app-owned key. The payload contains a schema version and task records.

```json
{
  "version": 1,
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "dueDate": "YYYY-MM-DD or empty string",
      "priority": "Low | Medium | High | empty string",
      "status": "Pending | In Progress | Completed",
      "createdAt": "ISO-8601 string",
      "updatedAt": "ISO-8601 string"
    }
  ]
}
```

**Response/Output Contract**

Reads return a validated array of task records to COMP-006. If no valid payload exists, the adapter returns an empty array and does not throw a fatal application error.

**Error Handling**

Malformed JSON, missing `tasks`, unsupported schema, or invalid records are treated as invalid stored data. The adapter returns an empty task collection fallback. Write failures caused by unavailable or full storage are surfaced to COMP-006 so the UI can preserve in-memory operation and avoid crashing. Task writes are full-collection replacements and are idempotent for the same serialized state.

## 9. Data Architecture

### DATA-001 — Task

- **Purpose:** Represents a user-created daily task and its tracking attributes.
- **System of Record:** Browser `localStorage` key owned by the app; React state is an in-memory working copy.
- **Classification:** Confidential
- **Retention:** Persisted in the same browser until the user deletes the task or clears browser storage.
- **Key Relationships:** No external relationships; dashboard summaries, filters, and sorts are derived from task records.

### DATA-002 — Task View State

- **Purpose:** Represents transient search query, status filter, priority filter, due date preset filter, and sort selection.
- **System of Record:** React in-memory state.
- **Classification:** Internal
- **Retention:** Current browser session unless explicitly persisted later through an approved change.
- **Key Relationships:** Applied to DATA-001 to derive visible task lists; not required to persist by the PRD.

### Data Migration

- **Required:** No
- **Approach:** Not applicable for first release because there is no backend, external database, or existing user data migration scope. The storage payload includes schema version `1` to support future local migrations if later approved.

## 10. Security Architecture

### ARD-SEC-001 — Local-Only Privacy Boundary

- **Related Requirements:** PRD-NFR-002, PRD-FR-011

The implementation must:

- Keep task data in browser `localStorage` and in-memory React state only.
- Avoid transmitting task titles, descriptions, due dates, statuses, priorities, or derived task data to backend services, external databases, analytics systems, or third-party integrations.
- Treat task titles and descriptions as potentially confidential personal productivity data.
- Serve production static assets over HTTPS.

The implementation must not:

- Add authentication, cloud sync, telemetry, third-party task integrations, backend APIs, or external data stores without a new approved requirement and architecture change.
- Log task payloads in production console output or remote systems.

### ARD-SEC-002 — Supply Chain Controls

- **Related Requirements:** PRD-NFR-002, PRD-NFR-004, CON-004, CON-005

The implementation must:

- Run dependency/CVE scanning before release.
- Block known critical and high dependency vulnerabilities before release where a fix is available.
- Generate an SBOM if supported by the selected CI tooling.

The implementation must not:

- Release with known critical or high dependency vulnerabilities where a fix is available and not applied.
- Store secrets in frontend source code or static build artifacts.

### Security Controls

- **Authentication:** None; the app has no accounts and relies on local browser profile access.
- **Authorization:** None; there are no roles, users, backend resources, or shared task lists.
- **Secrets Management:** No application secrets are allowed in frontend source code, environment files committed to source control, or static build artifacts.
- **Encryption:** Production static assets must be served over HTTPS; no application-managed encryption at rest is required because task data remains in browser `localStorage`.
- **Audit Logging:** No audit logging because there are no accounts or backend; task payloads must not be logged in production.
- **Dependency/CVE Scanning:** Required before release; known critical/high vulnerabilities are blocking where a fix is available.
- **SBOM:** Required if supported by the chosen CI tooling; otherwise tracked as open in ARC-OQ-003.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Local Persistence Reliability

- **Target:** Created, edited, and deleted task state is restored correctly after browser refresh in 100% of local persistence acceptance test cases where `localStorage` is available and not cleared.
- **Validation Method:** Automated or manual persistence acceptance tests covering create, edit, delete, refresh, and invalid storage fallback.

### ARD-OPS-002 — Interaction Responsiveness

- **Target:** Core create, edit, delete, status update, search, filter, sort, and dashboard update interactions complete visible UI updates within 200 ms for the typical local task list used in acceptance testing.
- **Validation Method:** Browser performance measurement during acceptance tests with representative local task data.

### ARD-OPS-003 — Responsive Layout

- **Target:** Core flows are usable without horizontal scrolling at common mobile, tablet, and desktop widths.
- **Validation Method:** Responsive UI acceptance testing against PRD-NFR-001.

### ARD-OPS-004 — Static Availability

- **Target:** The production app is available when the chosen static hosting platform successfully serves the current deployed static build.
- **Validation Method:** Static host deployment health/status check where available and smoke test after deployment.

### ARD-OPS-005 — Accessibility Validation

- **Target:** Core task actions are operable through standard keyboard navigation, and labels/control names/obvious accessibility violations pass automated checks used by the project.
- **Validation Method:** Manual keyboard testing plus automated accessibility checks for labels, control names, and obvious violations.

## 12. Observability

- **Logging:** Development-only console errors are allowed for debugging; production logging must not include task payloads.
- **Metrics:** No production analytics or client-side usage metrics; static host uptime/build status may be used where available.
- **Tracing:** No distributed tracing because there is no backend or external service call path.
- **Alerting:** Static hosting and CI/CD failure alerts may be used where supported by the selected provider; no application runtime alerting is required for first release.
- **Sensitive Data Restrictions:** Task title, description, due date, priority, status, and derived task data must not be transmitted to external observability systems.

## 13. Deployment Architecture

- **Environments:** Local development plus one static production environment; additional dev/test/stage environments are not required for first release.
- **Deployment Model:** CI/CD builds immutable static assets and deploys them to a static hosting platform over HTTPS.
- **CI/CD:** Pipeline must run install, build, lint, unit tests, component tests, accessibility checks, and dependency scanning before release.
- **Configuration Management:** Minimal build-time configuration; no runtime secrets; hosting provider configuration is TBD.
- **Rollback:** Redeploy the previous successful immutable static build.
- **Infrastructure as Code:** Optional/TBD because the hosting provider is not fixed; see ARC-OQ-002.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** No numeric threshold for first release; meaningful coverage is required for task utilities, `useTasks` hook, persistence adapter, and core component flows.
- **Blocking Security Severity:** Known critical and high dependency vulnerabilities block release where a fix is available.
- **Required Build/Lint Checks:** Production build, lint, unit tests for task logic/hooks, component tests for core flows, accessibility checks, and dependency scanning must pass.

Test responsibilities by area:

- **Unit Tests:** COMP-007 validation, search, filtering, sorting, date preset logic, and dashboard aggregation.
- **Hook/Integration Tests:** COMP-006 task lifecycle, state synchronization, status/priority updates, and persistence calls.
- **Component Tests:** COMP-002 through COMP-005 core user flows, validation messages, delete confirmation, empty states, and no-results states.
- **Contract Tests:** ARD-API-001 storage schema serialization/deserialization and invalid data fallback.
- **End-to-End Tests:** Create, view, edit, delete, status update, search, filter, dashboard update, and refresh persistence flows.
- **Security Tests:** Dependency/CVE scanning and verification that task operations do not require backend or transmit task data.
- **Performance Tests:** 200 ms core interaction target using representative local task data.

## 15. Architecture Constraints

- ARC-CON-001 — The application must be frontend-only with no backend or external database, derived from CON-001.
- ARC-CON-002 — The implementation must use React.js, JavaScript, CSS, React Hooks, and `localStorage`, derived from CON-002.
- ARC-CON-003 — Task data must remain local to the browser and cannot sync across devices, derived from CON-003.
- ARC-CON-004 — The architecture must remain simple and avoid unnecessary operational complexity for a small-business context, derived from CON-004.
- ARC-CON-005 — Release occurs when Must-priority requirements pass acceptance testing; there is no fixed deadline, derived from CON-005.
- ARC-CON-006 — User accounts, authentication, cloud sync, collaboration, notifications, recurring tasks, external integrations, backend storage, production analytics, revenue tracking, and retention analytics are out of scope.
- ARC-CON-007 — Data retention depends on browser `localStorage`; clearing browser storage removes saved tasks.
- ARC-CON-008 — Task data is classified as Confidential personal productivity data because titles/descriptions may contain sensitive personal or work information.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | Users may expect cross-device sync or account recovery even though the app is local-only | Medium | Position app as one-device/local-only and keep CON-003 visible in UX/support material |
| ARC-RISK-002 | Users may lose tasks if browser storage is cleared or corrupted | Medium | Document retention limits, fail safe on invalid data, and avoid promising backup/recovery |
| ARC-RISK-003 | No production analytics or remote error tracking reduces operational visibility | Medium | Use acceptance testing, static host/build status, and user-reported reproduction for troubleshooting |
| ARC-RISK-004 | Plain JavaScript can allow task shape errors that TypeScript might catch earlier | Low | Cover task utilities, storage schema, and hook behavior with meaningful tests |
| ARC-RISK-005 | Static hosting provider remains TBD | Low | Keep deployment model provider-neutral and require HTTPS, immutable builds, and rollback support |
| ARC-RISK-006 | Optional SBOM depends on selected CI tooling | Low | Track SBOM tooling decision under ARC-OQ-003 and require dependency scanning regardless |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Who is the named Architecture Owner for ARD approval and future architecture changes? | Product Owner | Open | TBD |
| ARC-OQ-002 | Which exact static hosting provider and infrastructure-as-code approach will be used? | Engineering Lead | Open | TBD |
| ARC-OQ-003 | Which CI/CD tool will run checks, deployment, dependency scanning, and SBOM generation? | Engineering Lead | Open | TBD |
| ARC-OQ-004 | What exact React, Vite, test runner, lint, and accessibility tooling versions will the repository use? | Engineering Lead | Open | TBD |
| ARC-OQ-005 | What Lighthouse performance threshold, if any, should supplement the 200 ms interaction target? | Engineering Lead | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002, COMP-003, COMP-006, COMP-007, COMP-008 | ARD-DEC-001, ARD-DEC-003, ARD-DEC-004, ARD-DEC-005 | ARD-API-001 | ARD-SEC-001 |
| FEAT-002 | COMP-002, COMP-003, COMP-004, COMP-006, COMP-007, COMP-008 | ARD-DEC-003, ARD-DEC-004 | ARD-API-001 | ARD-SEC-001 |
| FEAT-003 | COMP-004, COMP-006, COMP-007 | ARD-DEC-003 | ARD-API-001 | ARD-SEC-001 |
| FEAT-004 | COMP-003, COMP-005, COMP-006, COMP-007 | ARD-DEC-003 | ARD-API-001 | ARD-SEC-001 |
| FEAT-005 | COMP-006, COMP-008 | ARD-DEC-002, ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-001 | ARD-SEC-001, ARD-SEC-002 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |