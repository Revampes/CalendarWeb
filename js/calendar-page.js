const STORAGE_KEYS = {
            schedules: 'calendar_schedules',
            deadlines: 'calendar_deadlines',
            todos: 'calendar_todos',
            legacyTasks: 'tasks'
        };

const CANVAS_TOKEN_KEY = 'canvas_api_token';
const CANVAS_BASE_URL_KEY = 'canvas_base_url';
const DEFAULT_CANVAS_BASE_URL = 'https://canvas.instructure.com/';
const CANVAS_BASE_PLACEHOLDER = 'Optional (defaults to canvas.instructure.com)';
const DAILY_REMINDER_KEY = 'calendar_daily_reminder_shown';
const DAILY_BRIEFING_SENT_KEY = 'calendar_daily_briefing_last_sent';
const REMINDER_LOOKAHEAD_DAYS = 1;
const DATA_SEEDED_FLAG = 'calendar_seeded';

        const TASK_TYPE_COLORS = {
            lecture: '#3b82f6',
            tutorial: '#10b981',
            training: '#f59e0b',
            meeting: '#8b5cf6',
            assignment: '#ef4444',
            exam: '#ec4899',
            break: '#6366f1',
            other: '#6b7280'
        };

        const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const multiDateSelectors = {};
        const ICS_KIND_FIELD = 'X-CALENDARWEB-KIND';
        const ICS_KIND = {
            schedule: 'SCHEDULE',
            deadline: 'DEADLINE',
            todo: 'TODO'
        };

        document.addEventListener('DOMContentLoaded', () => {
            const state = {
                today: normaliseDate(new Date()),
                current: normaliseDate(new Date()),
                selected: normaliseDate(new Date())
            };

            const elements = {
                body: document.getElementById('body-element'),
                themeToggle: document.getElementById('theme-toggle'),
                mobileMenuButton: document.getElementById('mobile-menu-button'),
                mobileMenu: document.getElementById('mobile-menu'),
                prevMonth: document.getElementById('prev-month'),
                nextMonth: document.getElementById('next-month'),
                todayButton: document.getElementById('today-btn'),
                currentMonthLabel: document.getElementById('current-month'),
                calendarGrid: document.getElementById('calendar-grid'),
                selectedDateDisplay: document.getElementById('selected-date-display'),
                todoDateDisplay: document.getElementById('todo-date-display'),
                scheduleContainer: document.getElementById('schedule-container'),
                deadlinesContainer: document.getElementById('deadlines-container'),
                todoPendingContainer: document.getElementById('todo-pending-container'),
                todoCompletedContainer: document.getElementById('todo-completed-container'),
                dailySchedule: document.getElementById('daily-schedule'),
                todayScheduleContainer: document.getElementById('today-schedule-container'),
                todayDeadlinesContainer: document.getElementById('today-deadlines-container'),
                todayTodosContainer: document.getElementById('today-todos-container'),
                addTaskModal: document.getElementById('add-task-modal'),
                addDeadlineModal: document.getElementById('add-deadline-modal'),
                addTodoModal: document.getElementById('add-todo-modal'),
                editTaskModal: document.getElementById('edit-task-modal'),
                editDeadlineModal: document.getElementById('edit-deadline-modal'),
                addTaskForm: document.getElementById('add-task-form'),
                addDeadlineForm: document.getElementById('add-deadline-form'),
                addTodoForm: document.getElementById('add-todo-form'),
                editTaskForm: document.getElementById('edit-task-form'),
                editDeadlineForm: document.getElementById('edit-deadline-form'),
                clearCompletedButton: document.getElementById('clear-completed-btn'),
                addTaskButton: document.getElementById('add-task-btn'),
                addDeadlineButton: document.getElementById('add-deadline-btn'),
                addTodoButton: document.getElementById('add-todo-btn'),
                deleteTaskButton: document.getElementById('delete-task-btn'),
                deleteDeadlineButton: document.getElementById('delete-deadline-btn'),
                closeButtons: document.querySelectorAll('.close-modal'),
                modalContainers: document.querySelectorAll('.modal'),
                importIcsButton: document.getElementById('import-ics-btn'),
                icsFileInput: document.getElementById('ics-file-input'),
                importIcsModal: document.getElementById('import-ics-modal'),
                icsDropZone: document.getElementById('ics-drop-zone'),
                icsLinkInput: document.getElementById('ics-link-input'),
                fetchIcsLinkButton: document.getElementById('fetch-ics-link-btn'),
                exportIcsButton: document.getElementById('export-ics-btn'),
                syncCanvasButton: document.getElementById('sync-canvas-btn'),
                clearAllButton: document.getElementById('clear-all-btn'),
                canvasBaseUrlInput: document.getElementById('canvas-base-url-input'),
                canvasTokenInput: document.getElementById('canvas-token-input'),
                saveCanvasButton: document.getElementById('save-canvas-btn'),
                clearCanvasButton: document.getElementById('clear-canvas-btn'),
                toggleTokenVisibilityButton: document.getElementById('toggle-token-visibility'),
                automationStatus: document.getElementById('automation-status'),
                dailyReminderModal: document.getElementById('daily-reminder-modal'),
                dailyReminderList: document.getElementById('daily-reminder-list'),
                dismissDailyReminderButton: document.getElementById('dismiss-daily-reminder-btn'),
                closeDailyReminderButton: document.getElementById('close-daily-reminder-btn')
            };

            const statusToneClassMap = {
                info: ['text-gray-500', 'dark:text-gray-300', 'dark:text-gray-400'],
                success: ['text-emerald-600', 'dark:text-emerald-400'],
                error: ['text-red-600', 'dark:text-red-400'],
                warning: ['text-amber-600', 'dark:text-amber-400']
            };

            initialiseTheme(elements.body, elements.themeToggle);
            initialiseNavigation(elements.mobileMenuButton, elements.mobileMenu);
            ensureSeedData();
            initialiseCanvasSettings();
            disableCanvasCredentials();

            multiDateSelectors.schedule = createCalendarDateSelector({
                hiddenInputId: 'task-dates-hidden',
                listContainerId: 'task-selected-dates',
                pickerContainerId: 'task-date-picker',
                toneSetter: setAutomationStatus,
                emptyMessage: 'No schedule dates selected yet.'
            });

            multiDateSelectors.todo = createCalendarDateSelector({
                hiddenInputId: 'todo-dates-hidden',
                listContainerId: 'todo-selected-dates',
                pickerContainerId: 'todo-date-picker',
                toneSetter: setAutomationStatus,
                emptyMessage: 'No to-do dates selected yet.'
            });

            elements.prevMonth.addEventListener('click', () => {
                const updated = new Date(state.current.getFullYear(), state.current.getMonth() - 1, 1);
                state.current = normaliseDate(updated);
                renderAll();
            });

            elements.nextMonth.addEventListener('click', () => {
                const updated = new Date(state.current.getFullYear(), state.current.getMonth() + 1, 1);
                state.current = normaliseDate(updated);
                renderAll();
            });

            elements.todayButton.addEventListener('click', () => {
                state.current = normaliseDate(new Date());
                state.selected = normaliseDate(new Date());
                renderAll();
            });

            elements.addTaskButton.addEventListener('click', () => openAddModal('schedule'));
            elements.addDeadlineButton.addEventListener('click', () => openAddModal('deadline'));
            elements.addTodoButton.addEventListener('click', () => openAddModal('todo'));

            if (elements.importIcsButton && elements.importIcsModal) {
                elements.importIcsButton.addEventListener('click', () => {
                    elements.importIcsModal.classList.remove('hidden');
                });
            }

            if (elements.icsFileInput) {
                elements.icsFileInput.addEventListener('change', handleIcsFileInputChange);
            }

            if (elements.icsDropZone) {
                elements.icsDropZone.addEventListener('click', () => {
                    if (elements.icsFileInput) {
                        elements.icsFileInput.click();
                    }
                });
                ['dragenter', 'dragover'].forEach(eventName => {
                    elements.icsDropZone.addEventListener(eventName, handleIcsDragOver);
                });
                ['dragleave', 'dragend'].forEach(eventName => {
                    elements.icsDropZone.addEventListener(eventName, handleIcsDragLeave);
                });
                elements.icsDropZone.addEventListener('drop', handleIcsDrop);
            }

            if (elements.fetchIcsLinkButton) {
                elements.fetchIcsLinkButton.addEventListener('click', handleIcsLinkFetch);
            }

            if (elements.exportIcsButton) {
                elements.exportIcsButton.addEventListener('click', handleIcsExport);
            }

            if (elements.clearAllButton) {
                elements.clearAllButton.addEventListener('click', handleClearAll);
            }

            if (elements.syncCanvasButton) {
                elements.syncCanvasButton.addEventListener('click', handleCanvasSync);
            }

            if (elements.saveCanvasButton) {
                elements.saveCanvasButton.addEventListener('click', handleSaveCanvasSettings);
            }

            if (elements.clearCanvasButton) {
                elements.clearCanvasButton.addEventListener('click', handleClearCanvasSettings);
            }

            if (elements.toggleTokenVisibilityButton && elements.canvasTokenInput) {
                elements.toggleTokenVisibilityButton.addEventListener('click', () => {
                    const isHidden = elements.canvasTokenInput.type === 'password';
                    elements.canvasTokenInput.type = isHidden ? 'text' : 'password';
                    elements.toggleTokenVisibilityButton.textContent = isHidden ? 'Hide' : 'Show';
                });
            }

            elements.addTaskForm.addEventListener('submit', handleAddSchedule);
            elements.addDeadlineForm.addEventListener('submit', handleAddDeadline);
            elements.addTodoForm.addEventListener('submit', handleAddTodo);

            elements.editTaskForm.addEventListener('submit', handleEditSchedule);
            elements.editDeadlineForm.addEventListener('submit', handleEditDeadline);

            elements.deleteTaskButton.addEventListener('click', handleDeleteSchedule);
            elements.deleteDeadlineButton.addEventListener('click', handleDeleteDeadline);

            elements.clearCompletedButton.addEventListener('click', () => {
                const todos = getTodos().filter(todo => !todo.completed);
                saveItems(STORAGE_KEYS.todos, todos);
                renderAll();
            });

            elements.closeButtons.forEach(button => {
                button.addEventListener('click', () => closeAllModals());
            });

            elements.modalContainers.forEach(container => {
                container.addEventListener('click', event => {
                    if (event.target === container) {
                        closeAllModals();
                    }
                });
            });

            if (elements.dismissDailyReminderButton) {
                elements.dismissDailyReminderButton.addEventListener('click', () => closeDailyReminder());
            }

            if (elements.closeDailyReminderButton) {
                elements.closeDailyReminderButton.addEventListener('click', () => closeDailyReminder());
            }

            if (elements.dailyReminderModal) {
                elements.dailyReminderModal.addEventListener('click', event => {
                    if (event.target === elements.dailyReminderModal) {
                        closeDailyReminder();
                    }
                });
            }

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    closeAllModals();
                    closeDailyReminder();
                }
            });

            renderAll();
            maybeShowDailyReminder();
            initNotificationLoop();

            function renderAll() {
                renderCalendar();
                renderScheduleList();
                renderDeadlinesList();
                renderTodosList();
                renderDailySchedule();
                renderTodaySummary();
            }

            function renderCalendar() {
                const year = state.current.getFullYear();
                const month = state.current.getMonth();

                elements.currentMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;
                elements.calendarGrid.innerHTML = '';

                const firstDayOfWeek = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                    const date = new Date(year, month - 1, daysInPrevMonth - i);
                    elements.calendarGrid.appendChild(createDayCell(date, true));
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    elements.calendarGrid.appendChild(createDayCell(date, false));
                }

                const totalCells = elements.calendarGrid.children.length;
                const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                for (let day = 1; day <= remainingCells; day++) {
                    const date = new Date(year, month + 1, day);
                    elements.calendarGrid.appendChild(createDayCell(date, true));
                }
            }

            function createDayCell(date, isOtherMonth) {
                const dateKey = formatDateForStorage(date);
                const schedules = getSchedules().filter(schedule => schedule.date === dateKey);
                const deadlines = getDeadlines().filter(deadline => deadline.date === dateKey);

                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell px-2 py-2 flex flex-col items-start gap-1 hover:cursor-pointer';

                if (isOtherMonth) {
                    cell.classList.add('opacity-60');
                }

                if (isSameDay(date, state.selected)) {
                    cell.classList.add('ring-2', 'ring-primary-500', 'dark:ring-primary-400');
                }

                if (!isOtherMonth && isSameDay(date, state.today)) {
                    cell.classList.add('border-primary-500', 'dark:border-primary-400');
                }

                const dayNumber = document.createElement('div');
                dayNumber.className = 'calendar-day-number text-sm';
                dayNumber.textContent = date.getDate();
                cell.appendChild(dayNumber);

                if (deadlines.length > 0) {
                    const marker = document.createElement('div');
                    marker.className = 'deadline-marker';
                    marker.title = `${deadlines.length} deadline${deadlines.length > 1 ? 's' : ''}`;
                    cell.appendChild(marker);
                }

                if (schedules.length > 0 || deadlines.length > 0) {
                    const indicators = document.createElement('div');
                    indicators.className = 'calendar-day-meta';

                    schedules.slice(0, 3).forEach(schedule => {
                        const dot = document.createElement('span');
                        dot.className = 'task-dot';
                        dot.style.backgroundColor = TASK_TYPE_COLORS[schedule.type] || TASK_TYPE_COLORS.other;
                        indicators.appendChild(dot);
                    });

                    deadlines.slice(0, 2).forEach(() => {
                        const dot = document.createElement('span');
                        dot.className = 'task-dot';
                        dot.style.backgroundColor = TASK_TYPE_COLORS.assignment;
                        indicators.appendChild(dot);
                    });

                    const totalItems = schedules.length + deadlines.length;
                    if (totalItems > 5) {
                        const more = document.createElement('span');
                        more.className = 'text-xs text-gray-500 dark:text-gray-400';
                        more.textContent = `+${totalItems - 5}`;
                        indicators.appendChild(more);
                    }

                    cell.appendChild(indicators);
                }

                cell.addEventListener('click', () => {
                    state.selected = normaliseDate(date);
                    renderAll();
                });

                return cell;
            }

            function renderScheduleList() {
                const dateKey = formatDateForStorage(state.selected);
                const schedules = getSchedules().filter(schedule => schedule.date === dateKey).sort((a, b) => a.startTime.localeCompare(b.startTime));

                elements.selectedDateDisplay.textContent = isSameDay(state.selected, state.today) ? 'Today' : formatReadableDate(state.selected);
                elements.scheduleContainer.innerHTML = '';

                if (schedules.length === 0) {
                    elements.scheduleContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No schedule items for this day</div>';
                    return;
                }

                schedules.forEach(schedule => {
                    const card = document.createElement('div');
                    card.className = 'task-card';
                    const rgb = hexToRgb(TASK_TYPE_COLORS[schedule.type] || TASK_TYPE_COLORS.other);
                    card.style.setProperty('--task-color', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

                    const header = document.createElement('div');
                    header.className = 'flex items-start justify-between gap-3';

                    const title = document.createElement('div');
                    title.className = 'flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100';

                    const dot = document.createElement('span');
                    dot.className = 'task-dot';
                    dot.style.backgroundColor = TASK_TYPE_COLORS[schedule.type] || TASK_TYPE_COLORS.other;

                    const name = document.createElement('span');
                    name.textContent = schedule.name;

                    title.appendChild(dot);
                    title.appendChild(name);

                    const time = document.createElement('div');
                    time.className = 'text-sm font-medium text-gray-600 dark:text-gray-300';
                    time.textContent = `${schedule.startTime} - ${schedule.endTime}`;

                    header.appendChild(title);
                    header.appendChild(time);
                    card.appendChild(header);

                    if (schedule.location) {
                        const location = document.createElement('div');
                        location.className = 'text-sm text-gray-600 dark:text-gray-300 mt-2';
                        location.textContent = schedule.location;
                        card.appendChild(location);
                    }

                    if (schedule.description) {
                        const description = document.createElement('div');
                        description.className = 'text-xs text-gray-500 dark:text-gray-400 mt-2';
                        description.textContent = schedule.description;
                        card.appendChild(description);
                    }

                    if (schedule.link) {
                        const link = document.createElement('a');
                        link.className = 'text-sm text-primary-600 dark:text-primary-400 mt-3 inline-flex items-center gap-2';
                        link.href = schedule.link;
                        link.target = '_blank';
                        link.rel = 'noopener';
                        link.innerHTML = '<i class="fa fa-external-link" aria-hidden="true"></i>Open resource';
                        card.appendChild(link);
                    }

                    card.addEventListener('click', () => openEditSchedule(schedule));
                    elements.scheduleContainer.appendChild(card);
                });
            }

            function renderDeadlinesList() {
                const deadlines = getDeadlines().slice().sort((a, b) => {
                    if (a.date !== b.date) {
                        return a.date.localeCompare(b.date);
                    }
                    return a.time.localeCompare(b.time);
                }).filter(deadline => !isDeadlineInPast(deadline));

                elements.deadlinesContainer.innerHTML = '';

                if (deadlines.length === 0) {
                    elements.deadlinesContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No deadlines scheduled</div>';
                    return;
                }

                deadlines.forEach(deadline => {
                    const card = document.createElement('div');
                    card.className = 'task-card border-red-200 dark:border-red-800';
                    card.style.setProperty('--task-color', '239, 68, 68');

                    const header = document.createElement('div');
                    header.className = 'flex items-start justify-between gap-3';

                    const title = document.createElement('div');
                    title.className = 'flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300';

                    const dot = document.createElement('span');
                    dot.className = 'task-dot';
                    dot.style.backgroundColor = TASK_TYPE_COLORS.assignment;

                    const name = document.createElement('span');
                    name.textContent = deadline.name;

                    title.appendChild(dot);
                    title.appendChild(name);

                    const time = document.createElement('div');
                    time.className = 'text-sm font-medium text-red-600 dark:text-red-400';
                    time.textContent = `${formatReadableDate(deadline.date)} • ${deadline.time}`;

                    header.appendChild(title);
                    header.appendChild(time);
                    card.appendChild(header);

                    if (deadline.description) {
                        const description = document.createElement('div');
                        description.className = 'text-xs text-gray-500 dark:text-gray-400 mt-2';
                        description.textContent = deadline.description;
                        card.appendChild(description);
                    }

                    if (deadline.link) {
                        const link = document.createElement('a');
                        link.className = 'text-sm text-red-600 dark:text-red-400 mt-3 inline-flex items-center gap-2';
                        link.href = deadline.link;
                        link.target = '_blank';
                        link.rel = 'noopener';
                        link.innerHTML = '<i class="fa fa-external-link" aria-hidden="true"></i>Open resource';
                        card.appendChild(link);
                    }

                    card.addEventListener('click', () => openEditDeadline(deadline));
                    elements.deadlinesContainer.appendChild(card);
                });
            }

            function renderTodosList() {
                const dateKey = formatDateForStorage(state.selected);
                const todos = getTodos().filter(todo => todo.date === dateKey);

                elements.todoDateDisplay.textContent = isSameDay(state.selected, state.today) ? 'Today' : formatReadableDate(state.selected);
                elements.todoPendingContainer.innerHTML = '';
                elements.todoCompletedContainer.innerHTML = '';

                if (todos.length === 0) {
                    elements.todoPendingContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No to-dos yet</div>';
                    elements.todoCompletedContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">Nothing completed</div>';
                    return;
                }

                const pending = todos.filter(todo => !todo.completed);
                const completed = todos.filter(todo => todo.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

                if (pending.length === 0) {
                    elements.todoPendingContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No pending items</div>';
                } else {
                    pending.forEach(todo => elements.todoPendingContainer.appendChild(createTodoItem(todo)));
                }

                if (completed.length === 0) {
                    elements.todoCompletedContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No completed items</div>';
                } else {
                    completed.forEach(todo => elements.todoCompletedContainer.appendChild(createTodoItem(todo)));
                }
            }

            function createTodoItem(todo) {
                const item = document.createElement('div');
                item.className = 'todo-item';
                if (todo.completed) {
                    item.classList.add('completed');
                }

                const content = document.createElement('div');
                content.className = 'flex items-start gap-3 flex-1';

                const toggle = document.createElement('button');
                toggle.className = 'w-9 h-9 rounded-full border border-emerald-400 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors';
                toggle.innerHTML = todo.completed ? '<i class="fa fa-check" aria-hidden="true"></i>' : '<i class="fa fa-circle-o" aria-hidden="true"></i>';
                toggle.addEventListener('click', event => {
                    event.stopPropagation();
                    toggleTodo(todo.id);
                });

                const text = document.createElement('div');
                text.className = 'flex-1';

                const title = document.createElement('div');
                title.className = 'todo-title text-sm font-semibold text-gray-800 dark:text-gray-100';
                title.textContent = todo.title;

                const notes = document.createElement('div');
                notes.className = 'text-xs text-gray-500 dark:text-gray-400 mt-1';
                notes.textContent = todo.notes || '';

                text.appendChild(title);
                if (todo.notes) {
                    text.appendChild(notes);
                }

                content.appendChild(toggle);
                content.appendChild(text);

                const actions = document.createElement('div');
                actions.className = 'flex gap-2';

                const deleteButton = document.createElement('button');
                deleteButton.className = 'todo-action px-3 py-1 rounded-full border border-red-200 dark:border-red-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors';
                deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
                deleteButton.addEventListener('click', event => {
                    event.stopPropagation();
                    deleteTodo(todo.id);
                });

                actions.appendChild(deleteButton);
                item.appendChild(content);
                item.appendChild(actions);

                return item;
            }

            function renderDailySchedule() {
                const dateKey = formatDateForStorage(state.selected);
                const schedules = getSchedules().filter(schedule => schedule.date === dateKey).sort((a, b) => a.startTime.localeCompare(b.startTime));

                elements.dailySchedule.innerHTML = '';

                const hours = Array.from({ length: 17 }, (_, index) => 6 + index);
                hours.forEach(hour => {
                    const slot = document.createElement('div');
                    slot.className = 'flex items-start gap-4';

                    const label = document.createElement('div');
                    label.className = 'w-16 text-xs uppercase text-gray-500 dark:text-gray-400 pt-1';
                    label.textContent = formatHour(hour);

                    const content = document.createElement('div');
                    content.className = 'flex-1 space-y-2';

                    const matches = schedules.filter(schedule => parseInt(schedule.startTime.split(':')[0], 10) === hour);
                    matches.forEach(schedule => {
                        const pill = document.createElement('div');
                        pill.className = 'schedule-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 border';
                        const color = TASK_TYPE_COLORS[schedule.type] || TASK_TYPE_COLORS.other;
                        pill.style.backgroundColor = `${color}22`;
                        pill.style.borderColor = `${color}55`;
                        pill.textContent = `${schedule.startTime} • ${schedule.name}`;
                        pill.addEventListener('click', () => openEditSchedule(schedule));
                        content.appendChild(pill);
                    });

                    slot.appendChild(label);
                    slot.appendChild(content);
                    elements.dailySchedule.appendChild(slot);
                });
            }

            function renderTodaySummary() {
                const todayKey = formatDateForStorage(state.today);
                const schedules = getSchedules().filter(schedule => schedule.date === todayKey).sort((a, b) => a.startTime.localeCompare(b.startTime));
                const deadlines = getDeadlines().filter(deadline => deadline.date === todayKey).sort((a, b) => a.time.localeCompare(b.time));
                const todos = getTodos().filter(todo => todo.date === todayKey);

                elements.todayScheduleContainer.innerHTML = '';
                elements.todayDeadlinesContainer.innerHTML = '';
                elements.todayTodosContainer.innerHTML = '';

                if (schedules.length === 0) {
                    elements.todayScheduleContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No schedule items today</div>';
                } else {
                    schedules.forEach(schedule => {
                        const item = document.createElement('div');
                        item.className = 'todo-item';
                        const color = TASK_TYPE_COLORS[schedule.type] || TASK_TYPE_COLORS.other;
                        item.style.backgroundColor = `${color}15`;
                        item.style.borderColor = `${color}55`;
                        const title = document.createElement('div');
                        title.className = 'text-sm font-semibold text-gray-800 dark:text-gray-100';
                        title.textContent = schedule.name;
                        const time = document.createElement('div');
                        time.className = 'text-xs text-gray-500 dark:text-gray-400';
                        time.textContent = `${schedule.startTime} - ${schedule.endTime}`;
                        item.appendChild(title);
                        item.appendChild(time);
                        item.addEventListener('click', () => openEditSchedule(schedule));
                        elements.todayScheduleContainer.appendChild(item);
                    });
                }

                if (deadlines.length === 0) {
                    elements.todayDeadlinesContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No deadlines today</div>';
                } else {
                    deadlines.forEach(deadline => {
                        const item = document.createElement('div');
                        item.className = 'todo-item';
                        item.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                        item.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                        const title = document.createElement('div');
                        title.className = 'text-sm font-semibold text-red-700 dark:text-red-300';
                        title.textContent = deadline.name;
                        const time = document.createElement('div');
                        time.className = 'text-xs text-red-500 dark:text-red-300';
                        time.textContent = deadline.time;
                        item.appendChild(title);
                        item.appendChild(time);
                        item.addEventListener('click', () => openEditDeadline(deadline));
                        elements.todayDeadlinesContainer.appendChild(item);
                    });
                }

                if (todos.length === 0) {
                    elements.todayTodosContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No to-dos for today</div>';
                } else {
                    todos.sort((a, b) => Number(a.completed) - Number(b.completed));
                    todos.forEach(todo => {
                        const item = document.createElement('div');
                        item.className = 'todo-item';
                        if (todo.completed) {
                            item.classList.add('completed');
                        }
                        const title = document.createElement('div');
                        title.className = 'text-sm font-semibold text-gray-800 dark:text-gray-100';
                        title.textContent = todo.title;
                        item.appendChild(title);
                        item.addEventListener('click', () => toggleTodo(todo.id));
                        elements.todayTodosContainer.appendChild(item);
                    });
                }
            }

            function openAddModal(type) {
                closeAllModals();
                const dateValue = formatDateForStorage(state.selected);
                if (type === 'schedule') {
                    elements.addTaskForm.reset();
                    if (multiDateSelectors.schedule) {
                        multiDateSelectors.schedule.setDates([dateValue], dateValue);
                    }
                    elements.addTaskModal.classList.remove('hidden');
                } else if (type === 'deadline') {
                    elements.addDeadlineForm.reset();
                    document.getElementById('deadline-date-input').value = dateValue;
                    elements.addDeadlineModal.classList.remove('hidden');
                } else {
                    elements.addTodoForm.reset();
                    if (multiDateSelectors.todo) {
                        multiDateSelectors.todo.setDates([dateValue], dateValue);
                    }
                    elements.addTodoModal.classList.remove('hidden');
                }
            }

            function openEditSchedule(schedule) {
                document.getElementById('edit-task-id').value = schedule.id;
                document.getElementById('edit-task-name').value = schedule.name;
                document.getElementById('edit-task-type').value = schedule.type;
                document.getElementById('edit-task-date').value = schedule.date;
                document.getElementById('edit-start-time').value = schedule.startTime;
                document.getElementById('edit-end-time').value = schedule.endTime;
                document.getElementById('edit-location').value = schedule.location || '';
                document.getElementById('edit-description').value = schedule.description || '';
                document.getElementById('edit-link').value = schedule.link || '';
                closeAllModals();
                elements.editTaskModal.classList.remove('hidden');
            }

            function openEditDeadline(deadline) {
                document.getElementById('edit-deadline-id').value = deadline.id;
                document.getElementById('edit-deadline-name').value = deadline.name;
                document.getElementById('edit-deadline-date').value = deadline.date;
                document.getElementById('edit-deadline-time').value = deadline.time;
                document.getElementById('edit-deadline-description').value = deadline.description || '';
                document.getElementById('edit-deadline-link').value = deadline.link || '';
                closeAllModals();
                elements.editDeadlineModal.classList.remove('hidden');
            }

            function closeAllModals() {
                [
                    elements.addTaskModal,
                    elements.addDeadlineModal,
                    elements.addTodoModal,
                    elements.editTaskModal,
                    elements.editDeadlineModal,
                    elements.importIcsModal
                ].forEach(modal => {
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                });
                if (elements.icsDropZone) {
                    elements.icsDropZone.classList.remove('dragging');
                }
            }

            function handleAddSchedule(event) {
                event.preventDefault();
                const selectedDates = multiDateSelectors.schedule ? multiDateSelectors.schedule.getDates() : [formatDateForStorage(state.selected)];
                if (!selectedDates.length) {
                    setAutomationStatus('Choose at least one valid date for your schedule.', 'error');
                    return;
                }
                const basePayload = {
                    name: event.target['task-name'].value.trim(),
                    type: event.target['task-type'].value,
                    startTime: event.target['start-time'].value,
                    endTime: event.target['end-time'].value,
                    location: event.target['location'].value.trim(),
                    description: event.target['description'].value.trim(),
                    link: event.target['link'].value.trim()
                };
                const schedules = getSchedules();
                selectedDates.forEach(date => {
                    schedules.push({
                        id: generateId(),
                        ...basePayload,
                        date
                    });
                });
                saveItems(STORAGE_KEYS.schedules, schedules);
                closeAllModals();
                renderAll();
            }

            function handleAddDeadline(event) {
                event.preventDefault();
                const payload = {
                    id: generateId(),
                    name: event.target['deadline-name'].value.trim(),
                    date: event.target['deadline-date-input'].value,
                    time: event.target['deadline-time'].value,
                    description: event.target['deadline-description'].value.trim(),
                    link: event.target['deadline-link'].value.trim()
                };
                const deadlines = getDeadlines();
                deadlines.push(payload);
                saveItems(STORAGE_KEYS.deadlines, deadlines);
                closeAllModals();
                renderAll();
            }

            function handleAddTodo(event) {
                event.preventDefault();
                const selectedDates = multiDateSelectors.todo ? multiDateSelectors.todo.getDates() : [formatDateForStorage(state.selected)];
                if (!selectedDates.length) {
                    setAutomationStatus('Choose at least one valid date for your to-do.', 'error');
                    return;
                }
                const basePayload = {
                    title: event.target['todo-title'].value.trim(),
                    notes: event.target['todo-notes'].value.trim()
                };
                const todos = getTodos();
                selectedDates.forEach(date => {
                    todos.push({
                        id: generateId(),
                        ...basePayload,
                        date,
                        completed: false,
                        completedAt: null
                    });
                });
                saveItems(STORAGE_KEYS.todos, todos);
                closeAllModals();
                renderAll();
            }

            function handleEditSchedule(event) {
                event.preventDefault();
                const scheduleId = event.target['edit-task-id'].value;
                const schedules = getSchedules();
                const index = schedules.findIndex(schedule => schedule.id === scheduleId);
                if (index === -1) {
                    return;
                }
                schedules[index] = {
                    ...schedules[index],
                    name: event.target['edit-task-name'].value.trim(),
                    type: event.target['edit-task-type'].value,
                    date: event.target['edit-task-date'].value,
                    startTime: event.target['edit-start-time'].value,
                    endTime: event.target['edit-end-time'].value,
                    location: event.target['edit-location'].value.trim(),
                    description: event.target['edit-description'].value.trim(),
                    link: event.target['edit-link'].value.trim()
                };
                saveItems(STORAGE_KEYS.schedules, schedules);
                closeAllModals();
                renderAll();
            }

            function handleEditDeadline(event) {
                event.preventDefault();
                const deadlineId = event.target['edit-deadline-id'].value;
                const deadlines = getDeadlines();
                const index = deadlines.findIndex(deadline => deadline.id === deadlineId);
                if (index === -1) {
                    return;
                }
                deadlines[index] = {
                    ...deadlines[index],
                    name: event.target['edit-deadline-name'].value.trim(),
                    date: event.target['edit-deadline-date'].value,
                    time: event.target['edit-deadline-time'].value,
                    description: event.target['edit-deadline-description'].value.trim(),
                    link: event.target['edit-deadline-link'].value.trim()
                };
                saveItems(STORAGE_KEYS.deadlines, deadlines);
                closeAllModals();
                renderAll();
            }

            function handleDeleteSchedule() {
                if (!confirm('Delete this schedule item?')) {
                    return;
                }
                const scheduleId = document.getElementById('edit-task-id').value;
                const schedules = getSchedules().filter(schedule => schedule.id !== scheduleId);
                saveItems(STORAGE_KEYS.schedules, schedules);
                closeAllModals();
                renderAll();
            }

            function handleDeleteDeadline() {
                if (!confirm('Delete this deadline?')) {
                    return;
                }
                const deadlineId = document.getElementById('edit-deadline-id').value;
                const deadlines = getDeadlines().filter(deadline => deadline.id !== deadlineId);
                saveItems(STORAGE_KEYS.deadlines, deadlines);
                closeAllModals();
                renderAll();
            }

            function toggleTodo(id) {
                const todos = getTodos();
                const index = todos.findIndex(todo => todo.id === id);
                if (index === -1) {
                    return;
                }
                const todo = todos[index];
                const completed = !todo.completed;
                todos[index] = {
                    ...todo,
                    completed,
                    completedAt: completed ? Date.now() : null
                };
                saveItems(STORAGE_KEYS.todos, todos);
                renderAll();
            }

            function deleteTodo(id) {
                const todos = getTodos().filter(todo => todo.id !== id);
                saveItems(STORAGE_KEYS.todos, todos);
                renderAll();
            }

            async function handleIcsFileInputChange(event) {
                const { files } = event.target;
                const file = files && files[0];
                if (!file) {
                    return;
                }
                await importIcsFromFile(file);
                event.target.value = '';
            }

            function handleIcsDragOver(event) {
                event.preventDefault();
                if (elements.icsDropZone) {
                    elements.icsDropZone.classList.add('dragging');
                }
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'copy';
                }
            }

            function handleIcsDragLeave(event) {
                event.preventDefault();
                if (!elements.icsDropZone) {
                    return;
                }
                const related = event.relatedTarget;
                if (!related || !elements.icsDropZone.contains(related)) {
                    elements.icsDropZone.classList.remove('dragging');
                }
            }

            async function handleIcsDrop(event) {
                event.preventDefault();
                if (elements.icsDropZone) {
                    elements.icsDropZone.classList.remove('dragging');
                }
                const fileList = event.dataTransfer && event.dataTransfer.files;
                const file = fileList && fileList[0];
                if (file) {
                    await importIcsFromFile(file);
                }
            }

            async function handleIcsLinkFetch(event) {
                event.preventDefault();
                const url = elements.icsLinkInput ? elements.icsLinkInput.value.trim() : '';
                if (!url) {
                    setAutomationStatus('Paste an ICS link before fetching.', 'warning');
                    return;
                }
                await importIcsFromUrl(url);
            }

            async function importIcsFromFile(file) {
                try {
                    setAutomationStatus(`Importing ${file.name}...`, 'info');
                    const text = await file.text();
                    const imported = await processIcsPayload(text, file.name);
                    if (imported && elements.importIcsModal) {
                        elements.importIcsModal.classList.add('hidden');
                    }
                } catch (error) {
                    console.error('ICS import failed', error);
                    setAutomationStatus('Unable to import that ICS file. Please verify the file and try again.', 'error');
                }
            }

            async function importIcsFromUrl(url) {
                const trimmedUrl = (url || '').trim();
                if (!trimmedUrl) {
                    setAutomationStatus('Paste an ICS link before fetching.', 'warning');
                    return;
                }
                let directError = null;
                try {
                    setAutomationStatus('Downloading ICS link...', 'info');
                    const directContent = await fetchIcsDirect(trimmedUrl);
                    const imported = await processIcsPayload(directContent, trimmedUrl);
                    if (imported && elements.importIcsModal) {
                        elements.importIcsModal.classList.add('hidden');
                    }
                    return;
                } catch (error) {
                    directError = error;
                    console.warn('Direct ICS download failed, attempting fallback.', error);
                }
                try {
                    setAutomationStatus('Retrying via local proxy...', 'info');
                    const proxyContent = await fetchIcsViaProxy(trimmedUrl);
                    const imported = await processIcsPayload(proxyContent, trimmedUrl);
                    if (imported && elements.importIcsModal) {
                        elements.importIcsModal.classList.add('hidden');
                    }
                } catch (fallbackError) {
                    console.error('ICS link import failed', fallbackError, directError);
                    setAutomationStatus('Unable to download that ICS link automatically. Download it manually and drag it into the import box instead.', 'error');
                }
            }

            async function fetchIcsDirect(url) {
                const response = await fetch(url, { credentials: 'omit' });
                if (!response.ok) {
                    throw new Error(`Direct download failed with status ${response.status}`);
                }
                const text = await response.text();
                if (!text.trim()) {
                    throw new Error('The downloaded ICS file was empty.');
                }
                return text;
            }

            async function fetchIcsViaProxy(url) {
                const response = await fetch('php/api.php?endpoint=ics-fetch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Proxy download failed with ${response.status}: ${errorText.slice(0, 160)}`);
                }
                const payload = await response.json();
                if (!payload.success || !payload.data || typeof payload.data.content !== 'string') {
                    throw new Error(payload.error || 'The proxy returned an unexpected response.');
                }
                return payload.data.content;
            }

            async function processIcsPayload(text, sourceLabel = 'ICS file') {
                const components = parseIcsComponents(text);
                const converted = convertIcsComponentsToItems(components);
                if (!converted.schedules.length && !converted.deadlines.length && !converted.todos.length) {
                    setAutomationStatus('No events were detected in that ICS data.', 'warning');
                    return false;
                }
                const schedules = getSchedules();
                const deadlines = getDeadlines();
                const todos = getTodos();
                const scheduleResult = mergeItems(schedules, converted.schedules, getScheduleSignature);
                const deadlineResult = mergeItems(deadlines, converted.deadlines, getDeadlineSignature);
                const todoResult = mergeItems(todos, converted.todos, getTodoSignature);
                if (scheduleResult.added > 0) {
                    saveItems(STORAGE_KEYS.schedules, schedules);
                }
                if (deadlineResult.added > 0) {
                    saveItems(STORAGE_KEYS.deadlines, deadlines);
                }
                if (todoResult.added > 0) {
                    saveItems(STORAGE_KEYS.todos, todos);
                }
                if (scheduleResult.added === 0 && deadlineResult.added === 0 && todoResult.added === 0) {
                    setAutomationStatus('Every event in that ICS data was already on your calendar.', 'info');
                    return false;
                }
                renderAll();
                setAutomationStatus(`Imported ${scheduleResult.added} schedule(s), ${deadlineResult.added} deadline(s), and ${todoResult.added} to-do(s) from ${truncateSourceLabel(sourceLabel)}.`, 'success');
                if (elements.icsLinkInput) {
                    elements.icsLinkInput.value = '';
                }
                return true;
            }

            function handleIcsExport() {
                const schedules = getSchedules();
                const deadlines = getDeadlines();
                const todos = getTodos();
                if (!schedules.length && !deadlines.length && !todos.length) {
                    setAutomationStatus('Nothing to export yet. Add some schedules, deadlines, or to-dos first.', 'warning');
                    return;
                }
                const icsContent = buildIcsExport({ schedules, deadlines, todos });
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `calendar-web-${formatDateForStorage(new Date()).replace(/-/g, '')}.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setAutomationStatus('Exported your planner to an ICS file.', 'success');
            }

            function truncateSourceLabel(label) {
                if (!label) {
                    return 'ICS';
                }
                const trimmed = label.trim();
                return trimmed.length > 40 ? `${trimmed.slice(0, 37)}...` : trimmed;
            }

            function handleClearAll() {
                if (!confirm('This will permanently delete all schedules, deadlines, and to-dos. Continue?')) {
                    return;
                }
                Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
                localStorage.removeItem(DAILY_REMINDER_KEY);
                renderAll();
                setAutomationStatus('Cleared all calendar data from this browser.', 'warning');
            }

            function setAutomationStatus(message, tone = 'info') {
                if (!elements.automationStatus) {
                    return;
                }
                const allowedTones = Object.keys(statusToneClassMap);
                allowedTones.forEach(key => {
                    statusToneClassMap[key].forEach(className => elements.automationStatus.classList.remove(className));
                });
                const classes = statusToneClassMap[tone] || statusToneClassMap.info;
                classes.forEach(className => elements.automationStatus.classList.add(className));
                elements.automationStatus.textContent = message;
            }

            function initialiseCanvasSettings() {
                if (elements.canvasBaseUrlInput) {
                    const storedBaseUrl = localStorage.getItem(CANVAS_BASE_URL_KEY) || '';
                    elements.canvasBaseUrlInput.value = storedBaseUrl;
                    elements.canvasBaseUrlInput.placeholder = CANVAS_BASE_PLACEHOLDER;
                }
                if (elements.canvasTokenInput) {
                    const hasToken = Boolean(localStorage.getItem(CANVAS_TOKEN_KEY));
                    elements.canvasTokenInput.value = '';
                    elements.canvasTokenInput.placeholder = hasToken ? 'Token stored securely' : 'Paste your token';
                }
            }

            function handleSaveCanvasSettings() {
                const baseInput = elements.canvasBaseUrlInput ? elements.canvasBaseUrlInput.value.trim() : '';
                const tokenInput = elements.canvasTokenInput ? elements.canvasTokenInput.value.trim() : '';
                let changed = false;
                if (baseInput) {
                    const normalized = normaliseBaseUrl(baseInput);
                    localStorage.setItem(CANVAS_BASE_URL_KEY, normalized);
                    elements.canvasBaseUrlInput.value = normalized;
                    changed = true;
                } else if (localStorage.getItem(CANVAS_BASE_URL_KEY)) {
                    localStorage.removeItem(CANVAS_BASE_URL_KEY);
                    if (elements.canvasBaseUrlInput) {
                        elements.canvasBaseUrlInput.value = '';
                    }
                    changed = true;
                }
                if (elements.canvasBaseUrlInput) {
                    elements.canvasBaseUrlInput.placeholder = CANVAS_BASE_PLACEHOLDER;
                }
                if (tokenInput) {
                    localStorage.setItem(CANVAS_TOKEN_KEY, tokenInput);
                    elements.canvasTokenInput.value = '';
                    elements.canvasTokenInput.placeholder = 'Token stored securely';
                    elements.canvasTokenInput.type = 'password';
                    if (elements.toggleTokenVisibilityButton) {
                        elements.toggleTokenVisibilityButton.textContent = 'Show';
                    }
                    changed = true;
                }
                if (!changed) {
                    setAutomationStatus('Enter a Canvas base URL or API token before saving.', 'warning');
                    return;
                }
                setAutomationStatus('Canvas credentials saved locally.', 'success');
            }

            function handleClearCanvasSettings() {
                localStorage.removeItem(CANVAS_BASE_URL_KEY);
                localStorage.removeItem(CANVAS_TOKEN_KEY);
                if (elements.canvasBaseUrlInput) {
                    elements.canvasBaseUrlInput.value = '';
                    elements.canvasBaseUrlInput.placeholder = CANVAS_BASE_PLACEHOLDER;
                }
                if (elements.canvasTokenInput) {
                    elements.canvasTokenInput.value = '';
                    elements.canvasTokenInput.placeholder = 'Paste your token';
                    elements.canvasTokenInput.type = 'password';
                    if (elements.toggleTokenVisibilityButton) {
                        elements.toggleTokenVisibilityButton.textContent = 'Show';
                    }
                }
                setAutomationStatus('Removed saved Canvas credentials from this browser.', 'warning');
            }

            function getCanvasBaseUrl() {
                const typed = elements.canvasBaseUrlInput ? elements.canvasBaseUrlInput.value.trim() : '';
                const stored = localStorage.getItem(CANVAS_BASE_URL_KEY) || '';
                return typed || stored || DEFAULT_CANVAS_BASE_URL;
            }

            function getCanvasToken() {
                return localStorage.getItem(CANVAS_TOKEN_KEY) || '';
            }

            function normaliseBaseUrl(url) {
                if (!url) {
                    return '';
                }
                let normalized = url.trim();
                if (!/^https?:\/\//i.test(normalized)) {
                    normalized = `https://${normalized}`;
                }
                if (!normalized.endsWith('/')) {
                    normalized = `${normalized}/`;
                }
                return normalized;
            }

            async function handleCanvasSync() {
                const typedBase = elements.canvasBaseUrlInput ? elements.canvasBaseUrlInput.value.trim() : '';
                const storedBase = localStorage.getItem(CANVAS_BASE_URL_KEY) || '';
                const usingDefaultBase = !typedBase && !storedBase;
                const baseUrl = normaliseBaseUrl(typedBase || storedBase || DEFAULT_CANVAS_BASE_URL);
                const typedToken = elements.canvasTokenInput ? elements.canvasTokenInput.value.trim() : '';
                const token = typedToken || getCanvasToken();
                if (!token) {
                    setAutomationStatus('Enter your Canvas API token before syncing.', 'error');
                    return;
                }
                if (!usingDefaultBase && elements.canvasBaseUrlInput) {
                    elements.canvasBaseUrlInput.value = baseUrl;
                }
                if (usingDefaultBase && elements.canvasBaseUrlInput) {
                    elements.canvasBaseUrlInput.value = '';
                    elements.canvasBaseUrlInput.placeholder = CANVAS_BASE_PLACEHOLDER;
                }
                try {
                    setAutomationStatus('Syncing with Canvas...', 'info');
                    const events = await fetchCanvasEvents(baseUrl, token);
                    if (!Array.isArray(events) || events.length === 0) {
                        setAutomationStatus('Canvas did not return any upcoming events for the selected window.', 'info');
                        return;
                    }
                    const mapped = mapCanvasEvents(events);
                    const schedules = getSchedules();
                    const deadlines = getDeadlines();
                    const scheduleResult = mergeItems(schedules, mapped.schedules, getScheduleSignature);
                    const deadlineResult = mergeItems(deadlines, mapped.deadlines, getDeadlineSignature);
                    if (scheduleResult.added > 0) {
                        saveItems(STORAGE_KEYS.schedules, schedules);
                    }
                    if (deadlineResult.added > 0) {
                        saveItems(STORAGE_KEYS.deadlines, deadlines);
                    }
                    if (scheduleResult.added === 0 && deadlineResult.added === 0) {
                        setAutomationStatus('Canvas items are already up to date.', 'info');
                        return;
                    }
                    renderAll();
                    setAutomationStatus(`Added ${scheduleResult.added} schedule(s) and ${deadlineResult.added} deadline(s) from Canvas.`, 'success');
                } catch (error) {
                    console.error('Canvas sync failed', error);
                    setAutomationStatus(error.message || 'Canvas sync failed. Check the console for more information.', 'error');
                } finally {
                    if (typedToken && elements.canvasTokenInput) {
                        elements.canvasTokenInput.value = '';
                        elements.canvasTokenInput.placeholder = localStorage.getItem(CANVAS_TOKEN_KEY) ? 'Token stored securely' : 'Paste your token';
                        elements.canvasTokenInput.type = 'password';
                        if (elements.toggleTokenVisibilityButton) {
                            elements.toggleTokenVisibilityButton.textContent = 'Show';
                        }
                    }
                }
            }

            async function fetchCanvasEvents(baseUrl, token) {
                const windowStart = new Date();
                windowStart.setDate(windowStart.getDate() - 3);
                const windowEnd = new Date();
                windowEnd.setDate(windowEnd.getDate() + 30);
                const proxyPayload = {
                    baseUrl,
                    token,
                    startDate: windowStart.toISOString(),
                    endDate: windowEnd.toISOString()
                };
                const proxied = await fetchCanvasEventsViaProxy(proxyPayload);
                if (proxied) {
                    return proxied;
                }
                return fetchCanvasEventsDirect(baseUrl, token, windowStart, windowEnd);
            }

            async function fetchCanvasEventsViaProxy(payload) {
                try {
                    const response = await fetch('php/api.php?endpoint=canvas-events', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    if (response.status === 404) {
                        return null;
                    }
                    if (response.status === 405) {
                        throw new Error('Canvas Sync requires a backend server. This feature is not available in the standalone app version unless hosted.');
                    }
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Canvas proxy responded with ${response.status}: ${errorText.slice(0, 160)}`);
                    }
                    const json = await response.json();
                    if (!json.success) {
                        throw new Error(json.error || 'Canvas proxy returned an unknown error.');
                    }
                    return json.data;
                } catch (error) {
                    if (error.name === 'TypeError') {
                        console.warn('Canvas proxy unavailable, falling back to browser request.', error);
                        return null;
                    }
                    throw error;
                }
            }

            async function fetchCanvasEventsDirect(baseUrl, token, windowStart, windowEnd) {
                const url = new URL('/api/v1/calendar_events', baseUrl);
                url.searchParams.set('start_date', windowStart.toISOString());
                url.searchParams.set('end_date', windowEnd.toISOString());
                url.searchParams.set('per_page', '100');
                url.searchParams.append('include[]', 'assignment');
                try {
                    const response = await fetch(url.toString(), {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorBody = await response.text();
                        throw new Error(`Canvas responded with ${response.status}: ${errorBody.slice(0, 120)}`);
                    }
                    return response.json();
                } catch (error) {
                    if (error.name === 'TypeError') {
                        throw new Error('Canvas blocked the browser request (likely due to CORS). Serve this app via a PHP server so the built-in proxy can relay the request.');
                    }
                    throw error;
                }
            }

            function mapCanvasEvents(events) {
                const schedules = [];
                const deadlines = [];
                events.forEach(event => {
                    const title = stripHtml(event.title || (event.assignment && event.assignment.name) || 'Canvas Event');
                    const description = stripHtml(event.description || (event.assignment && event.assignment.description) || '');
                    const link = event.html_url || (event.assignment && event.assignment.html_url) || '';
                    const location = stripHtml(event.location_name || '');
                    const sourceId = event.id ? `canvas:${event.id}` : generateId();

                    if (event.assignment && event.assignment.due_at) {
                        const dueDate = new Date(event.assignment.due_at);
                        deadlines.push({
                            id: generateId(),
                            name: title,
                            date: formatDateForStorage(dueDate),
                            time: formatTimeFromDate(dueDate),
                            description,
                            link,
                            source: 'canvas',
                            sourceId
                        });
                        return;
                    }

                    const start = event.start_at ? new Date(event.start_at) : event.all_day_date ? new Date(event.all_day_date) : null;
                    if (!start || Number.isNaN(start.getTime())) {
                        return;
                    }

                    if (event.all_day || event.all_day_date) {
                        deadlines.push({
                            id: generateId(),
                            name: title,
                            date: formatDateForStorage(start),
                            time: '09:00',
                            description,
                            link,
                            source: 'canvas',
                            sourceId
                        });
                        return;
                    }

                    const end = event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 60 * 60 * 1000);
                    schedules.push({
                        id: generateId(),
                        name: title,
                        type: 'other',
                        date: formatDateForStorage(start),
                        startTime: formatTimeFromDate(start),
                        endTime: formatTimeFromDate(end),
                        location,
                        description,
                        link,
                        source: 'canvas',
                        sourceId
                    });
                });
                return { schedules, deadlines };
            }

            function maybeShowDailyReminder() {
                if (!elements.dailyReminderModal || !elements.dailyReminderList) {
                    return;
                }
                const todayKey = formatDateForStorage(state.today);
                if (localStorage.getItem(DAILY_REMINDER_KEY) === todayKey) {
                    return;
                }
                const summaryItems = buildReminderSummary(todayKey);
                if (summaryItems.length === 0) {
                    return;
                }
                elements.dailyReminderList.innerHTML = summaryItems.map(item => `<li class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">${item}</li>`).join('');
                elements.dailyReminderModal.classList.remove('hidden');
            }

            function initNotificationLoop() {
                if (!('Notification' in window)) {
                    return;
                }

                if (Notification.permission === 'default') {
                    const requestOnce = () => {
                        Notification.requestPermission().finally(() => {
                            document.removeEventListener('click', requestOnce);
                        });
                    };
                    document.addEventListener('click', requestOnce, { once: true });
                }

                const runChecks = () => {
                    if (Notification.permission !== 'granted') {
                        return;
                    }
                    sendDailyBriefingIfNeeded();
                };

                const loop = () => {
                    runChecks();
                    const now = Date.now();
                    const msUntilNextSecond = 1000 - (now % 1000);
                    setTimeout(loop, msUntilNextSecond);
                };

                setTimeout(loop, 500);
            }

            function sendDailyBriefingIfNeeded() {
                const settings = JSON.parse(localStorage.getItem('calendar_settings') || '{}');
                if (!settings.dailyBriefingEnabled || !settings.dailyBriefingTime) {
                    return;
                }

                const now = new Date();
                const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const seconds = now.getSeconds();
                const withinSendWindow = seconds >= 0 && seconds <= 3;
                if (settings.dailyBriefingTime !== currentTime || !withinSendWindow) {
                    return;
                }

                const todayKey = formatDateForStorage(now);
                const sentKey = `${todayKey}|${currentTime}`;
                if (localStorage.getItem(DAILY_BRIEFING_SENT_KEY) === sentKey) {
                    return;
                }

                const schedulesToday = getSchedules().filter(item => item.date === todayKey);
                const deadlinesToday = getDeadlines().filter(item => item.date === todayKey);
                const todosToday = getTodos().filter(item => item.date === todayKey && !item.completed);

                const upcomingDeadlines = getDeadlines().filter(item => {
                    const delta = daysBetween(new Date(item.date), normaliseDate(now));
                    return delta > 0 && delta <= 3;
                });

                const summaryLines = [];
                const totalToday = schedulesToday.length + deadlinesToday.length + todosToday.length;
                summaryLines.push(`Today you have ${totalToday} item${totalToday === 1 ? '' : 's'}.`);

                if (schedulesToday.length) {
                    summaryLines.push(`Schedules: ${schedulesToday.map(item => item.name || item.title).slice(0, 3).join(', ')}`);
                }

                if (deadlinesToday.length) {
                    summaryLines.push(`Deadlines today: ${deadlinesToday.map(item => item.name || item.title).join(', ')}`);
                }

                if (upcomingDeadlines.length) {
                    const soonList = upcomingDeadlines.map(item => {
                        const label = item.name || item.title || 'Deadline';
                        return `${label} (${formatReadableDate(item.date)})`;
                    });
                    summaryLines.push(`Due soon: ${soonList.join(', ')}`);
                }

                const body = summaryLines.filter(Boolean).join('\n') || 'No planned items for today.';
                dispatchNotification('Daily Schedule Briefing', {
                    body,
                    icon: 'assets/icons/icon.svg',
                    tag: `daily-briefing-${todayKey}`,
                    requireInteraction: true
                });

                localStorage.setItem(DAILY_BRIEFING_SENT_KEY, sentKey);
            }

            function dispatchNotification(title, options) {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready
                        .then(reg => reg.showNotification(title, options))
                        .catch(() => {
                            new Notification(title, options);
                        });
                    return;
                }

                new Notification(title, options);
            }

            function closeDailyReminder(markComplete = true) {
                if (!elements.dailyReminderModal) {
                    return;
                }
                elements.dailyReminderModal.classList.add('hidden');
                if (markComplete) {
                    localStorage.setItem(DAILY_REMINDER_KEY, formatDateForStorage(state.today));
                }
            }

            function buildReminderSummary(todayKey) {
                const todayDate = new Date(todayKey);
                const scheduleCount = getSchedules().filter(schedule => schedule.date === todayKey).length;
                const pendingTodos = getTodos().filter(todo => todo.date === todayKey && !todo.completed).length;
                const urgentDeadlines = getDeadlines().filter(deadline => {
                    const delta = daysBetween(new Date(deadline.date), todayDate);
                    return delta >= 0 && delta <= REMINDER_LOOKAHEAD_DAYS;
                });
                const messages = [];
                if (scheduleCount) {
                    messages.push(`${scheduleCount} schedule ${scheduleCount === 1 ? 'item is' : 'items are'} planned for today.`);
                }
                if (pendingTodos) {
                    messages.push(`${pendingTodos} to-do ${pendingTodos === 1 ? 'item still needs' : 'items still need'} attention today.`);
                }
                if (urgentDeadlines.length) {
                    const windowLabel = REMINDER_LOOKAHEAD_DAYS === 0 ? 'day' : `${REMINDER_LOOKAHEAD_DAYS + 1} days`;
                    messages.push(`${urgentDeadlines.length} deadline${urgentDeadlines.length === 1 ? ' is' : 's are'} due within the next ${windowLabel}.`);
                }
                return messages;
            }
        });

        function initialiseTheme(bodyElement, toggleButton) {
            const rootElement = document.documentElement;
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            const setTheme = (isDark) => {
                [rootElement, bodyElement].forEach(element => {
                    if (!element) {
                        return;
                    }
                    element.classList.toggle('dark', isDark);
                });
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            };

            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                setTheme(true);
            } else {
                setTheme(false);
            }

            if (!toggleButton) {
                return;
            }

            toggleButton.addEventListener('click', () => {
                const nextIsDark = !rootElement.classList.contains('dark');
                setTheme(nextIsDark);
            });
        }

        function initialiseNavigation(button, menu) {
            button.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
        }

        function ensureSeedData() {
            migrateLegacySchedules();
            const alreadySeeded = localStorage.getItem(DATA_SEEDED_FLAG) === 'true';
            const schedules = getSchedules();
            const deadlines = getDeadlines();
            const todos = getTodos();
            const hasAnyData = schedules.length > 0 || deadlines.length > 0 || todos.length > 0;
            if (alreadySeeded || hasAnyData) {
                return;
            }
            saveItems(STORAGE_KEYS.schedules, createSampleSchedules());
            saveItems(STORAGE_KEYS.deadlines, createSampleDeadlines());
            saveItems(STORAGE_KEYS.todos, createSampleTodos());
            localStorage.setItem(DATA_SEEDED_FLAG, 'true');
        }

        function migrateLegacySchedules() {
            const legacy = localStorage.getItem(STORAGE_KEYS.legacyTasks);
            if (!legacy || localStorage.getItem(STORAGE_KEYS.schedules)) {
                return;
            }
            try {
                const parsed = JSON.parse(legacy);
                if (Array.isArray(parsed)) {
                    saveItems(STORAGE_KEYS.schedules, parsed.map(task => ({
                        id: task.id || generateId(),
                        name: task.name || task.title || 'Untitled',
                        type: task.type || 'other',
                        date: task.date,
                        startTime: task.startTime || '09:00',
                        endTime: task.endTime || '10:00',
                        location: task.location || '',
                        description: task.description || '',
                        link: task.link || ''
                    })));
                }
            } catch (error) {
                console.warn('Failed to migrate legacy tasks', error);
            }
        }

        function createSampleSchedules() {
            const today = normaliseDate(new Date());
            const tomorrow = normaliseDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
            return [
                {
                    id: generateId(),
                    name: 'Introduction to Computer Science',
                    type: 'lecture',
                    date: formatDateForStorage(today),
                    startTime: '09:00',
                    endTime: '11:00',
                    location: 'Main Hall, Building A',
                    description: 'Kick-off lecture covering semester overview and core concepts.',
                    link: 'https://example.com/lecture1'
                },
                {
                    id: generateId(),
                    name: 'Programming Basics Tutorial',
                    type: 'tutorial',
                    date: formatDateForStorage(today),
                    startTime: '12:30',
                    endTime: '14:00',
                    location: 'Computer Lab, Building B',
                    description: 'Hands-on session for programming fundamentals.',
                    link: ''
                },
                {
                    id: generateId(),
                    name: 'Project Discussion Meeting',
                    type: 'meeting',
                    date: formatDateForStorage(today),
                    startTime: '15:30',
                    endTime: '16:30',
                    location: 'Conference Room, Building C',
                    description: 'Align deliverables and next steps with the project team.',
                    link: ''
                },
                {
                    id: generateId(),
                    name: 'Data Structures Lecture',
                    type: 'lecture',
                    date: formatDateForStorage(tomorrow),
                    startTime: '10:00',
                    endTime: '12:00',
                    location: 'Main Hall, Building A',
                    description: 'In-depth session on arrays, linked lists, and trees.',
                    link: ''
                }
            ];
        }

        function createSampleDeadlines() {
            const today = normaliseDate(new Date());
            const twoDaysLater = normaliseDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2));
            return [
                {
                    id: generateId(),
                    name: 'Data Structures Assignment',
                    date: formatDateForStorage(today),
                    time: '23:59',
                    description: 'Submit linked list implementation and analysis.',
                    link: 'https://example.com/assignment'
                },
                {
                    id: generateId(),
                    name: 'Midterm Registration',
                    date: formatDateForStorage(twoDaysLater),
                    time: '18:00',
                    description: 'Final day to register for midterm examination slots.',
                    link: ''
                }
            ];
        }

        function createSampleTodos() {
            const today = formatDateForStorage(normaliseDate(new Date()));
            return [
                {
                    id: generateId(),
                    title: 'Review lecture notes',
                    notes: 'Focus on recursion walkthrough.',
                    date: today,
                    completed: false,
                    completedAt: null
                },
                {
                    id: generateId(),
                    title: 'Plan project outline',
                    notes: 'Draft milestones before Friday stand-up.',
                    date: today,
                    completed: false,
                    completedAt: null
                }
            ];
        }

        function getSchedules() {
            return loadItems(STORAGE_KEYS.schedules);
        }

        function getDeadlines() {
            return loadItems(STORAGE_KEYS.deadlines);
        }

        function getTodos() {
            return loadItems(STORAGE_KEYS.todos);
        }

        function loadItems(key) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : [];
            } catch (error) {
                console.warn('Failed to load data for', key, error);
                return [];
            }
        }

        function saveItems(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }

        function normaliseDate(date) {
            const instance = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            instance.setHours(0, 0, 0, 0);
            return instance;
        }

        function formatDateForStorage(date) {
            if (typeof date === 'string') {
                return date;
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function formatReadableDate(date) {
            if (typeof date === 'string') {
                return formatReadableDate(new Date(date));
            }
            return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        }

        function formatHour(hour) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const display = hour % 12 === 0 ? 12 : hour % 12;
            return `${display}:00 ${period}`;
        }

        function isSameDay(a, b) {
            return formatDateForStorage(a) === formatDateForStorage(b);
        }

        function generateId() {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        }

        function hexToRgb(hex) {
            const sanitized = hex.replace('#', '');
            const bigint = parseInt(sanitized, 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        }

        function mergeItems(existing, incoming, signatureBuilder) {
            const seen = new Set(existing.map(item => signatureBuilder(item)));
            let added = 0;
            incoming.forEach(item => {
                const signature = signatureBuilder(item);
                if (seen.has(signature)) {
                    return;
                }
                seen.add(signature);
                existing.push(item);
                added += 1;
            });
            return { added };
        }

        function isDeadlineInPast(deadline) {
            if (!deadline || !deadline.date) {
                return false;
            }
            const timePart = deadline.time && deadline.time.trim() ? deadline.time : '23:59';
            const deadlineMoment = new Date(`${deadline.date}T${timePart}`);
            if (Number.isNaN(deadlineMoment.getTime())) {
                return false;
            }
            return deadlineMoment < new Date();
        }

        function disableCanvasCredentials() {
            localStorage.removeItem(CANVAS_BASE_URL_KEY);
            localStorage.removeItem(CANVAS_TOKEN_KEY);
        }

        function getScheduleSignature(item) {
            if (item.source && item.sourceId) {
                return `${item.source}:${item.sourceId}`;
            }
            return `${item.name}|${item.date}|${item.startTime}|${item.endTime}`;
        }

        function getDeadlineSignature(item) {
            if (item.source && item.sourceId) {
                return `${item.source}:${item.sourceId}`;
            }
            return `${item.name}|${item.date}|${item.time}`;
        }

        function getTodoSignature(item) {
            if (item.source && item.sourceId) {
                return `${item.source}:${item.sourceId}`;
            }
            return `${item.title}|${item.date}|${item.notes || ''}`;
        }

        function parseIcsComponents(rawText) {
            if (!rawText) {
                return [];
            }
            const unfolded = rawText.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
            const lines = unfolded.split(/\n+/);
            const stack = [];
            const components = [];
            lines.forEach(line => {
                if (!line) {
                    return;
                }
                if (line.startsWith('BEGIN:')) {
                    const type = line.slice(6).toUpperCase();
                    if (type === 'VEVENT' || type === 'VTODO') {
                        stack.push({ type, data: { component: type } });
                    } else if (stack.length) {
                        stack.push({ type, data: null });
                    }
                    return;
                }
                if (line.startsWith('END:')) {
                    const type = line.slice(4).toUpperCase();
                    while (stack.length) {
                        const current = stack.pop();
                        if (current.type === type) {
                            if (current.data) {
                                components.push(current.data);
                            }
                            break;
                        }
                    }
                    return;
                }
                const current = stack[stack.length - 1];
                if (!current || !current.data) {
                    return;
                }
                const separatorIndex = line.indexOf(':');
                if (separatorIndex === -1) {
                    return;
                }
                const keyPart = line.slice(0, separatorIndex);
                const value = line.slice(separatorIndex + 1);
                const key = keyPart.split(';')[0].toUpperCase();
                current.data[key] = value;
            });
            return components;
        }

        function convertIcsComponentsToItems(components) {
            const schedules = [];
            const deadlines = [];
            const todos = [];
            components.forEach(component => {
                if (component.component === 'VEVENT') {
                    const summary = decodeIcsText(component.SUMMARY || 'Untitled Event');
                    const description = stripHtml(decodeIcsText(component.DESCRIPTION || ''));
                    const location = decodeIcsText(component.LOCATION || '');
                    const link = decodeIcsText(component.URL || '');
                    const uid = component.UID || component['X-WR-UID'] || `${summary}-${component.DTSTART || ''}`;
                    const start = parseIcsDate(component.DTSTART);
                    const end = parseIcsDate(component.DTEND) || start;
                    if (!start) {
                        return;
                    }
                    const dtStartRaw = component.DTSTART || '';
                    const isAllDay = dtStartRaw.length === 8 && !dtStartRaw.includes('T');
                    const kindOverride = (component[ICS_KIND_FIELD] || '').toUpperCase();
                    const treatAsDeadline = kindOverride === ICS_KIND.deadline || (!kindOverride && isAllDay);
                    if (treatAsDeadline) {
                        deadlines.push({
                            id: generateId(),
                            name: summary,
                            date: formatDateForStorage(start),
                            time: isAllDay ? '23:59' : formatTimeFromDate(start),
                            description,
                            link,
                            source: 'ics',
                            sourceId: uid
                        });
                        return;
                    }
                    schedules.push({
                        id: generateId(),
                        name: summary,
                        type: 'other',
                        date: formatDateForStorage(start),
                        startTime: formatTimeFromDate(start),
                        endTime: formatTimeFromDate(end || start),
                        location,
                        description,
                        link,
                        source: 'ics',
                        sourceId: uid
                    });
                    return;
                }
                if (component.component === 'VTODO') {
                    const summary = decodeIcsText(component.SUMMARY || 'To-Do');
                    const notes = stripHtml(decodeIcsText(component.DESCRIPTION || ''));
                    const uid = component.UID || `${summary}-${component.DUE || ''}`;
                    const due = parseIcsDate(component.DUE) || parseIcsDate(component.DTSTART) || new Date();
                    const completedAtDate = parseIcsDate(component.COMPLETED);
                    const status = (component.STATUS || '').toUpperCase();
                    todos.push({
                        id: generateId(),
                        title: summary,
                        notes,
                        date: formatDateForStorage(due),
                        completed: status === 'COMPLETED',
                        completedAt: completedAtDate ? completedAtDate.getTime() : null,
                        source: 'ics',
                        sourceId: uid
                    });
                }
            });
            return { schedules, deadlines, todos };
        }

        function buildIcsExport({ schedules = [], deadlines = [], todos = [] }) {
            const stamp = formatDateTimeForICS(new Date());
            const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CalendarWeb//EN'];
            schedules.forEach(schedule => {
                lines.push(...createScheduleEventLines(schedule, stamp));
            });
            deadlines.forEach(deadline => {
                lines.push(...createDeadlineEventLines(deadline, stamp));
            });
            todos.forEach(todo => {
                lines.push(...createTodoLines(todo, stamp));
            });
            lines.push('END:VCALENDAR');
            return lines.map(foldIcsLine).join('\r\n');
        }

        function createScheduleEventLines(schedule, stamp) {
            const start = combineDateTime(schedule.date, schedule.startTime || '09:00');
            const end = combineDateTime(schedule.date, schedule.endTime || schedule.startTime || '10:00') || start;
            return [
                'BEGIN:VEVENT',
                `UID:schedule-${schedule.id || generateId()}`,
                `DTSTAMP:${stamp}`,
                start ? `DTSTART:${formatDateTimeForICS(start)}` : null,
                end ? `DTEND:${formatDateTimeForICS(end)}` : null,
                `SUMMARY:${escapeIcsText(schedule.name || 'Schedule Item')}`,
                `${ICS_KIND_FIELD}:${ICS_KIND.schedule}`,
                schedule.location ? `LOCATION:${escapeIcsText(schedule.location)}` : null,
                schedule.description ? `DESCRIPTION:${escapeIcsText(schedule.description)}` : null,
                schedule.link ? `URL:${escapeIcsText(schedule.link)}` : null,
                'END:VEVENT'
            ].filter(Boolean);
        }

        function createDeadlineEventLines(deadline, stamp) {
            const start = combineDateTime(deadline.date, deadline.time || '23:59');
            const end = start ? addMinutes(start, 30) : null;
            return [
                'BEGIN:VEVENT',
                `UID:deadline-${deadline.id || generateId()}`,
                `DTSTAMP:${stamp}`,
                start ? `DTSTART:${formatDateTimeForICS(start)}` : null,
                end ? `DTEND:${formatDateTimeForICS(end)}` : null,
                `SUMMARY:${escapeIcsText(deadline.name || 'Deadline')}`,
                `${ICS_KIND_FIELD}:${ICS_KIND.deadline}`,
                deadline.description ? `DESCRIPTION:${escapeIcsText(deadline.description)}` : null,
                deadline.link ? `URL:${escapeIcsText(deadline.link)}` : null,
                'END:VEVENT'
            ].filter(Boolean);
        }

        function createTodoLines(todo, stamp) {
            const dueDate = parseLocalDateString(todo.date);
            return [
                'BEGIN:VTODO',
                `UID:todo-${todo.id || generateId()}`,
                `DTSTAMP:${stamp}`,
                dueDate ? `DUE;VALUE=DATE:${formatDateForICS(dueDate)}` : null,
                `SUMMARY:${escapeIcsText(todo.title || 'To-Do')}`,
                `${ICS_KIND_FIELD}:${ICS_KIND.todo}`,
                todo.notes ? `DESCRIPTION:${escapeIcsText(todo.notes)}` : null,
                todo.completed ? 'STATUS:COMPLETED' : 'STATUS:NEEDS-ACTION',
                todo.completed && todo.completedAt ? `COMPLETED:${formatDateTimeForICS(new Date(todo.completedAt))}` : null,
                'END:VTODO'
            ].filter(Boolean);
        }

        function formatDateTimeForICS(date) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
                return formatDateTimeForICS(new Date());
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        }

        function formatDateForICS(date) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
                return formatDateForICS(new Date());
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }

        function escapeIcsText(value = '') {
            return value
                .replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/\r?\n/g, '\\n');
        }

        function foldIcsLine(line) {
            const chunkSize = 74;
            if (!line || line.length <= chunkSize) {
                return line || '';
            }
            const parts = [];
            for (let i = 0; i < line.length; i += chunkSize) {
                const chunk = line.slice(i, i + chunkSize);
                parts.push(i === 0 ? chunk : ` ${chunk}`);
            }
            return parts.join('\r\n');
        }

        function combineDateTime(dateString, timeString) {
            const base = parseLocalDateString(dateString);
            if (!base) {
                return null;
            }
            const [hours = '00', minutes = '00'] = (timeString || '00:00').split(':');
            base.setHours(Number(hours), Number(minutes), 0, 0);
            return base;
        }

        function addMinutes(date, minutes) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
                return null;
            }
            return new Date(date.getTime() + minutes * 60000);
        }

        function createCalendarDateSelector({ hiddenInputId, listContainerId, pickerContainerId, toneSetter = () => {}, emptyMessage = 'No dates selected yet.' }) {
            const hiddenInput = document.getElementById(hiddenInputId);
            const listContainer = document.getElementById(listContainerId);
            const pickerContainer = document.getElementById(pickerContainerId);
            const today = normaliseDate(new Date());
            const state = {
                dates: [],
                view: new Date(today.getFullYear(), today.getMonth(), 1)
            };

            const updateHiddenInput = () => {
                if (hiddenInput) {
                    hiddenInput.value = JSON.stringify(state.dates);
                }
            };

            const setViewForDate = (dateInput) => {
                const parsed = typeof dateInput === 'string' ? parseLocalDateString(dateInput) : dateInput;
                if (!parsed || Number.isNaN(parsed.getTime())) {
                    return;
                }
                state.view = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
            };

            const renderSelected = () => {
                if (!listContainer) {
                    return;
                }
                if (!state.dates.length) {
                    listContainer.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400">${emptyMessage}</span>`;
                    return;
                }
                listContainer.innerHTML = '';
                state.dates.forEach(date => {
                    const pill = document.createElement('span');
                    pill.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200';
                    pill.textContent = date;
                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'text-gray-500 hover:text-red-500';
                    removeButton.innerHTML = '&times;';
                    removeButton.setAttribute('data-remove-date', date);
                    removeButton.setAttribute('aria-label', `Remove ${date}`);
                    pill.appendChild(removeButton);
                    listContainer.appendChild(pill);
                });
            };

            const renderPicker = () => {
                if (!pickerContainer) {
                    return;
                }
                pickerContainer.innerHTML = '';
                const wrapper = document.createElement('div');
                wrapper.className = 'mini-date-picker';

                const header = document.createElement('div');
                header.className = 'mini-date-picker__header';
                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.className = 'mini-date-picker__nav-btn';
                prevBtn.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
                prevBtn.addEventListener('click', () => {
                    state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
                    renderPicker();
                });

                const label = document.createElement('span');
                label.className = 'mini-date-picker__label';
                label.textContent = `${MONTH_NAMES[state.view.getMonth()]} ${state.view.getFullYear()}`;

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.className = 'mini-date-picker__nav-btn';
                nextBtn.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
                nextBtn.addEventListener('click', () => {
                    state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
                    renderPicker();
                });

                header.appendChild(prevBtn);
                header.appendChild(label);
                header.appendChild(nextBtn);

                const weekdayRow = document.createElement('div');
                weekdayRow.className = 'mini-date-picker__weekdays';
                ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
                    const span = document.createElement('span');
                    span.textContent = day;
                    weekdayRow.appendChild(span);
                });

                const grid = document.createElement('div');
                grid.className = 'mini-date-picker__grid';
                const firstDayOffset = new Date(state.view.getFullYear(), state.view.getMonth(), 1).getDay();
                const daysInMonth = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 0).getDate();
                for (let i = 0; i < firstDayOffset; i += 1) {
                    const placeholder = document.createElement('span');
                    grid.appendChild(placeholder);
                }
                const todayValue = formatDateForStorage(normaliseDate(new Date()));
                for (let day = 1; day <= daysInMonth; day += 1) {
                    const date = new Date(state.view.getFullYear(), state.view.getMonth(), day);
                    const dateValue = formatDateForStorage(date);
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'mini-date-picker__day';
                    if (state.dates.includes(dateValue)) {
                        button.classList.add('is-selected');
                        button.setAttribute('aria-pressed', 'true');
                    } else {
                        button.setAttribute('aria-pressed', 'false');
                    }
                    if (dateValue === todayValue) {
                        button.classList.add('is-today');
                    }
                    button.textContent = day;
                    button.title = `Toggle ${formatReadableDate(date)}`;
                    button.addEventListener('click', () => {
                        toggleDate(dateValue);
                    });
                    grid.appendChild(button);
                }

                wrapper.appendChild(header);
                wrapper.appendChild(weekdayRow);
                wrapper.appendChild(grid);
                pickerContainer.appendChild(wrapper);
            };

            const setDates = (dates = [], anchorDate = null) => {
                state.dates = dedupeAndSortDates(dates);
                updateHiddenInput();
                if (anchorDate) {
                    setViewForDate(anchorDate);
                } else if (state.dates.length) {
                    setViewForDate(state.dates[0]);
                }
                renderSelected();
                renderPicker();
            };

            const toggleDate = (dateValue) => {
                if (!dateValue) {
                    return;
                }
                if (state.dates.includes(dateValue)) {
                    state.dates = state.dates.filter(date => date !== dateValue);
                } else {
                    state.dates = dedupeAndSortDates([...state.dates, dateValue]);
                }
                updateHiddenInput();
                renderSelected();
                renderPicker();
            };

            if (listContainer) {
                listContainer.addEventListener('click', event => {
                    const target = event.target.closest('[data-remove-date]');
                    if (!target) {
                        return;
                    }
                    const dateToRemove = target.getAttribute('data-remove-date');
                    if (!dateToRemove) {
                        return;
                    }
                    state.dates = state.dates.filter(date => date !== dateToRemove);
                    updateHiddenInput();
                    renderSelected();
                    renderPicker();
                });
            }

            setDates([]);

            return {
                setDates,
                getDates: () => state.dates.slice()
            };
        }

        function dedupeAndSortDates(dates = []) {
            return Array.from(new Set((dates || []).filter(Boolean))).sort();
        }

        function parseLocalDateString(dateString) {
            if (!dateString) {
                return null;
            }
            const [year, month, day] = dateString.split('-').map(Number);
            if (!year || !month || !day) {
                return null;
            }
            return new Date(year, month - 1, day);
        }

        function parseIcsDate(value) {
            if (!value) {
                return null;
            }
            const cleaned = value.trim();
            if (/^\d{8}$/.test(cleaned)) {
                const year = Number(cleaned.slice(0, 4));
                const month = Number(cleaned.slice(4, 6));
                const day = Number(cleaned.slice(6, 8));
                return new Date(year, month - 1, day);
            }
            if (/^\d{8}T\d{6}Z?$/.test(cleaned)) {
                const year = Number(cleaned.slice(0, 4));
                const month = Number(cleaned.slice(4, 6));
                const day = Number(cleaned.slice(6, 8));
                const hour = Number(cleaned.slice(9, 11));
                const minute = Number(cleaned.slice(11, 13));
                const second = Number(cleaned.slice(13, 15));
                if (cleaned.endsWith('Z')) {
                    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
                }
                return new Date(year, month - 1, day, hour, minute, second);
            }
            const parsed = new Date(cleaned);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        function formatTimeFromDate(date) {
            if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
                return '00:00';
            }
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        function decodeIcsText(value = '') {
            return value
                .replace(/\\n/g, '\n')
                .replace(/\\,/g, ',')
                .replace(/\\;/g, ';')
                .replace(/\\\\/g, '\\')
                .trim();
        }

        function stripHtml(value = '') {
            const temp = document.createElement('div');
            temp.innerHTML = value;
            return temp.textContent || temp.innerText || '';
        }

        function daysBetween(dateA, dateB) {
            if (!(dateA instanceof Date) || Number.isNaN(dateA.getTime()) || !(dateB instanceof Date) || Number.isNaN(dateB.getTime())) {
                return 0;
            }
            const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
            const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
            const MS_PER_DAY = 24 * 60 * 60 * 1000;
            return Math.floor((utcA - utcB) / MS_PER_DAY);
        }
