import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { attendanceService } from '../../services/attendanceService';
import { ATTENDANCE_STATUS } from '../../utils/constants';

export default function EmployerAttendance({ navigation }) {
  const [records, setRecords] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'today' | 'present' | 'completed'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendanceRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await attendanceService.getAllAttendanceRecords();
      setRecords(data);
    } catch (err) {
      setError(err?.message || 'Failed to load attendance directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchAttendanceRecords();
    });
    return unsubscribe;
  }, [navigation, fetchAttendanceRecords]);

  const todayStr = attendanceService.getTodayDateString();

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

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case ATTENDANCE_STATUS.PRESENT:
        return { badge: styles.statusPresent, text: styles.statusTextPresent, label: 'Present' };
      case ATTENDANCE_STATUS.COMPLETED:
        return { badge: styles.statusCompleted, text: styles.statusTextCompleted, label: 'Completed' };
      case ATTENDANCE_STATUS.ABSENT:
        return { badge: styles.statusAbsent, text: styles.statusTextAbsent, label: 'Absent' };
      case ATTENDANCE_STATUS.LEAVE:
        return { badge: styles.statusLeave, text: styles.statusTextLeave, label: 'Leave' };
      default:
        return { badge: styles.statusNotMarked, text: styles.statusTextNotMarked, label: 'Recorded' };
    }
  };

  const todayRecords = records.filter((r) => r.attendance_date === todayStr);
  const todayPresentCount = todayRecords.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
  const todayCompletedCount = todayRecords.filter((r) => r.status === ATTENDANCE_STATUS.COMPLETED).length;

  const filteredRecords = records.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') return r.attendance_date === todayStr;
    return (r.status || '').toLowerCase() === activeFilter;
  });

  const renderAttendanceCard = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const employeeName =
      item.employee_profile?.full_name ||
      item.employee_profile?.email ||
      'Employee';
    const hoursInfo = attendanceService.calculateWorkingHours(item.check_in, item.check_out);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{employeeName}</Text>
            {item.employee_profile?.department ? (
              <Text style={styles.departmentText}>
                {item.employee_profile.department} • {item.employee_profile.designation || 'Staff'}
              </Text>
            ) : null}
          </View>

          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>📅 {formatDateFormatted(item.attendance_date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Check In</Text>
            <Text style={styles.metaVal}>{formatTimeOnly(item.check_in)}</Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Check Out</Text>
            <Text style={styles.metaVal}>{formatTimeOnly(item.check_out)}</Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Total Hours</Text>
            <Text style={styles.metaVal}>{hoursInfo.text}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Employee Attendance" subtitle="Monitor Daily Check-ins & Working Hours" />

      {/* Summary Row */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryVal}>{todayRecords.length}</Text>
          <Text style={styles.summaryLbl}>Total Today</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: '#0369a1' }]}>{todayPresentCount}</Text>
          <Text style={styles.summaryLbl}>Active Now</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryVal, { color: '#059669' }]}>{todayCompletedCount}</Text>
          <Text style={styles.summaryLbl}>Completed Today</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All Records' },
          { key: 'today', label: `Today (${todayRecords.length})` },
          { key: ATTENDANCE_STATUS.PRESENT, label: 'Active Now' },
          { key: ATTENDANCE_STATUS.COMPLETED, label: 'Completed' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton title="Retry" onPress={() => fetchAttendanceRecords()} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendanceCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAttendanceRecords(true)}
            colors={['#0066cc']}
          />
        }
        ListEmptyComponent={
          !error && (
            <EmptyState
              message="No Attendance Records Found"
              subtitle="Employee check-in records will appear here."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  summaryVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryLbl: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0066cc',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  employeeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  departmentText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  dateRow: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
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
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fde8e8',
    borderColor: '#f8b4b4',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#9b1c1c',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
