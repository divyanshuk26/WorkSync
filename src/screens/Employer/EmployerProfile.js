import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function EmployerProfile() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader title="Employer Profile" subtitle="Account Settings & Logout" />
      <View style={styles.content}>
        <PrimaryButton title="Log Out" onPress={signOut} style={styles.logoutButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
});
