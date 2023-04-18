import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { openAuthWindow, closeAuthWindow } from '../components/auth/authSlice';
import { showNotification, closeNotification } from '../components/notification/notificationSlice';
import { Authentication } from '../components/auth/Authentication';
import { SearchBox } from 'react-instantsearch-hooks-web';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../interfaces/interfaces';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../utils/dbApi';

function NotificationsListener() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const initSnap = useRef(true);
  const notificationsLength = useRef(0);

  let currentUserRef: DocumentReference<DocumentData> | undefined;

  if (currentUserId) {
    currentUserRef = doc(db, 'users', currentUserId);
  }

  useEffect(() => {
    if (!currentUserRef) {
      return;
    }
    fetchNotifications(currentUserRef);
    const unsubscribe = onSnapshot(currentUserRef, async (docSnapshot: DocumentSnapshot) => {
      const newNotifications = docSnapshot
        .data()
        ?.notifications?.reverse()
        .filter((notif: any) => notif.authorId !== currentUserId);

      !initSnap.current && setNotifications(newNotifications);
      !initSnap.current &&
        newNotifications.length > notificationsLength.current &&
        fireNotification(newNotifications[0]);
      notificationsLength.current = newNotifications.length;
      initSnap.current = false;
    });

    return unsubscribe;
  }, [currentUserId]);

  const fireNotification = (notification: Notification) => {
    const content = {
      authorId: notification.authorId,
      authorName: notification.authorName,
      content: notification.content,
      postId: notification.postId,
      type: notification.type,
      unread: notification.unread,
    };
    dispatch(showNotification({ type: 'normal', content }));
    setTimeout(() => dispatch(closeNotification()), 5000);
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
    notificationsLength.current = currentUserNotifications.length;
    setNotifications(currentUserNotifications);
  };
  return <></>;
}

function Header() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const loading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
  const navigate = useNavigate();

  function handleRedirect() {
    navigate('/search');
  }

  return (
    <div className='mb-8 flex flex-row items-center justify-center gap-5 bg-gray-100 '>
      <NotificationsListener />
      <div>
        <img src={currentUserphotoURL} alt='' className='h-32 w-32 rounded-full object-cover' />
        <div className='text-center'>{isSignedIn ? `Hi ${currentUserName}` : 'not signed-in'}</div>
      </div>
      <div>
        <nav className='flex gap-3'>
          <Link to='/' className='bg-lime-200'>
            home
          </Link>
          <Link to={`/profile/${userId}`} className='bg-lime-200'>
            profile
          </Link>
          <Link to='/posts' className='bg-lime-200'>
            喝po
          </Link>
          <Link to='/notifications' className='bg-lime-200'>
            通知中心
          </Link>
          <Link to='/catalogue' className='bg-lime-200'>
            大全
          </Link>
          <Link to='/inspiration' className='bg-lime-200'>
            今天喝什麼
          </Link>
        </nav>
        <SearchBox placeholder='Search anything' searchAsYouType={false} onSubmit={handleRedirect} className='mt-5' />
      </div>
      <div className='flex flex-col'>
        <button onClick={() => dispatch(openAuthWindow())}>[ open auth window ]</button>
        <button onClick={() => dispatch(closeAuthWindow())}>[ close ]</button>
        {isAuthWindow && <Authentication />}
      </div>
      <div>
        <h3 className='text-2xl'>auth status</h3>
        <div className=''>{`is signed in: ${isSignedIn}`}</div>
        <div className=''>{`loading: ${loading}`}</div>
        <div className=''>{`error: ${error}`}</div>
        <div className=''>{`signed-in user id: ${userId}`}</div>
      </div>
    </div>
  );
}

export default Header;
