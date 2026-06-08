import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme';

export type BottomSheetRef = GorhomBottomSheetModal;

interface BottomSheetProps {
  snapPoints?: (string | number)[];
  children: React.ReactNode;
  title?: string;
  enablePanDownToClose?: boolean;
  scrollable?: boolean;
  onDismiss?: () => void;
}

export const BottomSheetModal = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      snapPoints: providedSnapPoints,
      children,
      title,
      enablePanDownToClose = true,
      scrollable = false,
      onDismiss,
    },
    ref
  ) => {
    const theme = useTheme();

    const snapPoints = useMemo(() => providedSnapPoints || ['50%', '90%'], [providedSnapPoints]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      []
    );

    const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <GorhomBottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      >
        <ContentWrapper style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                {title}
              </Text>
            </View>
          )}
          {children}
        </ContentWrapper>
      </GorhomBottomSheetModal>
    );
  }
);

// Wrapper provider needed at the root of the app
export { BottomSheetModalProvider };

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40, // Safe area bottom
  },
  header: {
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
});
