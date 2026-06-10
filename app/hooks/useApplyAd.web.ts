export function useApplyAd() {
  const showAdIfAvailable = (onAdClosed: () => void) => {
    // AdMob is not supported on web. Just proceed.
    onAdClosed();
  };

  return { showAdIfAvailable };
}
