import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function ApplyLeave() {
  return (
    <View style={styles.container}>
      <AppHeader title="Apply Leave" subtitle="Leave Request & History" />
      <EmptyState
        message="No Leave Applications"
        subtitle="Submitted leave requests will appear here."
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
