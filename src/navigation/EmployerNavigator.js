import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import EmployerDashboard from '../screens/Employer/EmployerDashboard';
import EmployeeList from '../screens/Employer/EmployeeList';
import AddEmployee from '../screens/Employer/AddEmployee';
import EditEmployee from '../screens/Employer/EditEmployee';
import TaskManagement from '../screens/Employer/TaskManagement';
import CreateTask from '../screens/Employer/CreateTask';
import EditTask from '../screens/Employer/EditTask';
import LeaveRequests from '../screens/Employer/LeaveRequests';
import EmployerAttendance from '../screens/Employer/EmployerAttendance';
import EmployerProfile from '../screens/Employer/EmployerProfile';
import { SCREENS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function EmployerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 64,
          paddingBottom: Platform.OS === 'web' ? 8 : 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name={SCREENS.EMPLOYER.DASHBOARD}
        component={EmployerDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.EMPLOYEE_LIST}
        component={EmployeeList}
        options={{
          title: 'Employees',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.ADD_EMPLOYEE}
        component={AddEmployee}
        options={{
          title: 'Add Employee',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.EDIT_EMPLOYEE}
        component={EditEmployee}
        options={{
          title: 'Edit Employee',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.ATTENDANCE}
        component={EmployerAttendance}
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.TASK_MANAGEMENT}
        component={TaskManagement}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.CREATE_TASK}
        component={CreateTask}
        options={{
          title: 'Create Task',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.EDIT_TASK}
        component={EditTask}
        options={{
          title: 'Edit Task',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.LEAVE_REQUESTS}
        component={LeaveRequests}
        options={{
          title: 'Leaves',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYER.PROFILE}
        component={EmployerProfile}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
