import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme';
import { ChevronLeft, IndianRupee, MapPin, Building2, Search, TrendingUp } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';

// Mock data
const MOCK_SALARIES = [
  { id: '1', title: 'Software Engineer', company: 'TCS', salary: '7,00,000', location: 'Pune', exp: 'Fresher' },
  { id: '2', title: 'Frontend Developer', company: 'Startup Inc', salary: '12,00,000', location: 'Bangalore', exp: '1 year' },
  { id: '3', title: 'Data Analyst', company: 'Infosys', salary: '4,50,000', location: 'Remote', exp: 'Fresher' },
];

export default function SalariesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Salary Insights
        </Text>
        <TouchableOpacity>
          <TrendingUp size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Search size={20} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search roles or companies..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={MOCK_SALARIES}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.salaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.jobTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
                    {item.title}
                  </Text>
                  <View style={styles.companyRow}>
                    <Building2 size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>{item.company}</Text>
                  </View>
                </View>
                <View style={styles.salaryBadge}>
                  <IndianRupee size={14} color="#FFF" />
                  <Text style={[styles.salaryAmount, { fontFamily: theme.typography.fontFamily.bold }]}>
                    {item.salary}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <MapPin size={14} color={theme.colors.textMuted} />
                  <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>{item.location}</Text>
                </View>
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>•</Text>
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>{item.exp}</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={
            <Button 
              label="Submit Anonymous Salary" 
              variant="outline" 
              fullWidth 
              style={{ marginBottom: 20 }}
              onPress={() => alert('Opening submission form...')}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  content: { flex: 1, paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, marginBottom: 20, gap: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  salaryCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobTitle: { fontSize: 16, marginBottom: 4 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyName: { fontSize: 14 },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 2 },
  salaryAmount: { color: '#FFF', fontSize: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 13 },
});
