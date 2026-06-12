import { useEffect, useRef, useState, useCallback } from 'react';
import mobileAds, { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Initialize the Google Mobile Ads SDK
mobileAds().initialize().catch(console.warn);

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-2920036380008137/1229515288';

export function useApplyAd() {
  const [adLoaded, setAdLoaded] = useState(false);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const isRewardEarned = useRef(false);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  const cleanupListeners = () => {
    unsubscribeRefs.current.forEach(unsub => unsub());
    unsubscribeRefs.current = [];
  };

  const loadNewAd = useCallback(() => {
    // Cleanup any existing listeners before creating a new instance
    cleanupListeners();
    setAdLoaded(false);
    isRewardEarned.current = false;

    try {
      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      rewardedRef.current = rewarded;

      const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded Ad loaded successfully');
        setAdLoaded(true);
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        reward => {
          console.log('User earned reward:', reward);
          isRewardEarned.current = true;
        },
      );

      const unsubscribeError = rewarded.addAdEventListener(
        AdEventType.ERROR,
        error => {
          console.error('Ad failed to load:', error);
          setAdLoaded(false);
        }
      );

      unsubscribeRefs.current.push(unsubscribeLoaded, unsubscribeEarned, unsubscribeError);

      rewarded.load();
    } catch (e) {
      console.error('Failed to create Rewarded Ad', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNewAd();
    return cleanupListeners;
  }, [loadNewAd]);

  /**
   * Attempts to show the ad if available.
   * @param onSuccess Callback executed if the ad is watched successfully, or if no ad is available (fallback).
   * @param onSkipped Callback executed if the user closes the ad before earning the reward.
   */
  const showAdIfAvailable = (onSuccess: () => void, onSkipped?: () => void) => {
    if (rewardedRef.current && adLoaded) {
      // Create a specific closed listener for this exact show() call
      const unsubscribeClosed = rewardedRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeClosed();
        
        // Execute the appropriate callback based on reward status
        if (isRewardEarned.current) {
          onSuccess();
        } else {
          console.log('Ad closed early, reward not earned');
          if (onSkipped) onSkipped();
        }

        // Always preload the next ad after closing
        loadNewAd();
      });

      // Keep track of this temporary listener just in case component unmounts
      unsubscribeRefs.current.push(unsubscribeClosed);

      try {
        rewardedRef.current.show();
      } catch (e) {
        console.warn('Failed to show ad natively', e);
        unsubscribeClosed();
        // Graceful fallback if native show() fails
        onSuccess();
        loadNewAd();
      }
    } else {
      console.log('Ad not loaded yet or failed, falling back to success');
      // If ad isn't ready or failed to load entirely, we don't block the user
      onSuccess();
      // Try to load one for next time
      loadNewAd();
    }
  };

  return { showAdIfAvailable, adLoaded };
}
