import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function MyTasks() {
  return (
    <View style={styles.container}>
      <AppHeader title="My Tasks" subtitle="Assigned Tasks & Updates" />
      <EmptyState
        message="No Tasks Assigned"
        subtitle="Your assigned tasks will appear here."
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
