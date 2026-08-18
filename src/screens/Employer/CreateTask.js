import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { taskService } from '../../services/taskService';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { SCREENS, TASK_STATUS } from '../../utils/constants';

export default function CreateTask({ navigation }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getEmployees();
        setEmployees(data);
      } catch (err) {
        console.warn('Failed to load employees for assignment:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const validateForm = () => {
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return false;
    }

    if (!selectedEmployee) {
      setErrorMessage('Please assign an employee to this task.');
      return false;
    }

    return true;
  };

  const handleCreateTask = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        assigned_to: selectedEmployee.id,
        created_by: user?.id || null,
        priority: priority.toLowerCase(),
        deadline: deadline.trim() || null,
        status: TASK_STATUS.PENDING,
      });

      setSuccessMessage('Task created and assigned successfully!');

      setTimeout(() => {
        if (navigation?.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate(SCREENS.EMPLOYER.TASK_MANAGEMENT);
        }
      }, 1000);
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Create Task" subtitle="Assign new work item to an employee" />
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
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Implement Navigation Header"
              value={title}
              onChangeText={setTitle}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assign Employee *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton]}
              onPress={() => !isSubmitting && setShowEmployeeModal(true)}
              activeOpacity={0.8}
              disabled={isSubmitting || loadingEmployees}
            >
              <Text style={selectedEmployee ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                {loadingEmployees
                  ? 'Loading employees list...'
                  : selectedEmployee
                  ? `${selectedEmployee.full_name || selectedEmployee.email} (${selectedEmployee.department || 'General'})`
                  : 'Tap to select employee'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {['Low', 'Medium', 'High'].map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      isSelected && styles[`priority${p}Active`],
                    ]}
                    onPress={() => !isSubmitting && setPriority(p)}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.priorityText, isSelected && styles.priorityTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date / Deadline</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (Optional)"
              value={deadline}
              onChangeText={setDeadline}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide detailed instructions..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              editable={!isSubmitting}
            />
          </View>

          <PrimaryButton
            title="Create & Assign Task"
            onPress={handleCreateTask}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Employee Selection Modal */}
      <Modal
        visible={showEmployeeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmployeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Assignee</Text>

            {employees.length === 0 ? (
              <Text style={styles.noEmployeesText}>No employees registered yet.</Text>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.employeeItem}
                    onPress={() => {
                      setSelectedEmployee(item);
                      setShowEmployeeModal(false);
                    }}
                  >
                    <Text style={styles.employeeItemName}>{item.full_name || 'Unnamed Employee'}</Text>
                    <Text style={styles.employeeItemSub}>{item.email} {item.department ? `• ${item.department}` : ''}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowEmployeeModal(false)}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    justifyContent: 'center',
  },
  pickerTextPlaceholder: {
    color: '#999999',
    fontSize: 15,
  },
  pickerTextSelected: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    gap: 6,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityLowActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    borderWidth: 1,
  },
  priorityMediumActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
  },
  priorityHighActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  priorityTextActive: {
    color: '#1e293b',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  employeeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  employeeItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  employeeItemSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  noEmployeesText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
});
