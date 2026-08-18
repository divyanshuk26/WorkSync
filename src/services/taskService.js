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

  async getTasks() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey (
            id,
            full_name,
            email,
            designation,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to plain query if foreign key alias fails
        const { data: plainData, error: plainError } = await supabase
          .from(TABLES.TASKS)
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

  async getEmployeeTasks(userId) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTask({
    title,
    description,
    assigned_to,
    created_by,
    priority = 'medium',
    deadline = null,
    status = TASK_STATUS.PENDING,
  }) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .insert([
        {
          title,
          description: description || '',
          assigned_to,
          created_by: created_by || null,
          priority: priority ? priority.toLowerCase() : 'medium',
          deadline: deadline || null,
          status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTaskStatus(taskId, status) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update({ status: status.toLowerCase() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
