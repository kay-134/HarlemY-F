# Google Calendar Integration Setup Guide

This guide will walk you through setting up Google Calendar integration so your events automatically populate on the website.

## Overview

Once configured, your calendar will:
- Automatically pull events from your public Google Calendar
- Display events in real-time (no manual updates needed)
- Categorize events based on keywords in titles/descriptions
- Show event dates, times, and locations

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "New Project"
4. Name your project (e.g., "Youth Ministry Calendar")
5. Click "Create"

### Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "Enable"

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click "**+ CREATE CREDENTIALS**" at the top
3. Select "**API key**"
4. Copy the API key that appears (you'll need this later)

**Important: Restrict Your API Key (Recommended for Security)**

5. Click "**Restrict Key**" (or "Edit API key" if the dialog closed)
6. Give your key a name like "Youth Calendar API Key"

**Option A - Application Restrictions (Recommended):**
7. Under "Application restrictions":
   - Select "**HTTP referrers (web sites)**"
   - Click "**ADD AN ITEM**"
   - Add your website URL: `https://YOUR-USERNAME.github.io/HarlemY-F/*`
   - Replace `YOUR-USERNAME` with your actual GitHub username
   - The `/*` at the end allows all pages on your site

**Option B - API Restrictions:**
8. Under "API restrictions":
   - Select "**Restrict key**"
   - Click the dropdown menu
   - **If you don't see "Google Calendar API":**
     - Make sure you completed Step 2 (Enable Google Calendar API)
     - Refresh the page and try again
     - Look for "Calendar API" or similar names
     - If still not visible, you can skip API restrictions for now and use HTTP referrer restrictions (Option A) instead
   - If you see it, check "**Google Calendar API**"

9. Click "**Save**"

**Note:** If you can't find Google Calendar API in the list:
- HTTP referrer restrictions (Option A) alone provide good security
- The API restriction will become available after the Calendar API is fully enabled (may take a few minutes)
- You can always come back and add API restrictions later

### Step 4: Make Your Calendar Public

1. Go to [Google Calendar](https://calendar.google.com/)
2. Find your calendar in the left sidebar under "My calendars"
3. Click the three dots next to your calendar name
4. Click "**Settings and sharing**"
5. Scroll down to "**Access permissions for events**"
6. Check the box for "**Make available to public**"
7. Click "OK" on the warning dialog

**Note:** Only make the calendar public if you're comfortable with anyone viewing these events.

### Step 5: Get Your Calendar ID

1. Still in Calendar Settings (from Step 4)
2. Scroll down to "**Integrate calendar**"
3. Copy the "**Calendar ID**" (it usually looks like: `yourname@group.calendar.google.com` or `yourname@gmail.com`)

### Step 6: Configure the Website

1. Open `script.js` in your project
2. Find the `GOOGLE_CALENDAR_CONFIG` section at the top (around line 11)
3. Replace the configuration values:

```javascript
const GOOGLE_CALENDAR_CONFIG = {
    apiKey: 'AIzaSyC1234567890abcdefghijklmnop',  // Your API key from Step 3
    calendarId: 'yourname@group.calendar.google.com',  // Your Calendar ID from Step 5
    enabled: true  // Change this to true to enable the integration
};
```

4. Save the file

### Step 7: Deploy and Test

1. Commit and push your changes to GitHub
2. GitHub Pages will automatically deploy your changes
3. Visit your website and verify events are loading

## Event Categories

Events are automatically categorized based on keywords in the title or description:

### Fun Event (Purple/Mauve Badge)
**Keywords:** game, movie, bowling, fun, night, party, social

**Example event titles:**
- "Youth Game Night"
- "Movie Marathon"
- "Social Gathering"

### Fundraising (Purple/Mauve Badge)
**Keywords:** fundraiser, bake sale, car wash, donation, fundraising

**Example event titles:**
- "Bake Sale Fundraiser"
- "Car Wash for Mission Trip"
- "Donation Drive"

### Y&F Ministry (Purple/Mauve Badge)
**Keywords:** bible, study, worship, ministry, prayer, devotion, retreat planning

**Example event titles:**
- "Bible Study Session"
- "Youth Worship Night"
- "Prayer Meeting"

### Teen Service (Purple/Mauve Badge)
**Keywords:** service, volunteer, community, outreach, mission, help

**Example event titles:**
- "Community Service Day"
- "Volunteer at Food Bank"
- "Mission Outreach"

**Tip:** Include these keywords in your event titles or descriptions to ensure proper categorization!

## Customizing Categories

Want to change which keywords map to which categories? Edit the `CATEGORY_KEYWORDS` object in `script.js`:

```javascript
const CATEGORY_KEYWORDS = {
    'fun-event': ['game', 'movie', 'bowling', 'fun', 'night', 'party', 'social'],
    'fundraising': ['fundraiser', 'bake sale', 'car wash', 'donation', 'fundraising'],
    'ministry-planned': ['bible', 'study', 'worship', 'ministry', 'prayer', 'devotion'],
    'teen-service': ['service', 'volunteer', 'community', 'outreach', 'mission', 'help']
};
```

## Adding Events to Google Calendar

Once set up, simply add events to your Google Calendar as normal:

1. Open Google Calendar
2. Click on a date to create a new event
3. Fill in:
   - **Event title** (include category keywords)
   - **Date and time**
   - **Location** (will display on the website)
   - **Description** (optional, can include category keywords)
4. Click "Save"

The event will automatically appear on your website within a few minutes!

## Troubleshooting

### Can't find Google Calendar API in restrictions dropdown

This is a common issue! Here's what to do:

1. **Make sure the API is enabled first:**
   - Go to **APIs & Services** > **Library**
   - Search for "Google Calendar API"
   - Make sure it shows "Enabled" (not "Enable")
   - If it says "Enable", click it and wait a few minutes

2. **Try refreshing the credentials page:**
   - After enabling the API, wait 2-3 minutes
   - Refresh your browser
   - Go back to edit your API key
   - Check the dropdown again

3. **Use HTTP referrer restrictions instead:**
   - This is actually MORE secure for websites
   - Under "Application restrictions", choose "HTTP referrers"
   - Add: `https://YOUR-USERNAME.github.io/HarlemY-F/*`
   - This limits the key to only work on your website

4. **Alternative names to look for:**
   - "Calendar API"
   - "Google Calendar API v3"
   - Sometimes it appears without "Google" prefix

5. **If all else fails:**
   - Use HTTP referrer restrictions (step 3 above)
   - Skip API restrictions for now
   - Your key will still work, just be careful not to share it publicly
   - You can add API restrictions later once it appears

### Events aren't showing up

1. **Check configuration:**
   - Verify `enabled: true` in `GOOGLE_CALENDAR_CONFIG`
   - Confirm API key and Calendar ID are correct
   - No typos in the configuration

2. **Check calendar permissions:**
   - Calendar must be set to "Make available to public"
   - Wait a few minutes after making it public

3. **Check browser console:**
   - Open browser Developer Tools (F12)
   - Look for error messages in the Console tab
   - Common errors:
     - `API key not valid` - Double-check your API key
     - `404 Not Found` - Calendar ID might be wrong
     - `403 Forbidden` - Calendar might not be public
     - `The API is not enabled` - Go enable it in Google Cloud Console

4. **Check API restrictions:**
   - In Google Cloud Console, verify the API key restrictions
   - Make sure Google Calendar API is enabled
   - If using HTTP referrer restrictions, make sure your domain is listed correctly

### Events are in the wrong category

- Add more specific keywords to your event titles
- Check the `CATEGORY_KEYWORDS` configuration
- Make sure keywords match the patterns defined

### Old events are showing

The calendar shows events from today up to 3 months in the future. Past events are automatically filtered out.

## Security Notes

- **API Key:** Your API key is restricted to only access Google Calendar API
- **Public Calendar:** Anyone with your calendar ID can view events if the calendar is public
- **Rate Limits:** Google Calendar API has usage limits (usually sufficient for personal use)
- **Consider:** If events contain sensitive information, do not make the calendar public

## Support

If you continue to have issues:
1. Check the browser console for error messages
2. Verify all steps were completed correctly
3. Try creating a test event with clear category keywords
4. Wait 5-10 minutes for Google Calendar changes to propagate

## Fallback Behavior

If Google Calendar integration fails or is disabled, the website will automatically display sample events. This ensures the calendar always has some data to show.
