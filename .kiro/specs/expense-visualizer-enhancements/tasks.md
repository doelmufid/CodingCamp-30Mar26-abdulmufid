# Implementation Plan: Expense Visualizer Enhancements

## Overview

Extend `js/app.js`, `index.html`, and `css/styles.css` incrementally. Each task builds on the previous one; the final task wires everything together in `DOMContentLoaded`.

## Tasks

- [x] 1. Storage layer — add `readCategories` and `saveCategories`
  - [x] 1.1 Add `CATEGORIES_KEY = 'expense_categories'` constant and in-memory `categories` array to `js/app.js`
    - Mirror the pattern of `STORAGE_KEY` / `transactions`
    - _Requirements: 1.3, 1.4, 4.2_
  - [x] 1.2 Implement `readCategories()` — reads and JSON-parses `expense_categories` from localStorage, returns `[]` on error with `console.warn`
    - _Requirements: 1.4, 4.2_
  - [x] 1.3 Implement `saveCategories(categories)` — JSON-serialises and writes to `expense_categories`, logs `console.warn` on quota/unavailability
    - _Requirements: 1.3_

- [x] 2. Data migration — assign today's date to dateless transactions
  - [x] 2.1 Add `date` field capture to `addTransaction` — set `date: new Date().toISOString().slice(0, 10)` on the new transaction object
    - _Requirements: 2.7_
  - [x] 2.2 Implement migration in `DOMContentLoaded`: after `readTransactions()`, iterate and assign today's date to any transaction where `date` is `undefined` or `null`, then re-save
    - _Requirements: 2.8, 4.2_
  - [ ]* 2.3 Write unit test for migration edge case
    - Verify that a transaction array with no `date` fields has today's date on all entries after migration runs
    - _Requirements: 2.8_

- [x] 3. Implement `getCategoryColor` helper
  - [x] 3.1 Implement `getCategoryColor(category)` in `js/app.js`
    - Check `CATEGORY_COLORS[category]` first; then search `categories` array case-insensitively; return `'#cccccc'` as fallback
    - _Requirements: 1.10, 4.4_
  - [ ]* 3.2 Write property test for `getCategoryColor` — Property 6
    - **Property 6: Custom category colour persisted and resolved**
    - **Validates: Requirements 1.10, 4.4**
    - Generate `{name, color}` pairs; add category; assert `getCategoryColor(name) === color`

- [x] 4. Update `renderChart` to use `getCategoryColor`
  - [x] 4.1 Refactor `renderChart` in `js/app.js` to aggregate totals across all categories (built-ins + custom), using `getCategoryColor(category)` instead of `CATEGORY_COLORS[category]` directly
    - Collect all distinct category names from `transactions` rather than only iterating `CATEGORY_COLORS` keys
    - _Requirements: 1.10, 4.1, 4.4_
  - [ ]* 4.2 Write unit test for chart colour integration
    - Add a transaction with a custom category; assert the chart dataset contains the correct colour for that slice
    - _Requirements: 1.10, 4.4_

- [x] 5. Category Manager — controller functions
  - [x] 5.1 Implement `addCategory(name, color)` in `js/app.js`
    - Validate: non-empty name, case-insensitive uniqueness against both `CATEGORY_COLORS` and `categories`
    - On error: set `#category-error` text and return early
    - On success: push to `categories`, call `saveCategories`, update `<select id="category">` with new `<option>`, call `renderCategories()`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_
  - [ ]* 5.2 Write property test for `addCategory` round-trip — Property 1
    - **Property 1: addCategory round-trip**
    - **Validates: Requirements 1.2, 1.3, 1.4**
    - Generate random `{name, color}` pairs; call `addCategory`; assert storage and `<select>` contain the entry
  - [ ]* 5.3 Write property test for duplicate category rejection — Property 2
    - **Property 2: Duplicate category rejection**
    - **Validates: Requirements 1.6**
    - Generate a category; add it; generate case variants of the name; assert second add is rejected and list is unchanged
  - [x] 5.4 Implement `removeCategory(name)` in `js/app.js`
    - Guard: if any transaction uses this category, show error in `#category-error` and return
    - On success: filter `categories`, call `saveCategories`, remove matching `<option>` from `<select id="category">`, call `renderCategories()`
    - _Requirements: 1.7, 1.8, 1.9_
  - [ ]* 5.5 Write property test for `removeCategory` round-trip — Property 4
    - **Property 4: removeCategory round-trip**
    - **Validates: Requirements 1.8**
    - Generate a category with no transactions; add then remove; assert absent from storage and `<select>`
  - [ ]* 5.6 Write property test for remove blocked when transactions exist — Property 5
    - **Property 5: Remove blocked when transactions exist**
    - **Validates: Requirements 1.9**
    - Generate a category + at least one transaction using it; attempt remove; assert list unchanged

- [x] 6. Category Manager — `renderCategories` and HTML/CSS
  - [x] 6.1 Implement `renderCategories()` in `js/app.js`
    - Clear and repopulate `#category-list`; each `<li>` contains a colour swatch `<span>`, the category name, and a `<button data-name="...">Remove</button>`
    - Attach click handler on each remove button to call `removeCategory(name)`
    - _Requirements: 1.7, 1.8_
  - [ ]* 6.2 Write property test for category list rendering — Property 3
    - **Property 3: Category list renders with remove controls**
    - **Validates: Requirements 1.7**
    - Generate arrays of `CustomCategory`; call `renderCategories`; assert one `<li>` + remove button per entry with correct `data-name`
  - [x] 6.3 Add Category Manager HTML to `index.html` inside `<main>`
    - Insert `<section id="category-section">` with `#category-name`, `#category-color`, `#add-category-btn`, `#category-error`, and `#category-list`
    - _Requirements: 1.1, 1.5, 1.6, 1.9_
  - [x] 6.4 Add Category Manager CSS to `css/styles.css`
    - Style `#category-form` (flex row, gap), colour swatch inline element, `#category-error` (hidden by default, shown via `.visible`), `#category-list` items with swatch + name + remove button
    - _Requirements: 1.7_

- [x] 7. Monthly Summary — `renderSummary` and HTML/CSS
  - [x] 7.1 Implement `renderSummary(transactions)` in `js/app.js`
    - Group transactions by `date.slice(0, 7)` (YYYY-MM), sum amounts per group, sort groups descending, render into `#summary-list`; show placeholder text when empty
    - _Requirements: 2.1, 2.4, 2.5, 2.7_
  - [ ]* 7.2 Write property test for `renderSummary` grouping and order — Property 7
    - **Property 7: renderSummary groups by month with correct totals in descending order**
    - **Validates: Requirements 2.1, 2.5, 2.7**
    - Generate arrays of transactions with random dates; call `renderSummary`; assert one entry per distinct YYYY-MM, correct totals, descending order
  - [ ]* 7.3 Write unit test for empty state
    - `renderSummary([])` should render placeholder text in `#summary-list`
    - _Requirements: 2.4_
  - [x] 7.4 Add Monthly Summary HTML to `index.html` inside `<main>`
    - Insert `<section id="summary-section">` with `<ul id="summary-list">`
    - _Requirements: 2.1_
  - [x] 7.5 Add Monthly Summary CSS to `css/styles.css`
    - Style `#summary-list` items to display YYYY-MM label and formatted total side-by-side
    - _Requirements: 2.1_

- [x] 8. Sort Control — `getSortedTransactions`, HTML/CSS, and `renderAll` update
  - [x] 8.1 Implement `getSortedTransactions(transactions, sortKey)` in `js/app.js`
    - Return `[...transactions]` (shallow copy) sorted per `sortKey`; never mutate the input array
    - Support: `'date-added'` (original order), `'amount-asc'`, `'amount-desc'`, `'category-az'`, `'category-za'`
    - _Requirements: 3.1, 3.5, 3.7_
  - [ ]* 8.2 Write property test for `getSortedTransactions` ordering — Property 8
    - **Property 8: getSortedTransactions returns correctly ordered array**
    - **Validates: Requirements 3.2, 3.5**
    - Generate transaction arrays; for each sort key assert the returned array is correctly ordered
  - [ ]* 8.3 Write property test for no mutation — Property 9
    - **Property 9: getSortedTransactions does not mutate the source array**
    - **Validates: Requirements 3.7**
    - Generate transaction arrays + sort key; assert source array is identical before and after call
  - [x] 8.4 Add `currentSortKey` module-level variable (default `'date-added'`) and update `renderAll` to call `renderList(getSortedTransactions(transactions, currentSortKey))` instead of `renderList(transactions)`, and also call `renderSummary` and `renderCategories`
    - _Requirements: 3.3, 3.4, 3.6, 2.2, 2.3_
  - [x] 8.5 Add Sort Control HTML to `index.html` inside `#list-section`, above `#transaction-list`
    - Insert `<label for="sort-control">Sort by</label>` and `<select id="sort-control">` with the five options
    - _Requirements: 3.1, 3.5, 3.6_
  - [x] 8.6 Add Sort Control CSS to `css/styles.css`
    - Style the sort label + select row (flex, gap, margin-bottom)
    - _Requirements: 3.1_

- [x] 9. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire everything together in `DOMContentLoaded`
  - [x] 10.1 Update `DOMContentLoaded` handler in `js/app.js`
    - Call `readCategories()` and assign to `categories`
    - Run date migration on loaded transactions and re-save if any were updated
    - Call `renderAll(transactions)` (which now includes `renderSummary` and `renderCategories`)
    - Populate `<select id="category">` with custom categories loaded from storage
    - Attach `change` listener on `#sort-control` to update `currentSortKey` and call `renderList(getSortedTransactions(transactions, currentSortKey))`
    - Attach `click` listener on `#add-category-btn` to call `addCategory(#category-name.value, #category-color.value)`
    - _Requirements: 1.4, 2.8, 3.6, 4.2_
  - [ ]* 10.2 Write property test for built-in categories cannot be removed — Property 10
    - **Property 10: Built-in categories cannot be removed**
    - **Validates: Requirements 4.1**
    - For each built-in name call `removeCategory`; assert categories list unchanged
  - [ ]* 10.3 Write property test for balance correctness — Property 11
    - **Property 11: renderBalance equals sum of all amounts**
    - **Validates: Requirements 4.5**
    - Generate transaction arrays with mixed categories; assert rendered balance equals `sum(amounts)` formatted to two decimal places
  - [ ]* 10.4 Write unit test for sort default on load
    - Assert `#sort-control` value is `'date-added'` after `DOMContentLoaded`
    - _Requirements: 3.6_

- [x] 11. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations each
- Each property test must include a comment: `// Feature: expense-visualizer-enhancements, Property N: <property text>`
- Unit tests complement property tests by covering specific examples and edge cases
