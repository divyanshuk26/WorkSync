import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import EmployerNavigator from './EmployerNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROLES } from '../utils/constants';

export default function AppNavigator() {
  const { user, role, loading } = useAuth();
// Conditional rendering 
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (role === ROLES.EMPLOYER) {
    return <EmployerNavigator />;
  }

  return <EmployeeNavigator />;
}
