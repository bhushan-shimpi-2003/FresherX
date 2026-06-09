import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, MoreVertical, Ban, Mail, Search, Shield, Filter, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AdminUser } from '../../../types/admin.types';
import { BottomSheetModal, BottomSheetRef } from '../../../components/ui/BottomSheet';

type RoleTab = 'all' | 'student' | 'recruiter' | 'admin';
type TimeFilter = 'all' | '24h' | '7d' | '30d';

export default function AdminUsersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { users, isLoading, error, fetchUsers, updateUserStatus, toggleAutoVerify } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<RoleTab>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const openOptions = (user: AdminUser) => {
    setSelectedUser(user);
    bottomSheetRef.current?.present();
  };

  const closeOptions = () => {
    bottomSheetRef.current?.dismiss();
    setTimeout(() => setSelectedUser(null), 300);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = (userId: string, email: string, action: 'suspend' | 'activate') => {
    const title = action === 'suspend' ? 'Suspend User' : 'Reactivate User';
    const msg = action === 'suspend'
      ? `Are you sure you want to suspend the account for ${email}? They will no longer be able to log in.`
      : `Are you sure you want to reactivate the account for ${email}?`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        updateUserStatus(userId, action);
      }
    } else {
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'suspend' ? 'Suspend' : 'Reactivate',
          style: action === 'suspend' ? 'destructive' : 'default',
          onPress: async () => {
            await updateUserStatus(userId, action);
          },
        },
      ]);
    }
  };

  const handleAutoVerify = (userId: string, email: string, currentStatus: boolean) => {
    const title = currentStatus ? 'Revoke Auto-Verify' : 'Grant Auto-Verify';
    const msg = currentStatus
      ? `Are you sure you want to revoke auto-verify permissions for ${email}? Their job posts will require manual approval again.`
      : `Are you sure you want to grant auto-verify permissions to ${email}? Their job posts will automatically go live.`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${msg}`)) {
        toggleAutoVerify(userId, !currentStatus);
      }
    } else {
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: currentStatus ? 'Revoke' : 'Grant',
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            await toggleAutoVerify(userId, !currentStatus);
          },
        },
      ]);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = activeRole === 'all' || user.role === activeRole;
      const query = searchQuery.toLowerCase();
      const matchesSearch = user.email.toLowerCase().includes(query) || 
                            (user.fullName?.toLowerCase() || '').includes(query);
      
      if (!matchesRole || !matchesSearch) return false;
      
      if (timeFilter !== 'all') {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - userDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (timeFilter === '24h' && diffDays > 1) return false;
        if (timeFilter === '7d' && diffDays > 7) return false;
        if (timeFilter === '30d' && diffDays > 30) return false;
      }
      
      return true;
    });
  }, [users, searchQuery, activeRole, timeFilter]);

  const roleTabs: { key: RoleTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'student', label: 'Students' },
    { key: 'recruiter', label: 'Recruiters' },
    { key: 'admin', label: 'Admins' },
  ];

  const renderUser = ({ item, index }: { item: AdminUser; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={[styles.card, { backgroundColor: theme.colors.card + 'E0', borderColor: theme.colors.border }]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold, fontSize: 16 }}>
            {item.fullName?.charAt(0).toUpperCase() || item.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]} numberOfLines={1}>
            {item.fullName || 'No Name'}
          </Text>
          <View style={styles.metaRow}>
            <Mail size={12} color={theme.colors.textMuted} />
            <Text style={[styles.email, { color: theme.colors.textMuted }]} numberOfLines={1}>{item.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => openOptions(item)}>
          <MoreVertical size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.badges}>
          <Badge label={item.role.toUpperCase()} variant={item.role === 'recruiter' ? 'info' : item.role === 'admin' ? 'warning' : 'default'} size="sm" />
          <Badge label={item.status} variant={item.status === 'active' ? 'success' : 'error'} size="sm" />
          {item.role === 'recruiter' && item.auto_verified && (
            <Badge label="AUTO-VERIFIED" variant="success" size="sm" />
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.accent + '10', 'transparent']}
          style={{ height: 250, opacity: 0.8 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          User Management
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card + '90', borderColor: theme.colors.border }]}>
          <Search size={18} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={roleTabs}
          keyExtractor={(t) => t.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                { backgroundColor: activeRole === item.key ? theme.colors.text : theme.colors.card + '80', borderColor: activeRole === item.key ? theme.colors.text : theme.colors.border }
              ]}
              onPress={() => setActiveRole(item.key)}
            >
              <Text style={[styles.filterPillText, { color: activeRole === item.key ? theme.colors.background : theme.colors.textMuted, fontFamily: activeRole === item.key ? theme.typography.fontFamily.semiBold : theme.typography.fontFamily.medium }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Filter size={16} color={theme.colors.textMuted} style={{ marginRight: 4, alignSelf: 'center' }} />
          {[
            { id: 'all', label: 'All Time' },
            { id: '24h', label: 'Last 24h' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, timeFilter === f.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => setTimeFilter(f.id as TimeFilter)}
            >
              <Text style={[styles.filterChipText, timeFilter === f.id && { color: '#FFF', fontFamily: theme.typography.fontFamily.semiBold }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && users.length === 0 ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={<Search size={56} color={theme.colors.textMuted} style={{ opacity: 0.8 }} />}
              title="No users found"
              description="Try adjusting your search query or role filter."
            />
          }
        />
      )}

      <BottomSheetModal ref={bottomSheetRef} snapPoints={['40%']} title="User Actions">
        {selectedUser && (
          <View style={{ gap: 12, marginTop: 12 }}>
            {selectedUser.role === 'recruiter' && selectedUser.status !== 'suspended' && (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: selectedUser.auto_verified ? theme.colors.warning + '15' : theme.colors.primary + '15' }]}
                onPress={() => {
                  closeOptions();
                  setTimeout(() => handleAutoVerify(selectedUser.id, selectedUser.email, !!selectedUser.auto_verified), Platform.OS === 'web' ? 0 : 400);
                }}
              >
                <Zap size={22} color={selectedUser.auto_verified ? theme.colors.warning : theme.colors.primary} />
                <View>
                  <Text style={[styles.actionTitle, { color: selectedUser.auto_verified ? theme.colors.warning : theme.colors.primary }]}>
                    {selectedUser.auto_verified ? 'Revoke Auto-Verify' : 'Grant Auto-Verify'}
                  </Text>
                  <Text style={[styles.actionSub, { color: theme.colors.textMuted }]}>
                    {selectedUser.auto_verified ? 'Require manual approval for jobs' : 'Allow jobs to go live instantly'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {selectedUser.role !== 'admin' && (
              selectedUser.status !== 'suspended' ? (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.colors.error + '15' }]}
                  onPress={() => {
                    closeOptions();
                    setTimeout(() => handleSuspend(selectedUser.id, selectedUser.email, 'suspend'), Platform.OS === 'web' ? 0 : 400);
                  }}
                >
                  <Ban size={22} color={theme.colors.error} />
                  <View>
                    <Text style={[styles.actionTitle, { color: theme.colors.error }]}>Suspend Account</Text>
                    <Text style={[styles.actionSub, { color: theme.colors.textMuted }]}>Prevent user from logging in</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success + '15' }]}
                  onPress={() => {
                    closeOptions();
                    setTimeout(() => handleSuspend(selectedUser.id, selectedUser.email, 'activate'), Platform.OS === 'web' ? 0 : 400);
                  }}
                >
                  <Shield size={22} color={theme.colors.success} />
                  <View>
                    <Text style={[styles.actionTitle, { color: theme.colors.success }]}>Reactivate Account</Text>
                    <Text style={[styles.actionSub, { color: theme.colors.textMuted }]}>Restore user access</Text>
                  </View>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, letterSpacing: -0.5 },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  filterContainer: { marginBottom: 12 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillText: { fontSize: 13 },
  tabText: { fontSize: 13, textTransform: 'capitalize' },
  filterScroll: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  filterChipText: { fontSize: 12, color: '#6B7280', fontFamily: 'Inter_500Medium' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, gap: 4 },
  name: { fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  email: { fontSize: 13 },
  moreBtn: { padding: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16 },
  actionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  actionSub: { fontSize: 13 },
});
