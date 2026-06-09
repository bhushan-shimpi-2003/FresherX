import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResumeStore } from '../../../../store/resume.store';
import { useUserStore } from '../../../../store/user.store';
import { generateResumePDF } from '../../../../utils/resumePdfGenerator';
import { useTheme } from '../../../../theme';
import { ScreenHeader } from '../../../../components/ui/ScreenHeader';
import { Download, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../../../components/ui/Button';
import { profileApi } from '../../../../services/api/profile.api';

export default function ResumeBuilderScreen() {
  const theme = useTheme();
  const { profile, setProfile } = useUserStore();
  const store = useResumeStore();
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-fill from profile on first load if empty
  useEffect(() => {
    if (profile?.resumeData) {
      // Load saved resume data from the database
      store.updateData(profile.resumeData);
    } else if (!store.data.fullName && profile) {
      store.updateData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: profile.skills?.join(', ') || '',
      });
    }
  }, [profile]);

  const handleDownload = async () => {
    try {
      if (profile?.userId) {
        // Save to database
        const updatedProfile = await profileApi.updateProfile(profile.userId, { resumeData: store.data });
        setProfile(updatedProfile);
      }
      await generateResumePDF(store.data);
    } catch (err) {
      console.log('Failed to generate resume', err);
    }
  };

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Personal Details</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.fullName}
              onChangeText={(t) => store.updateData({ fullName: t })}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.email}
              onChangeText={(t) => store.updateData({ email: t })}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Phone"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.phone}
              onChangeText={(t) => store.updateData({ phone: t })}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Location (e.g. Pune, India)"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.location}
              onChangeText={(t) => store.updateData({ location: t })}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="LinkedIn URL"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.linkedin}
              onChangeText={(t) => store.updateData({ linkedin: t })}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Portfolio URL"
              placeholderTextColor={theme.colors.textMuted}
              value={store.data.portfolio}
              onChangeText={(t) => store.updateData({ portfolio: t })}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Professional Summary</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, height: 100, textAlignVertical: 'top' }]}
              placeholder="A brief summary of your skills and goals"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              value={store.data.summary}
              onChangeText={(t) => store.updateData({ summary: t })}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Education</Text>
              <TouchableOpacity onPress={() => store.addEducation({ id: Date.now().toString(), institution: '', degree: '', year: '', score: '' })}>
                <Plus color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {store.data.education.map((edu, index) => (
              <View key={edu.id} style={[styles.card, { borderColor: theme.colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => store.removeEducation(edu.id)}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity>
                </View>
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Institution" placeholderTextColor={theme.colors.textMuted} value={edu.institution} onChangeText={(t) => {
                  const newEdu = [...store.data.education]; newEdu[index].institution = t; store.updateData({ education: newEdu });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Degree" placeholderTextColor={theme.colors.textMuted} value={edu.degree} onChangeText={(t) => {
                  const newEdu = [...store.data.education]; newEdu[index].degree = t; store.updateData({ education: newEdu });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Year (e.g. 2020 - 2024)" placeholderTextColor={theme.colors.textMuted} value={edu.year} onChangeText={(t) => {
                  const newEdu = [...store.data.education]; newEdu[index].year = t; store.updateData({ education: newEdu });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Score / CGPA" placeholderTextColor={theme.colors.textMuted} value={edu.score} onChangeText={(t) => {
                  const newEdu = [...store.data.education]; newEdu[index].score = t; store.updateData({ education: newEdu });
                }} />
              </View>
            ))}
          </View>
        );
      case 4:
        return (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Experience</Text>
              <TouchableOpacity onPress={() => store.addExperience({ id: Date.now().toString(), company: '', role: '', duration: '', description: '' })}>
                <Plus color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {store.data.experience.map((exp, index) => (
              <View key={exp.id} style={[styles.card, { borderColor: theme.colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => store.removeExperience(exp.id)}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity>
                </View>
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Company" placeholderTextColor={theme.colors.textMuted} value={exp.company} onChangeText={(t) => {
                  const newExp = [...store.data.experience]; newExp[index].company = t; store.updateData({ experience: newExp });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Role" placeholderTextColor={theme.colors.textMuted} value={exp.role} onChangeText={(t) => {
                  const newExp = [...store.data.experience]; newExp[index].role = t; store.updateData({ experience: newExp });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Duration (e.g. Jan 2022 - Present)" placeholderTextColor={theme.colors.textMuted} value={exp.duration} onChangeText={(t) => {
                  const newExp = [...store.data.experience]; newExp[index].duration = t; store.updateData({ experience: newExp });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={theme.colors.textMuted} multiline value={exp.description} onChangeText={(t) => {
                  const newExp = [...store.data.experience]; newExp[index].description = t; store.updateData({ experience: newExp });
                }} />
              </View>
            ))}
          </View>
        );
      case 5:
        return (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Projects</Text>
              <TouchableOpacity onPress={() => store.addProject({ id: Date.now().toString(), name: '', description: '', link: '' })}>
                <Plus color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {store.data.projects.map((proj, index) => (
              <View key={proj.id} style={[styles.card, { borderColor: theme.colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => store.removeProject(proj.id)}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity>
                </View>
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Project Name" placeholderTextColor={theme.colors.textMuted} value={proj.name} onChangeText={(t) => {
                  const newProj = [...store.data.projects]; newProj[index].name = t; store.updateData({ projects: newProj });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Link (Optional)" placeholderTextColor={theme.colors.textMuted} value={proj.link} onChangeText={(t) => {
                  const newProj = [...store.data.projects]; newProj[index].link = t; store.updateData({ projects: newProj });
                }} />
                <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={theme.colors.textMuted} multiline value={proj.description} onChangeText={(t) => {
                  const newProj = [...store.data.projects]; newProj[index].description = t; store.updateData({ projects: newProj });
                }} />
              </View>
            ))}
          </View>
        );
      case 6:
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Skills (Comma Separated)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]}
              placeholder="React, TypeScript, Node.js"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              value={store.data.skills}
              onChangeText={(t) => store.updateData({ skills: t })}
            />
          </View>
        );
      case 7:
        return (
          <View>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hobbies (Comma Separated)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, height: 80, textAlignVertical: 'top' }]}
                placeholder="Reading, Traveling, Gaming"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                value={store.data.hobbies}
                onChangeText={(t) => store.updateData({ hobbies: t })}
              />
            </View>
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Certifications</Text>
                <TouchableOpacity onPress={() => store.addCertification({ id: Date.now().toString(), name: '', issuer: '', year: '' })}>
                  <Plus color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              {store.data.certifications?.map((cert, index) => (
                <View key={cert.id} style={[styles.card, { borderColor: theme.colors.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => store.removeCertification(cert.id)}><Trash2 size={16} color={theme.colors.error} /></TouchableOpacity>
                  </View>
                  <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Certification Name" placeholderTextColor={theme.colors.textMuted} value={cert.name} onChangeText={(t) => {
                    const newCerts = [...store.data.certifications]; newCerts[index].name = t; store.updateData({ certifications: newCerts });
                  }} />
                  <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Issuer (e.g. Coursera)" placeholderTextColor={theme.colors.textMuted} value={cert.issuer} onChangeText={(t) => {
                    const newCerts = [...store.data.certifications]; newCerts[index].issuer = t; store.updateData({ certifications: newCerts });
                  }} />
                  <TextInput style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Year" placeholderTextColor={theme.colors.textMuted} value={cert.year} onChangeText={(t) => {
                    const newCerts = [...store.data.certifications]; newCerts[index].year = t; store.updateData({ certifications: newCerts });
                  }} />
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Resume Builder" subtitle={`Step ${currentStep} of 7`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {renderStep()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {currentStep > 1 && (
            <View style={{ flex: 1 }}>
              <Button 
                label="Back" 
                variant="outline"
                onPress={handleBack} 
                leftIcon={<ArrowLeft size={20} color={theme.colors.primary} />} 
                fullWidth
              />
            </View>
          )}
          
          {currentStep < 7 ? (
            <View style={{ flex: 2 }}>
              <Button 
                label="Next" 
                onPress={handleNext} 
                rightIcon={<ArrowRight size={20} color="#FFF" />} 
                fullWidth
              />
            </View>
          ) : (
            <View style={{ flex: 2 }}>
              <Button 
                label="Download PDF" 
                onPress={handleDownload} 
                leftIcon={<Download size={20} color="#FFF" />} 
                fullWidth
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  }
});
