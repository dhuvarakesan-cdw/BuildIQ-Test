Feature: FEAT-001 Task List Management

  @FEAT-001 @FAC-001
  Scenario: Create a task with every supported detail
    Given the task list management seed data is available
    When a visitor creates a task with a non-empty title, description, due date, priority, and completion status
    Then the task is saved into the list
    And the saved task shows its title, description, due date, priority, and status
    And those details remain available when the visitor opens the task for editing

  @FEAT-001 @FAC-002
  Scenario: Reject empty titles while creating and editing
    Given the task list management seed data is available
    When a visitor submits a new task without a title
    Then no new task is added
    And a visible title validation message is shown
    When the visitor edits an existing task and clears the title before saving
    Then the existing task is not updated
    And the visible title validation message remains shown

  @FEAT-001 @FAC-003
  Scenario: Create a task without a due date
    Given the task list management seed data is available
    When a visitor creates a task with a non-empty title and leaves the due date blank
    Then the task is saved into the list
    And the saved task clearly shows that no due date is set

  @FEAT-001 @FAC-004
  Scenario: Filter all, active, completed, and empty task lists
    Given the task list management seed data is available
    When a visitor chooses the all tasks filter
    Then active and completed tasks are shown together
    When the visitor chooses the active tasks filter
    Then only active tasks are shown
    When the visitor chooses the completed tasks filter
    Then only completed tasks are shown
    When the selected filter has no matching tasks
    Then a visible empty-state message is shown

  @FEAT-001 @FAC-005
  Scenario: Save and cancel task edits
    Given the task list management seed data is available
    When a visitor edits the title, description, due date, priority, and completion status of a task and saves
    Then the saved task shows the updated values
    When the visitor edits another task and cancels before saving
    Then none of the canceled values are saved

  @FEAT-001 @FAC-006
  Scenario: Confirm or cancel task deletion
    Given the task list management seed data is available
    When a visitor chooses to delete a task
    Then a confirmation prompt opens for that task
    And keyboard focus moves into the confirmation prompt
    When the visitor cancels the prompt
    Then the task remains in the list unchanged
    When the visitor confirms deletion for a task
    Then that task is removed from the list

  @FEAT-001 @FAC-007
  Scenario: Toggle tasks between active and completed filters
    Given the task list management seed data is available
    When a visitor marks an active task complete
    Then the task is shown under the completed filter
    And the task is no longer shown under the active filter
    When the visitor marks a completed task active
    Then the task is shown under the active filter
    And the task is no longer shown under the completed filter

  @FEAT-001 @FAC-008
  Scenario: Distinguish active overdue tasks from non-overdue tasks
    Given the task list management seed data is available
    When a visitor reviews tasks with the reference date applied
    Then an active task with a past due date is visually marked overdue
    And a completed task with a past due date is not treated as active overdue
    And a task without a due date is not treated as active overdue

  @FEAT-001 @FAC-009
  Scenario: Complete task workflows using only the keyboard
    Given the task list management seed data is available
    When a keyboard-only visitor creates, edits, completes, filters, and starts deleting tasks
    Then the task form fields have accessible labels
    And validation messages are visible when invalid data is submitted
    And empty-state messages are visible when no tasks match a filter
    And the deletion prompt keeps focus within the prompt until it is resolved

  @FEAT-001 @FAC-010
  Scenario: Use task management on desktop and mobile viewports
    Given the task list management seed data is available
    When a visitor uses the task form, task list, filters, and task actions on a desktop-width browser
    Then the task management controls remain visible and usable without horizontal scrolling
    When the visitor uses the same controls on a mobile-width browser
    Then the task management controls remain visible and usable without horizontal scrolling
