import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function LeaveRequests() {
  return (
    <View style={styles.container}>
      <AppHeader title="Leave Requests" subtitle="Review & Approve Employee Leaves" />
      <EmptyState
        message="No Leave Requests"
        subtitle="Pending leave approvals will appear here."
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
