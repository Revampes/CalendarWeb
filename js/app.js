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

const DAILY_BRIEFING_SENT_KEY = 'calendar_daily_briefing_last_sent';

// Notifications
function initNotifications() {
    console.log("[Debug] Initializing notifications...");
    
    if (!('Notification' in window)) {
        console.error('[Debug] Notifications not supported by this browser');
        return;
    }

    console.log("[Debug] Current Notification permission:", Notification.permission);

    if (Notification.permission === 'granted') {
        console.log("[Debug] Permission granted. Monitoring for scheduled notifications...");
        // sendTestNotification(); // Disabled instant notification on load
        return;
    }

    if (Notification.permission === 'denied') {
        console.warn('[Debug] Notifications blocked by the user');
        return;
    }

    // Request on first user tap/click to comply with browser gesture requirements
    console.log("[Debug] Waiting for user click to request permission...");
    document.addEventListener('click', () => {
        console.log("[Debug] User clicked. Requesting permission...");
        Notification.requestPermission().then(permission => {
            console.log("[Debug] Permission request result:", permission);
            if (permission === 'granted') {
                // sendTestNotification(); // Disabled
                console.log("[Debug] Permission granted via click.");
            }
        }).catch(err => console.error('[Debug] Permission request failed', err));
    }, { once: true });
}

function sendTestNotification() {
    const title = 'System Check';
    const options = {
        body: 'Notifications are active! timestamp: ' + new Date().toLocaleTimeString(),
        icon: 'assets/icons/icon.svg',
        vibrate: [100, 50, 100],
        tag: 'debug-test-' + Date.now(),
        requireInteraction: true
    };

    console.log("[Debug] Attempting to send test notification:", title, options);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            console.log("[Debug] Service Worker ready. Calling showNotification...");
            reg.showNotification(title, options).then(() => {
                console.log("[Debug] Service Worker notification sent successfully.");
            }).catch(e => {
                console.error("[Debug] SW showNotification failed:", e);
                // Fallback
                try {
                    new Notification(title, options);
                    console.log("[Debug] Fallback Notification sent.");
                } catch (fallbackErr) {
                    console.error("[Debug] Fallback Notification failed:", fallbackErr);
                }
            });
        }).catch(err => {
            console.error("[Debug] Service Worker not ready:", err);
        });
    } else {
        try {
            new Notification(title, options);
            console.log("[Debug] Standard Notification sent (No SW).");
        } catch (e) {
            console.error("[Debug] Standard Notification failed:", e);
        }
    }
}

// Reminder Checker Loop
function initReminderCheck() {
    console.log("[Debug] Starting reminder check loop...");

    const tick = () => {
        try {
            checkReminders();
        } finally {
            // Align to the next second boundary to avoid drift
            const now = Date.now();
            const msUntilNextSecond = 1000 - (now % 1000);
            setTimeout(tick, msUntilNextSecond);
        }
    };

    // Start shortly after load, then self-schedule
    setTimeout(tick, 500);
}

function checkReminders() {
    if (Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();
    const dateString = CalendarApp.formatDateForStorage(now);
    const timeHM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM
    const seconds = now.getSeconds();

    // --- Daily Briefing Check (fire exactly at HH:MM:00, once per day) ---
    const settings = JSON.parse(localStorage.getItem('calendar_settings') || '{}');
    if (settings.dailyBriefingEnabled && settings.dailyBriefingTime === timeHM && seconds === 0) {
        const sentKey = `${dateString}|${settings.dailyBriefingTime}`;
        if (localStorage.getItem(DAILY_BRIEFING_SENT_KEY) !== sentKey) {
            sendDailyBriefing(dateString);
            localStorage.setItem(DAILY_BRIEFING_SENT_KEY, sentKey);
        }
    }

    // --- Task/Deadline Reminders ---
    const tasks = CalendarApp.Storage.getTasksForDate(dateString);
    const deadlines = CalendarApp.Storage.getDeadlinesForDate(dateString);
    const items = [...tasks, ...deadlines];

    items.forEach(item => {
        if (!item.time) {
            return;
        }

        // Exact Time
        if (item.time === timeHM && seconds === 0) {
            sendNotification(item, false);
            return;
        }

        // 5 Minutes Before
        const warningTime = subtractMinutes(item.time, 5);
        if (warningTime === timeHM && seconds === 0) {
            sendNotification(item, true);
        }
    });
}

function subtractMinutes(timeStr, mins) {
    if (!timeStr) return null;
    try {
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m - mins, 0, 0);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return null;
    }
}

function sendDailyBriefing(todayDateStr) {
    const tasks = CalendarApp.Storage.getTasksForDate(todayDateStr);
    const deadlines = CalendarApp.Storage.getDeadlinesForDate(todayDateStr);
    
    // Future deadlines (3 days)
    let upcoming = [];
    for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dStr = CalendarApp.formatDateForStorage(d);
        const ds = CalendarApp.Storage.getDeadlinesForDate(dStr);
        ds.forEach(item => {
            upcoming.push(`${item.name} (${CalendarApp.formatDateShort(dStr)})`);
        });
    }

    const todayCount = tasks.length + deadlines.length;
    let body = `Today you have ${todayCount} items.`;
    
    if (deadlines.length > 0) {
        body += `\nDeadlines today: ${deadlines.map(d => d.name).join(', ')}.`;
    }
    
    if (upcoming.length > 0) {
        body += `\nUpcoming in 3 days: ${upcoming.join(', ')}`;
    }

    const title = "📅 Daily Schedule Briefing";
    const options = {
        body: body,
        icon: 'assets/icons/icon.svg',
        tag: 'daily-briefing-' + todayDateStr,
        requireInteraction: true
    };

    dispatchNotification(title, options);
}

function sendNotification(item, isEarly) {
    const title = isEarly ? `Upcoming: ${item.name}` : `Reminder: ${item.name}`;
    let body = item.description || `It's time for ${item.name}`;
    
    if (isEarly) {
        body = `Starting in 5 minutes. ${body}`;
    }

    const options = {
        body: body,
        icon: 'assets/icons/icon.svg',
        badge: 'assets/icons/icon.svg',
        vibrate: [200, 100, 200],
        tag: `reminder-${item.id}-${isEarly ? 'early' : 'now'}`,
        renotify: true,
        requireInteraction: true
    };
    
    dispatchNotification(title, options);
}

function dispatchNotification(title, options) {
    console.log("[Debug] Dispatching notification:", title);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, options);
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
