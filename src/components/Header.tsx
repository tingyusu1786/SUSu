import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  openAuthWindow,
  closeAuthWindow,
  signOutStart,
  signOutSuccess,
  signOutFail,
} from '../components/auth/authSlice';
import { showNotification, closeNotification } from '../components/notification/notificationSlice';
import { NotificationPopUp } from '../components/notification/NotificationPopUp';
import { SearchBox } from 'react-instantsearch-hooks-web';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../interfaces/interfaces';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import authApi from '../utils/authApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

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
    console.log('fireNotification');
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
  const isShown = useAppSelector((state) => state.notification.isShown);
  const navigate = useNavigate();

  function handleRedirect() {
    navigate('/search');
  }

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      dispatch(signOutStart());
      alert('sign out successful!');
      dispatch(signOutSuccess());
    } catch (error: any) {
      alert(`Error logging out. (${error})`);
      dispatch(signOutFail(error));
    }
  };

  function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(null);

    useEffect(() => {
      let lastScrollY = window.pageYOffset;

      const updateScrollDirection = () => {
        const scrollY = window.pageYOffset;
        const direction = scrollY > lastScrollY ? 'down' : 'up';
        if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
          setScrollDirection(direction);
        }
        lastScrollY = scrollY > 0 ? scrollY : 0;
      };
      window.addEventListener('scroll', updateScrollDirection); // add event listener
      return () => {
        window.removeEventListener('scroll', updateScrollDirection); // clean up
      };
    }, [scrollDirection]);

    return scrollDirection;
  }
  const scrollDirection = useScrollDirection();

  const navLi = [
    { name: 'DRINK LOGS', to: '/posts' },
    { name: 'NOTIFICATIONS', to: '/notifications' },
    { name: 'DRINK CATALOGUE', to: '/catalogue' },
    { name: 'INSPIRATION', to: '/inspiration' },
  ];
  const location = useLocation();

  return (
    <header
      className={`sticky ${
        scrollDirection === 'down' ? '-top-11 xl:top-0' : 'top-0'
      } flex h-11 w-screen flex-row items-center justify-around gap-5 border-b-4 border-solid border-green-400 bg-gray-100 transition-all duration-300 xl:h-16`}
    >
      <NotificationsListener />
      <nav>
        <ul className='flex gap-4'>
          <li>
            <Link to='/' className='mt-8 block pb-8'>
              LOGO
            </Link>
          </li>
          {navLi.map((li) => (
            <li key={li.name}>
              <Link
                to={li.to}
                className={`relative mt-8 block overflow-hidden pb-8 before:absolute before:whitespace-nowrap before:text-transparent before:underline before:underline-offset-8 before:content-[attr(data-text)attr(data-text)] hover:before:animate-wave hover:before:decoration-sky-400 hover:before:decoration-wavy ${
                  location.pathname === li.to ? 'before:decoration-sky-400 before:decoration-wavy' : ''
                }`}
                data-text={li.name}
              >
                {li.name}
              </Link>
            </li>
          ))}
          <li>
            <MagnifyingGlassIcon className='mt-8 h-5 w-5 cursor-pointer text-neutral-900' />
          </li>
        </ul>
      </nav>
      <SearchBox placeholder='Search anything' searchAsYouType={false} onSubmit={handleRedirect} className='mt-5' />
      {!isSignedIn && (
        <div onClick={() => dispatch(openAuthWindow())} className='cursor-pointer'>
          sign in
        </div>
      )}
      {isSignedIn && <div className='text-center'>{`Hi ${currentUserName}`}</div>}
      {isSignedIn && (
        <Link to={`/profile/${userId}`} className=''>
          <img
            src={currentUserphotoURL}
            alt=''
            className='box-content h-10 w-10 rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-4 hover:border-green-400'
          />
        </Link>
      )}
      {isSignedIn && (
        <div onClick={handleSignOut} className='cursor-pointer scroll-px-2.5'>
          sign out
        </div>
      )}

      {isShown && <NotificationPopUp />}
    </header>
  );
}

export default Header;
