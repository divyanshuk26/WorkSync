import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function EmployeeList() {
  return (
    <View style={styles.container}>
      <AppHeader title="Employee List" subtitle="Manage Organization Employees" />
      <EmptyState
        message="No Employees Found"
        subtitle="Employee directory will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
