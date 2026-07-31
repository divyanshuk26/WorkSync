import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import AppHeader from '../../components/AppHeader';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { dashboardService } from '../../services/dashboardService';

export default function EmployerDashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeTasks: 0,
    pendingLeaves: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await dashboardService.getEmployerMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  const isDataEmpty =
    metrics.totalEmployees === 0 &&
    metrics.activeTasks === 0 &&
    metrics.pendingLeaves === 0 &&
    metrics.completedTasks === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadDashboardData(true)}
          colors={['#0066cc']}
        />
      }
    >
      <AppHeader title="Employer Dashboard" subtitle="Overview & Team Metrics" />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton
            title="Retry"
            onPress={() => loadDashboardData()}
            style={styles.retryButton}
          />
        </View>
      ) : null}

      <DashboardCard
        title="Total Employees"
        value={String(metrics.totalEmployees)}
        subtitle="Registered workforce"
        accentColor="#0066cc"
      />
      <DashboardCard
        title="Active Tasks"
        value={String(metrics.activeTasks)}
        subtitle="Tasks currently in progress"
        accentColor="#f39c12"
      />
      <DashboardCard
        title="Pending Leave Requests"
        value={String(metrics.pendingLeaves)}
        subtitle="Awaiting review"
        accentColor="#e74c3c"
      />
      <DashboardCard
        title="Completed Tasks"
        value={String(metrics.completedTasks)}
        subtitle="Successfully finished"
        accentColor="#2ecc71"
      />

      {isDataEmpty && !error ? (
        <EmptyState
          message="No Workforce Activity Yet"
          subtitle="Metrics will automatically update as employees, tasks, and leave requests are added."
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fde8e8',
    borderColor: '#f8b4b4',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#9b1c1c',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
