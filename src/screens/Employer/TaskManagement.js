import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function TaskManagement() {
  return (
    <View style={styles.container}>
      <AppHeader title="Task Management" subtitle="Create & Assign Employee Tasks" />
      <EmptyState
        message="No Tasks Created"
        subtitle="Assigned work items will appear here."
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
