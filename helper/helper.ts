const TEN_MINUTES = 10 * 60 * 1000;

export function getCountdownTime(finishedAt: Date | string) {
  const endTime = new Date(finishedAt).getTime() + TEN_MINUTES;

  const diff = endTime - Date.now();

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    minutes,
    seconds,
    expired: false,
  };
}
