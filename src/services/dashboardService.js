import { employeeService } from './employeeService';
import { taskService } from './taskService';
import { leaveService } from './leaveService';

export const dashboardService = {
  async getEmployerMetrics() {
    try {
      const [
        employeesRes,
        activeTasksRes,
        pendingLeavesRes,
        completedTasksRes,
      ] = await Promise.allSettled([
        employeeService.getEmployeeCount(),
        taskService.getActiveTaskCount(),
        leaveService.getPendingLeaveCount(),
        taskService.getCompletedTaskCount(),
      ]);

      const totalEmployees =
        employeesRes.status === 'fulfilled' ? employeesRes.value : 0;

      const activeTasks =
        activeTasksRes.status === 'fulfilled' ? activeTasksRes.value : 0;

      const pendingLeaves =
        pendingLeavesRes.status === 'fulfilled' ? pendingLeavesRes.value : 0;

      const completedTasks =
        completedTasksRes.status === 'fulfilled' ? completedTasksRes.value : 0;

      return {
        totalEmployees,
        activeTasks,
        pendingLeaves,
        completedTasks,
      };
    } catch (error) {
      return {
        totalEmployees: 0,
        activeTasks: 0,
        pendingLeaves: 0,
        completedTasks: 0,
      };
    }
  },
};
