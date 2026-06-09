import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { useAuthStore } from '../../../store/auth.store';
import { useUserStore } from '../../../store/user.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Avatar } from '../../../components/ui/Avatar';
import { POPULAR_SKILLS, DEGREES, JOB_TYPES } from '../../../constants/config';

const LOCATIONS = ['Remote', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];

const ROLES = [
  'Software Developer', 'Frontend Engineer', 'Backend Engineer',
  'Full Stack Engineer', 'Mobile Developer', 'Data Scientist',
  'UI/UX Designer', 'Product Manager', 'QA Engineer'
];

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  college: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  passingYear: z.string().optional(),
  cgpa: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, uploadAvatar, isLoading } = useUserStore();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills ?? []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(profile?.preferredJobTypes ?? []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(profile?.preferredLocations ?? []);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(profile?.preferredRoles ?? []);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      bio: profile?.bio ?? '',
      college: profile?.college ?? '',
      degree: profile?.degree ?? '',
      branch: profile?.branch ?? '',
      passingYear: profile?.passingYear?.toString() ?? '',
      cgpa: profile?.cgpa?.toString() ?? '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        college: profile.college ?? '',
        degree: profile.degree ?? '',
        branch: profile.branch ?? '',
        passingYear: profile.passingYear?.toString() ?? '',
        cgpa: profile.cgpa?.toString() ?? '',
      });
      setSelectedSkills(profile.skills ?? []);
      setSelectedTypes(profile.preferredJobTypes ?? []);
      setSelectedLocations(profile.preferredLocations ?? []);
      setSelectedRoles(profile.preferredRoles ?? []);
    }
  }, [profile, reset]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && user) {
      const res = await uploadAvatar(user.id, result.assets[0].uri);
      if (!res.success) Alert.alert('Error', 'Failed to upload avatar');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    const result = await updateProfile(user.id, {
      fullName: data.fullName,
      phone: data.phone,
      bio: data.bio,
      college: data.college,
      degree: data.degree,
      branch: data.branch,
      passingYear: data.passingYear ? parseInt(data.passingYear) : undefined,
      cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
      skills: selectedSkills,
      preferredJobTypes: selectedTypes,
      preferredLocations: selectedLocations,
      preferredRoles: selectedRoles,
    });
    if (result.success) {
      if (router.canGoBack()) router.back();
      else router.replace('/(student)/(tabs)/profile');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((s) => s !== loc) : [...prev, loc]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(student)/(tabs)/profile')}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Edit Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar picker */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
            <Avatar uri={profile?.avatar} name={profile?.fullName} size={80} />
            <View style={[styles.cameraBtn, { backgroundColor: theme.colors.primary }]}>
              <Camera size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }]}>
            Change Photo
          </Text>
        </Animated.View>

        {/* Personal info */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            PERSONAL INFO
          </Text>
          <Controller control={control} name="fullName" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="Full Name" placeholder="Your full name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fullName?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="Phone" placeholder="+91 9876543210" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />
          <Controller control={control} name="bio" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="Bio" placeholder="Tell us about yourself..." value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' } as any} />
          )} />
        </Animated.View>

        {/* Education */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            EDUCATION
          </Text>
          <Controller control={control} name="college" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="College / University" placeholder="IIT Bombay" value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />
          <Controller control={control} name="degree" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="Degree" placeholder="B.Tech / B.E" value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />
          <Controller control={control} name="branch" render={({ field: { value, onChange, onBlur } }) => (
            <Input label="Branch" placeholder="Computer Science" value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Controller control={control} name="passingYear" render={({ field: { value, onChange } }) => (
              <Input label="Passing Year" placeholder="2025" keyboardType="numeric" value={value} onChangeText={onChange} containerStyle={{ flex: 1 }} />
            )} />
            <Controller control={control} name="cgpa" render={({ field: { value, onChange } }) => (
              <Input label="CGPA" placeholder="8.5" keyboardType="numeric" value={value} onChangeText={onChange} containerStyle={{ flex: 1 }} />
            )} />
          </View>
        </Animated.View>

        {/* Roles */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
            PREFERRED ROLES ({selectedRoles.length} selected)
          </Text>
          <View style={styles.skillsGrid}>
            {ROLES.map((role) => (
              <Chip key={role} label={role} selected={selectedRoles.includes(role)} onPress={() => toggleRole(role)} />
            ))}
          </View>
        </Animated.View>

        {/* Skills */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, marginTop: 12 }]}>
            SKILLS ({selectedSkills.length} selected)
          </Text>
          <View style={styles.skillsGrid}>
            {POPULAR_SKILLS.map((skill) => (
              <Chip key={skill} label={skill} selected={selectedSkills.includes(skill)} onPress={() => toggleSkill(skill)} />
            ))}
          </View>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, marginTop: 12 }]}>
            PREFERRED JOB TYPES ({selectedTypes.length} selected)
          </Text>
          <View style={styles.skillsGrid}>
            {JOB_TYPES.map((type) => (
              <Chip key={type} label={type} selected={selectedTypes.includes(type)} onPress={() => toggleType(type)} />
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, marginTop: 24 }]}>
            PREFERRED LOCATIONS ({selectedLocations.length} selected)
          </Text>
          <View style={styles.skillsGrid}>
            {LOCATIONS.map((loc) => (
              <Chip key={loc} label={loc} selected={selectedLocations.includes(loc)} onPress={() => toggleLocation(loc)} />
            ))}
          </View>
        </Animated.View>

        <Button label="Save Changes" variant="primary" size="lg" fullWidth loading={isLoading} onPress={handleSubmit(onSubmit)} style={{ marginTop: 32 }} />

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 20 },
  scroll: { paddingHorizontal: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  avatarWrapper: { position: 'relative' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { fontSize: 14 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12, marginTop: 8 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
});
