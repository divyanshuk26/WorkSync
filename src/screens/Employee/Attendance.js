import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { ATTENDANCE_STATUS } from '../../utils/constants';

export default function Attendance({ navigation }) {
  const { user } = useAuth();

  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    halfDays: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAttendanceData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const todayDate = attendanceService.getTodayDateString();
      const [todayData, historyData, summaryData] = await Promise.all([
        attendanceService.getTodayAttendance(user.id, todayDate),
        attendanceService.getEmployeeAttendanceHistory(user.id),
        attendanceService.getMonthlySummary(user.id),
      ]);

      setTodayRecord(todayData);
      setHistory(historyData);
      setSummary(summaryData);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchAttendanceData();
    });
    return unsubscribe;
  }, [navigation, fetchAttendanceData]);

  const handleCheckIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const updated = await attendanceService.checkIn(user.id);
      setTodayRecord(updated);
      setSuccessMessage('Checked in successfully! Have a productive day.');
      await fetchAttendanceData(true);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord || !todayRecord.check_in) {
      setErrorMessage('You must Check In before checking out.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const updated = await attendanceService.checkOut(todayRecord.id, todayRecord.check_in);
      setTodayRecord(updated);
      setSuccessMessage('Checked out successfully! Total working hours recorded.');
      await fetchAttendanceData(true);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateFormatted = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${shortMonths[m] || ''} ${y}`;
  };

  const getTodayDisplayHeader = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || ATTENDANCE_STATUS.NOT_MARKED).toLowerCase();
    switch (s) {
      case ATTENDANCE_STATUS.PRESENT:
        return { badge: styles.statusPresent, text: styles.statusTextPresent, label: 'Present' };
      case ATTENDANCE_STATUS.COMPLETED:
        return { badge: styles.statusCompleted, text: styles.statusTextCompleted, label: 'Completed' };
      case ATTENDANCE_STATUS.ABSENT:
        return { badge: styles.statusAbsent, text: styles.statusTextAbsent, label: 'Absent' };
      case ATTENDANCE_STATUS.LEAVE:
        return { badge: styles.statusLeave, text: styles.statusTextLeave, label: 'Leave' };
      case ATTENDANCE_STATUS.HALF_DAY:
        return { badge: styles.statusHalfDay, text: styles.statusTextHalfDay, label: 'Half Day' };
      default:
        return { badge: styles.statusNotMarked, text: styles.statusTextNotMarked, label: 'Not Marked' };
    }
  };

  const currentStatus = (todayRecord?.status || ATTENDANCE_STATUS.NOT_MARKED).toLowerCase();
  const isCheckedIn = currentStatus === ATTENDANCE_STATUS.PRESENT;
  const isCompleted = currentStatus === ATTENDANCE_STATUS.COMPLETED;

  const currentWorkingHoursText = todayRecord?.check_in && todayRecord?.check_out
    ? attendanceService.calculateWorkingHours(todayRecord.check_in, todayRecord.check_out).text
    : todayRecord?.check_in
    ? 'In Progress'
    : '0 hrs 0 mins';

  const filteredHistory = history.filter((item) => {
    if (activeFilter === 'all') return true;
    return (item.status || '').toLowerCase() === activeFilter;
  });

  const renderHistoryCard = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const checkInText = formatTimeOnly(item.check_in);
    const checkOutText = formatTimeOnly(item.check_out);
    const hoursInfo = attendanceService.calculateWorkingHours(item.check_in, item.check_out);

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyCardHeader}>
          <Text style={styles.historyDateText}>{formatDateFormatted(item.attendance_date)}</Text>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.historyMetaRow}>
          <View style={styles.historyMetaCol}>
            <Text style={styles.historyMetaLabel}>Check In</Text>
            <Text style={styles.historyMetaVal}>{checkInText}</Text>
          </View>

          <View style={styles.historyMetaCol}>
            <Text style={styles.historyMetaLabel}>Check Out</Text>
            <Text style={styles.historyMetaVal}>{checkOutText}</Text>
          </View>

          <View style={styles.historyMetaCol}>
            <Text style={styles.historyMetaLabel}>Work Hours</Text>
            <Text style={styles.historyMetaVal}>{hoursInfo.text}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Attendance" subtitle="Daily Check In & Working Hours" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAttendanceData(true)}
            colors={['#0066cc']}
          />
        }
      >
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

        {/* Today's Attendance Card */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeaderRow}>
            <View>
              <Text style={styles.todayLabel}>TODAY'S ATTENDANCE</Text>
              <Text style={styles.todayDateText}>{getTodayDisplayHeader()}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusBadgeStyle(currentStatus).badge]}>
              <Text style={[styles.statusText, getStatusBadgeStyle(currentStatus).text]}>
                {getStatusBadgeStyle(currentStatus).label}
              </Text>
            </View>
          </View>

          <View style={styles.timeGrid}>
            <View style={styles.timeCard}>
              <Feather name="log-in" size={18} color="#0066cc" style={styles.timeIcon} />
              <Text style={styles.timeCardLabel}>Check In</Text>
              <Text style={styles.timeCardValue}>{formatTimeOnly(todayRecord?.check_in)}</Text>
            </View>

            <View style={styles.timeCard}>
              <Feather name="log-out" size={18} color="#e11d48" style={styles.timeIcon} />
              <Text style={styles.timeCardLabel}>Check Out</Text>
              <Text style={styles.timeCardValue}>{formatTimeOnly(todayRecord?.check_out)}</Text>
            </View>

            <View style={styles.timeCard}>
              <Feather name="clock" size={18} color="#059669" style={styles.timeIcon} />
              <Text style={styles.timeCardLabel}>Working Hours</Text>
              <Text style={styles.timeCardValue}>{currentWorkingHoursText}</Text>
            </View>
          </View>

          {/* Check In / Check Out Action Buttons */}
          <View style={styles.actionContainer}>
            {!isCheckedIn && !isCompleted ? (
              <PrimaryButton
                title="Check In Now"
                onPress={handleCheckIn}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.checkInButton}
              />
            ) : isCheckedIn ? (
              <TouchableOpacity
                style={[styles.checkOutButton, isSubmitting && styles.disabledBtn]}
                onPress={handleCheckOut}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.checkOutButtonText}>
                  {isSubmitting ? 'Checking Out...' : 'Check Out Now'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadgeContainer}>
                <Feather name="check-circle" size={20} color="#059669" />
                <Text style={styles.completedBadgeText}>Attendance Completed for Today</Text>
              </View>
            )}
          </View>
        </View>

        {/* Monthly Summary Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryVal}>{summary.totalWorkingDays}</Text>
              <Text style={styles.summaryLbl}>Days Recorded</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: '#059669' }]}>{summary.presentDays}</Text>
              <Text style={styles.summaryLbl}>Present</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: '#0369a1' }]}>{summary.leaveDays}</Text>
              <Text style={styles.summaryLbl}>Leaves</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: '#e11d48' }]}>{summary.absentDays}</Text>
              <Text style={styles.summaryLbl}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Attendance History Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Attendance History</Text>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { key: 'all', label: 'All' },
              { key: ATTENDANCE_STATUS.COMPLETED, label: 'Completed' },
              { key: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
              { key: ATTENDANCE_STATUS.LEAVE, label: 'Leave' },
            ].map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading && !refreshing ? (
            <LoadingSpinner />
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              message="No Attendance Records"
              subtitle="Your previous check-in history will appear here."
            />
          ) : (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryCard}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
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
  todayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  todayDateText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  timeIcon: {
    marginBottom: 4,
  },
  timeCardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  timeCardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  actionContainer: {
    marginTop: 4,
  },
  checkInButton: {
    backgroundColor: '#0066cc',
  },
  checkOutButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  completedBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#def7ec',
    borderColor: '#bcf0da',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completedBadgeText: {
    color: '#03543f',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryLbl: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyMetaCol: {
    alignItems: 'center',
  },
  historyMetaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  historyMetaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusNotMarked: {
    backgroundColor: '#f1f5f9',
  },
  statusTextNotMarked: {
    color: '#64748b',
  },
  statusPresent: {
    backgroundColor: '#e0f2fe',
  },
  statusTextPresent: {
    color: '#0369a1',
  },
  statusCompleted: {
    backgroundColor: '#def7ec',
  },
  statusTextCompleted: {
    color: '#03543f',
  },
  statusAbsent: {
    backgroundColor: '#fee2e2',
  },
  statusTextAbsent: {
    color: '#b91c1c',
  },
  statusLeave: {
    backgroundColor: '#fef3c7',
  },
  statusTextLeave: {
    color: '#b45309',
  },
  statusHalfDay: {
    backgroundColor: '#f3e8ff',
  },
  statusTextHalfDay: {
    color: '#6b21a8',
  },
});
