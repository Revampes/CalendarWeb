// CalendarWeb - Calendar Page JavaScript
// Handles calendar rendering, task/deadline management, and UI interactions

// State management
const CalendarState = {
    currentDate: new Date(),
    selectedDate: new Date(),
    currentView: 'month'
};

// Initialize calendar page
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners
    initCalendarControls();
    initTaskButtons();
    initModalForms();
    
    // Initial render
    renderCalendar();
    renderTasksForSelectedDate();
    renderDeadlines();
    renderDailySchedule();
    renderTodaySummary();
});

// Initialize calendar navigation controls
function initCalendarControls() {
    const prevButton = document.getElementById('prev-month');
    const nextButton = document.getElementById('next-month');
    const todayButton = document.getElementById('today-btn');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            CalendarState.currentDate.setMonth(CalendarState.currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            CalendarState.currentDate.setMonth(CalendarState.currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    if (todayButton) {
        todayButton.addEventListener('click', () => {
            CalendarState.currentDate = new Date();
            CalendarState.selectedDate = new Date();
            renderCalendar();
            renderTasksForSelectedDate();
            renderDailySchedule();
            renderTodaySummary();
        });
    }
}

// Initialize task/deadline buttons
function initTaskButtons() {
    const addTaskButton = document.getElementById('add-task-btn');
    const addDeadlineButton = document.getElementById('add-deadline-btn');
    
    if (addTaskButton) {
        addTaskButton.addEventListener('click', openAddTaskModal);
    }
    
    if (addDeadlineButton) {
        addDeadlineButton.addEventListener('click', openAddDeadlineModal);
    }
}

// Initialize modal forms
function initModalForms() {
    // Add Task Form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }
    
    // Add Deadline Form
    const addDeadlineForm = document.getElementById('add-deadline-form');
    if (addDeadlineForm) {
        addDeadlineForm.addEventListener('submit', handleAddDeadline);
    }
    
    // Edit Task Form
    const editTaskForm = document.getElementById('edit-task-form');
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', handleEditTask);
    }
    
    // Edit Deadline Form
    const editDeadlineForm = document.getElementById('edit-deadline-form');
    if (editDeadlineForm) {
        editDeadlineForm.addEventListener('submit', handleEditDeadline);
    }
    
    // Delete buttons
    const deleteTaskBtn = document.getElementById('delete-task-btn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', handleDeleteTask);
    }
    
    const deleteDeadlineBtn = document.getElementById('delete-deadline-btn');
    if (deleteDeadlineBtn) {
        deleteDeadlineBtn.addEventListener('click', handleDeleteDeadline);
    }
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.modal-close, .btn-cancel');
    closeButtons.forEach(button => {
        button.addEventListener('click', CalendarApp.closeAllModals);
    });
}

// Render monthly calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    
    if (!calendarGrid || !currentMonthElement) return;
    
    const year = CalendarState.currentDate.getFullYear();
    const month = CalendarState.currentDate.getMonth();
    
    // Update month display
    currentMonthElement.textContent = `${CalendarApp.getMonthName(month)} ${year}`;
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Get calendar data
    const firstDay = CalendarApp.getFirstDayOfMonth(year, month);
    const daysInMonth = CalendarApp.getDaysInMonth(year, month);
    const daysInPrevMonth = CalendarApp.getDaysInMonth(year, month - 1);
    
    const tasks = CalendarApp.Storage.getTasks();
    const deadlines = CalendarApp.Storage.getDeadlines();
    
    // Add days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const cell = createCalendarDayCell(year, month - 1, day, true);
        calendarGrid.appendChild(cell);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = createCalendarDayCell(year, month, day, false);
        calendarGrid.appendChild(cell);
    }
    
    // Add days from next month
    const totalCells = calendarGrid.children.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createCalendarDayCell(year, month + 1, day, true);
        calendarGrid.appendChild(cell);
    }
}

// Create a calendar day cell
function createCalendarDayCell(year, month, day, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    
    const date = new Date(year, month, day);
    const dateString = CalendarApp.formatDateForStorage(date);
    
    // Add classes
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }
    
    if (CalendarApp.isToday(date)) {
        cell.classList.add('today');
    }
    
    if (CalendarApp.isSameDate(date, CalendarState.selectedDate)) {
        cell.classList.add('selected');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);
    
    // Task/deadline indicators
    const tasks = CalendarApp.Storage.getTasksForDate(dateString);
    const deadlines = CalendarApp.Storage.getDeadlinesForDate(dateString);
    
    if (tasks.length > 0 || deadlines.length > 0) {
        const indicators = document.createElement('div');
        indicators.className = 'day-indicators';
        
        // Show first 3 task indicators
        tasks.slice(0, 3).forEach(task => {
            const dot = document.createElement('span');
            dot.className = `task-dot ${task.type}`;
            indicators.appendChild(dot);
        });
        
        // Show deadline indicators
        deadlines.slice(0, 2).forEach(() => {
            const dot = document.createElement('span');
            dot.className = 'task-dot assignment';
            indicators.appendChild(dot);
        });
        
        // Show count if more items
        const totalCount = tasks.length + deadlines.length;
        if (totalCount > 5) {
            const more = document.createElement('span');
            more.textContent = `+${totalCount - 5}`;
            more.style.fontSize = '0.625rem';
            more.style.color = 'var(--text-muted)';
            indicators.appendChild(more);
        }
        
        cell.appendChild(indicators);
    }
    
    // Click handler
    cell.addEventListener('click', () => {
        CalendarState.selectedDate = date;
        renderCalendar();
        renderTasksForSelectedDate();
        renderDailySchedule();
        renderTodaySummary();
    });
    
    return cell;
}

// Render tasks for selected date
function renderTasksForSelectedDate() {
    const container = document.getElementById('tasks-container');
    const dateDisplay = document.getElementById('selected-date-display');
    
    if (!container || !dateDisplay) return;
    
    const dateString = CalendarApp.formatDateForStorage(CalendarState.selectedDate);
    const tasks = CalendarApp.Storage.getTasksForDate(dateString);
    
    // Update date display
    dateDisplay.textContent = CalendarApp.isToday(CalendarState.selectedDate) ? 
        'Today' : CalendarApp.formatDateShort(CalendarState.selectedDate);
    
    // Clear container
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks scheduled for this day</div>';
        return;
    }
    
    // Sort tasks by start time
    tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Render each task
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        container.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const element = document.createElement('div');
    element.className = `task-item ${task.type}`;
    
    const header = document.createElement('div');
    header.className = 'task-item-header';
    
    const title = document.createElement('div');
    title.className = 'task-item-title';
    
    const dot = document.createElement('span');
    dot.className = `task-dot ${task.type}`;
    
    const name = document.createElement('span');
    name.textContent = task.name;
    
    title.appendChild(dot);
    title.appendChild(name);
    
    const time = document.createElement('div');
    time.className = 'task-item-time';
    time.textContent = `${CalendarApp.formatTimeFromString(task.startTime)} - ${CalendarApp.formatTimeFromString(task.endTime)}`;
    
    header.appendChild(title);
    header.appendChild(time);
    
    element.appendChild(header);
    
    if (task.location) {
        const location = document.createElement('div');
        location.className = 'task-item-location';
        location.textContent = task.location;
        element.appendChild(location);
    }
    
    // Click to edit
    element.addEventListener('click', () => openEditTaskModal(task));
    
    return element;
}

// Render deadlines
function renderDeadlines() {
    const container = document.getElementById('deadlines-container');
    if (!container) return;
    
    const deadlines = CalendarApp.Storage.getDeadlines();
    
    // Clear container
    container.innerHTML = '';
    
    if (deadlines.length === 0) {
        container.innerHTML = '<div class="empty-state">No deadlines scheduled</div>';
        return;
    }
    
    // Sort deadlines by date and time
    deadlines.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });
    
    // Render each deadline
    deadlines.forEach(deadline => {
        const element = createDeadlineElement(deadline);
        container.appendChild(element);
    });
}

// Create deadline element
function createDeadlineElement(deadline) {
    const element = document.createElement('div');
    element.className = 'task-item assignment';
    
    const header = document.createElement('div');
    header.className = 'task-item-header';
    
    const title = document.createElement('div');
    title.className = 'task-item-title';
    
    const dot = document.createElement('span');
    dot.className = 'task-dot assignment';
    
    const name = document.createElement('span');
    name.textContent = deadline.name;
    
    title.appendChild(dot);
    title.appendChild(name);
    
    const datetime = document.createElement('div');
    datetime.className = 'task-item-time';
    datetime.textContent = `${CalendarApp.formatDateShort(deadline.date)} ${CalendarApp.formatTimeFromString(deadline.time)}`;
    
    header.appendChild(title);
    header.appendChild(datetime);
    
    element.appendChild(header);
    
    if (deadline.description) {
        const desc = document.createElement('div');
        desc.className = 'task-item-location';
        desc.textContent = deadline.description;
        element.appendChild(desc);
    }
    
    // Click to edit
    element.addEventListener('click', () => openEditDeadlineModal(deadline));
    
    return element;
}

// Render daily schedule
function renderDailySchedule() {
    const container = document.getElementById('daily-schedule');
    if (!container) return;
    
    const dateString = CalendarApp.formatDateForStorage(CalendarState.selectedDate);
    const tasks = CalendarApp.Storage.getTasksForDate(dateString);
    
    // Clear container
    container.innerHTML = '';
    
    // Create time slots from 6 AM to 10 PM
    for (let hour = 6; hour <= 22; hour++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = CalendarApp.formatTime(hour);
        
        const content = document.createElement('div');
        content.className = 'time-content';
        
        // Find tasks for this hour
        const hourTasks = tasks.filter(task => {
            const taskHour = parseInt(task.startTime.split(':')[0]);
            return taskHour === hour;
        });
        
        hourTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `schedule-task ${task.type}`;
            taskElement.style.backgroundColor = `${CalendarApp.getTaskColor(task.type)}22`;
            taskElement.style.borderLeft = `3px solid ${CalendarApp.getTaskColor(task.type)}`;
            taskElement.style.padding = '0.5rem';
            taskElement.textContent = task.name;
            taskElement.addEventListener('click', () => openEditTaskModal(task));
            content.appendChild(taskElement);
        });
        
        slot.appendChild(label);
        slot.appendChild(content);
        container.appendChild(slot);
    }
}

// Render today's summary
function renderTodaySummary() {
    const tasksContainer = document.getElementById('today-tasks-container');
    const deadlinesContainer = document.getElementById('today-deadlines-container');
    
    if (!tasksContainer || !deadlinesContainer) return;
    
    const today = new Date();
    const todayString = CalendarApp.formatDateForStorage(today);
    
    const tasks = CalendarApp.Storage.getTasksForDate(todayString);
    const deadlines = CalendarApp.Storage.getDeadlinesForDate(todayString);
    
    // Render tasks
    tasksContainer.innerHTML = '';
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state">No tasks for today</div>';
    } else {
        tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
        tasks.forEach(task => {
            const element = createSummaryTaskElement(task);
            tasksContainer.appendChild(element);
        });
    }
    
    // Render deadlines
    deadlinesContainer.innerHTML = '';
    if (deadlines.length === 0) {
        deadlinesContainer.innerHTML = '<div class="empty-state">No deadlines for today</div>';
    } else {
        deadlines.sort((a, b) => a.time.localeCompare(b.time));
        deadlines.forEach(deadline => {
            const element = createSummaryDeadlineElement(deadline);
            deadlinesContainer.appendChild(element);
        });
    }
}

// Create summary task element
function createSummaryTaskElement(task) {
    const element = document.createElement('div');
    element.className = `summary-item task-item ${task.type}`;
    
    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.marginBottom = '0.25rem';
    title.style.color = 'var(--text-primary)';
    title.textContent = task.name;
    
    const time = document.createElement('div');
    time.style.fontSize = '0.75rem';
    time.style.color = 'var(--text-muted)';
    time.textContent = `${CalendarApp.formatTimeFromString(task.startTime)} - ${CalendarApp.formatTimeFromString(task.endTime)}`;
    
    element.appendChild(title);
    element.appendChild(time);
    element.addEventListener('click', () => openEditTaskModal(task));
    
    return element;
}

// Create summary deadline element
function createSummaryDeadlineElement(deadline) {
    const element = document.createElement('div');
    element.className = 'summary-item task-item assignment';
    
    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.marginBottom = '0.25rem';
    title.style.color = 'var(--text-primary)';
    title.textContent = deadline.name;
    
    const time = document.createElement('div');
    time.style.fontSize = '0.75rem';
    time.style.color = 'var(--text-muted)';
    time.textContent = `Due: ${CalendarApp.formatTimeFromString(deadline.time)}`;
    
    element.appendChild(title);
    element.appendChild(time);
    element.addEventListener('click', () => openEditDeadlineModal(deadline));
    
    return element;
}

// Modal functions
function openAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    const form = document.getElementById('add-task-form');
    const dateInput = document.getElementById('task-date-input');
    
    if (!modal || !form) return;
    
    form.reset();
    dateInput.value = CalendarApp.formatDateForStorage(CalendarState.selectedDate);
    modal.classList.remove('hidden');
}

function openAddDeadlineModal() {
    const modal = document.getElementById('add-deadline-modal');
    const form = document.getElementById('add-deadline-form');
    const dateInput = document.getElementById('deadline-date-input');
    
    if (!modal || !form) return;
    
    form.reset();
    dateInput.value = CalendarApp.formatDateForStorage(CalendarState.selectedDate);
    modal.classList.remove('hidden');
}

function openEditTaskModal(task) {
    const modal = document.getElementById('edit-task-modal');
    if (!modal) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-type').value = task.type;
    document.getElementById('edit-task-date').value = task.date;
    document.getElementById('edit-start-time').value = task.startTime;
    document.getElementById('edit-end-time').value = task.endTime;
    document.getElementById('edit-location').value = task.location || '';
    document.getElementById('edit-description').value = task.description || '';
    document.getElementById('edit-link').value = task.link || '';
    
    modal.classList.remove('hidden');
}

function openEditDeadlineModal(deadline) {
    const modal = document.getElementById('edit-deadline-modal');
    if (!modal) return;
    
    document.getElementById('edit-deadline-id').value = deadline.id;
    document.getElementById('edit-deadline-name').value = deadline.name;
    document.getElementById('edit-deadline-date').value = deadline.date;
    document.getElementById('edit-deadline-time').value = deadline.time;
    document.getElementById('edit-deadline-description').value = deadline.description || '';
    document.getElementById('edit-deadline-link').value = deadline.link || '';
    
    modal.classList.remove('hidden');
}

// Form handlers
function handleAddTask(e) {
    e.preventDefault();
    
    const task = {
        name: document.getElementById('task-name').value,
        type: document.getElementById('task-type').value,
        date: document.getElementById('task-date-input').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        link: document.getElementById('link').value
    };
    
    CalendarApp.Storage.addTask(task);
    CalendarApp.closeAllModals();
    refreshAll();
}

function handleAddDeadline(e) {
    e.preventDefault();
    
    const deadline = {
        name: document.getElementById('deadline-name').value,
        date: document.getElementById('deadline-date-input').value,
        time: document.getElementById('deadline-time').value,
        description: document.getElementById('deadline-description').value,
        link: document.getElementById('deadline-link').value
    };
    
    CalendarApp.Storage.addDeadline(deadline);
    CalendarApp.closeAllModals();
    refreshAll();
}

function handleEditTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('edit-task-id').value;
    const updatedTask = {
        name: document.getElementById('edit-task-name').value,
        type: document.getElementById('edit-task-type').value,
        date: document.getElementById('edit-task-date').value,
        startTime: document.getElementById('edit-start-time').value,
        endTime: document.getElementById('edit-end-time').value,
        location: document.getElementById('edit-location').value,
        description: document.getElementById('edit-description').value,
        link: document.getElementById('edit-link').value
    };
    
    CalendarApp.Storage.updateTask(taskId, updatedTask);
    CalendarApp.closeAllModals();
    refreshAll();
}

function handleEditDeadline(e) {
    e.preventDefault();
    
    const deadlineId = document.getElementById('edit-deadline-id').value;
    const updatedDeadline = {
        name: document.getElementById('edit-deadline-name').value,
        date: document.getElementById('edit-deadline-date').value,
        time: document.getElementById('edit-deadline-time').value,
        description: document.getElementById('edit-deadline-description').value,
        link: document.getElementById('edit-deadline-link').value
    };
    
    CalendarApp.Storage.updateDeadline(deadlineId, updatedDeadline);
    CalendarApp.closeAllModals();
    refreshAll();
}

function handleDeleteTask() {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const taskId = document.getElementById('edit-task-id').value;
    CalendarApp.Storage.deleteTask(taskId);
    CalendarApp.closeAllModals();
    refreshAll();
}

function handleDeleteDeadline() {
    if (!confirm('Are you sure you want to delete this deadline?')) return;
    
    const deadlineId = document.getElementById('edit-deadline-id').value;
    CalendarApp.Storage.deleteDeadline(deadlineId);
    CalendarApp.closeAllModals();
    refreshAll();
}

// Refresh all views
function refreshAll() {
    renderCalendar();
    renderTasksForSelectedDate();
    renderDeadlines();
    renderDailySchedule();
    renderTodaySummary();
}
