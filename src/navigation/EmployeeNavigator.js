import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
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
        tabBarActiveTintColor: '#059669',
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
        name={SCREENS.EMPLOYEE.DASHBOARD}
        component={EmployeeDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.MY_TASKS}
        component={MyTasks}
        options={{
          title: 'My Tasks',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.APPLY_LEAVE}
        component={ApplyLeave}
        options={{
          title: 'Apply Leave',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMPLOYEE.PROFILE}
        component={EmployeeProfile}
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
