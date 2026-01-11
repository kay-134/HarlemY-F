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
    'birthday': ['birthday', 'bday', 'b-day'],
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
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
        key: GOOGLE_CALENDAR_CONFIG.apiKey,
        timeMin: threeMonthsAgo.toISOString(),
        timeMax: sixMonthsLater.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_CONFIG.calendarId)}/events?${params}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Get detailed error information
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to fetch from Google Calendar:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
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
    const isAllDay = !gcalEvent.start.dateTime;

    // For all-day events, parse dates without timezone conversion
    let dateObj, startDate, endDate;
    if (isAllDay) {
        // Parse YYYY-MM-DD directly without timezone issues
        const [startYear, startMonth, startDay] = start.split('-').map(Number);
        dateObj = new Date(startYear, startMonth - 1, startDay);
        startDate = new Date(startYear, startMonth - 1, startDay);

        const [endYear, endMonth, endDay] = end.split('-').map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay);
    } else {
        // For timed events, use normal Date parsing
        dateObj = new Date(start);
        startDate = new Date(start);
        endDate = new Date(end);
    }

    // Extract date in YYYY-MM-DD format
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    // Calculate if multi-day event
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

    let isMultiDay;
    if (isAllDay) {
        // For all-day events, Google end date is exclusive, so > 1 day means multi-day
        isMultiDay = daysDiff > 1;
    } else {
        // For timed events, check if event crosses midnight OR if it ends on a different calendar day
        const startCalendarDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endCalendarDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const crossesMidnight = startCalendarDay.getTime() !== endCalendarDay.getTime();

        isMultiDay = crossesMidnight || daysDiff >= 1;
    }

    // Calculate number of days
    let daysCount = 1;
    if (isMultiDay) {
        if (isAllDay) {
            daysCount = daysDiff;
        } else {
            // For timed events, count the number of calendar days spanned
            const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            daysCount = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
        }
    }

    console.log(`Parsing event: ${gcalEvent.summary}, Start: ${start}, End: ${end}, IsAllDay: ${isAllDay}, DaysDiff: ${daysDiff}, IsMultiDay: ${isMultiDay}, DaysCount: ${daysCount}`);

    // Format time
    let time = 'All Day';
    if (!isAllDay) {
        const startTime = new Date(start);
        const endTime = new Date(end);
        time = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    // Format end date for multi-day events
    let endDateStr = null;
    if (isMultiDay) {
        const actualEndDate = new Date(endDate);
        if (isAllDay) {
            // Google Calendar end dates are exclusive for all-day events, so subtract 1 day
            actualEndDate.setDate(actualEndDate.getDate() - 1);
        }
        endDateStr = `${actualEndDate.getFullYear()}-${String(actualEndDate.getMonth() + 1).padStart(2, '0')}-${String(actualEndDate.getDate()).padStart(2, '0')}`;
    }

    // Parse title - remove category prefix if present (e.g., "Y&F Ministry Event: Title" -> "Title")
    let eventTitle = gcalEvent.summary || 'Untitled Event';
    if (eventTitle.includes(': ')) {
        eventTitle = eventTitle.split(': ').slice(1).join(': ');
    }

    // Detect category from title and description
    const category = detectCategory(gcalEvent.summary, gcalEvent.description || '');

    // Special handling for birthday events
    let location = gcalEvent.location || 'TBD';
    let description = gcalEvent.description || '';
    let isBirthday = category.id === 'birthday';

    if (isBirthday) {
        // Extract person's name from title (e.g., "John's Birthday" -> "John")
        let personName = eventTitle;
        if (eventTitle.toLowerCase().includes('birthday')) {
            personName = eventTitle.replace(/['']s?\s*(birthday|bday|b-day)/gi, '').trim();
        }

        // Set birthday-specific properties
        location = ''; // Hide location for birthdays
        description = `Don't forget to text ${personName} Happy Birthday!`;
    }

    return {
        id: id,
        title: eventTitle,
        date: date,
        endDate: endDateStr,
        time: time,
        location: location,
        description: description,
        category: category.id,
        categoryLabel: category.label,
        isMultiDay: isMultiDay,
        daysCount: daysCount,
        isBirthday: isBirthday
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
        'birthday': 'Birthday',
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
            endDate: null,
            time: "6:00 PM - 9:00 PM",
            location: "Church Fellowship Hall",
            description: "Join us for an evening of fun games, snacks, and fellowship!",
            category: "fun-event",
            categoryLabel: "Fun Event",
            isMultiDay: false,
            daysCount: 1
        },
        {
            id: 2,
            title: "Bake Sale Fundraiser",
            date: "2026-01-18",
            endDate: null,
            time: "10:00 AM - 2:00 PM",
            location: "Church Courtyard",
            description: "Help support our youth ministry by purchasing delicious baked goods!",
            category: "fundraising",
            categoryLabel: "Fundraising",
            isMultiDay: false,
            daysCount: 1
        },
        {
            id: 3,
            title: "Bible Study Session",
            date: "2026-01-22",
            endDate: null,
            time: "7:00 PM - 8:30 PM",
            location: "Youth Center Room 3",
            description: "Weekly Bible study exploring faith and community.",
            category: "ministry-planned",
            categoryLabel: "Y&F Ministry",
            isMultiDay: false,
            daysCount: 1
        },
        {
            id: 4,
            title: "Community Service Day",
            date: "2026-01-25",
            endDate: null,
            time: "9:00 AM - 3:00 PM",
            location: "Local Food Bank",
            description: "Serve our community by volunteering at the local food bank.",
            category: "teen-service",
            categoryLabel: "Teen Service",
            isMultiDay: false,
            daysCount: 1
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

    // Check for events on this day (including multi-day events and past events)
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

    // Find all events that include this day
    const dayEvents = events.filter(event => {
        if (event.isMultiDay && event.endDate) {
            // For multi-day events, check if dateString is within range
            return dateString >= event.date && dateString <= event.endDate;
        } else {
            // Single day event - direct string comparison
            return event.date === dateString;
        }
    });

    if (dayEvents.length > 0) {
        dayDiv.classList.add('has-event');

        // Check if event is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [eventYear, eventMonth, eventDay] = dateString.split('-').map(Number);
        const eventDateObj = new Date(eventYear, eventMonth - 1, eventDay);
        eventDateObj.setHours(0, 0, 0, 0);

        if (eventDateObj < today) {
            dayDiv.classList.add('past-event');
        }

        // Check if this is a multi-day event and add position classes
        dayEvents.forEach((event, index) => {
            if (event.isMultiDay && event.endDate) {
                const eventStart = new Date(event.date);
                const eventEnd = new Date(event.endDate);

                if (dateString === event.date) {
                    dayDiv.classList.add('multi-day-start');
                } else if (dateString === event.endDate) {
                    dayDiv.classList.add('multi-day-end');
                } else {
                    dayDiv.classList.add('multi-day-middle');
                }
            }

            // Add category class for the first event (for color)
            if (index === 0) {
                dayDiv.classList.add(event.category);
            }
        });

        if (dayEvents.length > 1) {
            dayDiv.classList.add('has-multiple-events');
        }

        // Add click event to open modal for first event
        dayDiv.addEventListener('click', () => {
            openEventModal(dayEvents[0]);
        });
    }

    return dayDiv;
}

// Render Events List
function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';

    // Filter and sort upcoming events (include today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Today\'s date:', today.toDateString());
    console.log('Total events loaded:', events.length);

    const upcomingEvents = events
        .filter(event => {
            // Parse event date without timezone issues
            const [year, month, day] = event.date.split('-').map(Number);
            const eventDate = new Date(year, month - 1, day);
            eventDate.setHours(0, 0, 0, 0);

            const isUpcoming = eventDate >= today;
            console.log(`Event: ${event.title}, Date: ${event.date}, Is upcoming: ${isUpcoming}, Is multi-day: ${event.isMultiDay}`);

            return isUpcoming;
        })
        .sort((a, b) => {
            // Parse dates for sorting without timezone issues
            const [yearA, monthA, dayA] = a.date.split('-').map(Number);
            const [yearB, monthB, dayB] = b.date.split('-').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });

    console.log('Upcoming events count:', upcomingEvents.length);

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
    const [startYear, startMonth, startDay] = event.date.split('-').map(Number);
    const eventDate = new Date(startYear, startMonth - 1, startDay);

    let formattedDate;
    if (event.isMultiDay && event.endDate) {
        // Use long format for multi-day events
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);

        const [endYear, endMonth, endDay] = event.endDate.split('-').map(Number);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        formattedDate += ` - ${endDate.toLocaleDateString('en-US', dateOptions)}`;
    } else {
        // Use short format for single-day events
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
    }

    // Multi-day indicator
    const multiDayBadge = event.isMultiDay ?
        `<span class="multi-day-badge">${event.daysCount} days</span>` : '';

    card.innerHTML = `
        <div class="event-header">
            <div>
                <div class="event-title">${event.title}</div>
            </div>
            <div class="event-badges">
                ${multiDayBadge}
                <span class="event-badge ${event.category}">${event.categoryLabel}</span>
            </div>
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
            ${!event.isBirthday && event.location ? `
            <div class="event-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
            </div>
            ` : ''}
        </div>
    `;

    // Add click event to open modal
    card.addEventListener('click', () => {
        openEventModal(event);
    });
    card.style.cursor = 'pointer';

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

// ============================================
// MODAL FUNCTIONS
// ============================================

// Open Event Modal
function openEventModal(event) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    // Format date (parse without timezone issues)
    const [startYear, startMonth, startDay] = event.date.split('-').map(Number);
    const eventDate = new Date(startYear, startMonth - 1, startDay);
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    let formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);

    // Add end date for multi-day events
    if (event.isMultiDay && event.endDate) {
        const [endYear, endMonth, endDay] = event.endDate.split('-').map(Number);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        formattedDate += ` - ${endDate.toLocaleDateString('en-US', dateOptions)}`;
    }

    // Multi-day indicator
    const multiDayBadge = event.isMultiDay ?
        `<span class="multi-day-badge-large">${event.daysCount} Day Event</span>` : '';

    // Format description with line breaks
    const description = event.description ?
        event.description.replace(/\n/g, '<br>') :
        'No additional details available.';

    modalBody.innerHTML = `
        <div class="modal-event-header">
            <h2 class="modal-event-title">${event.title}</h2>
            <div class="modal-badges">
                ${multiDayBadge}
                <span class="event-badge ${event.category}">${event.categoryLabel}</span>
            </div>
        </div>
        <div class="modal-event-details">
            <div class="modal-detail-item">
                <div class="modal-detail-icon">
                    <i class="far fa-calendar"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Date</div>
                    <div class="modal-detail-value">${formattedDate}</div>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-icon">
                    <i class="far fa-clock"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Time</div>
                    <div class="modal-detail-value">${event.time}</div>
                </div>
            </div>
            ${!event.isBirthday && event.location ? `
            <div class="modal-detail-item">
                <div class="modal-detail-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Location</div>
                    <div class="modal-detail-value">${event.location}</div>
                </div>
            </div>
            ` : ''}
            ${event.description ? `
            <div class="modal-detail-item modal-description">
                <div class="modal-detail-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Details</div>
                    <div class="modal-detail-value">${description}</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close Event Modal
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

// Setup modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('eventModal');
    const closeBtn = document.getElementById('modalClose');

    // Close on X button
    closeBtn.addEventListener('click', closeEventModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEventModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeEventModal();
        }
    });

    // Subscribe button
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', showSubscribeInstructions);
    }
});

// ============================================
// CALENDAR SUBSCRIPTION FUNCTIONS
// ============================================

// Download ICS file for individual event
function downloadICS(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Parse dates
    const [year, month, day] = event.date.split('-').map(Number);
    let startDate, endDate;

    if (event.time === 'All Day') {
        // All-day event
        startDate = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;

        if (event.endDate) {
            const [endYear, endMonth, endDay] = event.endDate.split('-').map(Number);
            // Add 1 day for exclusive end date in ICS format
            const endDateObj = new Date(endYear, endMonth - 1, endDay);
            endDateObj.setDate(endDateObj.getDate() + 1);
            endDate = `${endDateObj.getFullYear()}${String(endDateObj.getMonth() + 1).padStart(2, '0')}${String(endDateObj.getDate()).padStart(2, '0')}`;
        } else {
            // Single day event - end is next day
            const nextDay = new Date(year, month - 1, day);
            nextDay.setDate(nextDay.setDate() + 1);
            endDate = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;
        }
    } else {
        // Timed event - need to parse time
        const timeMatch = event.time.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const ampm = timeMatch[3];

            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            startDate = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
        }

        // For timed events, calculate end time (default 2 hours if not specified)
        const endTimeMatch = event.time.match(/- (\d+):(\d+)\s*(AM|PM)/);
        if (endTimeMatch) {
            let endHours = parseInt(endTimeMatch[1]);
            const endMinutes = parseInt(endTimeMatch[2]);
            const endAmpm = endTimeMatch[3];

            if (endAmpm === 'PM' && endHours !== 12) endHours += 12;
            if (endAmpm === 'AM' && endHours === 12) endHours = 0;

            let endYear = year, endMonth = month, endDay = day;
            if (event.endDate) {
                [endYear, endMonth, endDay] = event.endDate.split('-').map(Number);
            }

            endDate = `${endYear}${String(endMonth).padStart(2, '0')}${String(endDay).padStart(2, '0')}T${String(endHours).padStart(2, '0')}${String(endMinutes).padStart(2, '0')}00`;
        } else {
            endDate = startDate; // Fallback
        }
    }

    // Create ICS content
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Harlem Youth Ministry//Events Calendar//EN
BEGIN:VEVENT
UID:${event.id}@harlemyouth.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART${event.time === 'All Day' ? ';VALUE=DATE' : ''}:${startDate}
DTEND${event.time === 'All Day' ? ';VALUE=DATE' : ''}:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    // Download the file
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show calendar subscription instructions
function showSubscribeInstructions() {
    const appleCalendarUrl = 'https://calendar.google.com/calendar/ical/c_a96a34b6a713662e7c6aa2869774de611fefe4f16ffabc05cf973e16edb93afa%40group.calendar.google.com/public/basic.ics';
    const googleCalendarUrl = `https://calendar.google.com/calendar/u/0?cid=${GOOGLE_CALENDAR_CONFIG.calendarId}`;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="modal-event-header">
            <h2 class="modal-event-title">Subscribe to Calendar</h2>
        </div>
        <div class="modal-event-details">
            <div class="modal-detail-item">
                <div class="modal-detail-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">For iPhone/iPad</div>
                    <div class="modal-detail-value">
                        <strong>Click the link below:</strong><br>
                        <a href="${appleCalendarUrl}" target="_blank" style="word-break: break-all; color: #93504B; text-decoration: underline; font-weight: 600;">
                            Tap here to subscribe on iPhone/iPad
                        </a><br><br>
                        When prompted, tap "Subscribe" to add the calendar.<br>
                        All events will sync automatically with updates!
                    </div>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-icon">
                    <i class="fab fa-android"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">For Android/Samsung</div>
                    <div class="modal-detail-value">
                        <strong>Click the link below:</strong><br>
                        <a href="${googleCalendarUrl}" target="_blank" style="word-break: break-all; color: #93504B; text-decoration: underline; font-weight: 600;">
                            Tap here to subscribe on Android
                        </a><br><br>
                        Sign in with your Google account and click "Add to Calendar".<br>
                        Events will appear in your Google Calendar app!
                    </div>
                </div>
            </div>
            <div class="modal-detail-item modal-description">
                <div class="modal-detail-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Why Subscribe?</div>
                    <div class="modal-detail-value">
                        <strong>Subscribe once, get automatic updates forever!</strong><br><br>
                        When you subscribe, ALL current and future events automatically sync to your phone's calendar.
                        If we add new events or make changes, they update automatically!
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ============================================
// THEME TOGGLE FUNCTIONS
// ============================================

// Initialize theme on page load
function initTheme() {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const subscribeBtnMobile = document.getElementById('subscribeBtnMobile');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(true);
    } else {
        // Default to dark mode
        updateThemeIcon(false);
    }

    // Add click event to toggle buttons
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

    // Add click event to mobile subscribe button
    if (subscribeBtnMobile) {
        subscribeBtnMobile.addEventListener('click', showSubscribeInstructions);
    }
}

// Toggle between light and dark mode
function toggleTheme() {
    const isLightMode = document.body.classList.toggle('light-mode');
    updateThemeIcon(isLightMode);

    // Save preference
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Update theme icon based on current mode
function updateThemeIcon(isLightMode) {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');

    const iconClass = isLightMode ? 'fas fa-moon' : 'fas fa-sun';

    // Update desktop icon
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = iconClass;
        }
    }

    // Update mobile icon
    if (themeToggleMobile) {
        const icon = themeToggleMobile.querySelector('i');
        if (icon) {
            icon.className = iconClass;
        }
    }
}

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateHeadingForMobile();
});

// Update heading text based on screen size
function updateHeadingForMobile() {
    const heading = document.querySelector('header h1');
    if (!heading) return;

    function checkScreenSize() {
        if (window.innerWidth <= 1024) {
            heading.textContent = 'Harlem Y&F Events';
        } else {
            heading.textContent = 'Harlem Youth Ministry Events';
        }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
}
