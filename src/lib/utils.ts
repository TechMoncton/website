import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize time to consistent 12-hour format
export function normalizeTime(time: string): string {
  if (/[ap]m/i.test(time)) return time;
  const match = time.match(/^(\d{1,2})[h:](\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  }
  return time;
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
