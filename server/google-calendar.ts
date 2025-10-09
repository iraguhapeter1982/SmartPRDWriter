import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    const cachedToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
    if (cachedToken) {
      return cachedToken;
    }
    // If cached settings exist but no token, fall through to refresh
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data?.items?.[0]);

  if (!connectionSettings) {
    throw new Error('Google Calendar connector not configured. Please set up the connector first.');
  }

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    throw new Error('Google Calendar not connected or access token not available');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getCalendarEmail() {
  const calendar = await getUncachableGoogleCalendarClient();
  const response = await calendar.calendarList.list();
  const primaryCalendar = response.data.items?.find(cal => cal.primary);
  return primaryCalendar?.id || null;
}

export async function syncCalendarEvents(userId: string, familyId: string) {
  const calendar = await getUncachableGoogleCalendarClient();
  const email = await getCalendarEmail();
  
  if (!email) {
    throw new Error('No primary calendar found');
  }

  // Fetch events from the next 30 days
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: thirtyDaysLater.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  
  return events.map(event => ({
    googleEventId: event.id,
    title: event.summary || 'Untitled Event',
    description: event.description || null,
    location: event.location || null,
    startTime: event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date || ''),
    endTime: event.end?.dateTime ? new Date(event.end.dateTime) : event.end?.date ? new Date(event.end.date) : null,
    allDay: !event.start?.dateTime,
    familyId,
  }));
}
