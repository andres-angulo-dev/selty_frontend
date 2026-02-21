import { Strings } from '@/shared/constants';

// Precision level for date formatting
type DatePrecision = "seconds" | 'days';

// Formats a date as a relative string (e.g  secondes: 'since 2 min' or days : 'since 3 days')
export const formatRelativeDate = (date: Date, precision: DatePrecision = 'days'): string => {
    const now = new Date();
    const diffMs= now.getTime() - date.getTime(); // .getTime() converts a Date to milliseconds since 01/01/1970

    // Convert to each unit
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Seconds precision 
    if (precision === 'seconds') {
        if (diffSeconds < 60) return Strings.dates.justNow;
        if (diffMinutes < 60) return Strings.dates.minutesAgo(diffMinutes);
        if (diffHours < 24) return Strings.dates.hoursAgo(diffHours);
    }

    // Return the appropriate relative string based on the number of days
    if (diffDays === 0) return Strings.dates.today;
    if (diffDays === 1) return Strings.dates.yesterday;
    if (diffDays < 7) return Strings.dates.daysAgo(diffDays);

    // Convert days to weeks
    if (diffDays < 30) return Strings.dates.weeksAgo(diffWeeks);

    // Convert days to months
    if (diffDays < 365) return Strings.dates.monthsAgo(diffMonths);

    // Convert days to years
    return Strings.dates.yearsAgo(diffYears);

}

// Format a date to a readable string (e.g "30 juin 2025")
export const formatAbsoluteDate = (date: Date): string => {
    return date.toLocaleDateString(Strings.locale, {day: 'numeric', month: 'long', year: 'numeric'});
};