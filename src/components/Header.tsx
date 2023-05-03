import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification, closeNotification, showSearch, closeSearch, showAuth } from '../app/popUpSlice';
import { signOutStart, signOutSuccess, signOutFail } from '../components/auth/authSlice';
import NotificationsList from '../components/notification/NotificationsList';
// import SearchModal from '../components/SearchModal';

import { Notification } from '../interfaces/interfaces';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import authApi from '../utils/authApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { BellIcon } from '@heroicons/react/24/outline';
import swal from '../utils/swal';

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
        newNotifications &&
        newNotifications.length > notificationsLength.current &&
        fireNotification(newNotifications[0]);
      if (newNotifications) {
        notificationsLength.current = newNotifications.length;
      }
      initSnap.current = false;
    });

    return unsubscribe;
  }, [currentUserId]);

  const fireNotification = ({ authorId, authorName, content, postId, type, unread }: Notification) => {
    let html: JSX.Element = <></>;
    switch (type) {
      case 'follow': {
        html = (
          <a href={`/profile/${authorId}`} className='group text-neutral-500'>
            <span className='group-hover:text-green-400 '>{authorName}</span> started following you!
          </a>
        );
        break;
      }
      case 'like': {
        html = (
          <a href={`/log/${postId}`} className='group text-neutral-500'>
            {authorName} liked your&nbsp;
            <span className='group-hover:text-green-400 '>log</span>!
          </a>
        );
        break;
      }
      case 'comment': {
        html = (
          <a href={`/log/${postId}`} className='group text-neutral-500'>
            {authorName} commented <span className='text-neutral-900'>"{content}"</span> <span>on your</span>
            <span className='group-hover:text-green-400 '>log</span>!
          </a>
        );
        break;
      }
    }
    swal.toast(html);
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

function ScreenSize() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSize = () => {
    let size: string;
    if (width >= 1536) {
      size = 'over 2xl';
    } else if (width >= 1279) {
      size = '2xl';
    } else if (width >= 1023) {
      size = 'xl';
    } else if (width >= 767) {
      size = 'lg';
    } else if (width >= 639) {
      size = 'md';
    } else {
      size = 'sm';
    }

    return size;
  };

  return (
    <span className='absolute bottom-[-35px] left-[50px]'>
      Screen size: [{getSize()}]: {width}px x {height}px
    </span>
  );
}

function Header() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const isNotificationShown = useAppSelector((state) => state.popUp.isNotificationShown);
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);
  const isAuthShown = useAppSelector((state) => state.popUp.isAuthShown);
  const navigate = useNavigate();

  function handleRedirect() {
    navigate('/search');
  }

  useEffect(() => {
    //todo: any
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') {
        dispatch(closeSearch());
        dispatch(closeNotification());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    const result = await swal.warning('Wanna sign out?', '', 'yes');

    if (result.isConfirmed) {
      try {
        await authApi.signOut();
        dispatch(signOutStart());
        dispatch(signOutSuccess());
        swal.success('signed out', 'come back soon!', 'ok');
      } catch (error: any) {
        swal.error('oh no!', 'something went wrong...try again later', 'ok');
        dispatch(signOutFail(error));
      }
    } else {
      return;
    }
  };

  const navLi = [
    { name: 'FEEDS', to: '/feeds' },
    { name: 'DRINKIPEDIA', to: '/drinkipedia' },
    { name: 'INSPIRATION', to: '/inspiration' },
  ];
  const location = useLocation();

  return (
    <header
      className={`sticky top-0 z-40 flex h-11 h-16 w-screen flex-row items-center justify-between gap-5 border-b-4 border-solid border-green-400 bg-gray-100 px-16 md:px-8`}
    >
      <ScreenSize />
      <NotificationsListener />
      <nav>
        <ul className='flex gap-4'>
          <li>
            <Link to='/' className=' mt-8 block pb-8'>
              SUSü
            </Link>
          </li>
          {navLi.map((li) => (
            <li key={li.name}>
              <Link
                to={li.to}
                className={`navLi ${
                  location.pathname === li.to ? 'before:decoration-sky-400 before:decoration-wavy' : ''
                }`}
                data-text={li.name}
              >
                {li.name}
              </Link>
            </li>
          ))}
          <li>
            <MagnifyingGlassIcon
              className='mt-8 h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-150 hover:text-green-400'
              onClick={() => {
                isSearchShown ? dispatch(closeSearch()) : dispatch(showSearch());
              }}
            />
          </li>
        </ul>
      </nav>

      {/*{isSearchShown && <SearchModal />}*/}

      {!isSignedIn && (
        <div className='group relative cursor-pointer ' onClick={() => dispatch(showAuth())}>
          <span className='decoration-2 underline-offset-2 group-hover:underline'>sign in</span>
          <span className='md:hidden'>&nbsp;to see your profile and notifications!</span>
        </div>
      )}

      {isSignedIn && (
        <div className='flex items-center gap-3'>
          <div className='text-center md:hidden'>{`Hi ${currentUserName}`}</div>
          <Link to={`/profile/${userId}`} className='group relative'>
            <img
              src={currentUserphotoURL}
              alt=''
              className='box-content h-10 w-10 min-w-[40px] rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
          </Link>
          <BellIcon
            className='h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-100 hover:text-green-400'
            onClick={() => {
              isNotificationShown ? dispatch(closeNotification()) : dispatch(showNotification());
            }}
          />
          {isNotificationShown && <NotificationsList />}
          <div
            onClick={handleSignOut}
            className='cursor-pointer scroll-px-2.5 text-neutral-500 decoration-2 underline-offset-2 hover:underline'
          >
            sign out
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
