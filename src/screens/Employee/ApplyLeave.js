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
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { leaveService } from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import { LEAVE_STATUS } from '../../utils/constants';

const LEAVE_TYPES = ['Casual', 'Sick', 'Emergency', 'Other'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Calendar Modal State
  const [pickerTarget, setPickerTarget] = useState(null); // 'start' | 'end' | null
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

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

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${shortMonths[m] || ''} ${y}`;
  };

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

  const openDatePicker = (target) => {
    setPickerTarget(target);
    const activeVal = target === 'start' ? startDate : endDate;
    if (activeVal) {
      const parts = activeVal.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
        return;
      }
    }
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const closeDatePicker = () => {
    setPickerTarget(null);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDateDisabled = (day) => {
    const cellDate = new Date(viewYear, viewMonth, day);
    cellDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickerTarget === 'start') {
      return cellDate < today;
    }

    if (pickerTarget === 'end') {
      const minEnd = startDate ? new Date(startDate + 'T00:00:00') : today;
      minEnd.setHours(0, 0, 0, 0);
      return cellDate < minEnd;
    }

    return false;
  };

  const handleSelectDay = (day) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mStr}-${dStr}`;

    if (pickerTarget === 'start') {
      setStartDate(dateStr);
      // Auto update/reset End Date if it is now before the new Start Date
      if (endDate && new Date(endDate + 'T00:00:00') < new Date(dateStr + 'T00:00:00')) {
        setEndDate(dateStr);
      }
    } else if (pickerTarget === 'end') {
      setEndDate(dateStr);
    }

    if (errorMessage) setErrorMessage('');
    closeDatePicker();
  };

  const validateForm = () => {
    if (!leaveType) {
      setErrorMessage('Please select a leave type.');
      return false;
    }
    if (!startDate) {
      setErrorMessage('Please select a start date.');
      return false;
    }
    if (!endDate) {
      setErrorMessage('Please select an end date.');
      return false;
    }

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

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
        start_date: startDate,
        end_date: endDate,
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
            📅 {formatDisplayDate(item.start_date)} to {formatDisplayDate(item.end_date)}
          </Text>
          <Text style={styles.daysText}>({numDays} {numDays === 1 ? 'day' : 'days'})</Text>
        </View>

        {item.reason ? (
          <Text style={styles.reasonText}>"{item.reason}"</Text>
        ) : null}
      </View>
    );
  };

  // Calendar Grid Calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const activeDateVal = pickerTarget === 'start' ? startDate : endDate;

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

          {/* Date Picker Buttons */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => !isSubmitting && openDatePicker('start')}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={startDate ? styles.dateTextSelected : styles.dateTextPlaceholder}>
                  {startDate ? formatDisplayDate(startDate) : 'Select start date'}
                </Text>
                <Feather name="calendar" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => !isSubmitting && openDatePicker('end')}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={endDate ? styles.dateTextSelected : styles.dateTextPlaceholder}>
                  {endDate ? formatDisplayDate(endDate) : 'Select end date'}
                </Text>
                <Feather name="calendar" size={18} color="#64748b" />
              </TouchableOpacity>
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

      {/* Cross-Platform Calendar Modal */}
      <Modal
        visible={Boolean(pickerTarget)}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDatePicker}
        >
          <TouchableOpacity
            style={styles.calendarCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {pickerTarget === 'start' ? 'Select Start Date' : 'Select End Date'}
              </Text>
              <TouchableOpacity onPress={closeDatePicker} style={styles.closeIconButton}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Month / Year Navigator */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowButton}>
                <Feather name="chevron-left" size={22} color="#1e293b" />
              </TouchableOpacity>
              <Text style={styles.monthNavTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navArrowButton}>
                <Feather name="chevron-right" size={22} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekdayText}>{wd}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const mStr = String(viewMonth + 1).padStart(2, '0');
                const dStr = String(day).padStart(2, '0');
                const cellDateStr = `${viewYear}-${mStr}-${dStr}`;

                const disabled = isDateDisabled(day);
                const isSelected = activeDateVal === cellDateStr;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      disabled && styles.dayCellDisabled,
                    ]}
                    onPress={() => !disabled && handleSelectDay(day)}
                    disabled={disabled}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Close */}
            <TouchableOpacity style={styles.cancelModalButton} onPress={closeDatePicker}>
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
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
  dateInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateTextPlaceholder: {
    fontSize: 14,
    color: '#999999',
  },
  dateTextSelected: {
    fontSize: 14,
    fontWeight: '600',
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

  /* Calendar Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeIconButton: {
    padding: 4,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  navArrowButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  monthNavTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#0066cc',
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#94a3b8',
  },
  cancelModalButton: {
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
});
