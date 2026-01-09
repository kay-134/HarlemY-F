// ============================================
// GOOGLE CALENDAR CONFIGURATION
// ============================================
// To set up Google Calendar integration:
// 1. Get your API key from: https://console.cloud.google.com/apis/credentials
// 2. Enable the Google Calendar API in your Google Cloud project
// 3. Make your Google Calendar public (Calendar Settings > Access permissions)
// 4. Get your Calendar ID from Calendar Settings > Integrate calendar
// 5. Replace the values below with your API key and Calendar ID

const GOOGLE_CALENDAR_CONFIG = {
    apiKey: 'AIzaSyDSTY2czR2Arg1Y_cfFiQ0DANCCY2kaq5o',  // Replace with your Google Calendar API key
    calendarId: 'c_a96a34b6a713662e7c6aa2869774de611fefe4f16ffabc05cf973e16edb93afa@group.calendar.google.com',  // Replace with your calendar ID (usually ends with @group.calendar.google.com)
    enabled: true  // Set to true once you've added your API key and calendar ID
};

// Category detection keywords
// Events are categorized based on keywords in the title or description
const CATEGORY_KEYWORDS = {
    'fun-event': ['game', 'movie', 'bowling', 'fun', 'night', 'party', 'social'],
    'fundraising': ['fundraiser', 'bake sale', 'car wash', 'donation', 'fundraising'],
    'ministry-planned': ['bible', 'study', 'worship', 'ministry', 'prayer', 'devotion', 'retreat planning'],
    'teen-service': ['service', 'volunteer', 'community', 'outreach', 'mission', 'help']
};

// Store events globally
let events = [];

// Calendar State
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ============================================
// GOOGLE CALENDAR API FUNCTIONS
// ============================================

// Fetch events from Google Calendar
async function fetchGoogleCalendarEvents() {
    if (!GOOGLE_CALENDAR_CONFIG.enabled) {
        console.log('Google Calendar integration is disabled. Using sample data.');
        return getSampleEvents();
    }

    const now = new Date();
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
        key: GOOGLE_CALENDAR_CONFIG.apiKey,
        timeMin: now.toISOString(),
        timeMax: threeMonthsLater.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_CONFIG.calendarId)}/events?${params}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error('Failed to fetch from Google Calendar:', response.statusText);
            return getSampleEvents();
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('No events found in Google Calendar.');
            return [];
        }

        return data.items.map((event, index) => parseGoogleCalendarEvent(event, index + 1));
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        return getSampleEvents();
    }
}

// Parse a Google Calendar event into our format
function parseGoogleCalendarEvent(gcalEvent, id) {
    const start = gcalEvent.start.dateTime || gcalEvent.start.date;
    const end = gcalEvent.end.dateTime || gcalEvent.end.date;

    // Extract date in YYYY-MM-DD format
    const dateObj = new Date(start);
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    // Format time
    let time = 'All Day';
    if (gcalEvent.start.dateTime) {
        const startTime = new Date(start);
        const endTime = new Date(end);
        time = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    // Detect category from title and description
    const category = detectCategory(gcalEvent.summary, gcalEvent.description || '');

    return {
        id: id,
        title: gcalEvent.summary || 'Untitled Event',
        date: date,
        time: time,
        location: gcalEvent.location || 'TBD',
        category: category.id,
        categoryLabel: category.label
    };
}

// Detect event category based on keywords
function detectCategory(title, description) {
    const searchText = `${title} ${description}`.toLowerCase();

    // Check each category's keywords
    for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                return {
                    id: categoryId,
                    label: getCategoryLabel(categoryId)
                };
            }
        }
    }

    // Default to fun-event if no match
    return {
        id: 'fun-event',
        label: 'Fun Event'
    };
}

// Get category label from ID
function getCategoryLabel(categoryId) {
    const labels = {
        'fun-event': 'Fun Event',
        'fundraising': 'Fundraising',
        'ministry-planned': 'Y&F Ministry',
        'teen-service': 'Teen Service'
    };
    return labels[categoryId] || 'Event';
}

// Format time to 12-hour format
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
}

// Sample events fallback
function getSampleEvents() {
    return [
        {
            id: 1,
            title: "Youth Game Night",
            date: "2026-01-15",
            time: "6:00 PM - 9:00 PM",
            location: "Church Fellowship Hall",
            category: "fun-event",
            categoryLabel: "Fun Event"
        },
        {
            id: 2,
            title: "Bake Sale Fundraiser",
            date: "2026-01-18",
            time: "10:00 AM - 2:00 PM",
            location: "Church Courtyard",
            category: "fundraising",
            categoryLabel: "Fundraising"
        },
        {
            id: 3,
            title: "Bible Study Session",
            date: "2026-01-22",
            time: "7:00 PM - 8:30 PM",
            location: "Youth Center Room 3",
            category: "ministry-planned",
            categoryLabel: "Y&F Ministry"
        },
        {
            id: 4,
            title: "Community Service Day",
            date: "2026-01-25",
            time: "9:00 AM - 3:00 PM",
            location: "Local Food Bank",
            category: "teen-service",
            categoryLabel: "Teen Service"
        }
    ];
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 2rem;">Loading events...</p>';

    // Fetch events from Google Calendar or use sample data
    events = await fetchGoogleCalendarEvents();

    // Render calendar and events
    renderCalendar();
    renderEvents();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

// Render Calendar
function renderCalendar() {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Update month/year display
    document.getElementById('currentMonth').textContent =
        `${monthNames[currentMonth]} ${currentYear}`;

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = createDayElement(daysInPrevMonth - i, true);
        calendarDays.appendChild(day);
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = createDayElement(i, false);
        calendarDays.appendChild(day);
    }

    // Next month's days to fill the grid
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
        const day = createDayElement(i, true);
        calendarDays.appendChild(day);
    }
}

// Create Day Element
function createDayElement(dayNumber, isOtherMonth) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.textContent = dayNumber;

    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
        return dayDiv;
    }

    // Check if today
    const today = new Date();
    if (dayNumber === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()) {
        dayDiv.classList.add('today');
    }

    // Check for events on this day
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dayEvents = events.filter(event => event.date === dateString);

    if (dayEvents.length > 0) {
        dayDiv.classList.add('has-event');
        // Add category class for the first event (for ring color)
        dayDiv.classList.add(dayEvents[0].category);

        if (dayEvents.length > 1) {
            dayDiv.classList.add('has-multiple-events');
        }

        // Add click event to scroll to event
        dayDiv.addEventListener('click', () => {
            scrollToEvent(dayEvents[0].id);
        });
    }

    return dayDiv;
}

// Render Events List
function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';

    // Filter and sort upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcomingEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 2rem;">No upcoming events</p>';
        return;
    }

    upcomingEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// Create Event Card
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = `event-card ${event.category}`;
    card.id = `event-${event.id}`;

    // Format date
    const eventDate = new Date(event.date);
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);

    card.innerHTML = `
        <div class="event-header">
            <div>
                <div class="event-title">${event.title}</div>
            </div>
            <span class="event-badge ${event.category}">${event.categoryLabel}</span>
        </div>
        <div class="event-details">
            <div class="event-detail">
                <i class="far fa-calendar"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="event-detail">
                <i class="far fa-clock"></i>
                <span>${event.time}</span>
            </div>
            <div class="event-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
            </div>
        </div>
    `;

    // Add click event to navigate calendar to event date
    card.addEventListener('click', () => {
        const eventDate = new Date(event.date);
        currentMonth = eventDate.getMonth();
        currentYear = eventDate.getFullYear();
        renderCalendar();
    });

    return card;
}

// Scroll to Event
function scrollToEvent(eventId) {
    const eventCard = document.getElementById(`event-${eventId}`);
    if (eventCard) {
        eventCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight effect
        eventCard.style.transform = 'scale(1.02)';
        eventCard.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';

        setTimeout(() => {
            eventCard.style.transform = '';
            eventCard.style.boxShadow = '';
        }, 1000);
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
