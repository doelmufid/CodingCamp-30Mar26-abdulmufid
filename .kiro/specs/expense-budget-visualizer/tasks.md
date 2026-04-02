# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page, client-side expense tracker using HTML, CSS, and Vanilla JavaScript. Implementation proceeds layer by layer: file structure → storage → form/validation → list/balance → chart → wiring.

## Tasks

- [x] 1. Create project file structure and HTML skeleton
  - Create `index.html` with the full page structure: `<header>` with `#balance-display`, `<main>` with `#form-section`, `#chart-section`, and `#list-section`
  - Create `css/styles.css` with base layout styles, scrollable list (`max-height` + `overflow-y: auto`), category badge styles, and hidden error state for `#form-error`
  - Create `js/app.js` as an empty module scaffold with `DOMContentLoaded` listener
  - Add Chart.js CDN `<script>` tag and link `css/styles.css` and `js/app.js` in `index.html`
  - _Requirements: 7.3_

- [x] 2. Implement the Storage layer
  - [x] 2.1 Implement `readTransactions()` and `saveTransactions()` in `js/app.js`
    - `readTransactions` reads from `localStorage` key `"expense_transactions"`, parses JSON, returns array; on parse error or unavailability returns `[]` and logs a non-blocking console warning
    - `saveTransactions` serialises the array and writes to `localStorage`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 2.2 Write property test for storage round-trip consistency
    - **Property 1: Round-trip consistency** — for any array of valid transactions, `readTransactions()` after `saveTransactions(arr)` returns a deep-equal array
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 3. Implement form validation
  - [x] 3.1 Implement `validateForm(name, amount, category)` in `js/app.js`
    - Returns `null` when all fields are non-empty and amount is a positive number
    - Returns an error message string when any field is empty or amount is not a positive number
    - _Requirements: 1.4, 1.5_

  - [ ]* 3.2 Write property test for form validator
    - **Property 2: Valid inputs always pass** — for any non-empty name, positive amount, and valid category, `validateForm` returns `null`
    - **Property 3: Invalid inputs always fail** — for any empty field or non-positive amount, `validateForm` returns a non-null string
    - **Validates: Requirements 1.4, 1.5**

- [ ] 4. Implement the Controller (add and delete)
  - [x] 4.1 Implement `addTransaction(name, amount, category)` in `js/app.js`
    - Generates a unique `id` via `crypto.randomUUID()` with `Date.now().toString()` fallback
    - Pushes new `Transaction` object onto the in-memory `transactions[]` array
    - Calls `saveTransactions()` then `renderAll()`
    - On form submit: calls `validateForm`, shows/hides `#form-error`, resets form on success
    - _Requirements: 1.1, 1.2, 1.3, 6.1_

  - [x] 4.2 Implement `deleteTransaction(id)` in `js/app.js`
    - Filters the matching entry out of `transactions[]`
    - Calls `saveTransactions()` then `renderAll()`
    - _Requirements: 3.1, 3.2, 6.2_

- [ ] 5. Implement render functions
  - [x] 5.1 Implement `renderList(transactions)` in `js/app.js`
    - Clears and rebuilds `<ul id="transaction-list">` — each `<li>` shows item name, formatted amount, category badge, and a `<button data-id="...">` delete control
    - Attaches click listeners on delete buttons that call `deleteTransaction(id)`
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 5.2 Implement `renderBalance(transactions)` in `js/app.js`
    - Sums all `transaction.amount` values and writes the formatted total to `#balance-amount`
    - Shows `$0.00` when the array is empty
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.3 Implement `renderChart(transactions)` in `js/app.js`
    - On first call, instantiates a Chart.js `Pie` on `#spending-chart` using `CATEGORY_COLORS`
    - On subsequent calls, mutates `chart.data` and calls `chart.update()` (no re-instantiation)
    - Only includes categories with total amount > 0; shows empty placeholder when no transactions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 5.4 Implement `renderAll(transactions)` in `js/app.js`
    - Calls `renderList`, `renderBalance`, and `renderChart` in sequence
    - _Requirements: 2.2, 3.3, 3.4, 4.2, 4.3, 5.2, 5.3_

- [x] 6. Checkpoint — wire everything together on page load
  - In the `DOMContentLoaded` listener: call `readTransactions()`, store result in `transactions[]`, then call `renderAll(transactions)`
  - Attach the form `submit` event listener that invokes `addTransaction`
  - Verify the Local Storage unavailability warning path is reachable (e.g. by temporarily stubbing `localStorage`)
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.4, 6.3, 6.4_

- [ ] 7. Final checkpoint — cross-browser and UX polish
  - [x] 7.1 Verify the app opens directly from the filesystem (`file://`) without errors in Chrome, Firefox, Edge, and Safari
    - _Requirements: 7.1, 7.2_

  - [ ]* 7.2 Write integration tests for full add/delete/persist flow
    - Test: add a transaction → list, balance, and chart update
    - Test: delete a transaction → list, balance, and chart update
    - Test: reload simulation (re-call `readTransactions` + `renderAll`) → state restored
    - **Validates: Requirements 1.2, 2.2, 3.2, 3.3, 3.4, 6.3**

- [x] 8. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit/integration tests validate specific examples and edge cases
