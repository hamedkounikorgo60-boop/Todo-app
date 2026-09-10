<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link rel="stylesheet" href="/css/app.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <!-- AUTH PAGE -->
    <div id="auth-page" class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <i class="fas fa-check-circle"></i>
                <h1>Todo App</h1>
            </div>
            <div class="auth-tabs">
                <button class="tab-btn active" onclick="showTab('login')">Connexion</button>
                <button class="tab-btn" onclick="showTab('register')">Inscription</button>
            </div>
            <form id="login-form" class="auth-form" onsubmit="login(event)">
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" id="login-email" placeholder="email@example.com" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock"></i> Mot de passe</label>
                    <input type="password" id="login-password" placeholder="••••••••" required>
                </div>
                <div id="login-error" class="error-msg"></div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fas fa-sign-in-alt"></i> Se connecter
                </button>
            </form>
            <form id="register-form" class="auth-form hidden" onsubmit="register(event)">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Nom</label>
                    <input type="text" id="reg-name" placeholder="Votre nom" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" id="reg-email" placeholder="email@example.com" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock"></i> Mot de passe</label>
                    <input type="password" id="reg-password" placeholder="••••••••" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock"></i> Confirmer</label>
                    <input type="password" id="reg-confirm" placeholder="••••••••" required>
                </div>
                <div id="reg-error" class="error-msg"></div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fas fa-user-plus"></i> S'inscrire
                </button>
            </form>
        </div>
    </div>

    <!-- DASHBOARD PAGE -->
    <div id="dashboard-page" class="hidden">

        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-check-circle"></i>
                <span>Todo App</span>
            </div>
            <div class="nav-tabs">
                <button class="nav-tab active" onclick="showView('list')">
                    <i class="fas fa-list"></i> Liste
                </button>
                <button class="nav-tab" onclick="showView('kanban')">
                    <i class="fas fa-columns"></i> Kanban
                </button>
                <button class="nav-tab" onclick="showView('stats')">
                    <i class="fas fa-chart-bar"></i> Statistiques
                </button>
            </div>
            <div class="nav-actions">
                <span id="user-name"></span>
                <button class="btn-icon" onclick="toggleTheme()">
                    <i class="fas fa-moon" id="theme-icon"></i>
                </button>
                <button class="btn-logout" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
            </div>
        </nav>

        <!-- Stats Cards -->
        <div class="stats-container">
            <div class="stat-card stat-total">
                <div class="stat-icon"><i class="fas fa-list"></i></div>
                <div class="stat-info">
                    <span class="stat-number" id="stat-total">0</span>
                    <span class="stat-label">Total</span>
                </div>
            </div>
            <div class="stat-card stat-todo">
                <div class="stat-icon"><i class="fas fa-circle"></i></div>
                <div class="stat-info">
                    <span class="stat-number" id="stat-todo">0</span>
                    <span class="stat-label">À faire</span>
                </div>
            </div>
            <div class="stat-card stat-doing">
                <div class="stat-icon"><i class="fas fa-spinner"></i></div>
                <div class="stat-info">
                    <span class="stat-number" id="stat-doing">0</span>
                    <span class="stat-label">En cours</span>
                </div>
            </div>
            <div class="stat-card stat-done">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info">
                    <span class="stat-number" id="stat-done">0</span>
                    <span class="stat-label">Terminées</span>
                </div>
            </div>
        </div>

        <!-- ===== VUE LISTE ===== -->
        <div id="view-list">
            <!-- Catégories -->
            <div class="categories-bar">
                <button class="cat-btn active" onclick="filterByCategory('all', this)">
                    <i class="fas fa-th"></i> Toutes
                </button>
                <button class="cat-btn cat-travail" onclick="filterByCategory('travail', this)">
                    <i class="fas fa-briefcase"></i> Travail
                </button>
                <button class="cat-btn cat-etudes" onclick="filterByCategory('etudes', this)">
                    <i class="fas fa-graduation-cap"></i> Études
                </button>
                <button class="cat-btn cat-personnel" onclick="filterByCategory('personnel', this)">
                    <i class="fas fa-user"></i> Personnel
                </button>
                <button class="cat-btn cat-autre" onclick="filterByCategory('autre', this)">
                    <i class="fas fa-tag"></i> Autre
                </button>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="search-input"
                           placeholder="Rechercher une tâche..."
                           oninput="applyFilters()">
                </div>
                <div class="filters">
                    <button class="filter-btn active" onclick="filterByStatus('all', this)">Toutes</button>
                    <button class="filter-btn" onclick="filterByStatus('todo', this)">À faire</button>
                    <button class="filter-btn" onclick="filterByStatus('doing', this)">En cours</button>
                    <button class="filter-btn" onclick="filterByStatus('done', this)">Terminées</button>
                </div>
                <div class="export-btns">
                    <button class="btn-export" onclick="exportCSV()">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button class="btn-export" onclick="exportPDF()">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
                <button class="btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i> Nouvelle tâche
                </button>
            </div>

            <!-- Tasks List -->
            <div class="tasks-container">
                <div id="tasks-list"></div>
                <div id="empty-state" class="empty-state hidden">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Aucune tâche trouvée</p>
                    <button class="btn-primary" onclick="openModal()">
                        <i class="fas fa-plus"></i> Ajouter une tâche
                    </button>
                </div>
            </div>
        </div>

        <!-- ===== VUE KANBAN ===== -->
        <div id="view-kanban" class="hidden">
            <div class="kanban-toolbar">
                <button class="btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i> Nouvelle tâche
                </button>
            </div>
            <div class="kanban-board">
                <div class="kanban-col">
                    <div class="kanban-header kanban-todo">
                        <i class="fas fa-circle"></i> À faire
                        <span class="kanban-count" id="k-todo-count">0</span>
                    </div>
                    <div class="kanban-cards" id="k-todo"></div>
                </div>
                <div class="kanban-col">
                    <div class="kanban-header kanban-doing">
                        <i class="fas fa-spinner"></i> En cours
                        <span class="kanban-count" id="k-doing-count">0</span>
                    </div>
                    <div class="kanban-cards" id="k-doing"></div>
                </div>
                <div class="kanban-col">
                    <div class="kanban-header kanban-done">
                        <i class="fas fa-check-circle"></i> Terminées
                        <span class="kanban-count" id="k-done-count">0</span>
                    </div>
                    <div class="kanban-cards" id="k-done"></div>
                </div>
            </div>
        </div>

        <!-- ===== VUE STATS ===== -->
        <div id="view-stats" class="hidden">
            <div class="stats-page">

                <!-- KPIs -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon kpi-green"><i class="fas fa-trophy"></i></div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="kpi-rate">0%</span>
                            <span class="kpi-label">Taux de complétion</span>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon kpi-blue"><i class="fas fa-calendar-week"></i></div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="kpi-week">0</span>
                            <span class="kpi-label">Terminées cette semaine</span>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon kpi-red"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="kpi-info">
                            <span class="kpi-value" id="kpi-overdue">0</span>
                            <span class="kpi-label">En retard</span>
                        </div>
                    </div>
                </div>

                <!-- Graphiques -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3><i class="fas fa-chart-pie"></i> Par catégorie</h3>
                        <div id="chart-category"></div>
                    </div>
                    <div class="chart-card">
                        <h3><i class="fas fa-chart-bar"></i> Par priorité</h3>
                        <div id="chart-priority"></div>
                    </div>
                    <div class="chart-card chart-full">
                        <h3><i class="fas fa-chart-line"></i> Activité 7 derniers jours</h3>
                        <div id="chart-activity"></div>
                    </div>
                </div>

                <!-- Barre de progression -->
                <div class="progress-card">
                    <div class="progress-header">
                        <span>Progression globale</span>
                        <span id="progress-text">0 / 0 tâches</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL Tâche -->
    <div id="task-modal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-title">Nouvelle tâche</h2>
                <button class="btn-icon" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form onsubmit="saveTask(event)">
                <div class="form-group">
                    <label>Titre *</label>
                    <input type="text" id="task-title" placeholder="Titre de la tâche" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="task-description" placeholder="Description..." rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Catégorie</label>
                        <select id="task-category">
                            <option value="travail">💼 Travail</option>
                            <option value="etudes">🎓 Études</option>
                            <option value="personnel">👤 Personnel</option>
                            <option value="autre">🏷️ Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priorité</label>
                        <select id="task-priority">
                            <option value="low">🟢 Faible</option>
                            <option value="medium">🟡 Moyenne</option>
                            <option value="high">🔴 Élevée</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="task-status">
                            <option value="todo">À faire</option>
                            <option value="doing">En cours</option>
                            <option value="done">Terminée</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date d'échéance</label>
                        <input type="date" id="task-due-date">
                    </div>
                </div>

                <!-- Sous-tâches -->
                <div class="form-group" id="subtasks-section">
                    <label>
                        <i class="fas fa-list-ul"></i> Sous-tâches
                    </label>
                    <div id="subtasks-list"></div>
                    <div class="subtask-input-row">
                        <input type="text" id="new-subtask"
                               placeholder="Ajouter une sous-tâche...">
                        <button type="button" class="btn-add-subtask"
                                onclick="addSubtaskInput()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div id="task-error" class="error-msg"></div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div id="overlay" class="overlay hidden" onclick="closeModal()"></div>
    <script src="/js/app.js"></script>
</body>
</html>
