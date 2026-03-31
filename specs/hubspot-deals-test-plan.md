# HubSpot CRM — Deals Feature Test Plan

## Application Overview

HubSpot CRM Deals module at https://app-eu1.hubspot.com. The Deals feature allows users to track sales opportunities through a configurable pipeline. The Sales Pipeline contains 7 stages: Appointment Scheduled, Qualified To Buy, Presentation Scheduled, Decision Maker Bought-In, Contract Sent, Closed Won, Closed Lost. A deal record has fields: Deal name (required), Pipeline, Deal stage, Amount, Close date, Deal owner, Deal type (New Business / Existing Business), Priority (Low / Medium / High), and associations to Contacts, Companies, Tickets, and Attachments. The list view supports Table and Board (kanban) views, filtering, sorting, pagination, column management, view cloning, and bulk actions (Assign, Edit, Delete, More). The deal detail page shows a highlights panel with key fields, an activity timeline (Notes, Emails, Calls, Tasks, Meetings), an About this deal sidebar, and a right sidebar for associations.

## Test Scenarios

### 1. Create Deal

**Seed:** `tests/seed.spec.ts`

#### 1.1. should create a deal with required fields only

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Navigate to the Deals list page and click the 'Create new' button in the top navigation bar
    - expect: A dropdown menu appears with options: Contact, Company, Deal, Ticket, Task
  2. Click 'Deal' from the dropdown menu
    - expect: The 'Create Deal' modal opens
    - expect: The Deal name field is focused
    - expect: Pipeline is pre-populated with 'Sales Pipeline'
    - expect: Deal stage is pre-populated with 'Appointment Scheduled'
    - expect: Close date is pre-populated with today's date
    - expect: Deal owner is pre-populated with 'Ihor Hanets'
    - expect: The Create button is disabled
  3. Type 'TC-001 Required Fields Deal' into the Deal name field
    - expect: The Create button becomes enabled
  4. Click the 'Create' button
    - expect: A success toast notification appears with the text 'A new deal was created'
    - expect: A 'Go to record' link is visible in the notification
    - expect: The Create Deal modal closes
  5. Navigate back to the Deals list page
    - expect: The deal 'TC-001 Required Fields Deal' appears in the table with stage 'Appointment Scheduled (Sales Pipeline)'

#### 1.2. should create a deal with all optional fields populated

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    - expect: The Create Deal modal opens
  2. Enter 'TC-002 Full Fields Deal' in the Deal name field
    - expect: The Create button becomes enabled
  3. Click the Deal stage dropdown and select 'Qualified To Buy'
    - expect: The Deal stage field shows 'Qualified To Buy'
  4. Click the Amount field and enter '5000'
    - expect: The Amount field shows '5000'
  5. Click the Deal type dropdown and select 'New Business'
    - expect: The Deal type field shows 'New Business'
  6. Click the Priority dropdown and select 'High'
    - expect: The Priority field shows 'High'
  7. Click the 'Create' button
    - expect: Success toast: 'A new deal was created'
  8. Navigate to the deals list and find 'TC-002 Full Fields Deal'
    - expect: The deal appears with stage 'Qualified To Buy (Sales Pipeline)'

#### 1.3. should keep modal open and reset after using 'Create and add another'

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    - expect: The Create Deal modal opens
  2. Enter 'TC-003 Create And Add Another Deal' in the Deal name field
    - expect: The Create button and 'Create and add another' button are both enabled
  3. Click the 'Create and add another' button
    - expect: A success toast appears for the first deal
    - expect: The Create Deal modal stays open
    - expect: The Deal name field is cleared and ready for a new entry

#### 1.4. should disable the Create button when Deal name is empty

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    - expect: The Create Deal modal opens
  2. Leave the Deal name field empty and observe the Create button
    - expect: The Create button is disabled
  3. Click inside the Deal name field then click outside without entering text
    - expect: The Create button remains disabled
    - expect: No deal is created

#### 1.5. should cancel deal creation using the Cancel button

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Navigate to the Deals list page. Note the current deal count on the 'All deals' tab
    - expect: Current deal count is recorded
  2. Click 'Create new' → 'Deal', then enter 'TC-005 Should Not Be Created'
    - expect: The Create Deal modal is open with text entered
  3. Click the 'Cancel' button at the bottom of the modal
    - expect: The Create Deal modal closes
    - expect: No success toast appears
    - expect: The deal count on the 'All deals' tab remains unchanged

#### 1.6. should cancel deal creation using the X (close) button

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', then enter 'TC-006 Cancel via X'
    - expect: The Create Deal modal is open
  2. Click the X (Close) button in the modal header
    - expect: The Create Deal modal closes
    - expect: No deal is created

#### 1.7. should display all 7 pipeline stages in the Deal stage dropdown

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal' and click the Deal stage dropdown
    - expect: The dropdown is open
  2. Inspect all options listed in the Deal stage dropdown
    - expect: Exactly 7 options appear in order: 'Appointment Scheduled', 'Qualified To Buy', 'Presentation Scheduled', 'Decision Maker Bought-In', 'Contract Sent', 'Closed Won', 'Closed Lost'

#### 1.8. should display correct Deal type options

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal' and click the Deal type dropdown
    - expect: The dropdown opens and lists exactly 3 options: a blank option, 'New Business', and 'Existing Business'

#### 1.9. should display correct Priority options

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal' and click the Priority dropdown
    - expect: The dropdown opens and lists exactly 4 options: a blank option, 'Low', 'Medium', 'High'

#### 1.10. should create a deal with Closed Won stage

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', enter 'TC-010 Closed Won Deal', select 'Closed Won' from the Deal stage dropdown, then click Create
    - expect: Success toast appears
    - expect: The deal is created with stage 'Closed Won'
  2. Navigate to the Deals list and find 'TC-010 Closed Won Deal'
    - expect: The deal is listed with stage 'Closed Won (Sales Pipeline)'

#### 1.11. should create a deal with Closed Lost stage

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', enter 'TC-011 Closed Lost Deal', select 'Closed Lost' from the Deal stage dropdown, then click Create
    - expect: Success toast appears
    - expect: The deal is created with stage 'Closed Lost'
  2. Navigate to the Deals list and find 'TC-011 Closed Lost Deal'
    - expect: The deal is listed with stage 'Closed Lost (Sales Pipeline)'

#### 1.12. should navigate to the deal detail page via the 'Go to record' link in the success notification

**File:** `tests/deals/create-deal.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', enter 'TC-012 Notification Link Deal', click Create
    - expect: Success toast appears with a 'Go to record' link
  2. Click the 'Go to record' link in the success notification
    - expect: User is navigated to the deal detail page for 'TC-012 Notification Link Deal'
    - expect: The page title shows 'TC-012 Notification Link Deal'

### 2. Edit Deal

**Seed:** `tests/seed.spec.ts`

#### 2.1. should edit deal name inline on the detail page

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-013 Edit Name Test' and navigate to its detail page
    - expect: The deal detail page is open with heading 'TC-013 Edit Name Test'
  2. Click the Edit (pencil) icon next to the deal name heading
    - expect: The deal name becomes an editable text field
  3. Clear the existing text and type 'TC-013 Edited Deal Name', then save (press Enter or click confirm)
    - expect: The deal name heading updates to 'TC-013 Edited Deal Name'
    - expect: No full page reload occurs
  4. Navigate back to the Deals list page
    - expect: The deal is listed as 'TC-013 Edited Deal Name' in the table

#### 2.2. should change deal stage from the deal detail page and log activity

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-014 Stage Change Deal' (default stage: Appointment Scheduled) and navigate to its detail page
    - expect: The Deal Stage field shows 'Appointment Scheduled'
  2. Click the 'Appointment Scheduled' Deal Stage dropdown in the deal highlights area and select 'Qualified To Buy'
    - expect: The Deal Stage field updates to 'Qualified To Buy'
  3. Scroll down to the activity timeline
    - expect: A new activity entry appears: '[User] moved TC-014 Stage Change Deal to Qualified To Buy'

#### 2.3. should edit the Amount field on the deal detail page

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-015 Amount Edit Deal' and navigate to its detail page
    - expect: The Amount field shows '--'
  2. Click the Amount field and enter '12500'
    - expect: The amount input accepts the value
  3. Save the change and reload/refresh the page
    - expect: The Amount field shows '$12,500' or equivalent formatted value

#### 2.4. should edit the Close date field on the deal detail page

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-016 Close Date Edit' and navigate to its detail page
    - expect: The Close Date field is visible in the highlights area
  2. Click the Close date field and change the date to '12/31/2026'
    - expect: The date picker or input accepts the new date
  3. Save the change and reload the page
    - expect: The Close Date field shows '12/31/2026'

#### 2.5. should edit Deal type from the 'About this deal' section

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-017 Deal Type Edit' and navigate to its detail page
    - expect: The Deal Type field in the 'About this deal' section shows '--'
  2. Click the Deal Type field and select 'Existing Business'
    - expect: The Deal Type field updates to 'Existing Business'
  3. Reload the page
    - expect: The Deal Type field still shows 'Existing Business'

#### 2.6. should edit Priority from the 'About this deal' section

**File:** `tests/deals/edit-deal.spec.ts`

**Steps:**
  1. Create a deal named 'TC-018 Priority Edit Deal' and navigate to its detail page
    - expect: The Priority field in the 'About this deal' section shows '--'
  2. Click the Priority field and select 'Medium'
    - expect: The Priority field updates to 'Medium'
  3. Reload the page
    - expect: The Priority field still shows 'Medium'

### 3. Deal Actions Menu

**Seed:** `tests/seed.spec.ts`

#### 3.1. should display all expected items in the Actions dropdown

**File:** `tests/deals/deal-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-019 Actions Verify Deal' and navigate to its detail page
    - expect: The deal detail page is open
  2. Click the 'Actions' button at the top of the left panel
    - expect: A dropdown menu opens
  3. Inspect all items listed in the Actions dropdown
    - expect: The dropdown contains exactly: Unfollow, View all properties, View property history, View association history, Review associations, Summarize, Restore activity, Merge, Clone, Delete

#### 3.2. should clone a deal via the Actions menu

**File:** `tests/deals/deal-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-020 Original Deal' and navigate to its detail page
    - expect: The deal detail page is open
  2. Click 'Actions' → 'Clone'
    - expect: User is navigated to a new deal detail page (the clone)
    - expect: The cloned deal has a name derived from the original (e.g., 'Copy of TC-020 Original Deal')
  3. Navigate to the Deals list
    - expect: Both 'TC-020 Original Deal' and the cloned deal appear in the list

#### 3.3. should delete a deal via the Actions menu with confirmation

**File:** `tests/deals/deal-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-021 Deal To Delete' and navigate to its detail page
    - expect: The deal detail page is open
  2. Click 'Actions' → 'Delete'
    - expect: A confirmation dialog appears asking to confirm deletion
  3. Click the confirm Delete button in the dialog
    - expect: The deal is deleted
    - expect: User is redirected to the Deals list
  4. Search for 'TC-021 Deal To Delete' in the Deals list
    - expect: The deleted deal does not appear in the list

#### 3.4. should open all properties panel via Actions menu

**File:** `tests/deals/deal-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-022 View Props Deal' and navigate to its detail page
    - expect: The deal detail page is open
  2. Click 'Actions' → 'View all properties'
    - expect: A panel or page opens displaying all deal properties and their current values

### 4. Deal Activity Timeline

**Seed:** `tests/seed.spec.ts`

#### 4.1. should verify creation activities appear in the timeline immediately after deal creation

**File:** `tests/deals/deal-activity.spec.ts`

**Steps:**
  1. Create a deal named 'TC-023 Activity Log Deal' and navigate directly to its detail page
    - expect: The deal detail page is open
  2. Scroll to the activity timeline area
    - expect: The timeline shows a 'Created' entry: 'This deal was created by Ihor Hanets' with today's timestamp
    - expect: The timeline shows a 'Deal Activity' entry: '[User] moved TC-023 Activity Log Deal to Appointment Scheduled'

#### 4.2. should add a Note to a deal and display it in the timeline

**File:** `tests/deals/deal-activity.spec.ts`

**Steps:**
  1. Create a deal named 'TC-024 Note Test Deal' and navigate to its detail page
    - expect: The deal detail page is open with activity timeline visible
  2. Click the 'Note' (Create a note) button in the activity area
    - expect: A note editor appears
  3. Type 'This is a test note for TC-024' in the note editor and click Save note
    - expect: The note editor closes
    - expect: The note 'This is a test note for TC-024' appears in the activity timeline with today's timestamp
  4. Click the 'Notes' filter tab in the timeline
    - expect: Only the newly added note is displayed under the Notes filter

#### 4.3. should create a Task from a deal and display it in the timeline

**File:** `tests/deals/deal-activity.spec.ts`

**Steps:**
  1. Create a deal named 'TC-025 Task Test Deal' and navigate to its detail page
    - expect: The deal detail page is open
  2. Click the 'Task' (Create a task) button in the activity area
    - expect: A task creation form appears
  3. Enter title 'TC-025 Follow up task', set a due date, and save the task
    - expect: The task is created and appears in the activity timeline
  4. Click the 'Tasks' filter tab in the timeline
    - expect: Only the task 'TC-025 Follow up task' is displayed

#### 4.4. should filter activities by type using timeline tabs

**File:** `tests/deals/deal-activity.spec.ts`

**Steps:**
  1. Create a deal, add a note and a task to it. Navigate to the deal detail page.
    - expect: The deal detail page shows multiple activities in the timeline
  2. Click the 'Notes' tab in the activity timeline navigation
    - expect: Only note activities are shown
  3. Click the 'Tasks' tab
    - expect: Only task activities are shown
  4. Click the 'All activities' tab
    - expect: All activity types are shown (unfiltered)

#### 4.5. should filter activities using the search box in the timeline

**File:** `tests/deals/deal-activity.spec.ts`

**Steps:**
  1. Create a deal, add a note containing the text 'unique-search-keyword-TC-026', navigate to the deal detail page
    - expect: The note appears in the timeline
  2. Type 'unique-search-keyword-TC-026' in the 'Search activities' search box
    - expect: Only the note matching the search text is displayed in the timeline
  3. Clear the search box
    - expect: All activities are restored in the timeline

### 5. Deals List View — Table

**Seed:** `tests/seed.spec.ts`

#### 5.1. should navigate to the Deals list via the left sidebar

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Click 'Deals' in the left navigation sidebar
    - expect: User is navigated to the Deals list page
    - expect: The page title shows 'Deals | All deals'
    - expect: The table view shows columns: Deal Name, Deal Stage, Close Date, Deal owner, Amount

#### 5.2. should search for a deal by name using the Search box

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Create a deal named 'TC-028 Searchable Deal' and navigate to the Deals list page
    - expect: The deal appears in the list
  2. Type 'TC-028 Searchable' in the Search box in the toolbar
    - expect: The table filters to show only 'TC-028 Searchable Deal'
    - expect: Other deals are not visible
  3. Clear the Search box
    - expect: All deals are restored in the list

#### 5.3. should sort deals by Deal Name column in ascending and descending order

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Create at least two deals with different names (e.g., 'AAA Sort Deal' and 'ZZZ Sort Deal') and navigate to the Deals list
    - expect: Both deals appear in the table
  2. Click the 'Deal Name' column header once
    - expect: Deals are sorted alphabetically A→Z
    - expect: A sort direction indicator (ascending arrow) appears on the Deal Name column header
  3. Click the 'Deal Name' column header again
    - expect: Deals are sorted Z→A
    - expect: The sort direction indicator reverses to descending

#### 5.4. should sort deals by Close Date column

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Create at least two deals with different close dates and navigate to the Deals list
    - expect: Both deals appear in the table
  2. Click the 'Close Date' column header once
    - expect: Deals are sorted by close date in ascending order (earliest first)
    - expect: A sort direction indicator appears on the column
  3. Click the 'Close Date' column header again
    - expect: Sort order reverses to descending (latest first)

#### 5.5. should switch between Table view and Board view using the view toggle

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list (currently showing table view). Click the 'Table view' button in the toolbar.
    - expect: A view type picker panel appears with options: 'Table view' (currently active/pressed) and 'Board view'
  2. Click 'Board view' in the picker
    - expect: The page URL changes to end with '.../views/all/board'
    - expect: A kanban board layout is displayed with deal stage columns
  3. Click the 'Board view' button again to open the picker, then click 'Table view'
    - expect: The page URL changes back to '.../views/all/list'
    - expect: The table view is restored

#### 5.6. should switch between 'All deals' and 'My deals' view tabs

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list and click the 'My deals' tab
    - expect: The list filters to show only deals owned by the logged-in user (Ihor Hanets)
    - expect: The 'My deals' tab appears active
  2. Click the 'All deals' tab
    - expect: All deals are shown again
    - expect: The 'All deals' tab appears active

#### 5.7. should change pagination to 50 per page via the settings sidebar

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list (table view) and click the 'Open Settings Sidebar' icon in the toolbar
    - expect: The Table settings panel opens on the right side, showing Pagination, Row height, and Zebra striping sections
  2. Under Pagination, select '50 per page'
    - expect: The radio button for '50 per page' becomes selected
  3. Close the settings sidebar and observe the pagination control at the bottom
    - expect: The pagination control shows '50 per page'

#### 5.8. should change row height to Compact via the settings sidebar

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list (table view) and click the 'Open Settings Sidebar' icon
    - expect: The Table settings panel opens
    - expect: Row height 'Default' is selected
  2. Under Row height, select 'Compact'
    - expect: The 'Compact' radio button is selected
    - expect: The table rows visually become more condensed

#### 5.9. should toggle Zebra striping via the settings sidebar

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list (table view) and open the Settings Sidebar. Under Zebra striping, toggle it ON.
    - expect: Alternating rows display a different background colour
  2. Toggle Zebra striping OFF
    - expect: All rows display the same background colour

#### 5.10. should open and use the Edit columns dialog to add a new column

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list (table view) and click the 'Edit columns' button in the toolbar
    - expect: The 'Choose which columns you see' dialog opens
    - expect: Properties are grouped under categories such as Associations and Deal activity
  2. Search for 'Priority' in the search box inside the dialog and check the 'Priority' checkbox
    - expect: The Priority checkbox becomes checked
  3. Confirm/apply the changes by clicking Apply or Save
    - expect: The dialog closes
    - expect: A 'Priority' column now appears in the table

#### 5.11. should clone a view and rename it

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list 'All deals' tab and click the 'Clone view' button (copy icon next to Save in the toolbar)
    - expect: A new view tab appears in the tab bar with an editable name input pre-filled with a default name (e.g., 'All deals-1')
  2. Clear the default name and type 'TC-038 Cloned View', then press Enter or click the save icon
    - expect: The new tab is named 'TC-038 Cloned View'
    - expect: The URL contains the new view's ID
    - expect: The cloned view contains the same columns and deals as the source

#### 5.12. should filter deals by Pipeline

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list and click the Pipeline filter button in the toolbar (showing 'All Pipelines' or 'Sales Pipeline')
    - expect: A dropdown appears listing available pipelines including 'Sales Pipeline'
  2. Select 'Sales Pipeline'
    - expect: The list shows only deals belonging to the 'Sales Pipeline'

#### 5.13. should apply a quick filter by Deal owner

**File:** `tests/deals/deals-list-table.spec.ts`

**Steps:**
  1. Navigate to the Deals list and click 'Deal owner' in the quick-filter bar below the toolbar
    - expect: A filter input/dropdown appears to select a Deal owner
  2. Select 'Ihor Hanets' as the filter value and apply
    - expect: The table shows only deals owned by 'Ihor Hanets'
    - expect: A filter tag/indicator is visible showing the active filter
  3. Remove the Deal owner filter tag
    - expect: The full unfiltered list is restored

### 6. Deals List View — Board

**Seed:** `tests/seed.spec.ts`

#### 6.1. should display all 7 pipeline stage columns in Board view

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Navigate to the Deals list and switch to Board view
    - expect: Exactly 7 columns are visible in order: Appointment Scheduled, Qualified To Buy, Presentation Scheduled, Decision Maker Bought-In, Contract Sent, Closed Won, Closed Lost
  2. Inspect each column header
    - expect: Each column displays a deal count
    - expect: Each column footer shows a Total amount and a Weighted amount

#### 6.2. should display correct information on a deal card in Board view

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Create a deal named 'TC-042 Board Card Deal' with a close date and deal owner, then switch to Board view
    - expect: The deal card is visible in the 'Appointment Scheduled' column
  2. Inspect the deal card content
    - expect: The card shows: deal name 'TC-042 Board Card Deal', Create date, Close date, Deal owner 'Ihor Hanets'

#### 6.3. should navigate to the deal detail page by clicking the deal name on a card

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Switch to Board view and click the deal name link on any deal card
    - expect: User is navigated to that deal's detail page

#### 6.4. should select a deal card in Board view using the card checkbox

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Switch to Board view and hover over a deal card
    - expect: A 'Select card' checkbox appears on the deal card
  2. Click the Select card checkbox
    - expect: The card is selected (checkbox is checked)
    - expect: A bulk actions bar appears at the top of the page

#### 6.5. should update column Total amount after setting a deal amount

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Switch to Board view and note the Total amount for the 'Appointment Scheduled' column
    - expect: Total amount is $0 (or current value)
  2. Create a deal named 'TC-045 Amount Update Deal', navigate to its detail page, and set Amount to '10000'
    - expect: Amount is saved as $10,000
  3. Navigate back to Board view
    - expect: The 'Appointment Scheduled' column Total amount has increased by $10,000

#### 6.6. should open the Export dialog from Board view

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Switch to Board view and click the 'Export' button in the toolbar
    - expect: An export dialog or modal appears allowing the user to configure and initiate a deals data export

#### 6.7. should sort deal cards in Board view using the Sort button

**File:** `tests/deals/deals-board.spec.ts`

**Steps:**
  1. Switch to Board view and click the 'Sort' button in the toolbar
    - expect: A sort options panel/dropdown appears listing sortable fields
  2. Select a sort option (e.g., Create Date, Most recent)
    - expect: Deal cards within each column are re-ordered according to the selected sort option

### 7. Bulk Actions

**Seed:** `tests/seed.spec.ts`

#### 7.1. should show bulk action bar with correct controls when a row is selected

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-048 Bulk Select Deal' and navigate to the Deals list (table view)
    - expect: The deal is visible in the table
  2. Click the row checkbox for 'TC-048 Bulk Select Deal'
    - expect: The bulk actions bar appears at the top of the table
    - expect: The bar shows '1 deal selected'
    - expect: The following buttons are visible: Assign, Fill smart properties (disabled), Edit, Delete, More

#### 7.2. should select all deals using the column header checkbox

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Navigate to the Deals list (table view) and click the 'Select all records' checkbox in the column header
    - expect: All rows on the current page have their checkboxes checked
    - expect: The bulk actions bar shows the correct total count (e.g., '1 deal selected' if only one deal exists)

#### 7.3. should bulk delete a selected deal

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-050 Bulk Delete Deal' and navigate to the Deals list
    - expect: The deal is visible in the table
  2. Select the row for 'TC-050 Bulk Delete Deal' using the row checkbox
    - expect: Bulk actions bar appears
  3. Click 'Delete' in the bulk actions bar and confirm the deletion in the confirmation dialog
    - expect: A success notification appears
    - expect: The deal 'TC-050 Bulk Delete Deal' is removed from the table

#### 7.4. should bulk assign a deal to a user

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-051 Bulk Assign Deal' and navigate to the Deals list
    - expect: The deal is visible in the table
  2. Select the row for 'TC-051 Bulk Assign Deal' using the row checkbox
    - expect: Bulk actions bar appears
  3. Click 'Assign' in the bulk actions bar, select 'Ihor Hanets', and confirm
    - expect: The deal remains assigned to 'Ihor Hanets'
    - expect: The Deal owner column shows 'Ihor Hanets (igorhanets@gmail.com)'

#### 7.5. should bulk edit a property across selected deals

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Create a deal named 'TC-052 Bulk Edit Deal' and navigate to the Deals list
    - expect: The deal is visible in the table
  2. Select the row and click 'Edit' in the bulk actions bar
    - expect: A bulk edit dialog opens allowing selection of a property to update
  3. Select the 'Priority' property, set value to 'High', and confirm the edit
    - expect: The bulk edit applies the change
    - expect: The deal 'TC-052 Bulk Edit Deal' now has Priority set to 'High'

#### 7.6. should display all options in the 'More' bulk actions dropdown

**File:** `tests/deals/bulk-actions.spec.ts`

**Steps:**
  1. Create a deal, navigate to the Deals list, select the row checkbox, then click 'More' in the bulk actions bar
    - expect: A dropdown appears with the following options: 'Review Associations', 'Add to static segment', 'Create tasks', 'Enroll in workflow', 'Add to Power Dialer' (shown as disabled)

### 8. Deal Record Associations

**Seed:** `tests/seed.spec.ts`

#### 8.1. should display Contacts, Companies, Tickets, and Attachments sections in the right sidebar

**File:** `tests/deals/deal-associations.spec.ts`

**Steps:**
  1. Create a deal named 'TC-055 Sidebar Sections Deal' and navigate to its detail page
    - expect: The right sidebar is visible
  2. Inspect the right sidebar sections
    - expect: The right sidebar contains: 'Contacts (0)' with an Add button, 'Companies (0)' with an Add button, 'Tickets (0)' with an Add button, 'Attachments' with an Add button

#### 8.2. should upload an attachment to a deal

**File:** `tests/deals/deal-associations.spec.ts`

**Steps:**
  1. Create a deal named 'TC-056 Attachment Deal' and navigate to its detail page. In the right sidebar, click the 'Add' button under Attachments.
    - expect: A file upload dialog or dropzone appears
  2. Upload a small test file (e.g., a plain text file)
    - expect: The file appears listed in the Attachments section with its file name visible

### 9. Validation and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 9.1. should reject non-numeric input in the Amount field during deal creation

**File:** `tests/deals/validation.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', enter 'TC-057 Amount Validation' as the deal name, then click the Amount field and type 'abc'
    - expect: Non-numeric characters are either prevented from being entered, or a validation error message is displayed
    - expect: The Create button does not submit with an invalid amount

#### 9.2. should accept a valid MM/DD/YYYY close date during deal creation

**File:** `tests/deals/validation.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal', enter 'TC-058 Date Format Test', clear the Close date field and type '06/15/2026', then click Create
    - expect: The deal is created successfully with close date '06/15/2026'
  2. Navigate to the deal's detail page
    - expect: The Close Date field shows '06/15/2026' or a localised equivalent

#### 9.3. should handle a very long deal name without crashing

**File:** `tests/deals/validation.spec.ts`

**Steps:**
  1. Click 'Create new' → 'Deal' and enter a string of 200+ characters into the Deal name field
    - expect: The system either accepts the input or displays a clear validation message stating the maximum allowed length
    - expect: The UI does not crash or behave unexpectedly

#### 9.4. should increment the 'All deals' count after creating a deal

**File:** `tests/deals/validation.spec.ts`

**Steps:**
  1. Navigate to the Deals list and note the current count shown on the 'All deals' tab (e.g., '1')
    - expect: Current count is recorded
  2. Create a deal named 'TC-060 Count Increment Deal' and wait for the success notification
    - expect: Success toast appears
  3. Observe the 'All deals' tab count
    - expect: The count has incremented by 1 compared to the previously noted count
