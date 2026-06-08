import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useImagePicker() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async (options?: ImagePicker.ImagePickerOptions) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo access to upload images.');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        ...options,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        return uri;
      }
      return null;
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickDocument = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow file access to upload resume.');
      return null;
    }
    // For PDF/documents, would use expo-document-picker
    return null;
  }, []);

  return { image, isLoading, pickImage, pickDocument, clearImage: () => setImage(null) };
}
