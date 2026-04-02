# Requirements Document

## Introduction

A client-side Expense & Budget Visualizer web app built with HTML, CSS, and Vanilla JavaScript. Users can log expense transactions, view a running total balance, browse a scrollable transaction list, and see a live pie chart of spending by category. All data is persisted in the browser's Local Storage — no backend or server required.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, amount, and category.
- **Category**: A predefined spending label assigned to a transaction. Valid values are: Food, Transport, Fun.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Balance_Display**: The UI component at the top of the page that shows the total sum of all transaction amounts.
- **Chart**: The pie chart component that visualises spending distribution across categories.
- **Form**: The input form used to create a new transaction.
- **Storage**: The browser's Local Storage API used to persist transaction data.
- **Validator**: The client-side logic that checks form inputs before a transaction is saved.

---

## Requirements

### Requirement 1: Add a Transaction via the Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category, so that I can log a new expense.

#### Acceptance Criteria

1. THE Form SHALL contain an item name text field, a numeric amount field, and a category selector with the options Food, Transport, and Fun.
2. WHEN the user submits the Form with all fields filled and a valid positive amount, THE App SHALL add the transaction to Storage and display it in the Transaction_List.
3. WHEN the user submits the Form with all fields filled and a valid positive amount, THE Form SHALL reset all fields to their default empty/unselected state.
4. IF the user submits the Form with one or more empty fields, THEN THE Validator SHALL display an inline error message indicating which fields are required.
5. IF the user submits the Form with an amount that is not a positive number, THEN THE Validator SHALL display an inline error message stating that the amount must be a positive number.

---

### Requirement 2: Display the Transaction List

**User Story:** As a user, I want to see all my logged expenses in a scrollable list, so that I can review what I have spent.

#### Acceptance Criteria

1. THE Transaction_List SHALL display every stored transaction showing the item name, amount, and category.
2. WHEN a new transaction is added, THE Transaction_List SHALL update to include the new entry without requiring a page reload.
3. THE Transaction_List SHALL be scrollable when the number of entries exceeds the visible area.
4. WHEN the App loads, THE Transaction_List SHALL render all transactions previously saved in Storage.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete an individual transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction entry.
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Storage and from the Transaction_List.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total.
4. WHEN a transaction is deleted, THE Chart SHALL update to reflect the new category distribution.

---

### Requirement 4: Display the Total Balance

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much I have spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts currently in Storage.
2. WHEN a transaction is added, THE Balance_Display SHALL update automatically to reflect the new total.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update automatically to reflect the new total.
4. WHEN Storage contains no transactions, THE Balance_Display SHALL show a total of 0.

---

### Requirement 5: Visualise Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending broken down by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart showing the proportion of total spending for each category that has at least one transaction.
2. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new category distribution.
3. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the new category distribution.
4. WHEN Storage contains no transactions, THE Chart SHALL display an empty or placeholder state.
5. THE Chart SHALL assign a distinct, consistent colour to each category (Food, Transport, Fun).

---

### Requirement 6: Persist Data Across Sessions

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a transaction is added, THE Storage SHALL save the updated transaction list to Local Storage.
2. WHEN a transaction is deleted, THE Storage SHALL save the updated transaction list to Local Storage.
3. WHEN the App loads, THE App SHALL read all transactions from Local Storage and restore the Transaction_List, Balance_Display, and Chart to the state they were in at the end of the previous session.
4. IF Local Storage is unavailable or returns a parse error, THEN THE App SHALL initialise with an empty transaction list and display a non-blocking warning to the user.

---

### Requirement 7: Technology and Compatibility Constraints

**User Story:** As a developer, I want the app to run without a build step or backend, so that it can be opened directly in a browser or packaged as a browser extension.

#### Acceptance Criteria

1. THE App SHALL be implemented using HTML, CSS, and Vanilla JavaScript only, with no frontend framework dependencies beyond a charting library (e.g. Chart.js via CDN).
2. THE App SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.
3. THE App SHALL consist of a single HTML file, one CSS file inside a `css/` directory, and one JavaScript file inside a `js/` directory.
4. THE App SHALL load and become interactive in under 2 seconds on a standard broadband connection.
