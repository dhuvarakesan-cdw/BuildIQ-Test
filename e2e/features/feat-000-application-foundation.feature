Feature: FEAT-000 Application Foundation

  @FEAT-000 @FAC-001
  Scenario: Static React application opens from the root route
    Given the application foundation seed data is available
    When a visitor opens the root application route
    Then the static Vite React application shell is shown
    And the shell is mounted through the TypeScript application entry point

  @FEAT-000 @FAC-002
  Scenario: Browser-only foundation avoids remote application services
    Given the application foundation seed data is available
    When a visitor uses the foundation shell
    Then no backend service, authentication, user account, analytics, or telemetry flow is required
    And the experience remains a local browser-only application

  @FEAT-000 @FAC-003
  Scenario: Source boundary areas are ready for future feature work
    Given the application foundation seed data is available
    When the foundation source structure is reviewed
    Then the shell has dedicated areas for components, hooks, domain utilities, and storage adapters
    And each area is available as a separate application concern

  @FEAT-000 @FAC-004
  Scenario: Responsive accessible shell supports keyboard and viewport use
    Given the application foundation seed data is available
    When a visitor navigates the shell on desktop and mobile viewports
    Then the skip link, topbar, and main landmark are available to keyboard users
    And the responsive layout remains usable without horizontal scrolling
