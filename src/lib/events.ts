export interface Event {
  date: string;
  time: string;
  topic: string;
  presentation: string; // speaker
  year: number;
  location?: string;
}

const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/TechMoncton/Meetups/main';

export async function fetchEventsForYear(year: number): Promise<Event[]> {
  const url = `${GITHUB_RAW_BASE}/MeetUps%20${year}/MeetUps%20${year}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`No events found for year ${year}`);
      return [];
    }
    const events = await response.json();
    return events.map((event: any) => ({
      ...event,
      topic: Array.isArray(event.topic) ? event.topic.join(', ') : event.topic,
      presentation: Array.isArray(event.presentation)
        ? event.presentation.join(', ')
        : event.presentation,
      year,
    }));
  } catch (error) {
    console.error(`Error fetching events for year ${year}:`, error);
    return [];
  }
}

export function getNextFirstFriday(startDate: Date): Date {
  const date = new Date(startDate);
  // Start at the beginning of the month of the startDate
  date.setDate(1);

  // Find the first Friday of this month
  // 0 is Sunday, 5 is Friday
  let firstFriday = 1 + ((5 - date.getDay() + 7) % 7);
  date.setDate(firstFriday);
  date.setHours(18, 30, 0, 0); // 6:30 PM

  // If the first Friday of this month is in the past, go to next month
  if (date < startDate) {
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    firstFriday = 1 + ((5 - date.getDay() + 7) % 7);
    date.setDate(firstFriday);
    date.setHours(18, 30, 0, 0);
  }

  return date;
}

export function getRecurringMeetup(): Event {
  const nextMeetupDate = getNextFirstFriday(new Date());

  // Format date as "Month Day, Year" to match existing data format
  const dateString = nextMeetupDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    date: dateString,
    time: '6:30 PM',
    topic: 'events.recurringTopic', // i18n key
    presentation: 'events.recurringPresentation', // i18n key
    year: nextMeetupDate.getFullYear(),
    location: 'Venn Innovation (770 St. George Blvd, Moncton)',
  };
}

export async function fetchAllEvents(): Promise<Event[]> {
  const currentYear = new Date().getFullYear();
  // Fetch from 2024 onwards (when Moncton Tech Hive started tracking in GitHub)
  const startYear = 2024;
  const years = [];
  for (let year = startYear; year <= currentYear + 1; year++) {
    years.push(year);
  }

  const eventsArrays = await Promise.all(years.map(fetchEventsForYear));
  const fetchedEvents = eventsArrays.flat();

  // Add the recurring meetup
  const recurringMeetup = getRecurringMeetup();

  // Check if we already have an event on this date to avoid duplication
  const hasDuplicate = fetchedEvents.some(
    (e) =>
      parseEventDate(e.date).toDateString() ===
      parseEventDate(recurringMeetup.date).toDateString(),
  );

  if (!hasDuplicate) {
    fetchedEvents.push(recurringMeetup);
  }

  return fetchedEvents;
}

export function parseEventDate(dateStr: string): Date {
  // Handle formats like "January 15, 2025" or "2025-01-15"
  return new Date(dateStr);
}

export function isUpcoming(event: Event): boolean {
  const eventDate = parseEventDate(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export function sortByDate(events: Event[], ascending = true): Event[] {
  return [...events].sort((a, b) => {
    const dateA = parseEventDate(a.date).getTime();
    const dateB = parseEventDate(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

export function getUpcomingEvents(events: Event[]): Event[] {
  return sortByDate(events.filter(isUpcoming), true);
}

export function getPastEvents(events: Event[]): Event[] {
  return sortByDate(
    events.filter((e) => !isUpcoming(e)),
    false,
  );
}
