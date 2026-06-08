import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';

interface FollowButtonProps {
  recruiterId: string;
  initialIsFollowing?: boolean;
}

export default function FollowButton({ recruiterId, initialIsFollowing = false }: FollowButtonProps) {
  const theme = useTheme();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    setIsLoading(true);
    // Optimistic UI update
    setIsFollowing(!isFollowing);
    
    try {
      // API call to Supabase to insert/delete from 'follows' table
      // const { error } = await supabase...
      
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Revert on failure
      setIsFollowing(isFollowing);
      console.error('Failed to toggle follow', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isFollowing ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }
      ]}
      onPress={toggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? theme.colors.text : '#fff'} />
      ) : (
        <Text style={[styles.text, isFollowing ? { color: theme.colors.text } : { color: '#fff' }]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
