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
  ATTENDANCE: 'attendance',
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

export const ATTENDANCE_STATUS = {
  NOT_MARKED: 'not_marked',
  PRESENT: 'present',
  COMPLETED: 'completed',
  ABSENT: 'absent',
  LEAVE: 'leave',
  HALF_DAY: 'half_day',
};

export const SCREENS = {
  AUTH: {
    LOGIN: 'Login',
  },
  EMPLOYER: {
    DASHBOARD: 'EmployerDashboard',
    EMPLOYEE_LIST: 'EmployeeList',
    ADD_EMPLOYEE: 'AddEmployee',
    EDIT_EMPLOYEE: 'EditEmployee',
    TASK_MANAGEMENT: 'TaskManagement',
    CREATE_TASK: 'CreateTask',
    EDIT_TASK: 'EditTask',
    LEAVE_REQUESTS: 'LeaveRequests',
    ATTENDANCE: 'EmployerAttendance',
    PROFILE: 'EmployerProfile',
  },
  EMPLOYEE: {
    DASHBOARD: 'EmployeeDashboard',
    ATTENDANCE: 'Attendance',
    MY_TASKS: 'MyTasks',
    APPLY_LEAVE: 'ApplyLeave',
    PROFILE: 'EmployeeProfile',
  },
};
