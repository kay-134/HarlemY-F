# Youth Ministry Events Calendar

A modern, responsive events calendar application designed for youth ministry to help young members stay informed about upcoming church activities and gatherings.

## Features

### Visual Design
- **Gradient Background**: Soft purple and blue gradients creating a welcoming spiritual atmosphere
- **Clean Layout**: Two-column desktop layout with events list and interactive calendar
- **Color-Coded Categories**: Four distinct event types with matching visual indicators
  - Purple: Fun Event
  - Green: Fundraising
  - Blue: Y&F Ministry Planned
  - Orange: Teen Service

### Interactive Elements
- **Monthly Calendar Navigation**: Browse through months with intuitive prev/next buttons
- **Event Highlighting**: Colored ring highlights on calendar dates matching event categories
- **Click Interactions**: Click calendar dates to view event details, click events to navigate to their date
- **Smooth Animations**: Hover states and transitions for enhanced user experience
- **Scrollable Event List**: Easy-to-navigate list of upcoming events with detailed information

### Responsive Design
- **Desktop**: Side-by-side layout with events on left, calendar on right
- **Mobile**: Stacked layout with events first, calendar below
- **Adaptive Typography**: Scales appropriately for all screen sizes
- **Touch-Friendly**: Optimized for mobile and tablet interactions

### Event Information
Each event displays:
- Event title and category badge
- Date with day of week
- Time range
- Location with address/room
- Visual category indicators (colored borders and badges)

## File Structure

```
HarlemY-F/
├── index.html                  # Main HTML structure
├── styles.css                  # All styling and responsive design
├── script.js                   # Calendar logic and Google Calendar API integration
├── README.md                   # Project documentation
└── GOOGLE_CALENDAR_SETUP.md   # Step-by-step Google Calendar setup guide
```

## Live Demo

This site is configured for GitHub Pages deployment. Once enabled, it will be available at:
`https://[username].github.io/HarlemY-F/`

### Setting Up GitHub Pages

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Click **Settings** (in the repository menu)
3. Click **Pages** (in the left sidebar under "Code and automation")
4. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
5. The site will automatically deploy when you push changes to the `claude/youth-events-calendar-oHn95` or `main` branch
6. Once deployed, GitHub will show your live site URL

The deployment workflow is already configured in `.github/workflows/deploy.yml` and will run automatically.

## Local Usage

Simply open `index.html` in any modern web browser. No build process or dependencies required beyond the Font Awesome CDN for icons.

## Google Calendar Integration

This calendar can automatically pull events from a public Google Calendar! See **[GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md)** for detailed setup instructions.

### Quick Start:
1. Get a Google Calendar API key
2. Make your calendar public
3. Update the configuration in `script.js`
4. Events will automatically sync!

## Customization

### Manual Event Entry (Alternative to Google Calendar)
If you prefer not to use Google Calendar, you can manually edit the `getSampleEvents()` function in `script.js`:

```javascript
{
    id: 1,
    title: "Event Name",
    date: "2026-01-15",  // YYYY-MM-DD format
    time: "6:00 PM - 9:00 PM",
    location: "Event Location",
    category: "fun-event",  // fun-event, fundraising, ministry-planned, teen-service
    categoryLabel: "Fun Event"
}
```

### Changing Colors
Modify the CSS custom properties in `styles.css` for event categories:
- `.fun-event`: Purple (#9f7aea)
- `.fundraising`: Green (#48bb78)
- `.ministry-planned`: Blue (#4299e1)
- `.teen-service`: Orange (#ed8936)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Design Philosophy

The application prioritizes:
- **Clarity**: Easy-to-read typography and clear visual hierarchy
- **Accessibility**: High contrast, readable fonts, organized information
- **Youth-Friendly**: Modern, vibrant design appealing to younger audiences
- **Professional**: Maintains appropriate appearance for religious organization
