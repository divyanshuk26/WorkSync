import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { employeeService } from '../../services/employeeService';
import { SCREENS } from '../../utils/constants';

export default function EmployeeList({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployeesList = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err?.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployeesList();
    });
    return unsubscribe;
  }, [navigation, fetchEmployeesList]);

  const confirmDelete = (title, message, onConfirm) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  const handleDeleteEmployee = (emp) => {
    confirmDelete(
      'Delete Employee',
      `Are you sure you want to delete ${emp.full_name || emp.email}?`,
      async () => {
        try {
          setLoading(true);
          await employeeService.deleteEmployee(emp.id);
          await fetchEmployeesList();
        } catch (err) {
          setError(err?.message || 'Failed to delete employee profile.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = emp.full_name?.toLowerCase().includes(query);
    const emailMatch = emp.email?.toLowerCase().includes(query);
    const deptMatch = emp.department?.toLowerCase().includes(query);
    const desigMatch = emp.designation?.toLowerCase().includes(query);
    return nameMatch || emailMatch || deptMatch || desigMatch;
  });

  const renderEmployeeCard = ({ item }) => {
    const isActive = item.is_active !== false;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{item.full_name || 'Unnamed Employee'}</Text>
            <Text style={styles.emailText}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          {item.department ? (
            <View style={styles.detailTag}>
              <Text style={styles.detailTagLabel}>Dept:</Text>
              <Text style={styles.detailTagValue}>{item.department}</Text>
            </View>
          ) : null}

          {item.designation ? (
            <View style={styles.detailTag}>
              <Text style={styles.detailTagLabel}>Role:</Text>
              <Text style={styles.detailTagValue}>{item.designation}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          {item.phone ? (
            <Text style={styles.phoneText}>📞 {item.phone}</Text>
          ) : (
            <View />
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate(SCREENS.EMPLOYER.EDIT_EMPLOYEE, { employee: item })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEmployee(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
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
      <AppHeader title="Employee List" subtitle="Organization Members Directory" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, department, or designation..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton title="Retry" onPress={() => fetchEmployeesList()} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        renderItem={renderEmployeeCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEmployeesList(true)}
            colors={['#0066cc']}
          />
        }
        ListEmptyComponent={
          !error && (
            <EmptyState
              message={searchQuery ? 'No Matching Employees Found' : 'No Employees Registered'}
              subtitle={
                searchQuery
                  ? 'Try searching with a different keyword.'
                  : 'Tap the "+" button below to add your first employee.'
              }
            />
          )
        }
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate(SCREENS.EMPLOYER.ADD_EMPLOYEE)}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  searchInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
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
    marginBottom: 10,
  },
  nameContainer: {
    flex: 1,
    paddingRight: 8,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  emailText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#def7ec',
  },
  statusInactive: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#03543f',
  },
  statusTextInactive: {
    color: '#6b7280',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  detailTag: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailTagLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 4,
  },
  detailTagValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  phoneText: {
    fontSize: 13,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
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
  deleteButton: {
    backgroundColor: '#fde8e8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f8b4b4',
  },
  deleteButtonText: {
    color: '#e02424',
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
