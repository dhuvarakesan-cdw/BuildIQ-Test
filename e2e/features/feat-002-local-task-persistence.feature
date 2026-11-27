Feature: FEAT-002 Local Task Persistence

  @FEAT-002 @FAC-001
  Scenario: Created tasks remain available after a page refresh
    Given the local task persistence seed data is available for the current browser profile
    When a visitor creates a new local task and refreshes the page
    Then the newly created task remains available in the current task list
    And the task details remain unchanged after the refresh

  @FEAT-002 @FAC-001
  Scenario: Edited tasks remain available after a page refresh
    Given the local task persistence seed data is available for the current browser profile
    When a visitor edits an existing local task and refreshes the page
    Then the edited task remains available in the current task list
    And the saved edits remain unchanged after the refresh

  @FEAT-002 @FAC-002
  Scenario: Confirmed deleted tasks stay removed after a page refresh
    Given the local task persistence seed data is available for the current browser profile
    When a visitor confirms deletion of an existing local task and refreshes the page
    Then the deleted task does not reappear in the current task list
    And the remaining local tasks are still available

  @FEAT-002 @FAC-003
  Scenario: Tasks do not appear in a different browser profile
    Given the local task persistence seed data is saved in the original browser profile
    When a visitor opens the application in a different browser profile
    Then the original profile tasks are not available in that profile
    And the different profile starts with its own separate local task list

  @FEAT-002 @FAC-004
  Scenario: Task workflows do not send task data to a backend API
    Given network monitoring is active for task data requests
    And the local task persistence seed data is available for the current browser profile
    When a visitor creates, views, edits, deletes, completes, and filters local tasks
    Then no backend API receives task titles, descriptions, due dates, priorities, or completion states
    And the task list remains usable from browser storage only

  @FEAT-002 @FAC-005
  Scenario: Task data is stored only for the current browser profile
    Given the local task persistence seed data is available for the current browser profile
    When a visitor refreshes the current browser profile and opens an isolated browser profile
    Then the current browser profile keeps its local tasks
    And the isolated browser profile does not receive those tasks
    And each profile uses only its own browser storage
