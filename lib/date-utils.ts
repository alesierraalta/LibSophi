import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/es';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(calendar);
dayjs.extend(updateLocale);

// Set Spanish locale
dayjs.locale('es');

// Update locale with custom formats
dayjs.updateLocale('es', {
  calendar: {
    lastDay: '[Ayer a las] LT',
    sameDay: '[Hoy a las] LT',
    nextDay: '[Mañana a las] LT',
    lastWeek: '[el] dddd [pasado a las] LT',
    nextWeek: 'dddd [a las] LT',
    sameElse: 'L'
  }
});

export { dayjs };

// Common date formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD [de] MMMM [de] YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  DATETIME_LONG: 'DD [de] MMMM [de] YYYY [a las] HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Date utility functions
export const dateUtils = {
  // Format dates
  format: (date: string | Date | dayjs.Dayjs, format: string = DATE_FORMATS.SHORT) => {
    return dayjs(date).format(format);
  },

  // Get relative time (hace 2 horas, en 3 días, etc.)
  fromNow: (date: string | Date | dayjs.Dayjs) => {
    return dayjs(date).fromNow();
  },

  // Get time to a specific date
  to: (date: string | Date | dayjs.Dayjs, compareDate?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).to(compareDate);
  },

  // Calendar format (Hoy, Ayer, etc.)
  calendar: (date: string | Date | dayjs.Dayjs) => {
    return dayjs(date).calendar();
  },

  // Check if date is valid
  isValid: (date: string | Date | dayjs.Dayjs) => {
    return dayjs(date).isValid();
  },

  // Get start/end of periods
  startOf: (date: string | Date | dayjs.Dayjs, unit: dayjs.ManipulateType) => {
    return dayjs(date).startOf(unit);
  },

  endOf: (date: string | Date | dayjs.Dayjs, unit: dayjs.ManipulateType) => {
    return dayjs(date).endOf(unit);
  },

  // Add/subtract time
  add: (date: string | Date | dayjs.Dayjs, amount: number, unit: dayjs.ManipulateType) => {
    return dayjs(date).add(amount, unit);
  },

  subtract: (date: string | Date | dayjs.Dayjs, amount: number, unit: dayjs.ManipulateType) => {
    return dayjs(date).subtract(amount, unit);
  },

  // Comparisons
  isAfter: (date: string | Date | dayjs.Dayjs, compareDate: string | Date | dayjs.Dayjs) => {
    return dayjs(date).isAfter(compareDate);
  },

  isBefore: (date: string | Date | dayjs.Dayjs, compareDate: string | Date | dayjs.Dayjs) => {
    return dayjs(date).isBefore(compareDate);
  },

  isSame: (date: string | Date | dayjs.Dayjs, compareDate: string | Date | dayjs.Dayjs, unit?: dayjs.OpUnitType) => {
    return dayjs(date).isSame(compareDate, unit);
  },

  // Timezone utilities
  utc: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs.utc(date);
  },

  timezone: (date: string | Date | dayjs.Dayjs, tz: string) => {
    return dayjs(date).tz(tz);
  },

  // Duration utilities
  duration: (input: dayjs.DurationInputArg1, unit?: dayjs.DurationInputArg2) => {
    return dayjs.duration(input, unit);
  },

  // Get difference between dates
  diff: (date: string | Date | dayjs.Dayjs, compareDate: string | Date | dayjs.Dayjs, unit?: dayjs.QUnitType) => {
    return dayjs(date).diff(compareDate, unit);
  },

  // Current date/time
  now: () => dayjs(),
  today: () => dayjs().startOf('day'),
  tomorrow: () => dayjs().add(1, 'day').startOf('day'),
  yesterday: () => dayjs().subtract(1, 'day').startOf('day'),

  // Week utilities
  startOfWeek: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).startOf('week');
  },

  endOfWeek: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).endOf('week');
  },

  // Month utilities
  startOfMonth: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).startOf('month');
  },

  endOfMonth: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).endOf('month');
  },

  // Year utilities
  startOfYear: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).startOf('year');
  },

  endOfYear: (date?: string | Date | dayjs.Dayjs) => {
    return dayjs(date).endOf('year');
  },

  // Reading time calculator
  calculateReadingTime: (text: string, wordsPerMinute: number = 200) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  },

  // Format reading time
  formatReadingTime: (minutes: number) => {
    if (minutes < 1) return 'Menos de 1 min';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hora' : `${hours} horas`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  },

  // Age calculation
  getAge: (birthDate: string | Date | dayjs.Dayjs) => {
    return dayjs().diff(birthDate, 'year');
  },

  // Business days calculation
  isWeekend: (date: string | Date | dayjs.Dayjs) => {
    const day = dayjs(date).day();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  isWeekday: (date: string | Date | dayjs.Dayjs) => {
    return !dateUtils.isWeekend(date);
  },

  // Get next business day
  nextBusinessDay: (date: string | Date | dayjs.Dayjs) => {
    let nextDay = dayjs(date).add(1, 'day');
    while (dateUtils.isWeekend(nextDay)) {
      nextDay = nextDay.add(1, 'day');
    }
    return nextDay;
  },

  // Format for different contexts
  formatForPost: (date: string | Date | dayjs.Dayjs) => {
    const now = dayjs();
    const postDate = dayjs(date);
    const diffInMinutes = now.diff(postDate, 'minute');
    const diffInHours = now.diff(postDate, 'hour');
    const diffInDays = now.diff(postDate, 'day');

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    if (diffInDays < 7) return `hace ${diffInDays}d`;
    
    return postDate.format(DATE_FORMATS.SHORT);
  },

  // Create date range
  dateRange: (start: string | Date | dayjs.Dayjs, end: string | Date | dayjs.Dayjs, unit: dayjs.ManipulateType = 'day') => {
    const dates = [];
    let current = dayjs(start).startOf(unit);
    const endDate = dayjs(end).startOf(unit);

    while (current.isBefore(endDate) || current.isSame(endDate)) {
      dates.push(current);
      current = current.add(1, unit);
    }

    return dates;
  }
};

export default dateUtils;
