# Zoho CRM — Open Tasks Feature Test Suite

## Application Overview

The Open Tasks feature in Zoho CRM (Activities > Tasks > Open Tasks tab) displays a Kanban board of all non-completed tasks grouped by status columns: Not Started, Deferred, and In Progress. Tasks with Status=Completed are excluded. Core fields include Subject (required), Due Date, Contact Name, Related To, Status (Not Started/In Progress/Deferred/Completed/Waiting for input), Priority (Lowest/Low/Normal/High/Highest), Task Owner, Repeat, Reminder, and Description. Functional capabilities include: create, edit, close, sort, filter, bulk actions (mass update, export), notes, attachments, links, and tags.

## Test Scenarios

### 1. Navigation & View Rendering

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-001: Navigate to Open Tasks view via Activities menu

**File:** `tests/open-tasks/navigation.spec.ts`

**Steps:**
  1. In the left navigation, click Activities, then click Tasks in the expanded submenu
    - expect: Tasks module page loads
  2. Click the Open Tasks tab (next to All Tasks)
    - expect: Open Tasks Kanban view loads, URL ends with /tab/Tasks/custom-view/[id]/kanban
    - expect: Three Kanban columns are visible: Not Started, Deferred, In Progress
    - expect: Each column header shows the count of tasks within it

#### 1.2. TC-002: Open Tasks default Kanban view displays correct status columns

**File:** `tests/open-tasks/navigation.spec.ts`

**Steps:**
  1. Navigate to the Open Tasks view and observe the Kanban board layout
    - expect: Exactly three status columns appear: Not Started, Deferred, In Progress
    - expect: The column Completed is absent — completed tasks are excluded
    - expect: Each task card shows: Subject, Due Date, Priority, Task Owner, Contact Name, Related To

#### 1.3. TC-003: Open Tasks tab is distinct from All Tasks tab

**File:** `tests/open-tasks/navigation.spec.ts`

**Steps:**
  1. Click the All Tasks tab and note the total task count
    - expect: All Tasks view loads and shows total task count including completed tasks
  2. Click the Open Tasks tab and compare the task count
    - expect: Open Tasks count is less than or equal to All Tasks count
    - expect: Open Tasks does not show tasks with Status = Completed
    - expect: Active tab styling changes correctly between the two tabs

#### 1.4. TC-004: Refresh Open Tasks view

**File:** `tests/open-tasks/navigation.spec.ts`

**Steps:**
  1. On the Open Tasks view, click the Refresh Custom View button (circular refresh icon in the header toolbar)
    - expect: The Kanban board reloads without error
    - expect: Tasks data is up-to-date and column counts are accurate

#### 1.5. TC-005: Open Tasks Kanban — empty Deferred column renders correctly

**File:** `tests/open-tasks/navigation.spec.ts`

**Steps:**
  1. Navigate to the Open Tasks view and observe the Deferred column when no deferred tasks exist
    - expect: The Deferred column is visible with a count of 0
    - expect: An empty state message (e.g. No Tasks found.) is shown inside the Deferred column
    - expect: Other columns are unaffected

### 2. Create Task

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-006: Create a new task with Subject only (minimum required fields)

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. On the Open Tasks view, click the Create Task button
    - expect: Create Task form opens at /tab/Tasks/create
  2. Enter 'Test Task - Minimum Fields' in the Subject field, leave all other fields at their defaults, and click Save
    - expect: Task is created successfully with a success notification or redirect to the task detail page
    - expect: The new task appears in the Not Started column of the Open Tasks Kanban
    - expect: Task Owner defaults to the currently logged-in user (Ihor Hanets)
    - expect: Priority defaults to High

#### 2.2. TC-007: Create a task with all fields populated

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Click Create Task, then populate: Subject='Full Fields Task', Due Date=15.04.2026, Contact Name=existing contact, Related To type=Account (select existing), Status=In Progress, Priority=Highest, Description='Test description text'
    - expect: All fields are accepted without error
  2. Click Save
    - expect: Task is saved with all provided values
    - expect: The task appears in the In Progress column of the Open Tasks Kanban
    - expect: All field values are accurately reflected on the task detail page

#### 2.3. TC-008: Create a task using Save and New

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. On the Create Task form, enter 'Save and New Task 1' in Subject, then click Save and New
    - expect: The first task is saved successfully
    - expect: A new empty Create Task form opens immediately
  2. Navigate back to the Open Tasks view
    - expect: The first saved task is visible in the Not Started column

#### 2.4. TC-009: Cancel task creation

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Open the Create Task form, enter some text in Subject, then click Cancel
    - expect: The form is dismissed
    - expect: No new task is created
    - expect: User is returned to the previous Tasks view
    - expect: The Open Tasks count remains unchanged

#### 2.5. TC-010: Save a task with empty Subject — validation error

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. On the Create Task form, leave the Subject field empty and click Save
    - expect: The task is NOT saved
    - expect: Inline validation error 'Subject cannot be empty.' appears beneath the Subject field
    - expect: The Subject field is highlighted or focused
    - expect: The form remains open

#### 2.6. TC-011: Attempt to enter an invalid date format in Due Date

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. On the Create Task form, enter a valid subject and type '31-13-2026' (invalid month) in the Due Date field, then click Save
    - expect: The task is NOT saved
    - expect: A date validation error is displayed (e.g. Invalid date or field is highlighted)
    - expect: The form remains open

#### 2.7. TC-012: Enter a past date in Due Date

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Create a task with a valid Subject and Due Date set to 01.01.2020 (past date), then click Save
    - expect: The task is saved without a blocking error
    - expect: The task appears in the Open Tasks view
    - expect: The due date on the task card reflects the past date entered

#### 2.8. TC-013: Create task with Status=Not Started — verify Kanban placement

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Create a task with Subject='Status Not Started Task' and Status='Not Started', then save
    - expect: Task is created and visible in the Not Started column on the Open Tasks Kanban
    - expect: The Not Started column count increments by 1

#### 2.9. TC-014: Create task with Status=In Progress — verify Kanban placement

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Create a task with Subject='Status In Progress Task' and Status='In Progress', then save
    - expect: Task is created and visible in the In Progress column on the Open Tasks Kanban
    - expect: The In Progress column count increments by 1

#### 2.10. TC-015: Create task with Status=Deferred — verify Kanban placement

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Create a task with Subject='Status Deferred Task' and Status='Deferred', then save
    - expect: Task is created and visible in the Deferred column on the Open Tasks Kanban
    - expect: The Deferred column count increments by 1

#### 2.11. TC-016: Create task with Status=Completed — verify exclusion from Open Tasks

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. Create a task with Subject='Completed Task Exclusion Test' and Status='Completed', then save
    - expect: Task is saved successfully
  2. Navigate to the Open Tasks view
    - expect: The task does NOT appear in any Kanban column of the Open Tasks view
    - expect: The Open Tasks total count is NOT incremented
    - expect: The task is visible in the All Tasks and Closed Tasks views

#### 2.12. TC-017: Verify all Priority values can be selected during task creation

**File:** `tests/open-tasks/create-task.spec.ts`

**Steps:**
  1. On the Create Task form, open the Priority dropdown and observe available options
    - expect: All 5 priority options are present: Lowest, Low, Normal, High, Highest
    - expect: Default value is High
    - expect: Each option is selectable without error

### 3. View & Read Task Details

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-018: Open a task from the Kanban to view its detail page

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. Click the Subject/name link on any task card in the Open Tasks Kanban board
    - expect: The task detail page opens
    - expect: All saved fields are displayed: Subject, Priority, Due Date, Status, Related To, Task Owner, Contact Name, Created By, Modified By, Description
    - expect: Two tabs are visible: Overview and Timeline
    - expect: Action buttons visible: Close Task, Edit, More Options
    - expect: Navigation buttons visible: Previous Record, Next Record

#### 3.2. TC-019: Task detail page — Business Card section shows key fields

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. On the task detail page, observe the Business Card section (top-left of the detail view)
    - expect: Business Card shows: Priority, Due Date, Status, Related To, Task Owner
    - expect: Each field is clickable (inline edit enabled)
    - expect: Values are visually distinct and readable

#### 3.3. TC-020: Navigate between tasks using Previous and Next Record buttons

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. On a task detail page, click the Next Record button
    - expect: The next task in the current view order is loaded
  2. Click the Previous Record button
    - expect: The previous task is returned to
    - expect: Buttons are disabled/grayed when at the first or last record respectively

#### 3.4. TC-021: Timeline tab shows task activity history

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. On a task detail page, click the Timeline tab
    - expect: The Timeline tab displays a chronological history of actions
    - expect: At minimum, the creation event is shown
    - expect: Each entry shows the user and timestamp

### 4. Edit Task

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-022: Edit a task subject from the detail page

**File:** `tests/open-tasks/edit-task.spec.ts`

**Steps:**
  1. On a task detail page, click Edit, clear the Subject field, enter 'Updated Task Subject', and click Save
    - expect: The task subject is updated to 'Updated Task Subject'
    - expect: The change is reflected on the detail page immediately
    - expect: The modified timestamp is updated
    - expect: The task card in the Kanban view shows the new subject

#### 4.2. TC-023: Inline edit Priority field on the task detail page

**File:** `tests/open-tasks/edit-task.spec.ts`

**Steps:**
  1. In the Business Card section on the task detail page, click on the Priority field value, select 'Highest' from the inline dropdown, and save
    - expect: Priority is updated to Highest without leaving the detail page
    - expect: The change is saved and visible on the Kanban card

#### 4.3. TC-024: Change task Status from Not Started to In Progress — Kanban column update

**File:** `tests/open-tasks/edit-task.spec.ts`

**Steps:**
  1. Open a task from the Not Started column, click Edit, change Status from Not Started to In Progress, and click Save
    - expect: Task is saved with In Progress status
  2. Navigate back to the Open Tasks Kanban
    - expect: The task moves from the Not Started column to the In Progress column
    - expect: Not Started count decreases by 1; In Progress count increases by 1
    - expect: The task is still visible in the Open Tasks view

#### 4.4. TC-025: Change task Status from In Progress to Completed — task removed from Open Tasks

**File:** `tests/open-tasks/edit-task.spec.ts`

**Steps:**
  1. Open any In Progress task, click Edit, change Status to Completed, and click Save
    - expect: Task is saved with Completed status
  2. Navigate back to the Open Tasks view
    - expect: The task is removed from the Open Tasks Kanban (not in any column)
    - expect: The In Progress column count decreases by 1
    - expect: The task appears in All Tasks and Closed Tasks views

#### 4.5. TC-026: Attempt to save an edited task with an empty Subject

**File:** `tests/open-tasks/edit-task.spec.ts`

**Steps:**
  1. Click Edit on any task, clear the Subject field entirely, and click Save
    - expect: The task is NOT saved
    - expect: Error message 'Subject cannot be empty.' is displayed
    - expect: The form remains open with the Subject field highlighted

### 5. Close Task Action

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-027: Close a task using the Close Task button

**File:** `tests/open-tasks/close-task.spec.ts`

**Steps:**
  1. On the detail page of any open task, click the Close Task button in the action header
    - expect: The task status changes to Completed
    - expect: A Closed Time value is recorded on the task
    - expect: A success notification is shown
  2. Navigate back to the Open Tasks Kanban
    - expect: The closed task is removed from the Open Tasks Kanban view

#### 5.2. TC-028: Closed task is absent from Open Tasks and present in Closed Tasks view

**File:** `tests/open-tasks/close-task.spec.ts`

**Steps:**
  1. After closing a task (TC-027), navigate to the Open Tasks Kanban and verify the task is not visible
    - expect: Closed task is NOT present in Open Tasks and column counts are decremented
  2. Use the custom view picker to switch to the Closed Tasks view
    - expect: The closed task IS present in the Closed Tasks view

### 6. Sort & Filter

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-029: Sort Open Tasks by Due Date ascending

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click the Sort button, select Due Date from the Sort By dropdown, set order to Ascending, and click Apply
    - expect: Tasks within each Kanban column are sorted by Due Date in ascending order
    - expect: Earliest due date appears at the top of each column
    - expect: The sort indicator is visible in the toolbar

#### 6.2. TC-030: Sort Open Tasks by Priority descending

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click Sort, select Priority, set order to Descending, and click Apply
    - expect: Tasks are sorted by Priority in descending order within each column
    - expect: No errors appear and sort is applied consistently across all visible columns

#### 6.3. TC-031: Remove applied sort from Open Tasks

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click Sort, select None from the Sort By dropdown, and confirm
    - expect: Sort is cleared
    - expect: Tasks return to their default order

#### 6.4. TC-032: Filter Open Tasks by Priority

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click the Filter button, check the Priority checkbox in Filter By Fields, select 'High', and apply the filter
    - expect: Only tasks with Priority = High are displayed in the Kanban
    - expect: Tasks with other priority values are hidden
    - expect: Column counts update to reflect filtered results
    - expect: A visual indicator shows that a filter is active

#### 6.5. TC-033: Filter Open Tasks by Due Date range

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click Filter, enable Due Date filter, set date range from 01.03.2026 to 31.03.2026, and apply
    - expect: Only tasks with Due Date within that range are shown
    - expect: Tasks outside the range are hidden
    - expect: Column counts update accordingly

#### 6.6. TC-034: Filter Open Tasks by Task Owner

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click Filter, check the Task Owner checkbox, select the current logged-in user, and apply
    - expect: Only tasks owned by the selected user are displayed
    - expect: Tasks assigned to other users are hidden

#### 6.7. TC-035: Clear all applied filters

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. With one or more filters active, locate and click the option to clear/remove all filters
    - expect: All filters are removed
    - expect: The full Open Tasks list is restored
    - expect: Column counts reflect unfiltered data

#### 6.8. TC-036: Apply multiple filters simultaneously (AND logic)

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Click Filter, apply Priority=High AND Due Date=current month, then apply both filters
    - expect: Both filters are applied simultaneously
    - expect: Only tasks matching ALL filter criteria are displayed
    - expect: No system errors occur

#### 6.9. TC-037: Filter with criteria that matches no tasks

**File:** `tests/open-tasks/sort-filter.spec.ts`

**Steps:**
  1. Apply a filter that guarantees 0 results (e.g., Due Date = a date far in the future with no tasks assigned)
    - expect: Each Kanban column shows an empty state (No Tasks found. or equivalent)
    - expect: All column counts show 0
    - expect: No error is thrown
    - expect: Clearing the filter restores the original list

### 7. Bulk Actions

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-038: Export tasks from Open Tasks view

**File:** `tests/open-tasks/bulk-actions.spec.ts`

**Steps:**
  1. Click the Actions button, then click Export Tasks from the dropdown menu
    - expect: An export dialog or download process is initiated
    - expect: A CSV or XLS file is prepared/downloaded containing Open Tasks data
    - expect: No errors occur

#### 7.2. TC-039: Mass Update — change Priority for multiple tasks

**File:** `tests/open-tasks/bulk-actions.spec.ts`

**Steps:**
  1. Click Actions, click Mass Update, select multiple tasks, set Priority to Normal, and confirm the mass update
    - expect: All selected tasks have their Priority updated to Normal
    - expect: The change is reflected on the Kanban cards
    - expect: A success notification is shown

### 8. Custom View & View Configuration

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-040: Verify Open Tasks is listed in the custom views dropdown

**File:** `tests/open-tasks/custom-view.spec.ts`

**Steps:**
  1. On the Tasks module, click the custom view dropdown selector (combobox next to the Open Tasks tab)
    - expect: Open Tasks appears under Public Views in the dropdown list
    - expect: Other public views are also listed (All Tasks, Closed Tasks, My Open Tasks, etc.)

#### 8.2. TC-041: Switch from Open Tasks to My Open Tasks via dropdown

**File:** `tests/open-tasks/custom-view.spec.ts`

**Steps:**
  1. On the Open Tasks view, click the custom view dropdown and select My Open Tasks
    - expect: The view switches to My Open Tasks (showing only the current user's open tasks)
    - expect: The Kanban data updates to reflect the new filter scope
    - expect: The active view label in the UI updates accordingly

### 9. Notes, Attachments & Links

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-042: Add a note to an open task

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. On the detail page of an open task, click the 'Add a note' text field in the Notes section, type 'This is a test note', and save
    - expect: The note is added and displayed in the Notes section
    - expect: The note shows the author and timestamp
    - expect: The task's Last Activity Time is updated

#### 9.2. TC-043: Attach a file to an open task

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. On the task detail page, click Attach in the Attachments section and upload a valid small file (e.g., PDF or image)
    - expect: The file is uploaded and appears in the Attachments section
    - expect: The file name and upload date are displayed
    - expect: No error occurs during upload

#### 9.3. TC-044: Add a link to an open task

**File:** `tests/open-tasks/task-detail.spec.ts`

**Steps:**
  1. In the Links section on the task detail page, click Add, enter a valid URL and display label, and save
    - expect: The link appears in the Links section with the provided label
    - expect: Clicking the link opens the URL in a new tab or window

### 10. Data Consistency

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-045: Task data persists correctly after page refresh

**File:** `tests/open-tasks/data-consistency.spec.ts`

**Steps:**
  1. Create a new task with all fields populated, note the task ID from the URL, then navigate away and back to the task detail page
    - expect: All field values are correctly persisted and displayed after the refresh
    - expect: No data loss occurs
    - expect: Created By and Modified By timestamps are accurate

#### 10.2. TC-046: Kanban column counts match the actual number of visible task cards

**File:** `tests/open-tasks/data-consistency.spec.ts`

**Steps:**
  1. On the Open Tasks Kanban, note the count in each column header (Not Started: X, Deferred: Y, In Progress: Z) and manually count the task cards in each column
    - expect: Each header count matches the number of task cards in the corresponding column
    - expect: The total across all columns represents the total open tasks

#### 10.3. TC-047: Task is removed from Open Tasks after Status changed to Completed via Edit

**File:** `tests/open-tasks/data-consistency.spec.ts`

**Steps:**
  1. Open an open task, click Edit, change Status to Completed, click Save, then click Back to return to the Open Tasks Kanban
    - expect: The task no longer appears in any column of the Open Tasks Kanban
    - expect: The column count where the task previously resided is decremented by 1
    - expect: The task now appears in All Tasks and Closed Tasks views

### 11. UI Behavior & Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 11.1. TC-048: Task card displays long subject gracefully without breaking layout

**File:** `tests/open-tasks/ui-behavior.spec.ts`

**Steps:**
  1. Create a task with a very long subject (200+ characters) and navigate to the Open Tasks Kanban
    - expect: The task card does not break the Kanban layout
    - expect: The subject is truncated with an ellipsis or wrapped gracefully
    - expect: Clicking the card shows the full subject on the detail page

#### 11.2. TC-049: Create Task button is always accessible on Open Tasks view

**File:** `tests/open-tasks/ui-behavior.spec.ts`

**Steps:**
  1. On the Open Tasks view, observe the toolbar and scroll down the page if there are many tasks
    - expect: The Create Task button is visible and clickable
    - expect: The button remains accessible regardless of the number of visible tasks

#### 11.3. TC-050: Open Tasks page loads within an acceptable time

**File:** `tests/open-tasks/ui-behavior.spec.ts`

**Steps:**
  1. Navigate directly to the Open Tasks view URL from a freshly authenticated session
    - expect: The Open Tasks Kanban fully renders within 5 seconds under normal conditions
    - expect: No timeout errors or blank page states occur
    - expect: All column counts and task cards are visible after load
