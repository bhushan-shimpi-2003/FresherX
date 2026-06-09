import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../../../theme';
import { useAdminStore } from '../../../../store/admin.store';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Loader } from '../../../../components/ui/Loader';
import type { AdminJob } from '../../../../types/admin.types';

export default function AdminEditJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { pendingJobs, updateJob } = useAdminStore();
  
  const [job, setJob] = useState<AdminJob | null>(null);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundJob = pendingJobs.find((j) => j.id === id);
    if (foundJob) {
      setJob(foundJob);
      setTitle(foundJob.title);
      setCompanyName(foundJob.company.name || '');
      setDescription(foundJob.description || '');
      setLocation(foundJob.location || '');
    }
  }, [id, pendingJobs]);

  const handleSave = async () => {
    if (!id || !title.trim() || !companyName.trim()) {
      if (Platform.OS === 'web') window.alert('Title and Company Name are required.');
      else Alert.alert('Error', 'Title and Company Name are required.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title,
      companyName,
      description,
      location,
    };

    const res = await updateJob(id, payload);
    setIsSubmitting(false);

    if (res.success) {
      if (Platform.OS === 'web') {
        window.alert('Job updated successfully');
        router.back();
      } else {
        Alert.alert('Success', 'Job updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } else {
      if (Platform.OS === 'web') window.alert(res.error || 'Failed to update job');
      else Alert.alert('Error', res.error || 'Failed to update job');
    }
  };

  if (!job) {
    return <Loader fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]}>
          Edit Job
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Job Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Senior Frontend Developer"
        />

        <Input
          label="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Tech Corp"
        />

        <Input
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Pune, Remote"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the job role..."
          multiline
          numberOfLines={6}
          style={{ height: 120, textAlignVertical: 'top' }}
        />

        <Button
          label="Save Changes"
          onPress={handleSave}
          loading={isSubmitting}
          style={{ marginTop: 20 }}
          leftIcon={<CheckCircle size={20} color="#FFF" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
});
