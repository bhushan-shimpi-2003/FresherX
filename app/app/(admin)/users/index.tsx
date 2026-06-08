import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, MoreVertical, Ban, Mail, Search, Shield, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme';
import { useAdminStore } from '../../../store/admin.store';
import { Loader } from '../../../components/ui/Loader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AdminUser } from '../../../types/admin.types';

type RoleTab = 'all' | 'student' | 'recruiter' | 'admin';

export default function AdminUsersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { users, isLoading, fetchUsers, suspendUser } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<RoleTab>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = (userId: string, email: string) => {
    Alert.alert(
      'Suspend User',
      `Are you sure you want to suspend the account for ${email}? They will no longer be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            await suspendUser(userId);
          },
        },
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = activeRole === 'all' || user.role === activeRole;
      const query = searchQuery.toLowerCase();
      const matchesSearch = user.email.toLowerCase().includes(query) || 
                            (user.fullName?.toLowerCase() || '').includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, searchQuery, activeRole]);

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
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.badges}>
          <Badge label={item.role.toUpperCase()} variant={item.role === 'recruiter' ? 'info' : item.role === 'admin' ? 'warning' : 'default'} size="sm" />
          <Badge label={item.status} variant={item.status === 'active' ? 'success' : 'error'} size="sm" />
        </View>

        {item.status !== 'suspended' && item.role !== 'admin' && (
          <TouchableOpacity onPress={() => handleSuspend(item.id, item.email)} style={[styles.suspendBtn, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '30' }]}>
            <Ban size={14} color={theme.colors.error} />
            <Text style={[styles.suspendText, { color: theme.colors.error }]}>Suspend</Text>
          </TouchableOpacity>
        )}
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
  filterContainer: { marginBottom: 8 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterPillText: { fontSize: 13 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, gap: 4 },
  name: { fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  email: { fontSize: 13 },
  moreBtn: { padding: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  badges: { flexDirection: 'row', gap: 8 },
  suspendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  suspendText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
