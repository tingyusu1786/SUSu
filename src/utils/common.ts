import { Timestamp } from 'firebase/firestore';
import { showNotification, closeNotification } from '../components/notification/notificationSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';

export const getTimeDiff = (timestamp: Timestamp): string => {
  const now = new Date();
  const target = timestamp.toDate();
  const diff = now.getTime() - target.getTime();

  const minInMs = 60 * 1000;
  const hourInMs = 60 * minInMs;
  const dayInMs = 24 * hourInMs;
  const weekInMs = 7 * dayInMs;
  const monthInMs = 30 * dayInMs;
  const yearInMs = 365 * dayInMs;

  const years = Math.floor(diff / yearInMs);
  const months = Math.floor(diff / monthInMs);
  const weeks = Math.floor(diff / weekInMs);
  const days = Math.floor(diff / dayInMs);
  const hours = Math.floor(diff / hourInMs);
  const mins = Math.floor(diff / minInMs);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (mins > 0) {
    return `${mins} minute${mins > 1 ? 's' : ''}`;
  } else {
    return 'just now';
  }
};

// export const fireNotification = () => {
//   dispatch(showNotification({ type: 'success', content: 'hihi' }));
//   setTimeout(() => dispatch(closeNotification()), 5000);
// };
