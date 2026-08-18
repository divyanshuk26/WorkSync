import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { employeeService } from '../../services/employeeService';
import { SCREENS } from '../../utils/constants';

export default function EditEmployee({ route, navigation }) {
  const employee = route?.params?.employee || {};

  const [fullName, setFullName] = useState(employee.full_name || '');
  const [department, setDepartment] = useState(employee.department || '');
  const [designation, setDesignation] = useState(employee.designation || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [isActive, setIsActive] = useState(employee.is_active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return false;
    }
    return true;
  };

  const handleUpdateEmployee = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await employeeService.updateEmployee(employee.id, {
        full_name: fullName.trim(),
        department: department.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        is_active: isActive,
      });

      setSuccessMessage('Employee profile updated successfully!');

      setTimeout(() => {
        if (navigation?.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate(SCREENS.EMPLOYER.EMPLOYEE_LIST);
        }
      }, 1000);
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to update employee profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Edit Employee" subtitle="Update member profile & status" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Read-Only)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={employee.email || ''}
              editable={false}
            />
            <Text style={styles.readOnlyNote}>Email belongs to authentication account and cannot be modified.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              value={fullName}
              onChangeText={setFullName}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engineering, Sales"
              value={department}
              onChangeText={setDepartment}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Designation</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Frontend Developer"
              value={designation}
              onChangeText={setDesignation}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555-0199"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Status</Text>
            <View style={styles.statusToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  isActive && styles.statusOptionActiveGreen,
                ]}
                onPress={() => !isSubmitting && setIsActive(true)}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    isActive && styles.statusOptionTextActiveGreen,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  !isActive && styles.statusOptionInactiveGray,
                ]}
                onPress={() => !isSubmitting && setIsActive(false)}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    !isActive && styles.statusOptionTextInactiveGray,
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <PrimaryButton
            title="Save Changes"
            onPress={handleUpdateEmployee}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  readOnlyInput: {
    backgroundColor: '#eef1f5',
    color: '#64748b',
    borderColor: '#cbd5e1',
  },
  readOnlyNote: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    gap: 6,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionActiveGreen: {
    backgroundColor: '#def7ec',
    borderColor: '#bcf0da',
    borderWidth: 1,
  },
  statusOptionInactiveGray: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  statusOptionTextActiveGreen: {
    color: '#03543f',
  },
  statusOptionTextInactiveGray: {
    color: '#334155',
  },
  errorBanner: {
    backgroundColor: '#fde8e8',
    borderColor: '#f8b4b4',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#9b1c1c',
    fontSize: 14,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#def7ec',
    borderColor: '#bcf0da',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#03543f',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 12,
  },
});
