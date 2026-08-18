import { supabase } from '../config/supabase';
import { TABLES, LEAVE_STATUS } from '../utils/constants';

export const leaveService = {
  async getPendingLeaveCount() {
    const { count, error } = await supabase
      .from(TABLES.LEAVE_REQUESTS)
      .select('*', { count: 'exact', head: true })
      .eq('status', LEAVE_STATUS.PENDING);

    if (error) throw error;
    return count || 0;
  },

  async createLeaveRequest({ employee_id, leave_type, start_date, end_date, reason }) {
    const { data, error } = await supabase
      .from(TABLES.LEAVE_REQUESTS)
      .insert([
        {
          employee_id,
          leave_type: leave_type || 'Casual',
          start_date,
          end_date,
          reason,
          status: LEAVE_STATUS.PENDING,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEmployeeLeaves(userId) {
    const { data, error } = await supabase
      .from(TABLES.LEAVE_REQUESTS)
      .select('*')
      .eq('employee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllLeaveRequests() {
    try {
      const { data, error } = await supabase
        .from(TABLES.LEAVE_REQUESTS)
        .select(`
          *,
          employee_profile:profiles!leave_requests_employee_id_fkey (
            id,
            full_name,
            email,
            department,
            designation
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to plain query if foreign key alias fails
        const { data: plainData, error: plainError } = await supabase
          .from(TABLES.LEAVE_REQUESTS)
          .select('*')
          .order('created_at', { ascending: false });

        if (plainError) throw plainError;
        return plainData || [];
      }

      return data || [];
    } catch (err) {
      throw err;
    }
  },

  async updateLeaveStatus(id, status) {
    const { data, error } = await supabase
      .from(TABLES.LEAVE_REQUESTS)
      .update({ status: status.toLowerCase() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
