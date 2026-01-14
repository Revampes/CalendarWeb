// CalendarWeb - Main App JavaScript
// Handles theme management, localStorage, and shared utilities

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initModalHandlers();
    initNotifications();
    initReminderCheck();
});

// Notifications
function initNotifications() {
    // Helper to actually show the notification via the active service worker
    const triggerWelcome = () => {
        // Only trigger welcome if requested explicitly or first time logic, 
        // but here it is just a permission test. 
        // Commenting out welcome message to avoid spam on reload, 
        // or just keep it as "Test Notification" if user clicks something.
        // For now, let's just logging.
        console.log("Notifications initialized.");
    };

    // Permission Logic
    if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return;
    }

    if (Notification.permission === 'granted') {
        triggerWelcome();
        return;
    }

    if (Notification.permission === 'denied') {
        console.warn('Notifications blocked by the user');
        return;
    }

    // Request on first user tap/click to comply with browser gesture requirements
    document.addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                triggerWelcome();
                // Send a test notification to confirm it works
                 if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification('Notifications Enabled', {
                            body: 'You will now receive reminders for your events.',
                            icon: 'assets/icons/icon-192.png',
                             vibrate: [100, 50, 100]
                        });
                    });
                }
            }
        }).catch(err => console.error('Permission request failed', err));
    }, { once: true });
}

// Reminder Checker Loop
function initReminderCheck() {
    // Check every minute
    setInterval(checkReminders, 60000);
    // Initial check
    setTimeout(checkReminders, 5000); 
}

function checkReminders() {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const dateString = CalendarApp.formatDateForStorage(now);
    const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

    // Get items
    const tasks = CalendarApp.Storage.getTasksForDate(dateString);
    const deadlines = CalendarApp.Storage.getDeadlinesForDate(dateString);

    const items = [...tasks, ...deadlines];

    items.forEach(item => {
        if (item.time === timeString) {
            // It's time!
            sendNotification(item);
        }
    });
}

function sendNotification(item) {
    const title = `Reminder: ${item.name}`;
    const options = {
        body: item.description || `It's time for ${item.name}`,
        icon: 'assets/icons/icon-192.png',
        badge: 'assets/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: `reminder-${item.id}`, // Prevent duplicate notifications
        renotify: true
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, options);
        }).catch(err => {
             console.error('SW notification failed', err);
             new Notification(title, options);
        });
    } else {
        new Notification(title, options);
    }
}


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
    closeAllModals
};
