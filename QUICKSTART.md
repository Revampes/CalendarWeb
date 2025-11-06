# CalendarWeb - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Open the Website
Simply open `index.html` in your web browser, or navigate to the Calendar page directly by opening `calendar.html`.

### Step 2: Explore the Features
- **Home Page** (`index.html`): Overview of CalendarPro features
- **Introduction** (`intro.html`): Detailed guide on how to use the calendar
- **Calendar** (`calendar.html`): The main calendar application

### Step 3: Start Using It!
1. Click "Add Task" to create your first task
2. Click "Add Deadline" to set a deadline
3. Click the moon/sun icon to toggle dark mode

## 📁 File Organization

Your project now has a clean, professional structure:

```
CalendarWeb/
├── 📄 index.html               → Home page
├── 📄 intro.html               → How-to guide
├── 📄 calendar.html            → Calendar app (MAIN)
├── 📄 README.md                → Full documentation
├── 📄 QUICKSTART.md            → This file
│
├── 📁 css/
│   └── style.css               → All styles & dark mode
│
├── 📁 js/
│   ├── app.js                  → Core functions & storage
│   └── calendar.js             → Calendar logic
│
└── 📁 php/
    └── api.php                 → Server API template (optional)
```

## ✨ Key Features Implemented

### ✅ Calendar Functions
- [x] Monthly calendar with navigation
- [x] Day selection and highlighting
- [x] Task indicators on calendar days
- [x] Current day highlighting

### ✅ Task Management
- [x] Add tasks with name, type, time, location, description, link
- [x] Edit existing tasks
- [x] Delete tasks
- [x] Color-coded task types (8 types)
- [x] Task list for selected date

### ✅ Deadline Management
- [x] Add deadlines with name, date, time, description, link
- [x] Edit existing deadlines
- [x] Delete deadlines
- [x] Deadline list showing all upcoming deadlines

### ✅ Daily Schedule
- [x] Hourly time slots from 6:00 AM to 10:00 PM
- [x] Tasks displayed in their time slots
- [x] Clickable tasks for editing

### ✅ Today's Summary
- [x] Quick view of today's tasks
- [x] Quick view of today's deadlines
- [x] Right-side panel for easy access

### ✅ Dark/Light Mode
- [x] Theme toggle button
- [x] Persistent theme preference
- [x] Smooth transitions

### ✅ Responsive Design
- [x] Works on mobile, tablet, and desktop
- [x] Adaptive layouts
- [x] Touch-friendly interface

## 🎨 Task Types & Colors

Your calendar supports 8 task types, each with a unique color:

1. **Lecture** 🔵 - Blue (#3b82f6)
2. **Tutorial** 🟢 - Green (#10b981)
3. **Training** 🟠 - Orange (#f59e0b)
4. **Meeting** 🟣 - Purple (#8b5cf6)
5. **Assignment** 🔴 - Red (#ef4444)
6. **Exam** 🌸 - Pink (#ec4899)
7. **Break** 🔷 - Indigo (#6366f1)
8. **Other** ⚫ - Gray (#6b7280)

## 💾 Data Storage

All your tasks and deadlines are automatically saved to your browser's localStorage:
- No internet connection required
- Data persists between sessions
- Private and secure (stored locally)

**Note**: If you clear your browser data, you'll lose your tasks. Consider implementing the PHP backend for permanent storage!

## 🌙 Dark Mode

Toggle between light and dark modes with a single click! Your preference is automatically saved.

## 📱 Mobile Support

The calendar is fully responsive:
- Calendar adapts to smaller screens
- Forms are touch-friendly
- Navigation menu collapses on mobile

## 🔧 Customization Options

Want to customize? Here's what you can easily change:

### Change Colors
Edit `css/style.css` - Look for the `:root` section

### Change Time Range
Edit `js/calendar.js` - Find the `renderDailySchedule()` function

### Add New Task Types
1. Update the `<select>` options in `calendar.html`
2. Add color in `css/style.css`
3. Add to `taskColors` object in `js/app.js`

## 🐛 Troubleshooting

### Calendar not loading?
- Check browser console (F12) for errors
- Ensure `js/app.js` and `js/calendar.js` are in the correct folders
- Verify `css/style.css` exists

### Tasks not saving?
- Check if localStorage is enabled in your browser
- Try a different browser
- Check browser privacy settings

### Dark mode not working?
- Clear your browser cache
- Check the console for JavaScript errors
- Verify `js/app.js` is loading correctly

## 🎯 Next Steps

### For Development
1. **Add Database**: Configure `php/api.php` for MySQL storage
2. **Add Users**: Implement authentication system
3. **Add Sync**: Enable cloud synchronization
4. **Add Export**: Implement iCal/CSV export

### For Daily Use
1. Start adding your classes/meetings
2. Set deadlines for assignments
3. Check your daily schedule each morning
4. Use the color-coding to organize by type

## 📖 Learn More

For detailed documentation, see `README.md`
For usage instructions, visit `intro.html`

## ⚡ Pro Tips

1. **Use keyboard shortcuts**: Press `Escape` to close modals
2. **Click outside modals** to close them quickly
3. **Use the "Today" button** to quickly return to the current date
4. **Click on any task** in the schedule view to edit it quickly
5. **Add links** to your tasks for quick access to class materials

---

## 🎉 You're All Set!

Your CalendarWeb is ready to use. Open `calendar.html` and start organizing your schedule!

**Happy Planning! 📅**
