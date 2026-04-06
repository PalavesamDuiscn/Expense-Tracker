const CAT_COLORS = {
  Food:          '#f76a8a',
  Transport:     '#7c6af7',
  Shopping:      '#f7c26a',
  Entertainment: '#6af7e4',
  Health:        '#3dffa0',
  Utilities:     '#f76af0',
  Other:         '#a0a0c0'
};

// Load expenses from localStorage (or start with empty array)
let expenses = JSON.parse(localStorage.getItem('expenses_v1') || '[]');

function save() {
  localStorage.setItem('expenses_v1', JSON.stringify(expenses));
}

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function addExpense() {
  const desc     = document.getElementById('desc').value.trim();
  const amount   = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date     = document.getElementById('date').value;

  if (!desc || isNaN(amount) || amount <= 0 || !date) {
    alert('Please fill in all fields correctly.');
    return;
  }

  expenses.unshift({ id: Date.now(), desc, amount, category, date });
  save();
  render();

  // Clear inputs after adding
  document.getElementById('desc').value   = '';
  document.getElementById('amount').value = '';
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

function clearAll() {
  if (expenses.length === 0) return;
  if (confirm('Clear all expenses?')) {
    expenses = [];
    save();
    render();
  }
}

function render() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // This month's total
  const now = new Date();
  const monthTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Update stat cards
  document.getElementById('totalSpent').textContent = fmt(total);
  document.getElementById('monthSpent').textContent  = fmt(monthTotal);

  // Category totals
  const bycat = {};
  expenses.forEach(e => {
    bycat[e.category] = (bycat[e.category] || 0) + e.amount;
  });

  const top = Object.entries(bycat).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('topCat').textContent = top ? top[0] : '—';

  // Bar chart
  const chartEl = document.getElementById('barChart');
  const maxVal  = top ? top[1] : 1;

  chartEl.innerHTML = Object.entries(bycat)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => `
      <div class="bar-row">
        <div class="bar-label">${cat}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(val / maxVal * 100).toFixed(1)}%; background:${CAT_COLORS[cat] || '#7c6af7'}"></div>
        </div>
        <div class="bar-amount">${fmt(val)}</div>
      </div>
    `)
    .join('');

  // Transaction list
  const list = document.getElementById('expenseList');

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="icon">₹</span>
        No expenses yet. Add your first one!
      </div>`;
    return;
  }

  list.innerHTML = expenses.map(e => `
    <div class="expense-item">
      <div class="cat-dot" style="background:${CAT_COLORS[e.category] || '#7c6af7'}"></div>
      <div class="expense-info">
        <div class="expense-desc">${e.desc}</div>
        <div class="expense-meta">
          ${e.category} &nbsp;·&nbsp;
          ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div class="expense-amount">${fmt(e.amount)}</div>
      <button class="del-btn" onclick="deleteExpense(${e.id})">✕</button>
    </div>
  `).join('');
}

// --- Init ---
document.getElementById('date').value = new Date().toISOString().split('T')[0];
document.getElementById('dateChip').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

render();
