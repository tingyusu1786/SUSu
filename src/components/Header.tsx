import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { NotificationsList } from '../components/notification/NotificationsList';
import { SearchBox } from 'react-instantsearch-hooks-web';
import { Notification } from '../interfaces/interfaces';
import type { SearchBoxProps } from 'react-instantsearch-hooks-web';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import authApi from '../utils/authApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { BellIcon } from '@heroicons/react/24/solid';

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
    // <></>
    <span className='absolute bottom-[-10px] left-[30px]'>
      Screen size: [{getSize()}]: {width}px x {height}px
    </span>
  );
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
  const [searchShown, setSearchShown] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);

  function handleRedirect() {
    navigate('/search');
  }

  const queryHook: SearchBoxProps['queryHook'] = (query, search) => {
    const searchQuery = query.replace(/\s/g, '');
    if (searchQuery === '') return;
    search(searchQuery);
  };

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
    // { name: 'NOTIFICATIONS', to: '/notifications' },
    { name: 'DRINK CATALOGUE', to: '/catalogue' },
    { name: 'INSPIRATION', to: '/inspiration' },
  ];
  const location = useLocation();

  // transition - all duration - 300
  // ${
  //   scrollDirection === 'down' ? '-top-11 xl:top-0' : 'top-0'
  // }
  return (
    <header
      className={`sticky top-0 z-40 flex h-11 h-16 w-screen flex-row items-center justify-between gap-5 border-b-4 border-solid border-green-400 bg-gray-100 px-16 `}
    >
      <ScreenSize />
      <NotificationsListener />
      <nav>
        <ul className='flex gap-4'>
          <li>
            <Link to='/' className='mt-8 block pb-8'>
              SUSU
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
            <MagnifyingGlassIcon
              className='mt-8 h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-150 hover:scale-125'
              onClick={() => {
                setSearchShown((prev) => !prev);
              }}
            />
          </li>
          {searchShown && (
            <SearchBox
              placeholder='Search anything'
              // queryHook={queryHook}
              searchAsYouType={false}
              onSubmit={handleRedirect}
              submitIconComponent={({ classNames }) => <span className={classNames.submitIcon}></span>}
              resetIconComponent={({ classNames }) => <span className={classNames.resetIcon}></span>}
              loadingIconComponent={() => <span></span>}
              classNames={{
                // root: 'MyCustomSearchBox',
                form: '',
                input:
                  'h-10 rounded-full border-2 border-solid border-gray-400 p-3 focus:border-green-400 focus:outline-green-400 mt-6',
                submitIcon: 'hidden',
                resetIcon: 'bg-red-700 hidden',
                loadingIcon: 'hidden',
              }}
            />
          )}
        </ul>
      </nav>

      {!isSignedIn && (
        <div onClick={() => dispatch(openAuthWindow())} className='group relative cursor-pointer '>
          <span>sign in</span>
          <div className='absolute -right-1/2 top-8 hidden min-w-[192px] rounded-full border-2 border-solid border-neutral-900 bg-[#F5F3EA] p-2 text-center text-sm group-hover:block'>
            sign in to see your profile and notifications!
          </div>
        </div>
      )}

      {isSignedIn && (
        <div className='flex items-center gap-3'>
          <div className='text-center'>{`Hi ${currentUserName}`}</div>

          <Link to={`/profile/${userId}`} className=''>
            <img
              src={currentUserphotoURL}
              alt=''
              className='box-content h-10 w-10 rounded-full border-4 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
          </Link>
          <BellIcon
            className='h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-150 hover:scale-125'
            onClick={() => {
              setNotificationShown((prev) => !prev);
            }}
          />
          {notificationShown && <NotificationsList />}
          <div onClick={handleSignOut} className='cursor-pointer scroll-px-2.5'>
            sign out
          </div>
        </div>
      )}

      {isShown && <NotificationPopUp />}
    </header>
  );
}

export default Header;
