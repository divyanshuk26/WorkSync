import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EmployeeDashboard from '../screens/Employee/EmployeeDashboard';
import MyTasks from '../screens/Employee/MyTasks';
import ApplyLeave from '../screens/Employee/ApplyLeave';
import EmployeeProfile from '../screens/Employee/EmployeeProfile';
import { SCREENS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function EmployeeNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={SCREENS.EMPLOYEE.DASHBOARD}
        component={EmployeeDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.MY_TASKS}
        component={MyTasks}
        options={{ title: 'My Tasks' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.APPLY_LEAVE}
        component={ApplyLeave}
        options={{ title: 'Apply Leave' }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.PROFILE}
        component={EmployeeProfile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
