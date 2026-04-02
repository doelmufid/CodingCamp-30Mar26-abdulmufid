// js/app.js - Expense & Budget Visualizer

const STORAGE_KEY = 'expense_transactions';
const CATEGORIES_KEY = 'expense_categories';

const CATEGORY_COLORS = {
  Food:      '#FF6384',
  Transport: '#36A2EB',
  Fun:       '#FFCE56',
};

let chart = null;
let transactions = [];
let categories = [];
let currentSortKey = 'date-added';

function readTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
    return JSON.parse(raw);
  } catch (err) {
    console.warn('expense-budget-visualizer: could not read transactions from localStorage.', err);
    return [];
  }
}

function saveTransactions(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (err) {
    console.warn('expense-budget-visualizer: could not save transactions to localStorage.', err);
  }
}

function readCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY) ?? '[]';
    return JSON.parse(raw);
  } catch (err) {
    console.warn('expense-budget-visualizer: could not read categories from localStorage.', err);
    return [];
  }
}

function saveCategories(cats) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  } catch (err) {
    console.warn('expense-budget-visualizer: could not save categories to localStorage.', err);
  }
}

function getCategoryColor(category) {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const custom = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
  return custom ? custom.color : '#cccccc';
}

function validateForm(name, amount, category) {
  if (!name || name.trim() === '') return 'Item name is required.';
  if (!category || category.trim() === '') return 'Category is required.';
  const parsedAmount = parseFloat(amount);
  if (!amount || amount.trim() === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
    return 'Amount must be a positive number.';
  }
  return null;
}

function addTransaction(name, amount, category) {
  const formError = document.getElementById('form-error');
  const error = validateForm(name, amount, category);
  if (error) {
    formError.textContent = error;
    formError.classList.add('visible');
    return;
  }
  formError.textContent = '';
  formError.classList.remove('visible');
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString();
  transactions.push({
    id,
    name: name.trim(),
    amount: parseFloat(amount),
    category,
    date: new Date().toISOString().slice(0, 10),
  });
  saveTransactions(transactions);
  renderAll(transactions);
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions(transactions);
  renderAll(transactions);
}

function addCategory(name, color) {
  const categoryError = document.getElementById('category-error');
  const trimmedName = name.trim();
  if (!trimmedName) {
    categoryError.textContent = 'Category name cannot be empty.';
    return;
  }
  const lowerName = trimmedName.toLowerCase();
  const existsInBuiltIns = Object.keys(CATEGORY_COLORS).some(k => k.toLowerCase() === lowerName);
  const existsInCustom = categories.some(c => c.name.toLowerCase() === lowerName);
  if (existsInBuiltIns || existsInCustom) {
    categoryError.textContent = 'Category already exists.';
    return;
  }
  categoryError.textContent = '';
  categories.push({ name: trimmedName, color });
  saveCategories(categories);
  const select = document.getElementById('category');
  const option = document.createElement('option');
  option.value = trimmedName;
  option.textContent = trimmedName;
  select.appendChild(option);
  renderCategories();
}

function removeCategory(name) {
  const categoryError = document.getElementById('category-error');
  const inUse = transactions.some(t => t.category === name);
  if (inUse) {
    categoryError.textContent = 'Cannot remove a category that has transactions.';
    return;
  }
  categories = categories.filter(c => c.name !== name);
  saveCategories(categories);
  const select = document.getElementById('category');
  const escaped = CSS.escape(name);
  const option = select ? select.querySelector('option[value="' + escaped + '"]') : null;
  if (option) option.remove();
  categoryError.textContent = '';
  renderCategories();
}

function getSortedTransactions(txns, sortKey) {
  const copy = [...txns];
  switch (sortKey) {
    case 'amount-asc':  return copy.sort((a, b) => a.amount - b.amount);
    case 'amount-desc': return copy.sort((a, b) => b.amount - a.amount);
    case 'category-az': return copy.sort((a, b) => a.category.localeCompare(b.category));
    case 'category-za': return copy.sort((a, b) => b.category.localeCompare(a.category));
    default:            return copy;
  }
}

function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function renderList(txns) {
  const ul = document.getElementById('transaction-list');
  ul.innerHTML = '';
  txns.forEach(({ id, name, amount, category }) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'transaction-name';
    nameSpan.textContent = name;
    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    amountSpan.textContent = '$' + amount.toFixed(2);
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = category;
    badge.style.backgroundColor = getCategoryColor(category);
    // ensure text contrast for light colors
    badge.style.color = isLightColor(getCategoryColor(category)) ? '#333' : '#fff';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = id;
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTransaction(id));
    li.append(nameSpan, amountSpan, badge, deleteBtn);
    ul.appendChild(li);
  });
}

function renderBalance(txns) {
  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById('balance-amount').textContent = total.toFixed(2);
}

function renderChart(txns) {
  const totals = {};
  for (const t of txns) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  const labels = [];
  const data = [];
  const backgroundColor = [];
  for (const [category, total] of Object.entries(totals)) {
    if (total > 0) {
      labels.push(category);
      data.push(total);
      backgroundColor.push(getCategoryColor(category));
    }
  }
  const chartData = { labels, datasets: [{ data, backgroundColor }] };
  if (!chart) {
    try {
      const ctx = document.getElementById('spending-chart').getContext('2d');
      chart = new Chart(ctx, { type: 'pie', data: chartData });
    } catch (err) {
      console.warn('expense-budget-visualizer: could not render chart.', err);
    }
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColor;
    chart.update();
  }
}

function renderSummary(txns) {
  const list = document.getElementById('summary-list');
  if (!list) return;
  list.innerHTML = '';
  if (!txns || txns.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No transactions yet.';
    list.appendChild(li);
    return;
  }
  const totals = {};
  for (const t of txns) {
    const month = t.date ? t.date.slice(0, 7) : 'unknown';
    totals[month] = (totals[month] || 0) + t.amount;
  }
  const sorted = Object.keys(totals).sort((a, b) => b.localeCompare(a));
  for (const month of sorted) {
    const li = document.createElement('li');
    const monthSpan = document.createElement('span');
    monthSpan.className = 'summary-month';
    monthSpan.textContent = month;
    const totalSpan = document.createElement('span');
    totalSpan.className = 'summary-total';
    totalSpan.textContent = '$' + totals[month].toFixed(2);
    li.append(monthSpan, totalSpan);
    list.appendChild(li);
  }
}

function renderCategories() {
  const ul = document.getElementById('category-list');
  if (!ul) return;
  ul.innerHTML = '';
  categories.forEach(({ name, color }) => {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'category-swatch';
    swatch.style.backgroundColor = color;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.textContent = name;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.dataset.name = name;
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeCategory(name));
    li.append(swatch, nameSpan, removeBtn);
    ul.appendChild(li);
  });
}

function renderAll(txns) {
  renderList(getSortedTransactions(txns, currentSortKey));
  renderBalance(txns);
  renderChart(txns);
  renderSummary(txns);
  renderCategories();
}

document.addEventListener('DOMContentLoaded', () => {
  transactions = readTransactions();
  categories = readCategories();

  const today = new Date().toISOString().slice(0, 10);
  let migrated = false;
  for (const t of transactions) {
    if (t.date == null) {
      t.date = today;
      migrated = true;
    }
  }
  if (migrated) saveTransactions(transactions);

  const categorySelect = document.getElementById('category');
  categories.forEach(({ name }) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    categorySelect.appendChild(option);
  });

  renderAll(transactions);

  const sortControl = document.getElementById('sort-control');
  if (sortControl) {
    sortControl.value = currentSortKey;
    sortControl.addEventListener('change', () => {
      currentSortKey = sortControl.value;
      renderList(getSortedTransactions(transactions, currentSortKey));
    });
  }

  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('category-name');
      const colorInput = document.getElementById('category-color');
      addCategory(nameInput.value, colorInput.value);
      nameInput.value = '';
      colorInput.value = '#888888';
    });
  }

  const form = document.getElementById('expense-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    addTransaction(name, amount, category);
    const formError = document.getElementById('form-error');
    if (!formError.textContent) form.reset();
  });
});
