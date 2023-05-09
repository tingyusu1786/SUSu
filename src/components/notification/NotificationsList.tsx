import { useState, useEffect, useRef } from 'react';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot, updateDoc } from 'firebase/firestore';
import dbApi from '../../utils/dbApi';
import { closeNotification } from '../../app/popUpSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { getTimeDiff } from '../../utils/common';
import { Notification } from '../../interfaces/interfaces';
import swal from '../../utils/swal';
import { SmileyWink } from '@phosphor-icons/react';

function NotificationsList() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [notifications, setNotifications] = useState<Notification[]>();
  const initSnap = useRef(true);

  let currentUserRef: DocumentReference<DocumentData> | undefined;

  if (currentUserId) {
    currentUserRef = doc(db, 'users', currentUserId);
  }

  useEffect(() => {
    if (!currentUserRef) {
      return;
    }

    setTimeout(() => fetchNotifications(currentUserRef), 500);

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

    setNotifications(currentUserNotifications);
  };

  const handleClearNotification = async () => {
    if (!currentUserId) return;
    const result = await swal.warning('clear all notifications?', 'this cannot be undone!', 'yes');

    if (result.isConfirmed) {
      // updateDoc
      const userRef = doc(db, 'users', currentUserId);
      await updateDoc(userRef, { notifications: [] });
      // setState
      setNotifications([]);
      swal.success('Notifications cleared!', '', 'ok');
    } else {
      return;
    }
  };
  // animate__animated animate__bounceInRight

  if (!notifications) {
    return (
      <div className='justify-top absolute right-5 top-20 flex max-h-[80vh] w-96 flex-col items-center gap-2 overflow-y-scroll rounded-lg border-4 border-neutral-900 bg-neutral-100 p-5 shadow-lg'>
        <SmileyWink
          size={32}
          color='#171717'
          weight='light'
          className='animate__animated animate__swing animate__infinite animate__fast'
        />
      </div>
    );
  }

  return (
    <div className='justify-top absolute right-5 top-20 flex max-h-[80vh] w-96 flex-col items-center gap-2 overflow-y-scroll rounded-lg border-4 border-neutral-900 bg-neutral-100 p-5 shadow-lg lg:max-h-[85vh]'>
      {notifications.length === 0 && <div>no notification yet</div>}
      {notifications.length > 0 && <div>({notifications.length})</div>}
      {notifications.length > 0 && (
        <button
          onClick={handleClearNotification}
          className='absolute right-6 top-6 text-sm outline-0 hover:text-green-400'
        >
          clear all
        </button>
      )}
      <div className='flex h-4/5 w-full flex-col items-center gap-2 '>
        {notifications.map((notification, index) => {
          const timeDiff = getTimeDiff(notification.timeCreated);
          let html: JSX.Element = <></>;
          let to: string = '';
          switch (notification.type) {
            case 'follow': {
              to = `/profile/${notification.authorId}`;
              html = (
                <div className='group text-neutral-500'>
                  <span className='transition-all duration-300 group-hover:text-green-400 '>
                    {notification.authorName}
                  </span>{' '}
                  started following you!
                  <br />
                  <div className='text-right text-sm text-neutral-900'>{timeDiff}</div>
                </div>
              );
              break;
            }
            case 'like': {
              to = `/log/${notification.postId}`;
              html = (
                <div className='group text-neutral-500'>
                  {notification.authorName} liked your&nbsp;
                  <span className='transition-all duration-300 group-hover:text-green-400 '>log</span>!
                  <br />
                  <div className='text-right text-sm text-neutral-900'>{timeDiff}</div>
                </div>
              );
              break;
            }
            case 'comment': {
              to = `/log/${notification.postId}`;
              html = (
                <div className='group text-neutral-500'>
                  {notification.authorName} commented <q className='text-neutral-900'>{notification.content}</q> on your{' '}
                  <span className='transition-all duration-300 group-hover:text-green-400 '>log</span>!
                  <br />
                  <div className='text-right text-sm text-neutral-900'>{timeDiff}</div>
                </div>
              );
              break;
            }
          }
          return (
            <Link
              to={to}
              className='group h-max w-full overflow-x-scroll rounded border-2 border-neutral-900 bg-white p-2  shadow-md transition-all duration-300 hover:-translate-y-1'
              key={index}
              onClick={() => dispatch(closeNotification())}
            >
              {html}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default NotificationsList;
