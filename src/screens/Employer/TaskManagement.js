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
import { SCREENS } from '../../utils/constants';

export default function TaskManagement({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasksList = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err?.message || 'Failed to load task list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasksList();
    });
    return unsubscribe;
  }, [navigation, fetchTasksList]);

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
    const assigneeName =
      item.assigned_profile?.full_name ||
      item.assigned_profile?.email ||
      'Assigned Employee';

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

        <View style={styles.metaRow}>
          <Text style={styles.assigneeText}>👤 {assigneeName}</Text>
          {item.deadline ? (
            <Text style={styles.deadlineText}>📅 Due: {item.deadline}</Text>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {(item.status || 'pending').replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(SCREENS.EMPLOYER.EDIT_TASK, { task: item })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Task Management" subtitle="Create, Assign & Monitor Tasks" />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton title="Retry" onPress={() => fetchTasksList()} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTasksList(true)}
            colors={['#0066cc']}
          />
        }
        ListEmptyComponent={
          !error && (
            <EmptyState
              message="No Tasks Assigned Yet"
              subtitle='Tap the "+" button below to create and assign your first task.'
            />
          )
        }
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate(SCREENS.EMPLOYER.CREATE_TASK)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assigneeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
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
    paddingTop: 8,
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
  editButton: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  editButtonText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '600',
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
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 34,
    fontWeight: '300',
  },
});
