import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ message = 'No data available', subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#999999',
    marginTop: 6,
    textAlign: 'center',
  },
});
