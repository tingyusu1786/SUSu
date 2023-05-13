import { Timestamp } from 'firebase/firestore';

const getTimeDiff = (timestamp: Timestamp): string => {
  const now = new Date();
  const target = timestamp.toDate();
  const diff = now.getTime() - target.getTime();

  const durations = [
    { unit: 'year', duration: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', duration: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'week', duration: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', duration: 24 * 60 * 60 * 1000 },
    { unit: 'hour', duration: 60 * 60 * 1000 },
    { unit: 'minute', duration: 60 * 1000 },
  ];

  for (let i = 0; i < durations.length; i++) {
    const { unit, duration } = durations[i];
    if (diff >= duration) {
      const diffInUnit = Math.floor(diff / duration);
      return `${diffInUnit} ${unit}${diffInUnit > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

export default { getTimeDiff };
