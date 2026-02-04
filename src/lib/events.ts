export interface Event {
  date: string;
  time: string;
  topic: string;
  presentation: string; // speaker
  year: number;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/TechMoncton/Meetups/main';

export async function fetchEventsForYear(year: number): Promise<Event[]> {
  const url = `${GITHUB_RAW_BASE}/MeetUps%20${year}/MeetUps%20${year}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`No events found for year ${year}`);
      return [];
    }
    const events = await response.json();
    return events.map((event: Omit<Event, 'year'>) => ({
      ...event,
      year,
    }));
  } catch (error) {
    console.error(`Error fetching events for year ${year}:`, error);
    return [];
  }
}

export async function fetchAllEvents(): Promise<Event[]> {
  const currentYear = new Date().getFullYear();
  // Fetch from 2024 onwards (when Tech Moncton started tracking in GitHub)
  const startYear = 2024;
  const years = [];
  for (let year = startYear; year <= currentYear + 1; year++) {
    years.push(year);
  }

  const eventsArrays = await Promise.all(years.map(fetchEventsForYear));
  return eventsArrays.flat();
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
  return sortByDate(events.filter(e => !isUpcoming(e)), false);
}
