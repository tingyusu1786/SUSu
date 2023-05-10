import { Timestamp } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import dbApi from './dbApi';
import { addAllBrands } from '../app/infoSlice';

// const dispatch = useAppDispatch();

const getTimeDiff = (timestamp: Timestamp): string => {
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
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (mins > 0) {
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
};

const fetchAllBrandsInfo = async () => {
  const allBrands = await dbApi.getAllBrandsInfo();
  return allBrands;
};

export default { getTimeDiff, fetchAllBrandsInfo };