export const ROLES = {
  EMPLOYER: 'employer',
  EMPLOYEE: 'employee',
};

export const TABLES = {
  PROFILES: 'profiles',
  TASKS: 'tasks',
  LEAVE_REQUESTS: 'leave_requests',
  LEAVES: 'leave_requests',
  ANNOUNCEMENTS: 'announcements',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SCREENS = {
  AUTH: {
    LOGIN: 'Login',
  },
  EMPLOYER: {
    DASHBOARD: 'EmployerDashboard',
    EMPLOYEE_LIST: 'EmployeeList',
    ADD_EMPLOYEE: 'AddEmployee',
    TASK_MANAGEMENT: 'TaskManagement',
    LEAVE_REQUESTS: 'LeaveRequests',
    PROFILE: 'EmployerProfile',
  },
  EMPLOYEE: {
    DASHBOARD: 'EmployeeDashboard',
    MY_TASKS: 'MyTasks',
    APPLY_LEAVE: 'ApplyLeave',
    PROFILE: 'EmployeeProfile',
  },
};
