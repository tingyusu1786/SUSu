import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { openAuthWindow, signOutStart, signOutSuccess, signOutFail } from '../components/auth/authSlice';
import { showNotification, closeNotification } from '../components/notification/notificationSlice';
import { NotificationsList } from '../components/notification/NotificationsList';

import type { SearchBoxProps } from 'react-instantsearch-hooks-web';
import { PoweredBy } from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  useHits,
  Hits,
  Highlight,
  RefinementList,
  Index,
  InfiniteHits,
} from 'react-instantsearch-hooks-web';

import { Notification } from '../interfaces/interfaces';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import authApi from '../utils/authApi';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/solid';
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
        newNotifications.length > notificationsLength.current &&
        fireNotification(newNotifications[0]);
      notificationsLength.current = newNotifications.length;
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
  // const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
  const isShown = useAppSelector((state) => state.notification.isShown);
  const navigate = useNavigate();
  const [searchShown, setSearchShown] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);

  function handleRedirect() {
    navigate('/search');
  }

  function BrandHit({ hit }: any) {
    return (
      <Link
        to={`/catalogue/${hit.objectID}`}
        className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
        onClick={() => setSearchShown(false)}
      >
        {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
        <Highlight attribute='name' hit={hit} className='' />
        <Highlight attribute='story' hit={hit} className='text-sm text-neutral-500' />
        <div className='text-sm'>
          <span>總部：</span>
          <Highlight attribute='headquarter' hit={hit} className='text-sm text-neutral-500' />
        </div>
      </Link>
    );
  }

  function UserHit({ hit }: any) {
    return (
      <Link
        to={`/profile/${hit.objectID}`}
        className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
        onClick={() => setSearchShown(false)}
      >
        {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
        <Highlight attribute='name' hit={hit} className='' />
        {hit.email && (
          <div className='text-sm text-neutral-500'>
            <Highlight attribute='email' hit={hit} className='text-sm' />
          </div>
        )}
        {hit.status && (
          <div className='text-sm'>
            <span>🎙️</span>
            <Highlight attribute='status' hit={hit} className='text-sm' />
          </div>
        )}
      </Link>
    );
  }

  // 直接render出post?
  function PostHit({ hit }: any) {
    return (
      <article className='my-5 text-center'>
        {/*<button className='hover:font-bold hover:text-lime-700'>
        <Link to={`/profile/${hit.objectID}`}>
          <Highlight attribute='name' hit={hit} className='my-0 rounded' />
        </Link>
      </button>*/}
        {hit.brandId && (
          <div className='text-sm text-gray-400'>
            <Highlight attribute='brandId' hit={hit} className='rounded text-sm' />
          </div>
        )}
        {hit.itemId && (
          <div className='text-sm text-gray-400'>
            <Highlight attribute='itemId' hit={hit} className='rounded text-sm' />
          </div>
        )}
        {hit.hashtags && (
          <div className='text-sm text-gray-400'>
            <Highlight attribute='hashtags' hit={hit} className='rounded text-sm' />
          </div>
        )}
      </article>
    );
  }

  useEffect(() => {
    //todo: any
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') {
        setNotificationShown(false);
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
        swal.success('signed out.', 'come back soon!', 'ok');
      } catch (error: any) {
        swal.error('oh no!', 'something went wrong...try again later', 'ok');
        dispatch(signOutFail(error));
      }
    } else {
      return;
    }
  };

  const navLi = [
    { name: 'DRINK FEEDS', to: '/feeds' },
    { name: 'DRINK CATALOGUE', to: '/catalogue' },
    { name: 'INSPIRATION', to: '/inspiration' },
  ];
  const location = useLocation();

  return (
    <header
      className={`sticky top-0 z-40 flex h-11 h-16 w-screen flex-row items-center justify-between gap-5 border-b-4 border-solid border-green-400 bg-gray-100 px-16 `}
    >
      {<ScreenSize />}
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
              className='mt-8 h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-150 hover:scale-125'
              onClick={() => {
                setSearchShown((prev) => !prev);
              }}
            />
          </li>
        </ul>
      </nav>

      {searchShown && (
        <div className='fixed left-1/2 top-20 grid h-[80vh] w-3/4 max-w-[700px] -translate-x-1/2 grid-rows-[auto_1fr_2rem] rounded-md border-4 border-neutral-900 bg-neutral-100 p-5 shadow-lg'>
          <div className='border-b-2 border-dashed border-neutral-900'>
            <SearchBox
              // queryHook={queryHook}
              // onSubmit={handleRedirect}
              autoFocus
              placeholder='Search anything'
              searchAsYouType={true}
              submitIconComponent={({ classNames }) => <span className={classNames.submitIcon}></span>}
              resetIconComponent={({ classNames }) => <span className={classNames.resetIcon}></span>}
              loadingIconComponent={() => <span></span>}
              classNames={{
                // root: 'MyCustomSearchBox',
                form: 'pb-5',
                input:
                  'h-10 rounded-full border-2 border-solid border-gray-400 p-3 focus:border-green-400 focus:outline-green-400 w-full',
                submitIcon: 'hidden',
                resetIcon: 'bg-red-700 hidden',
                loadingIcon: 'hidden',
              }}
            />
          </div>

          <div className=' flex w-full flex-col items-stretch gap-3 overflow-y-scroll py-3'>
            <Index indexName='brands'>
              <div className='text-xl'>brands</div>
              <Hits hitComponent={BrandHit} className='' />
            </Index>
            <Index indexName='users'>
              <h1>users</h1>
              <Hits hitComponent={UserHit} className='' />
            </Index>

            <Index indexName='posts'>
              <h1>posts</h1>
              <Hits
                hitComponent={PostHit}
                className='  flex flex-col items-center bg-green-100'
                // showPrevious={false}
              />
            </Index>
          </div>

          <PoweredBy
            classNames={{
              root: 'MyCustomPoweredBy',
              link: 'MyCustomPoweredByLink MyCustomPoweredByLink--subclass',
            }}
          />
        </div>
      )}

      {!isSignedIn && (
        <div className='group relative hover:cursor-pointer ' onClick={() => dispatch(openAuthWindow())}>
          <span className='decoration-2 group-hover:underline'>sign in</span>
          <span>&nbsp;to see your profile and notifications!</span>
        </div>
      )}

      {isSignedIn && (
        <div className='flex items-center gap-3'>
          <div className='text-center'>{`Hi ${currentUserName}`}</div>
          <Link to={`/profile/${userId}`} className='group relative'>
            <img
              src={currentUserphotoURL}
              alt=''
              className='box-content h-10 min-w-[40px] rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
          </Link>
          <BellIcon
            className='h-6 w-6 cursor-pointer text-neutral-900 transition-all duration-100 hover:text-green-400'
            onClick={() => {
              setNotificationShown((prev) => !prev);
            }}
          />
          {notificationShown && <NotificationsList />}
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
