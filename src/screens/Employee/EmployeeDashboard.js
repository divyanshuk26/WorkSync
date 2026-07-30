import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import DashboardCard from '../../components/DashboardCard';

export default function EmployeeDashboard() {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Employee Dashboard" subtitle="Daily Overview & Quick Stats" />
      <DashboardCard
        title="Today's Tasks"
        value="0"
        subtitle="Pending work for today"
        accentColor="#0066cc"
      />
      <DashboardCard
        title="Completed Tasks"
        value="0"
        subtitle="Finished items"
        accentColor="#2ecc71"
      />
      <DashboardCard
        title="Leave Balance"
        value="0 Days"
        subtitle="Available annual leaves"
        accentColor="#9b59b6"
      />
      <DashboardCard
        title="Attendance Status"
        value="Not Marked"
        subtitle="Today's check-in status"
        accentColor="#e67e22"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
