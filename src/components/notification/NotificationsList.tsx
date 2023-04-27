import { useState, useEffect, useRef } from 'react';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../../utils/dbApi';
import { openAuthWindow } from '../../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { getTimeDiff } from '../../utils/common';
import { Notification } from '../../interfaces/interfaces';

export function NotificationsList() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const initSnap = useRef(true);
  // const notificationsLength = useRef(0);

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
        ?.notifications?.reverse()
        .filter((notif: any) => notif.authorId !== currentUserId);

      !initSnap.current && setNotifications(newNotifications);
      initSnap.current = false;
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
    }, 3000);
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
      currentUserData?.notifications?.reverse().filter((notif: any) => notif.authorId !== currentUserId) || [];
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
    <div className='justify-top absolute right-5 top-20 flex max-h-96 w-96 flex-col items-center gap-1 overflow-scroll text-xl'>
      {notifications.length === 0 && <div>no notification yet</div>}
      {notifications.length > 0 && <div>({notifications?.length})</div>}
      {notifications.map((notification, index) => {
        const timeDiff = getTimeDiff(notification.timeCreated);
        return (
          <div className={`${notification.unread ? 'bg-lime-100' : 'bg-gray-100'} w-96 rounded p-2`} key={index}>
            <Link to={`/profile/${notification.authorId}`} className='hover:font-bold'>
              {notification.authorName}
            </Link>
            {notification.type === 'follow' ? (
              <span> {` started following you!`}</span>
            ) : (
              <Link to={`/log/${notification.postId}`}>
                <span>
                  {` ${notification.type}${notification.type === 'like' ? 'd' : 'ed'} on your post! (post id: ${
                    notification.postId
                  })`}
                </span>
              </Link>
            )}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className='text-gray-500'>
              {timeDiff}{' '}
              <span className='text-xs text-gray-500'>({notification.timeCreated.toDate().toLocaleString()})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
