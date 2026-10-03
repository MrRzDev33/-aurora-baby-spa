export type GuestCategory = 'Trial' | 'Pelanggan' | 'Influencer';

export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked-in'
  | 'In Treatment'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'No Show';

export interface Treatment {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reservation_code: string;
  mom_name: string;
  child_name: string;
  child_age: string;
  whatsapp: string;
  guest_category: GuestCategory;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:mm (24-hour)
  treatment_id: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithTreatment extends Reservation {
  treatment_name: string;
}

export interface DashboardStats {
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
}

export type CalendarViewType = 'month' | 'week' | 'day';

export interface ReservationFilter {
  searchQuery: string;
  dateFilter: string; // 'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom'
  customDate?: string;
  guestCategory: string; // 'all' | GuestCategory
  status: string; // 'all' | ReservationStatus
  treatmentId: string; // 'all' | id
  sortOrder: 'asc' | 'desc';
}
