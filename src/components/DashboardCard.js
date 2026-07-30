import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardCard({ title, value, subtitle, accentColor = '#0066cc' }) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
  },
});
