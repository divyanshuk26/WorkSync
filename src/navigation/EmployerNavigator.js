import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EmployerDashboard from '../screens/Employer/EmployerDashboard';
import EmployeeList from '../screens/Employer/EmployeeList';
import TaskManagement from '../screens/Employer/TaskManagement';
import LeaveRequests from '../screens/Employer/LeaveRequests';
import EmployerProfile from '../screens/Employer/EmployerProfile';
import { SCREENS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function EmployerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={SCREENS.EMPLOYER.DASHBOARD}
        component={EmployerDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.EMPLOYEE_LIST}
        component={EmployeeList}
        options={{ title: 'Employees' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.TASK_MANAGEMENT}
        component={TaskManagement}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.LEAVE_REQUESTS}
        component={LeaveRequests}
        options={{ title: 'Leaves' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.PROFILE}
        component={EmployerProfile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
