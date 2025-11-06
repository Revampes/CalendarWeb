// CalendarWeb - Main App JavaScript
// Handles theme management, localStorage, and shared utilities

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initModalHandlers();
});

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark');
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark');
    
    // Save preference to localStorage
    const theme = body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('show');
        });
    }
}

// Modal Handlers
function initModalHandlers() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
}

// LocalStorage Management
const Storage = {
    // Get tasks from localStorage
    getTasks() {
        const tasks = localStorage.getItem('calendar_tasks');
        return tasks ? JSON.parse(tasks) : [];
    },
    
    // Save tasks to localStorage
    saveTasks(tasks) {
        localStorage.setItem('calendar_tasks', JSON.stringify(tasks));
    },
    
    // Get deadlines from localStorage
    getDeadlines() {
        const deadlines = localStorage.getItem('calendar_deadlines');
        return deadlines ? JSON.parse(deadlines) : [];
    },
    
    // Save deadlines to localStorage
    saveDeadlines(deadlines) {
        localStorage.setItem('calendar_deadlines', JSON.stringify(deadlines));
    },
    
    // Add a task
    addTask(task) {
        const tasks = this.getTasks();
        task.id = generateId();
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    },
    
    // Update a task
    updateTask(taskId, updatedData) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedData };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },
    
    // Delete a task
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filtered);
    },
    
    // Add a deadline
    addDeadline(deadline) {
        const deadlines = this.getDeadlines();
        deadline.id = generateId();
        deadlines.push(deadline);
        this.saveDeadlines(deadlines);
        return deadline;
    },
    
    // Update a deadline
    updateDeadline(deadlineId, updatedData) {
        const deadlines = this.getDeadlines();
        const index = deadlines.findIndex(d => d.id === deadlineId);
        if (index !== -1) {
            deadlines[index] = { ...deadlines[index], ...updatedData };
            this.saveDeadlines(deadlines);
            return deadlines[index];
        }
        return null;
    },
    
    // Delete a deadline
    deleteDeadline(deadlineId) {
        const deadlines = this.getDeadlines();
        const filtered = deadlines.filter(d => d.id !== deadlineId);
        this.saveDeadlines(filtered);
    },
    
    // Get tasks for a specific date
    getTasksForDate(date) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.date === date);
    },
    
    // Get deadlines for a specific date
    getDeadlinesForDate(date) {
        const deadlines = this.getDeadlines();
        return deadlines.filter(d => d.date === date);
    }
};

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateShort(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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

function formatTime(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
}

function formatTimeFromString(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${period}`;
}

function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isSameDate(date1, date2) {
    return formatDateForStorage(date1) === formatDateForStorage(date2);
}

// Task Type Colors
const taskColors = {
    lecture: '#3b82f6',
    tutorial: '#10b981',
    training: '#f59e0b',
    meeting: '#8b5cf6',
    assignment: '#ef4444',
    exam: '#ec4899',
    break: '#6366f1',
    other: '#6b7280'
};

function getTaskColor(taskType) {
    return taskColors[taskType] || taskColors.other;
}

// Initialize sample data if none exists
function initSampleData() {
    const tasks = Storage.getTasks();
    const deadlines = Storage.getDeadlines();
    
    // Only add sample data if storage is empty
    if (tasks.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sampleTasks = [
            {
                id: generateId(),
                name: 'Introduction to Computer Science',
                type: 'lecture',
                date: formatDateForStorage(today),
                startTime: '09:00',
                endTime: '11:00',
                location: 'Main Hall, Building A',
                description: 'First lecture of the semester covering basic concepts',
                link: 'https://example.com/lecture1'
            },
            {
                id: generateId(),
                name: 'Programming Basics Tutorial',
                type: 'tutorial',
                date: formatDateForStorage(today),
                startTime: '12:00',
                endTime: '14:00',
                location: 'Computer Lab, Building B',
                description: 'Hands-on session for programming fundamentals',
                link: ''
            },
            {
                id: generateId(),
                name: 'Project Discussion Meeting',
                type: 'meeting',
                date: formatDateForStorage(today),
                startTime: '15:00',
                endTime: '16:00',
                location: 'Conference Room, Building C',
                description: 'Group discussion for the upcoming project',
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
                description: 'Lecture on arrays, linked lists, and trees',
                link: ''
            }
        ];
        
        Storage.saveTasks(sampleTasks);
    }
    
    if (deadlines.length === 0) {
        const today = new Date();
        const twoDaysLater = new Date(today);
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        
        const sampleDeadlines = [
            {
                id: generateId(),
                name: 'Data Structures Assignment',
                date: formatDateForStorage(today),
                time: '23:59',
                description: 'Complete the assignment on linked lists and submit via the portal',
                link: 'https://example.com/assignment1'
            },
            {
                id: generateId(),
                name: 'Midterm Exam Registration',
                date: formatDateForStorage(twoDaysLater),
                time: '18:00',
                description: 'Last day to register for midterm exams',
                link: ''
            }
        ];
        
        Storage.saveDeadlines(sampleDeadlines);
    }
}

// Export for use in other scripts
window.CalendarApp = {
    Storage,
    generateId,
    formatDate,
    formatDateShort,
    formatDateForStorage,
    formatTime,
    formatTimeFromString,
    getMonthName,
    getDaysInMonth,
    getFirstDayOfMonth,
    isToday,
    isSameDate,
    getTaskColor,
    closeAllModals,
    initSampleData
};
