import {
  isToday,
  isYesterday,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  const daysDiff = differenceInDays(new Date(), date);
  if (daysDiff < 7) return `${daysDiff} days ago`;

  const weeksDiff = differenceInWeeks(new Date(), date);
  if (weeksDiff < 4) return `${weeksDiff} weeks ago`;

  const monthsDiff = differenceInMonths(new Date(), date);
  return `${monthsDiff} months ago`;
};
