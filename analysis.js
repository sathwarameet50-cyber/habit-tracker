const MOTIVATIONS = [
  "Every habit you build is a vote for the person you want to become.",
  "Small steps every day lead to big changes over time. Keep going!",
  "Consistency beats perfection. Show up every day.",
  "You are what you repeatedly do. Excellence is a habit.",
  "The secret of your future is hidden in your daily routine.",
  "Progress, not perfection. Every check counts!",
  "Your habits shape your identity. Keep building the best version of you.",
];

function loadHabits() {
  const saved = localStorage.getItem('habitflow_habits');
  return saved ? JSON.parse(saved) : [];
}

function init() {
  const habits = loadHabits();

  document.getElementById('analysisDate').textContent =
    new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  if (habits.length === 0) {
    document.querySelector('.analysis-grid').innerHTML =
      '<div class="empty-state" style="grid-column:1/-1"><h2>No habits tracked yet</h2><p>Go to the Tracker page and add some habits first!</p></div>';
    document.getElementById('motivationBox').textContent = MOTIVATIONS[0];
    document.getElementById('aTotal').textContent = '0';
    document.getElementById('aBest').textContent = '—';
    document.getElementById('aRate').textContent = '0%';
    return;
  }

  const totalCells = habits.length * 7;
  const doneCells = habits.reduce((s, h) => s + h.checks.reduce((a, b) => a + b, 0), 0);
  const overallRate = totalCells ? Math.round(doneCells / totalCells * 100) : 0;

  const bestHabit = habits.reduce((best, h) => {
    const score = h.checks.reduce((a, b) => a + b, 0);
    return score > (best.score || 0) ? { name: h.name, score } : best;
  }, {});

  document.getElementById('aTotal').textContent = habits.length;
  document.getElementById('aBest').textContent = bestHabit.name || '—';
  document.getElementById('aRate').textContent = overallRate + '%';

  const motivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
  document.getElementById('motivationBox').textContent = motivation;

  buildBarChart(habits);
  buildLineChart(habits);
  buildDonutChart(habits);
  buildReportTable(habits);
}

function buildBarChart(habits) {
  const ctx = document.getElementById('barChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: habits.map(h => h.name),
      datasets: [{
        label: 'Days completed',
        data: habits.map(h => h.checks.reduce((a, b) => a + b, 0)),
        backgroundColor: habits.map(h => h.color + 'cc'),
        borderColor: habits.map(h => h.color),
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 7,
          ticks: { stepSize: 1, color: '#6b7280', font: { size: 11 } },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: { color: '#6b7280', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function buildLineChart(habits) {
  const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const ctx = document.getElementById('lineChart').getContext('2d');
  const dailyTotals = Array.from({ length: 7 }, (_, d) =>
    habits.reduce((sum, h) => sum + h.checks[d], 0)
  );
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: DAY_LABELS,
      datasets: [{
        label: 'Habits completed',
        data: dailyTotals,
        borderColor: '#7F77DD',
        backgroundColor: 'rgba(127,119,221,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7F77DD',
        pointRadius: 5,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#6b7280', font: { size: 11 } },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: { color: '#6b7280', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function buildDonutChart(habits) {
  const ctx = document.getElementById('donutChart').getContext('2d');
  const data = habits.map(h => h.checks.reduce((a, b) => a + b, 0));
  const allZero = data.every(d => d === 0);
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: habits.map(h => h.name),
      datasets: [{
        data: allZero ? habits.map(() => 1) : data,
        backgroundColor: habits.map(h => h.color + 'cc'),
        borderColor: habits.map(h => h.color),
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, color: '#6b7280', padding: 12, boxWidth: 12 }
        }
      }
    }
  });
}

function buildReportTable(habits) {
  const container = document.getElementById('reportTable');
  const rows = habits.map(h => {
    const done = h.checks.reduce((a, b) => a + b, 0);
    const rate = Math.round(done / 7 * 100);
    return { name: h.name, color: h.color, done, rate };
  }).sort((a, b) => b.rate - a.rate);

  const table = document.createElement('table');
  table.className = 'report-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Habit</th>
        <th>Days</th>
        <th>Rate</th>
        <th>Progress</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span style="display:inline-block;width:9px;height:9px;border-radius:50%;
          background:${r.color};margin-right:7px;vertical-align:middle;"></span>
        ${r.name}
      </td>
      <td>${r.done} / 7</td>
      <td style="font-weight:600;color:${r.rate >= 70 ? '#1D9E75' : r.rate >= 40 ? '#BA7517' : '#D85A30'}">${r.rate}%</td>
      <td>
        <div class="rate-bar-wrap">
          <div class="rate-bar" style="width:${r.rate}%;background:${r.color}"></div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

init();