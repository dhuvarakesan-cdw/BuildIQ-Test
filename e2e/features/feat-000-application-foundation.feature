Feature: FEAT-000 Application Foundation

  @FEAT-000 @FAC-001
  Scenario: Shell navigation exposes the foundation views
    Given seed context CTX-FEAT-000-SHELL-NAVIGATION
    When the application opens at route ROUTE-001
    Then the shell navigation shows Dashboard, Task list, and Create task

  @FEAT-000 @FAC-002
  Scenario: Task values use the approved foundation vocabulary
    Given seed context CTX-FEAT-000-APPROVED-TASK-VALUES
    When the foundation task model is available
    Then the approved statuses are Pending, In Progress, and Completed
    Then the approved priorities are Low, Medium, High, and blank

  @FEAT-000 @FAC-003
  Scenario: Build and test structure is present for the frontend application
    Given seed context CTX-FEAT-000-BUILD-TEST-STRUCTURE
    When the frontend project files are inspected
    Then the Vite application shell and Jest test structure are present
