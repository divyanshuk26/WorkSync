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
};
