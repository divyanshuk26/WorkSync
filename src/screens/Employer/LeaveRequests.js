import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { leaveService } from '../../services/leaveService';
import { LEAVE_STATUS } from '../../utils/constants';

export default function LeaveRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAllLeaveRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await leaveService.getAllLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError(err?.message || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLeaveRequests();
  }, [fetchAllLeaveRequests]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchAllLeaveRequests();
    });
    return unsubscribe;
  }, [navigation, fetchAllLeaveRequests]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setSuccessMessage('');
    setError(null);
    setUpdatingId(requestId);

    try {
      await leaveService.updateLeaveStatus(requestId, newStatus);
      const actionText = newStatus === LEAVE_STATUS.APPROVED ? 'approved' : 'rejected';
      setSuccessMessage(`Leave request ${actionText} successfully!`);
      await fetchAllLeaveRequests(true);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err?.message || `Failed to update leave request status.`);
    } finally {
      setUpdatingId(null);
    }
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

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    return (r.status || 'pending').toLowerCase() === activeFilter;
  });

  const pendingCount = requests.filter((r) => (r.status || 'pending').toLowerCase() === LEAVE_STATUS.PENDING).length;

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

  const renderRequestCard = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const numDays = calculateDays(item.start_date, item.end_date);
    const employeeName =
      item.employee_profile?.full_name ||
      item.employee_profile?.email ||
      'Employee';
    const isPending = (item.status || 'pending').toLowerCase() === LEAVE_STATUS.PENDING;
    const isUpdatingThis = updatingId === item.id;

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
            <Text style={[styles.statusText, statusStyle.text]}>
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.leave_type || 'Leave'}</Text>
          </View>

          <Text style={styles.datesText}>
            📅 {item.start_date} to {item.end_date} ({numDays} {numDays === 1 ? 'day' : 'days'})
          </Text>
        </View>

        {item.reason ? (
          <Text style={styles.reasonText}>"{item.reason}"</Text>
        ) : null}

        {isPending ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton, isUpdatingThis && styles.disabledButton]}
              onPress={() => handleUpdateStatus(item.id, LEAVE_STATUS.REJECTED)}
              disabled={isUpdatingThis}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectButtonText}>
                {isUpdatingThis ? 'Updating...' : 'Reject'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton, isUpdatingThis && styles.disabledButton]}
              onPress={() => handleUpdateStatus(item.id, LEAVE_STATUS.APPROVED)}
              disabled={isUpdatingThis}
              activeOpacity={0.8}
            >
              <Text style={styles.approveButtonText}>
                {isUpdatingThis ? 'Updating...' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Leave Requests" subtitle="Review & Manage Employee Absences" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
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

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton title="Retry" onPress={() => fetchAllLeaveRequests()} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAllLeaveRequests(true)}
            colors={['#0066cc']}
          />
        }
        ListEmptyComponent={
          !error && (
            <EmptyState
              message={
                activeFilter === 'pending'
                  ? 'No Pending Leave Requests'
                  : 'No Leave Applications Found'
              }
              subtitle={
                activeFilter === 'pending'
                  ? 'All employee leave requests have been processed.'
                  : 'Submitted leave requests will appear here.'
              }
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    marginBottom: 10,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '700',
  },
  datesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  reasonText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#059669',
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  rejectButtonText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  successBanner: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#def7ec',
    borderColor: '#bcf0da',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  successText: {
    color: '#03543f',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    margin: 16,
    marginBottom: 0,
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
