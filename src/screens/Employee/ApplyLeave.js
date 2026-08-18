import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { leaveService } from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import { LEAVE_STATUS } from '../../utils/constants';

const LEAVE_TYPES = ['Casual', 'Sick', 'Emergency', 'Other'];

export default function ApplyLeave({ navigation }) {
  const { user } = useAuth();

  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchLeaveHistory = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await leaveService.getEmployeeLeaves(user.id);
      setLeaves(data);
    } catch (err) {
      console.warn('Failed to fetch leave history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchLeaveHistory();
    });
    return unsubscribe;
  }, [navigation, fetchLeaveHistory]);

  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const validateForm = () => {
    if (!leaveType) {
      setErrorMessage('Please select a leave type.');
      return false;
    }
    if (!startDate.trim()) {
      setErrorMessage('Start date is required.');
      return false;
    }
    if (!endDate.trim()) {
      setErrorMessage('End date is required.');
      return false;
    }

    const start = new Date(startDate.trim());
    const end = new Date(endDate.trim());

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (end < start) {
        setErrorMessage('End date cannot be before start date.');
        return false;
      }
    }

    if (!reason.trim()) {
      setErrorMessage('Reason for leave is required.');
      return false;
    }

    return true;
  };

  const handleSubmitLeave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.createLeaveRequest({
        employee_id: user.id,
        leave_type: leaveType,
        start_date: startDate.trim(),
        end_date: endDate.trim(),
        reason: reason.trim(),
      });

      setSuccessMessage('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('Casual');

      await fetchLeaveHistory(true);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case LEAVE_STATUS.APPROVED:
        return { badge: styles.statusApproved, text: styles.statusTextApproved };
      case LEAVE_STATUS.REJECTED:
        return { badge: styles.statusRejected, text: styles.statusTextRejected };
      default:
        return { badge: styles.statusPending, text: styles.statusTextPending };
    }
  };

  const renderLeaveCard = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const numDays = calculateDays(item.start_date, item.end_date);

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.leave_type || 'Leave'}</Text>
          </View>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.datesRow}>
          <Text style={styles.datesText}>
            📅 {item.start_date} to {item.end_date}
          </Text>
          <Text style={styles.daysText}>({numDays} {numDays === 1 ? 'day' : 'days'})</Text>
        </View>

        {item.reason ? (
          <Text style={styles.reasonText}>"{item.reason}"</Text>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader title="Apply Leave" subtitle="Submit Leave Requests & View History" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLeaveHistory(true)}
            colors={['#0066cc']}
          />
        }
      >
        {/* Leave Application Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Request Time Off</Text>

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
            <Text style={styles.label}>Leave Type *</Text>
            <View style={styles.typeContainer}>
              {LEAVE_TYPES.map((type) => {
                const isSelected = leaveType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, isSelected && styles.typeChipActive]}
                    onPress={() => !isSubmitting && setLeaveType(type)}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Start Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                editable={!isSubmitting}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>End Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="State your reason for leave..."
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
              editable={!isSubmitting}
            />
          </View>

          <PrimaryButton
            title="Submit Leave Request"
            onPress={handleSubmitLeave}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>

        {/* Leave History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>My Leave History</Text>

          {loading && !refreshing ? (
            <LoadingSpinner />
          ) : leaves.length === 0 ? (
            <EmptyState
              message="No Leave History"
              subtitle="Submitted leave applications will appear here."
            />
          ) : (
            <FlatList
              data={leaves}
              keyExtractor={(item) => item.id}
              renderItem={renderLeaveCard}
              scrollEnabled={false}
            />
          )}
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
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
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
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  typeChipActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fde8e8',
    borderColor: '#f8b4b4',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#9b1c1c',
    fontSize: 13,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#def7ec',
    borderColor: '#bcf0da',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    color: '#03543f',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  historySection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusTextPending: {
    color: '#b45309',
  },
  statusApproved: {
    backgroundColor: '#def7ec',
  },
  statusTextApproved: {
    color: '#03543f',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusTextRejected: {
    color: '#b91c1c',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  datesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  daysText: {
    fontSize: 12,
    color: '#64748b',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
});
