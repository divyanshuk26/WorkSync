import { supabase } from '../config/supabase';
import { TABLES, ATTENDANCE_STATUS } from '../utils/constants';

export const attendanceService = {
  // Helper to format ISO to date string YYYY-MM-DD
  getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Helper to calculate total working hours string & numeric hours
  calculateWorkingHours(checkInIso, checkOutIso) {
    if (!checkInIso || !checkOutIso) return { text: '0 hrs 0 mins', numeric: 0 };
    const start = new Date(checkInIso);
    const end = new Date(checkOutIso);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { text: '0 hrs 0 mins', numeric: 0 };
    }

    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const numericHours = parseFloat((totalMinutes / 60).toFixed(2));

    return {
      text: `${hours} hrs ${minutes} mins`,
      numeric: numericHours,
    };
  },

  async getTodayAttendance(userId, todayDate = this.getTodayDateString()) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTENDANCE)
        .select('*')
        .eq('employee_id', userId)
        .eq('attendance_date', todayDate)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.warn('getTodayAttendance query warning:', err?.message);
      return null;
    }
  },

  async checkIn(userId, todayDate = this.getTodayDateString()) {
    const nowIso = new Date().toISOString();

    // Check if record already exists to prevent duplicates
    const existing = await this.getTodayAttendance(userId, todayDate);
    if (existing && existing.check_in) {
      return existing;
    }

    const payload = {
      employee_id: userId,
      attendance_date: todayDate,
      check_in: nowIso,
      status: ATTENDANCE_STATUS.PRESENT,
      total_working_hours: 0,
    };

    const { data, error } = await supabase
      .from(TABLES.ATTENDANCE)
      .upsert(payload, { onConflict: 'employee_id,attendance_date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkOut(attendanceId, checkInIso) {
    const nowIso = new Date().toISOString();
    const hoursInfo = this.calculateWorkingHours(checkInIso, nowIso);

    const { data, error } = await supabase
      .from(TABLES.ATTENDANCE)
      .update({
        check_out: nowIso,
        status: ATTENDANCE_STATUS.COMPLETED,
        total_working_hours: hoursInfo.numeric,
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEmployeeAttendanceHistory(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTENDANCE)
        .select('*')
        .eq('employee_id', userId)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('getEmployeeAttendanceHistory query warning:', err?.message);
      return [];
    }
  },

  async getMonthlySummary(userId) {
    const records = await this.getEmployeeAttendanceHistory(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${currentMonth}`;

    const monthRecords = records.filter((r) =>
      r.attendance_date ? r.attendance_date.startsWith(monthPrefix) : false
    );

    let presentDays = 0;
    let completedDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let halfDays = 0;

    monthRecords.forEach((r) => {
      const st = (r.status || '').toLowerCase();
      if (st === ATTENDANCE_STATUS.PRESENT) presentDays++;
      else if (st === ATTENDANCE_STATUS.COMPLETED) completedDays++;
      else if (st === ATTENDANCE_STATUS.ABSENT) absentDays++;
      else if (st === ATTENDANCE_STATUS.LEAVE) leaveDays++;
      else if (st === ATTENDANCE_STATUS.HALF_DAY) halfDays++;
    });

    const totalPresent = presentDays + completedDays;
    const totalWorkingDays = monthRecords.length;

    return {
      totalWorkingDays,
      presentDays: totalPresent,
      absentDays,
      leaveDays,
      halfDays,
    };
  },
};
