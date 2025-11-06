# CalendarWeb - A Modern Calendar Management System

CalendarWeb is a responsive, feature-rich calendar application with dark/light mode support, built with HTML, CSS, and JavaScript. It allows users to manage tasks, deadlines, and schedules efficiently with a clean, minimalist interface.

## Features

### 🗓️ Calendar Features
- **Monthly Calendar View**: Navigate through months with an interactive calendar grid
- **Current Day Highlighting**: Easily spot today's date
- **Task & Deadline Indicators**: Visual dots show which days have scheduled items
- **Date Selection**: Click any date to view or add tasks

### ✅ Task Management
- **Add Tasks**: Create tasks with:
  - Task name
  - Type (Lecture, Tutorial, Training, Meeting, Assignment, Exam, Break, Other)
  - Start and end times
  - Location
  - Description
  - Optional web links
- **Edit Tasks**: Click any task to modify its details
- **Delete Tasks**: Remove tasks you no longer need
- **Color-Coded Types**: Different colors for different task types

### 📅 Deadline Tracking
- **Add Deadlines**: Set deadlines with name, date, time, description, and links
- **Edit Deadlines**: Modify deadline details
- **Visual Reminders**: Deadlines show up on the calendar and in today's summary
- **Deadline List**: View all upcoming deadlines in one place

### ⏰ Daily Schedule View
- **Hourly Timeline**: View your day from 6:00 AM to 10:00 PM
- **Task Placement**: Tasks appear in their scheduled time slots
- **Quick Access**: Click any task in the timeline to edit it

### 🌓 Dark/Light Mode
- **Theme Toggle**: Switch between dark and light modes
- **Persistent Preference**: Your theme choice is saved
- **System Preference**: Defaults to your system's theme setting

### 📱 Responsive Design
- **Mobile-Friendly**: Works on phones, tablets, and desktops
- **Adaptive Layout**: Calendar and schedule adjust to screen size
- **Touch-Friendly**: Optimized for touch interactions

## File Structure

```
CalendarWeb/
├── index.html              # Home page - Overview of the website
├── intro.html              # Introduction page - How to use the calendar
├── calendar.html           # Main calendar application
├── css/
│   └── style.css           # Main stylesheet with dark/light mode support
├── js/
│   ├── app.js              # Core app functions (theme, storage, utilities)
│   └── calendar.js         # Calendar-specific functionality
└── php/
    └── api.php             # PHP API template for server-side features
```

## Getting Started

### Option 1: Local Usage (No Server Required)
1. Open `index.html` in your web browser
2. Navigate to the Calendar page
3. Start adding tasks and deadlines!

**Note**: Data is stored in your browser's localStorage. Clearing browser data will remove your tasks.

### Option 2: With Web Server
1. Copy the CalendarWeb folder to your web server directory
2. Access the site through your web server URL
3. (Optional) Configure `php/api.php` for database storage

## Usage Guide

### Adding a Task
1. Click the "Add Task" button
2. Fill in the task details:
   - Name, Type, Date
   - Start and End times
   - Location (optional)
   - Description (optional)
   - Link (optional)
3. Click "Add Task"

### Adding a Deadline
1. Click the "Add Deadline" button
2. Enter deadline details:
   - Name, Date, Time
   - Description (optional)
   - Link (optional)
3. Click "Add Deadline"

### Editing Tasks/Deadlines
- Click on any task or deadline card
- Modify the details in the modal
- Click "Save Changes" or "Delete" to remove

### Switching Themes
- Click the moon/sun icon in the top-right corner
- Your preference is automatically saved

## Task Types & Colors

- **Lecture** (Blue): Academic lectures and presentations
- **Tutorial** (Green): Hands-on learning sessions
- **Training** (Orange): Skill development and training
- **Meeting** (Purple): Team meetings and discussions
- **Assignment** (Red): Homework and projects
- **Exam** (Pink): Tests and examinations
- **Break** (Indigo): Rest periods and breaks
- **Other** (Gray): Miscellaneous activities

## Browser Support

CalendarWeb works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Data Storage

### Local Storage (Default)
Data is stored in your browser's localStorage:
- Tasks: `calendar_tasks`
- Deadlines: `calendar_deadlines`
- Theme: `theme`

### Server Storage (Optional)
The `php/api.php` file provides a template for implementing:
- Database storage (MySQL, PostgreSQL, etc.)
- User authentication
- Data synchronization
- Export/Import functionality
- Email notifications

To enable server-side storage:
1. Configure a database
2. Uncomment and modify the database functions in `php/api.php`
3. Update the JavaScript files to use API endpoints

## Customization

### Changing Colors
Edit `css/style.css` and modify the CSS variables in the `:root` section:
```css
:root {
    --accent-primary: #6366f1;  /* Main accent color */
    --task-lecture: #3b82f6;    /* Lecture color */
    /* ... other colors ... */
}
```

### Adding More Task Types
1. Add the option in the HTML forms (calendar.html)
2. Add the color definition in `css/style.css`
3. Add the color mapping in `js/app.js` (taskColors object)

### Modifying Time Range
Edit `js/calendar.js` in the `renderDailySchedule()` function:
```javascript
// Change from 6 AM - 10 PM to your preferred range
for (let hour = 6; hour <= 22; hour++) {
```

## Future Enhancements

Potential features for future versions:
- ✨ Recurring tasks/events
- 🔔 Browser notifications for upcoming tasks
- 📤 Export to iCal/CSV format
- 👥 Multi-user support with authentication
- 🔄 Cloud synchronization
- 📊 Statistics and productivity insights
- 🎨 Custom themes and color schemes
- 📱 Progressive Web App (PWA) support

## Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling with CSS variables for theming
- **JavaScript (ES6+)**: Application logic and interactivity
- **LocalStorage API**: Client-side data persistence
- **Font Awesome**: Icons
- **PHP** (Optional): Server-side API

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions:
1. Check the Introduction page (`intro.html`) for usage guidelines
2. Review this README for technical details
3. Inspect browser console for error messages

## Credits

Developed as a modern, minimalist calendar solution for students, professionals, and anyone who wants to stay organized.

---

**Version**: 1.0  
**Last Updated**: November 2025
