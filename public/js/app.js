// ===== CONFIG =====
const API = '/api';
let token           = localStorage.getItem('token');
let currentUser     = JSON.parse(localStorage.getItem('user') || 'null');
let editingTaskId   = null;
let currentFilter   = 'all';
let currentCategory = 'all';
let currentView     = 'list';
let allTasks        = [];
let newSubtasks     = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (token && currentUser) {
        showDashboard();
    } else {
        showAuth();
    }
});

// ===== VIEWS =====
function showView(view) {
    currentView = view;
    ['list', 'kanban', 'stats'].forEach(v => {
        document.getElementById(`view-${v}`).classList.toggle('hidden', v !== view);
    });
    document.querySelectorAll('.nav-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === ['list','kanban','stats'].indexOf(view));
    });

    if (view === 'kanban') renderKanban();
    if (view === 'stats')  loadStats();
}

// ===== AUTH =====
function showAuth() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser?.name || '';
    loadTasks();
}

function showTab(tab) {
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active',
            (i === 0 && tab === 'login') || (i === 1 && tab === 'register')
        );
    });
}

async function login(e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    try {
        const res  = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                email:    document.getElementById('login-email').value,
                password: document.getElementById('login-password').value,
            }),
        });
        const data = await res.json();
        if (!res.ok) { errorEl.textContent = data.message || 'Identifiants incorrects'; return; }
        token       = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        showDashboard();
    } catch { errorEl.textContent = 'Erreur de connexion'; }
}

async function register(e) {
    e.preventDefault();
    const errorEl  = document.getElementById('reg-error');
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;
    errorEl.textContent = '';
    if (password !== confirm) { errorEl.textContent = 'Les mots de passe ne correspondent pas'; return; }
    try {
        const res  = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                password, password_confirmation: confirm,
            }),
        });
        const data = await res.json();
        if (!res.ok) { errorEl.textContent = data.message || 'Erreur inscription'; return; }
        token       = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        showDashboard();
    } catch { errorEl.textContent = 'Erreur de connexion'; }
}

async function logout() {
    try {
        await fetch(`${API}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
    } catch {}
    token = null; currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

// ===== TASKS =====
async function loadTasks() {
    try {
        const res  = await fetch(`${API}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        const data = await res.json();
        allTasks   = data.tasks || [];
        updateStats();
        applyFilters();
        if (currentView === 'kanban') renderKanban();
    } catch { console.error('Erreur chargement'); }
}

function updateStats() {
    document.getElementById('stat-total').textContent = allTasks.length;
    document.getElementById('stat-todo').textContent  = allTasks.filter(t => t.status === 'todo').length;
    document.getElementById('stat-doing').textContent = allTasks.filter(t => t.status === 'doing').length;
    document.getElementById('stat-done').textContent  = allTasks.filter(t => t.status === 'done').length;
}

function applyFilters() {
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    let filtered = [...allTasks];
    if (currentCategory !== 'all') filtered = filtered.filter(t => t.category === currentCategory);
    if (currentFilter   !== 'all') filtered = filtered.filter(t => t.status   === currentFilter);
    if (search) filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
    );
    renderTasks(filtered);
}

function filterByStatus(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function filterByCategory(category, btn) {
    currentCategory = category;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function renderTasks(tasks) {
    const list  = document.getElementById('tasks-list');
    const empty = document.getElementById('empty-state');
    if (tasks.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    list.innerHTML = tasks.map(task => {
        const sub    = task.subtasks || [];
        const done   = sub.filter(s => s.completed).length;
        const pct    = sub.length > 0 ? Math.round((done / sub.length) * 100) : 0;

        const subtasksHtml = sub.length > 0 ? `
            <div class="subtasks-wrapper">
                <div class="subtask-progress" onclick="toggleSubtasks(${task.id})">
                    <span class="subtask-progress-text">
                        <i class="fas fa-list-ul"></i> ${done}/${sub.length}
                    </span>
                    <div class="subtask-progress-bar">
                        <div class="subtask-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="subtask-progress-text">${pct}%</span>
                </div>
                <div class="subtasks-items hidden" id="subtasks-${task.id}">
                    ${sub.map(s => `
                        <div class="subtask-item">
                            <div class="subtask-check ${s.completed ? 'done' : ''}"
                                 onclick="toggleSubtask(${task.id}, ${s.id})">
                                ${s.completed ? '<i class="fas fa-check"></i>' : ''}
                            </div>
                            <span class="subtask-title ${s.completed ? 'done' : ''}">
                                ${escapeHtml(s.title)}
                            </span>
                            <button class="subtask-delete"
                                    onclick="deleteSubtask(${task.id}, ${s.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>` : '';

        return `
        <div class="task-card priority-${task.priority} status-${task.status}">
            <div class="task-main">
                <div class="task-checkbox ${task.status === 'done' ? 'checked' : ''}"
                     onclick="toggleComplete(${task.id}, '${task.status}')">
                    ${task.status === 'done' ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title ${task.status === 'done' ? 'done' : ''}">
                        ${escapeHtml(task.title)}
                    </div>
                    ${task.description
                        ? `<div class="task-description">${escapeHtml(task.description)}</div>`
                        : ''}
                    <div class="task-meta">
                        <span class="badge badge-${task.category}">
                            ${categoryIcon(task.category)} ${categoryLabel(task.category)}
                        </span>
                        <span class="badge badge-${task.status}">${statusLabel(task.status)}</span>
                        <span class="badge badge-${task.priority}">${priorityLabel(task.priority)}</span>
                        ${task.due_date ? `
                            <span class="task-date ${isOverdue(task.due_date, task.status) ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${formatDate(task.due_date)}
                            </span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="openModal(${task.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${subtasksHtml}
        </div>`;
    }).join('');
}

function toggleSubtasks(taskId) {
    const el = document.getElementById(`subtasks-${taskId}`);
    if (el) el.classList.toggle('hidden');
}

// ===== KANBAN =====
function renderKanban() {
    ['todo', 'doing', 'done'].forEach(status => {
        const tasks = allTasks.filter(t => t.status === status);
        document.getElementById(`k-${status}-count`).textContent = tasks.length;
        document.getElementById(`k-${status}`).innerHTML = tasks.map(task => `
            <div class="kanban-card priority-${task.priority}" onclick="openModal(${task.id})">
                <div class="kanban-card-title">${escapeHtml(task.title)}</div>
                <div class="kanban-card-meta">
                    <span class="badge badge-${task.category}">
                        ${categoryIcon(task.category)} ${categoryLabel(task.category)}
                    </span>
                    <span class="badge badge-${task.priority}">${priorityLabel(task.priority)}</span>
                    ${task.due_date ? `
                        <span class="task-date ${isOverdue(task.due_date, task.status) ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i> ${formatDate(task.due_date)}
                        </span>` : ''}
                    ${(task.subtasks||[]).length > 0 ? `
                        <span style="font-size:11px;color:var(--text-muted)">
                            <i class="fas fa-list-ul"></i>
                            ${(task.subtasks||[]).filter(s=>s.completed).length}/${(task.subtasks||[]).length}
                        </span>` : ''}
                </div>
                <div class="kanban-card-actions" onclick="event.stopPropagation()">
                    ${status !== 'todo' ? `
                        <button class="kanban-move"
                                onclick="moveTask(${task.id}, '${prevStatus(status)}')">
                            <i class="fas fa-arrow-left"></i>
                        </button>` : ''}
                    ${status !== 'done' ? `
                        <button class="kanban-move"
                                onclick="moveTask(${task.id}, '${nextStatus(status)}')">
                            <i class="fas fa-arrow-right"></i>
                        </button>` : ''}
                    <button style="color:var(--danger)"
                            onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('') || `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
            <i class="fas fa-inbox"></i><br>Aucune tâche
        </div>`;
    });
}

function prevStatus(s) { return { doing: 'todo', done: 'doing' }[s]; }
function nextStatus(s) { return { todo: 'doing', doing: 'done' }[s]; }

async function moveTask(id, status) {
    try {
        await fetch(`${API}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        await loadTasks();
    } catch { console.error('Erreur move'); }
}

// ===== STATS =====
async function loadStats() {
    try {
        const res  = await fetch(`${API}/stats`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        const data = await res.json();
        renderStats(data);
    } catch { console.error('Erreur stats'); }
}

function renderStats(data) {
    document.getElementById('kpi-rate').textContent    = `${data.rate}%`;
    document.getElementById('kpi-week').textContent    = data.thisWeek;
    document.getElementById('kpi-overdue').textContent = data.overdue;

    // Progress
    document.getElementById('progress-text').textContent =
        `${data.done} / ${data.total} tâches`;
    document.getElementById('progress-fill').style.width = `${data.rate}%`;

    // Par catégorie
    const cats = ['travail', 'etudes', 'personnel', 'autre'];
    const catLabels = { travail:'💼 Travail', etudes:'🎓 Études', personnel:'👤 Personnel', autre:'🏷️ Autre' };
    const catData   = Object.fromEntries((data.byCategory||[]).map(c => [c.category, c.total]));
    const maxCat    = Math.max(...cats.map(c => catData[c]||0), 1);

    document.getElementById('chart-category').innerHTML = `
        <div class="bar-chart">
            ${cats.map(c => `
                <div class="bar-item bar-${c}">
                    <div class="bar-label">
                        <span>${catLabels[c]}</span>
                        <span>${catData[c]||0}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${((catData[c]||0)/maxCat)*100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>`;

    // Par priorité
    const prios = ['high','medium','low'];
    const prioLabels = { high:'🔴 Élevée', medium:'🟡 Moyenne', low:'🟢 Faible' };
    const prioData   = Object.fromEntries((data.byPriority||[]).map(p => [p.priority, p.total]));
    const maxPrio    = Math.max(...prios.map(p => prioData[p]||0), 1);

    document.getElementById('chart-priority').innerHTML = `
        <div class="bar-chart">
            ${prios.map(p => `
                <div class="bar-item bar-${p}">
                    <div class="bar-label">
                        <span>${prioLabels[p]}</span>
                        <span>${prioData[p]||0}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${((prioData[p]||0)/maxPrio)*100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>`;

    // Activité 7 jours
    const days   = [];
    const maxVal = Math.max(...(data.last7days||[]).map(d => d.total), 1);

    for (let i = 6; i >= 0; i--) {
        const d    = new Date();
        d.setDate(d.getDate() - i);
        const key  = d.toISOString().substring(0, 10);
        const found = (data.last7days||[]).find(x => x.date === key);
        days.push({ date: key, total: found ? found.total : 0, label: d.toLocaleDateString('fr-FR', { weekday: 'short' }) });
    }

    document.getElementById('chart-activity').innerHTML = `
        <div class="activity-chart">
            ${days.map(d => `
                <div class="activity-bar">
                    <span class="activity-bar-value">${d.total > 0 ? d.total : ''}</span>
                    <div class="activity-bar-fill"
                         style="height:${Math.max((d.total/maxVal)*100, 4)}%"></div>
                    <span class="activity-bar-label">${d.label}</span>
                </div>
            `).join('')}
        </div>`;
}

// ===== SUBTASKS =====
async function toggleSubtask(taskId, subtaskId) {
    try {
        await fetch(`${API}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        await loadTasks();
    } catch { console.error('Erreur toggle subtask'); }
}

async function deleteSubtask(taskId, subtaskId) {
    try {
        await fetch(`${API}/tasks/${taskId}/subtasks/${subtaskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        await loadTasks();
    } catch { console.error('Erreur delete subtask'); }
}

// ===== MODAL =====
function openModal(id = null) {
    editingTaskId = id;
    newSubtasks   = [];

    document.getElementById('task-title').value       = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-status').value      = 'todo';
    document.getElementById('task-priority').value    = 'medium';
    document.getElementById('task-category').value    = 'autre';
    document.getElementById('task-due-date').value    = '';
    document.getElementById('task-error').textContent = '';
    document.getElementById('subtasks-list').innerHTML = '';
    document.getElementById('new-subtask').value      = '';

    if (id) {
        document.getElementById('modal-title').textContent = 'Modifier la tâche';
        const task = allTasks.find(t => t.id === id);
        if (task) {
            document.getElementById('task-title').value       = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-status').value      = task.status;
            document.getElementById('task-priority').value    = task.priority;
            document.getElementById('task-category').value    = task.category || 'autre';
            document.getElementById('task-due-date').value    = task.due_date
                ? task.due_date.substring(0, 10) : '';
        }
    } else {
        document.getElementById('modal-title').textContent = 'Nouvelle tâche';
    }

    document.getElementById('task-modal').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('task-modal').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    editingTaskId = null;
    newSubtasks   = [];
}

function addSubtaskInput() {
    const input = document.getElementById('new-subtask');
    const val   = input.value.trim();
    if (!val) return;

    newSubtasks.push(val);
    input.value = '';

    const list = document.getElementById('subtasks-list');
    const item = document.createElement('div');
    item.className = 'subtask-input-item';
    item.dataset.title = val;
    item.innerHTML = `
        <i class="fas fa-grip-vertical" style="color:var(--text-muted);font-size:12px"></i>
        <span>${escapeHtml(val)}</span>
        <button type="button" class="subtask-remove" onclick="removeSubtaskInput(this, '${escapeHtml(val)}')">
            <i class="fas fa-times"></i>
        </button>`;
    list.appendChild(item);
    input.focus();
}

function removeSubtaskInput(btn, title) {
    newSubtasks = newSubtasks.filter(s => s !== title);
    btn.closest('.subtask-input-item').remove();
}

// Appuyer Entrée pour ajouter sous-tâche
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement.id === 'new-subtask') {
        e.preventDefault();
        addSubtaskInput();
    }
});

async function saveTask(e) {
    e.preventDefault();
    const errorEl = document.getElementById('task-error');
    errorEl.textContent = '';

    const data = {
        title:       document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status:      document.getElementById('task-status').value,
        priority:    document.getElementById('task-priority').value,
        category:    document.getElementById('task-category').value,
        due_date:    document.getElementById('task-due-date').value || null,
    };

    try {
        const url    = editingTaskId ? `${API}/tasks/${editingTaskId}` : `${API}/tasks`;
        const method = editingTaskId ? 'PUT' : 'POST';

        const res    = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        if (!res.ok) { errorEl.textContent = result.message || 'Erreur'; return; }

        const taskId = result.task.id;

        // Créer les sous-tâches
        for (const title of newSubtasks) {
            await fetch(`${API}/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
        }

        closeModal();
        await loadTasks();
    } catch { errorEl.textContent = 'Erreur de connexion'; }
}

async function toggleComplete(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
        if (newStatus === 'done') {
            await fetch(`${API}/tasks/${id}/complete`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            });
        } else {
            await fetch(`${API}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status: 'todo' }),
            });
        }
        await loadTasks();
    } catch { console.error('Erreur toggle'); }
}

async function deleteTask(id) {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
        await fetch(`${API}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        await loadTasks();
    } catch { console.error('Erreur suppression'); }
}

// ===== EXPORT =====
function exportCSV() {
    const headers = ['ID','Titre','Description','Statut','Priorité','Catégorie','Échéance','Créé le'];
    const rows    = allTasks.map(t => [
        t.id,
        `"${(t.title||'').replace(/"/g,'""')}"`,
        `"${(t.description||'').replace(/"/g,'""')}"`,
        statusLabel(t.status),
        priorityLabel(t.priority),
        categoryLabel(t.category),
        t.due_date ? formatDate(t.due_date) : '',
        t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '',
    ]);

    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `todo-${new Date().toISOString().substring(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportPDF() {
    const win = window.open('', '_blank');
    const css = `
        body { font-family: Arial, sans-serif; padding: 30px; color: #1a1a2e; }
        h1   { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
        .meta { color: #6b7280; font-size: 13px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #4f46e5; color: white; padding: 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f8f9fa; }
        .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; }
        .done   { background:#d1fae5; color:#059669; }
        .doing  { background:#fef3c7; color:#d97706; }
        .todo   { background:#f1f5f9; color:#64748b; }
        .high   { background:#fee2e2; color:#dc2626; }
        .medium { background:#fef3c7; color:#d97706; }
        .low    { background:#d1fae5; color:#059669; }
    `;

    const rows = allTasks.map(t => `
        <tr>
            <td>${escapeHtml(t.title)}</td>
            <td>${escapeHtml(t.description || '-')}</td>
            <td><span class="badge ${t.status}">${statusLabel(t.status)}</span></td>
            <td><span class="badge ${t.priority}">${priorityLabel(t.priority)}</span></td>
            <td>${categoryIcon(t.category)} ${categoryLabel(t.category)}</td>
            <td>${t.due_date ? formatDate(t.due_date) : '-'}</td>
        </tr>
    `).join('');

    win.document.write(`
        <!DOCTYPE html>
        <html><head>
            <meta charset="UTF-8">
            <title>Todo App - Export</title>
            <style>${css}</style>
        </head>
        <body>
            <h1>✅ Todo App — Liste des tâches</h1>
            <div class="meta">
                Exporté le ${new Date().toLocaleDateString('fr-FR')} •
                ${allTasks.length} tâche(s) •
                ${currentUser?.name || ''}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th>Priorité</th>
                        <th>Catégorie</th>
                        <th>Échéance</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body></html>
    `);
    win.document.close();
    win.print();
}

// ===== THEME =====
function toggleTheme() {
    const html   = document.documentElement;
    const icon   = document.getElementById('theme-icon');
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// ===== HELPERS =====
function categoryLabel(c) {
    return { travail:'Travail', etudes:'Études', personnel:'Personnel', autre:'Autre' }[c] || c;
}
function categoryIcon(c) {
    return { travail:'💼', etudes:'🎓', personnel:'👤', autre:'🏷️' }[c] || '🏷️';
}
function statusLabel(s) {
    return { todo:'À faire', doing:'En cours', done:'Terminée' }[s] || s;
}
function priorityLabel(p) {
    return { low:'Faible', medium:'Moyenne', high:'Élevée' }[p] || p;
}
function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
        day:'2-digit', month:'short', year:'numeric'
    });
}
function isOverdue(date, status) {
    if (status === 'done' || !date) return false;
    return new Date(date) < new Date();
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
}
