import { useEffect, useRef, useState } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-2920036380008137/1229515288';

export function useApplyAd() {
  const [adLoaded, setAdLoaded] = useState(false);
  const rewardedRef = useRef<RewardedAd | null>(null);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedRef.current = rewarded;

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const showAdIfAvailable = (onAdClosed: () => void) => {
    if (rewardedRef.current && adLoaded) {
      const unsubscribeClosed = rewardedRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        onAdClosed();
        unsubscribeClosed();
        // Reset and reload the ad
        setAdLoaded(false);
        rewardedRef.current?.load();
      });
      
      try {
        rewardedRef.current.show();
      } catch (e) {
        console.warn('Failed to show ad', e);
        onAdClosed();
      }
    } else {
      onAdClosed();
    }
  };

  return { showAdIfAvailable };
}
