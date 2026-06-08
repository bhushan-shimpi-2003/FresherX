import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Globe, Users } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Avatar } from '../ui/Avatar';
import type { RecruiterCompany as Company } from '../../types/recruiter.types';

interface CompanyCardProps {
  company: Company;
  onPress?: () => void;
  index?: number;
}

export function CompanyCard({ company, onPress, index = 0 }: CompanyCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Avatar uri={company.logo} name={company.name} size={48} />
          <View style={styles.headerText}>
            <Text style={[styles.name, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }]} numberOfLines={1}>
              {company.name}
            </Text>
            <Text style={[styles.industry, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]} numberOfLines={1}>
              {company.industry}
            </Text>
          </View>
        </View>

        {company.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]} numberOfLines={2}>
            {company.description}
          </Text>
        )}

        <View style={styles.footer}>
          {company.location && (
            <View style={styles.metaItem}>
              <MapPin size={14} color={theme.colors.textMuted} />
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{company.location}</Text>
            </View>
          )}
          {company.size && (
            <View style={styles.metaItem}>
              <Users size={14} color={theme.colors.textMuted} />
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{company.size}</Text>
            </View>
          )}
          {company.website && (
            <View style={styles.metaItem}>
              <Globe size={14} color={theme.colors.textMuted} />
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                {company.website.replace(/^https?:\/\//, '')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
  },
  industry: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
