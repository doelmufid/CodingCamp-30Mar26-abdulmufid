# Requirements Document

## Introduction

This document covers three enhancements to the existing Expense & Budget Visualizer web app. The app is a single-page, client-side application (HTML/CSS/Vanilla JS, no build step, no backend) that already supports logging transactions with hardcoded categories (Food, Transport, Fun), a scrollable transaction list with delete controls, a running balance display, a Chart.js pie chart, and localStorage persistence.

The three new features are:
1. **Custom Categories** — users can define their own spending categories beyond the three hardcoded ones.
2. **Monthly Summary View** — users can see spending grouped and summarised by calendar month.
3. **Sort Transactions** — users can sort the transaction list by amount or by category.

All enhancements must extend the existing app without breaking any existing functionality.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, amount, and category.
- **Category**: A spending label assigned to a transaction. May be one of the built-in defaults (Food, Transport, Fun) or a user-defined custom category.
- **Custom_Category**: A user-defined category name created at runtime and persisted in Storage.
- **Category_Manager**: The UI component and associated logic responsible for adding and removing custom categories.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Balance_Display**: The UI component that shows the total sum of all transaction amounts.
- **Chart**: The pie chart component that visualises spending distribution across categories.
- **Form**: The input form used to create a new transaction.
- **Monthly_Summary**: The UI component that displays total spending grouped by calendar month (YYYY-MM).
- **Sort_Control**: The UI control that allows the user to choose a sort order for the Transaction_List.
- **Storage**: The browser's Local Storage API used to persist transaction and category data.
- **Validator**: The client-side logic that checks form inputs before a transaction is saved.

---

## Requirements

### Requirement 1: Add Custom Categories

**User Story:** As a user, I want to create my own spending categories, so that I can track expenses that do not fit the default Food, Transport, or Fun labels.

#### Acceptance Criteria

1. THE Category_Manager SHALL provide an input field and a submit control that allows the user to enter a new category name.
2. WHEN the user submits a non-empty, unique category name, THE Category_Manager SHALL add the new Custom_Category to the category list and make it immediately available as an option in the Form's category selector.
3. WHEN a Custom_Category is added, THE Storage SHALL persist the updated category list to Local Storage so that it survives page reloads.
4. WHEN the App loads, THE App SHALL read all Custom_Categories from Storage and restore them to the Form's category selector and the Category_Manager's list.
5. IF the user submits an empty category name, THEN THE Category_Manager SHALL display an inline error message stating that the category name cannot be empty.
6. IF the user submits a category name that already exists (case-insensitive), THEN THE Category_Manager SHALL display an inline error message stating that the category already exists.
7. THE Category_Manager SHALL display all current custom categories with a remove control for each.
8. WHEN the user activates the remove control for a Custom_Category that has no associated transactions, THE Category_Manager SHALL remove that category from Storage and from the Form's category selector.
9. IF the user attempts to remove a Custom_Category that has one or more associated transactions, THEN THE Category_Manager SHALL display an inline error message stating that the category cannot be removed while transactions are assigned to it.
10. WHEN the user creates a Custom_Category, THE Category_Manager SHALL provide a colour picker input so the user can choose a colour for that category; the chosen colour SHALL be persisted alongside the category name and used consistently in the Chart across all renders.

---

### Requirement 2: Monthly Summary View

**User Story:** As a user, I want to see my spending grouped by month, so that I can understand how my expenses change over time.

#### Acceptance Criteria

1. THE Monthly_Summary SHALL display a list of calendar months (formatted as YYYY-MM) for which at least one transaction exists, along with the total spending amount for each month.
2. WHEN a transaction is added, THE Monthly_Summary SHALL update automatically to reflect the new monthly totals without requiring a page reload.
3. WHEN a transaction is deleted, THE Monthly_Summary SHALL update automatically to reflect the updated monthly totals.
4. WHEN Storage contains no transactions, THE Monthly_Summary SHALL display an empty or placeholder state indicating no data is available.
5. THE Monthly_Summary SHALL list months in descending chronological order (most recent month first).
6. WHEN the App loads, THE Monthly_Summary SHALL render the correct monthly totals based on all transactions currently in Storage.
7. THE Monthly_Summary SHALL derive the month of each transaction from the transaction's recorded date (YYYY-MM-DD), which SHALL be captured at the time the transaction is added.
8. WHEN the App loads and encounters an existing transaction that has no recorded date, THE App SHALL assign today's date (YYYY-MM-DD) to that transaction as a migration fallback before rendering.

---

### Requirement 3: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or by category, so that I can quickly find and compare entries.

#### Acceptance Criteria

1. THE Sort_Control SHALL provide options to sort the Transaction_List by amount (ascending and descending) and by category (A–Z and Z–A).
2. WHEN the user selects a sort option, THE Transaction_List SHALL re-render immediately in the chosen order without requiring a page reload.
3. WHEN a new transaction is added, THE Transaction_List SHALL render the new entry in the currently selected sort order.
4. WHEN a transaction is deleted, THE Transaction_List SHALL re-render the remaining entries in the currently selected sort order.
5. THE Sort_Control SHALL include a default "Date Added" option that preserves the original insertion order of transactions.
6. WHEN the App loads, THE Sort_Control SHALL default to the "Date Added" order.
7. THE Sort_Control SHALL not alter the underlying transaction data in Storage; sorting is a display-only operation.

---

### Requirement 4: Backward Compatibility

**User Story:** As a developer, I want the new features to integrate cleanly with the existing app, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE App SHALL continue to support the three built-in categories (Food, Transport, Fun) after the enhancements are applied; these categories SHALL NOT be removable.
2. WHEN the App loads with existing localStorage data that contains no custom categories or sort preference, THE App SHALL initialise all new features with sensible defaults and render the existing transactions correctly.
3. THE App SHALL remain a single HTML file, one CSS file, and one JavaScript file with no build step or backend dependency after the enhancements are applied.
4. THE Chart SHALL continue to update correctly when transactions are added or deleted, including transactions assigned to Custom_Categories.
5. THE Balance_Display SHALL continue to reflect the correct total across all categories, including Custom_Categories.
