// Indonesian month and day names
export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const ENGLISH_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Returns current date ISO string (YYYY-MM-DD)
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format 'YYYY-MM-DD' into 'Jumat, 9 Oktober 2026'
 */
export function formatFullIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const d = new Date(year, month, day);

  const dayName = INDONESIAN_DAYS[d.getDay()];
  const monthName = INDONESIAN_MONTHS[month];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format 'YYYY-MM-DD' into '9 Oktober 2026'
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const monthName = INDONESIAN_MONTHS[month];
  return `${day} ${monthName} ${year}`;
}

/**
 * Format 'YYYY-MM-DD' into '09 Oct 2026'
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = String(parseInt(dayStr, 10)).padStart(2, '0');
  const monthName = ENGLISH_MONTHS_SHORT[month];
  return `${day} ${monthName} ${year}`;
}

/**
 * Check if dateStr matches today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getCurrentDateString();
}

/**
 * Check if dateStr is in the same week (Monday to Sunday) as today or target date
 */
export function isInCurrentWeek(dateStr: string, referenceDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const targetDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  // Determine Monday of reference week
  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const diffToMonday = ref.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
  const monday = new Date(ref.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return targetDate >= monday && targetDate <= sunday;
}

/**
 * Check if dateStr is in the same month and year as reference date
 */
export function isInCurrentMonth(dateStr: string, referenceDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const [yearStr, monthStr] = dateStr.split('-');
  return (
    parseInt(yearStr, 10) === referenceDate.getFullYear() &&
    parseInt(monthStr, 10) === referenceDate.getMonth() + 1
  );
}

/**
 * Shorten treatment name for calendar display
 * e.g. "Couple Massage Mom & Kids" -> "Couple Massage"
 */
export function getShortTreatmentName(name: string): string {
  if (!name) return '';
  if (name.includes('—')) {
    return name.split('—')[0].trim();
  }
  if (name.includes('&')) {
    return name.split('&')[0].trim();
  }
  if (name.length > 20) {
    return name.slice(0, 18) + '...';
  }
  return name;
}

/**
 * Clean phone number for WhatsApp link
 * +62812-9744-3286 -> 6281297443286
 */
export function getWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '');
  const formatted = cleaned.startsWith('0') ? '62' + cleaned.substring(1) : cleaned;
  return `https://wa.me/${formatted}`;
}

/**
 * Validates Indonesian or international phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}
