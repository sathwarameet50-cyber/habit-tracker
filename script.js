const COLORS = ['#7F77DD','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517','#639922','#888780'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

let habits = [
  { id:1, name:'Exercise',    color:'#1D9E75', checks:[0,0,0,0,0,0,0] },
  { id:2, name:'Read',        color:'#7F77DD', checks:[0,0,0,0,0,0,0] },
  { id:3, name:'Meditate',    color:'#378ADD', checks:[0,0,0,0,0,0,0] },
  { id:4, name:'Drink water', color:'#D85A30', checks:[0,0,0,0,0,0,0] },
];

let nextId = 5;
let pickedColor = COLORS[0];

const now = new Date();
const rawDay = now.getDay();
const todayCol = rawDay === 0 ? 6 : rawDay - 1;

function getGreeting() {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function setup() {
  document.getElementById('greeting').textContent = getGreeting();
  document.getElementById('dateLabel').textContent = now.toLocaleDateString('en-IN', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  DAY_LABELS.forEach((label, i) => {
    const el = document.getElementById('dh' + i);
    el.textContent = label;
    if (i === todayCol) el.classList.add('today');
  });
  buildColorPicker();
}

function buildColorPicker() {
  const cp = document.getElementById('colorPicker');
  cp.innerHTML = '';
  COLORS.forEach(color => {
    const dot = document.createElement('div');
    dot.className = 'cpick' + (color === pickedColor ? ' selected' : '');
    dot.style.background = color;
    dot.onclick = () => { pickedColor = color; buildColorPicker(); };
    cp.appendChild(dot);
  });
}

function render() {
  const container = document.getElementById('habitRows');
  container.innerHTML = '';

  if (habits.length === 0) {
    container.innerHTML = '<div class="empty-state"><h2>No habits yet</h2><p>Add your first habit below to get started!</p></div>';
    updateStats();
    return;
  }

  habits.forEach(habit => {
    const row = document.createElement('div');
    row.className = 'habit-row';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'habit-name';

    const dot = document.createElement('div');
    dot.className = 'habit-dot';
    dot.style.background = habit.color;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = habit.name;
    nameSpan.title = habit.name;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '×';
    delBtn.title = 'Delete habit';
    delBtn.onclick = () => {
      if (confirm('Delete "' + habit.name + '"?')) {
        habits = habits.filter(h => h.id !== habit.id);
        saveToStorage();
        render();
      }
    };

    nameDiv.appendChild(dot);
    nameDiv.appendChild(nameSpan);
    nameDiv.appendChild(delBtn);
    row.appendChild(nameDiv);

    for (let d = 0; d < 7; d++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (d === todayCol ? ' today-col' : '');

      const box = document.createElement('div');
      box.className = 'check-box' + (habit.checks[d] ? ' done' : '');
      if (habit.checks[d]) box.style.background = habit.color;

      box.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

      const hid = habit.id;
      const di = d;
      box.onclick = () => {
        habits.find(x => x.id === hid).checks[di] ^= 1;
        saveToStorage();
        render();
      };

      cell.appendChild(box);
      row.appendChild(cell);
    }

    const total = habit.checks.reduce((a, b) => a + b, 0);
    const countDiv = document.createElement('div');
    countDiv.className = 'row-count';
    countDiv.textContent = total + '/7';
    row.appendChild(countDiv);

    container.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  const todayDone = habits.filter(h => h.checks[todayCol]).length;
  document.getElementById('statToday').textContent = todayDone + ' / ' + habits.length;

  const totalCells = habits.length * 7;
  const doneCells = habits.reduce((s, h) => s + h.checks.reduce((a, b) => a + b, 0), 0);
  const pct = totalCells ? Math.round(doneCells / totalCells * 100) : 0;
  document.getElementById('statWeek').textContent = pct + '%';
  document.getElementById('progressBar').style.width = pct + '%';

  let streak = 0;
  for (let d = todayCol; d >= 0; d--) {
    const allDone = habits.length > 0 && habits.every(h => h.checks[d] === 1);
    if (allDone) streak++;
    else break;
  }
  document.getElementById('statStreak').textContent = streak + (streak === 1 ? ' day' : ' days');
}

function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  habits.push({ id: nextId++, name, color: pickedColor, checks: [0,0,0,0,0,0,0] });
  input.value = '';
  saveToStorage();
  render();
}

function saveToStorage() {
  localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  localStorage.setItem('habitflow_nextId', nextId);
}

function loadFromStorage() {
  const saved = localStorage.getItem('habitflow_habits');
  const savedId = localStorage.getItem('habitflow_nextId');
  if (saved) habits = JSON.parse(saved);
  if (savedId) nextId = parseInt(savedId);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('habitInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addHabit();
  });
});

loadFromStorage();
setup();
render();