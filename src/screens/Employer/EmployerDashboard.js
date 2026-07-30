import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import DashboardCard from '../../components/DashboardCard';

export default function EmployerDashboard() {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title="Employer Dashboard" subtitle="Overview & Team Metrics" />
      <DashboardCard
        title="Total Employees"
        value="0"
        subtitle="Registered workforce"
        accentColor="#0066cc"
      />
      <DashboardCard
        title="Active Tasks"
        value="0"
        subtitle="Tasks currently in progress"
        accentColor="#f39c12"
      />
      <DashboardCard
        title="Pending Leave Requests"
        value="0"
        subtitle="Awaiting review"
        accentColor="#e74c3c"
      />
      <DashboardCard
        title="Completed Tasks"
        value="0"
        subtitle="Successfully finished"
        accentColor="#2ecc71"
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
