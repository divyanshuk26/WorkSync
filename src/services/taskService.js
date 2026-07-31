import { supabase } from '../config/supabase';
import { TABLES, TASK_STATUS } from '../utils/constants';

export const taskService = {
  async getActiveTaskCount() {
    const { count, error } = await supabase
      .from(TABLES.TASKS)
      .select('*', { count: 'exact', head: true })
      .in('status', [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS]);

    if (error) throw error;
    return count || 0;
  },

  async getCompletedTaskCount() {
    const { count, error } = await supabase
      .from(TABLES.TASKS)
      .select('*', { count: 'exact', head: true })
      .eq('status', TASK_STATUS.COMPLETED);

    if (error) throw error;
    return count || 0;
  },
};
