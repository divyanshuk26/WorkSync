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
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { TASK_STATUS } from '../../utils/constants';

export default function MyTasks({ navigation }) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEmployeeTasksList = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await taskService.getEmployeeTasks(user.id);
      setTasks(data);
    } catch (err) {
      setError(err?.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEmployeeTasksList();
  }, [fetchEmployeeTasksList]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchEmployeeTasksList();
    });
    return unsubscribe;
  }, [navigation, fetchEmployeeTasksList]);

  const handleMarkComplete = async (taskId) => {
    setSuccessMessage('');
    setError(null);
    setCompletingTaskId(taskId);

    try {
      await taskService.updateTaskStatus(taskId, TASK_STATUS.COMPLETED);
      setSuccessMessage('Task marked as completed!');
      await fetchEmployeeTasksList(true);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update task status.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const pendingTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.PENDING || t.status === TASK_STATUS.IN_PROGRESS
  );
  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);

  const currentTabTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  const getPriorityStyle = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'high':
        return { badge: styles.badgeHigh, text: styles.badgeTextHigh };
      case 'low':
        return { badge: styles.badgeLow, text: styles.badgeTextLow };
      default:
        return { badge: styles.badgeMedium, text: styles.badgeTextMedium };
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'completed':
        return { badge: styles.statusCompleted, text: styles.statusTextCompleted };
      case 'in_progress':
        return { badge: styles.statusInProgress, text: styles.statusTextInProgress };
      default:
        return { badge: styles.statusPending, text: styles.statusTextPending };
    }
  };

  const renderTaskCard = ({ item }) => {
    const priorityStyle = getPriorityStyle(item.priority);
    const statusStyle = getStatusStyle(item.status);
    const isCompleted = item.status === TASK_STATUS.COMPLETED;
    const isCompletingThis = completingTaskId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.badge, priorityStyle.badge]}>
            <Text style={[styles.badgeText, priorityStyle.text]}>
              {(item.priority || 'medium').toUpperCase()}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText}>{item.description}</Text>
        ) : null}

        {item.deadline ? (
          <View style={styles.metaRow}>
            <Text style={styles.deadlineText}>📅 Due: {item.deadline}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {(item.status || 'pending').replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {!isCompleted ? (
            <TouchableOpacity
              style={[styles.completeButton, isCompletingThis && styles.completeButtonDisabled]}
              onPress={() => handleMarkComplete(item.id)}
              disabled={isCompletingThis}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>
                {isCompletingThis ? 'Updating...' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="My Tasks" subtitle="Assigned Work Items & Completion Status" />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton
            title="Retry"
            onPress={() => fetchEmployeeTasksList()}
            style={styles.retryButton}
          />
        </View>
      ) : null}

      <FlatList
        data={currentTabTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEmployeeTasksList(true)}
            colors={['#0066cc']}
          />
        }
        ListEmptyComponent={
          !error && (
            <EmptyState
              message={
                activeTab === 'pending'
                  ? 'No Pending Tasks'
                  : 'No Completed Tasks Yet'
              }
              subtitle={
                activeTab === 'pending'
                  ? 'You are all caught up on your assigned work!'
                  : 'Tasks marked as completed will appear here.'
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0066cc',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
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
  taskTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    marginBottom: 10,
  },
  deadlineText: {
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeLow: {
    backgroundColor: '#e0f2fe',
  },
  badgeTextLow: {
    color: '#0369a1',
  },
  badgeMedium: {
    backgroundColor: '#fef3c7',
  },
  badgeTextMedium: {
    color: '#b45309',
  },
  badgeHigh: {
    backgroundColor: '#fee2e2',
  },
  badgeTextHigh: {
    color: '#b91c1c',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
    backgroundColor: '#f3f4f6',
  },
  statusTextPending: {
    color: '#4b5563',
  },
  statusInProgress: {
    backgroundColor: '#fef3c7',
  },
  statusTextInProgress: {
    color: '#d97706',
  },
  statusCompleted: {
    backgroundColor: '#def7ec',
  },
  statusTextCompleted: {
    color: '#03543f',
  },
  completeButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  completeButtonDisabled: {
    backgroundColor: '#a7f3d0',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
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
