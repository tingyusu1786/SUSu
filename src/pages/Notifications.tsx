import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import {
  //   collection,
  doc,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
  //   getDoc,
  //   getDocs,
  //   query,
  //   Query,
  //   orderBy,
  //   limit,
  onSnapshot,
  //   QuerySnapshot,
  Timestamp,
  //   updateDoc,
  //   where,
  //   deleteDoc,
  //   startAfter,
  //   arrayUnion,
  //   arrayRemove,
} from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { openAuthWindow } from '../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification } from '../components/notification/notificationSlice';

interface Notification {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  timeCreated: Timestamp;
  type: 'like' | 'comment;';
  postId: string;
  unread: boolean;
}

function Notifications() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const currentUserName = useAppSelector((state) => state.auth.userName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const initSnap = useRef(true);

  let currentUserRef: DocumentReference<DocumentData> | undefined;

  if (currentUserId) {
    currentUserRef = doc(db, 'users', currentUserId);
  }

  useEffect(() => {
    if (!currentUserRef) {
      return;
    }

    fetchNotifications(currentUserRef);
    // changeRead();

    const unsubscribe = onSnapshot(currentUserRef, async (docSnapshot: DocumentSnapshot) => {
      const newNotifications = docSnapshot
        .data()
        ?.notifications.reverse()
        .filter((notif: any) => notif.authorId !== currentUserId);

      console.log('newNotifications', newNotifications);

      !initSnap.current && setNotifications(newNotifications);
      initSnap.current = false;
      // changeRead();
    });

    return unsubscribe;
  }, [currentUserId]);

  const getAuthorInfo = async (authorId: string, field: 'name' | 'photoURL') => {
    const authorRef = doc(db, 'users', authorId);
    const authorDoc = await dbApi.getDoc(authorRef);
    if (!authorDoc.exists()) {
      alert('No such user!');
      return;
    }
    const authorData = authorDoc.data();
    return authorData[field];
  };

  // todo
  const changeRead = () => {
    setTimeout(async () => {
      setNotifications((prev) => {
        const newNotifications = prev.map((n) => {
          n.unread = false;
          return n;
        });
        return newNotifications;
      });
      // if (!currentUserRef) {
      //   return;
      // }
      // const newNotifications = notifications.map((n) => {
      //   n.unread = false;
      //   return n;
      // });
      // await updateDoc(currentUserRef, {
      //   notifications: newNotifications,
      // });
    }, 3000);
  };

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

  const fetchNotifications = async (currentUserRef: DocumentReference<DocumentData> | undefined) => {
    if (!currentUserRef) {
      return;
    }
    const currentUserDoc = await dbApi.getDoc(currentUserRef);
    if (!currentUserDoc.exists()) {
      alert('No such user!');
      return;
    }
    const currentUserData = currentUserDoc.data();
    const currentUserNotifications =
      currentUserData?.notifications.reverse().filter((notif: any) => notif.authorId !== currentUserId) || [];
    // if (!currentUserNotifications) {
    //   alert('no 通知 yet');
    //   return;
    // }
    setNotifications(currentUserNotifications);
  };

  if (!isSignedIn) {
    return (
      <div className='text-center font-heal text-3xl'>
        <button className='underline' onClick={() => dispatch(openAuthWindow())}>
          sign in
        </button>
        <span> to see your notification</span>
      </div>
    );
  }
  return (
    <div className='text-xl'>
      {/*{notifications.length===0 && <div>no notification yet</div>}*/}
      {notifications.length > 0 && <div>({notifications.length})</div>}
      {notifications.map((notification, index) => {
        const timeDiff = getTimeDiff(notification.timeCreated);
        return (
          <div className={`my-1 ${notification.unread ? 'bg-lime-100' : 'bg-gray-100'} rounded`} key={index}>
            <span>{`${notification.authorName} ${notification.type}${
              notification.type === 'like' ? 'd' : 'ed'
            } on your post! (post id: ${notification.postId})`}</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className='text-gray-500'>
              {timeDiff} <span className='text-gray-500 text-xs'>({notification.timeCreated.toDate().toLocaleString()})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Notifications;
