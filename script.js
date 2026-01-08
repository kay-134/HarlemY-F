// Sample Events Data
const events = [
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
    },
    {
        id: 5,
        title: "Movie Night",
        date: "2026-01-29",
        time: "7:00 PM - 10:00 PM",
        location: "Church Auditorium",
        category: "fun-event",
        categoryLabel: "Fun Event"
    },
    {
        id: 6,
        title: "Car Wash Fundraiser",
        date: "2026-02-01",
        time: "11:00 AM - 4:00 PM",
        location: "Church Parking Lot",
        category: "fundraising",
        categoryLabel: "Fundraising"
    },
    {
        id: 7,
        title: "Youth Worship Night",
        date: "2026-02-05",
        time: "6:30 PM - 8:30 PM",
        location: "Main Sanctuary",
        category: "ministry-planned",
        categoryLabel: "Y&F Ministry"
    },
    {
        id: 8,
        title: "Bowling Tournament",
        date: "2026-02-08",
        time: "5:00 PM - 8:00 PM",
        location: "Sunset Bowling Alley",
        category: "fun-event",
        categoryLabel: "Fun Event"
    },
    {
        id: 9,
        title: "Homeless Shelter Volunteering",
        date: "2026-02-12",
        time: "10:00 AM - 2:00 PM",
        location: "Downtown Shelter",
        category: "teen-service",
        categoryLabel: "Teen Service"
    },
    {
        id: 10,
        title: "Valentine's Day Banquet",
        date: "2026-02-14",
        time: "6:00 PM - 9:00 PM",
        location: "Church Fellowship Hall",
        category: "fun-event",
        categoryLabel: "Fun Event"
    },
    {
        id: 11,
        title: "Youth Retreat Planning",
        date: "2026-02-19",
        time: "7:00 PM - 8:30 PM",
        location: "Youth Center",
        category: "ministry-planned",
        categoryLabel: "Y&F Ministry"
    },
    {
        id: 12,
        title: "Pancake Breakfast Fundraiser",
        date: "2026-02-22",
        time: "8:00 AM - 11:00 AM",
        location: "Church Kitchen",
        category: "fundraising",
        categoryLabel: "Fundraising"
    }
];

// Calendar State
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
        eventsList.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">No upcoming events</p>';
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
