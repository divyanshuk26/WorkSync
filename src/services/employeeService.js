import { supabase } from '../config/supabase';
import { TABLES, ROLES } from '../utils/constants';

export const employeeService = {
  async getEmployeeCount() {
    const { count, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*', { count: 'exact', head: true })
      .eq('role', ROLES.EMPLOYEE);

    if (error) throw error;
    return count || 0;
  },

  async getEmployees() {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('role', ROLES.EMPLOYEE)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addEmployee({ email, password, fullName, department, designation, phone }) {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: ROLES.EMPLOYEE,
        },
      },
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error('User creation failed.');
    }

    // 2. Insert / Upsert Profile into profiles table matching exact database schema
    const { data: profileData, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .upsert({
        id: userId,
        email: email,
        full_name: fullName,
        department: department || '',
        designation: designation || '',
        phone: phone || '',
        role: ROLES.EMPLOYEE,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    return profileData;
  },

  async updateEmployee(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEmployee(id) {
    const { error } = await supabase
      .from(TABLES.PROFILES)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
