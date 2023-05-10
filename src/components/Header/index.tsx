import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotification, closeNotification, showSearch, closeSearch, showAuth } from '../../app/popUpSlice';
import { signOutStart, signOutSuccess, signOutFail } from '../../app/authSlice';
import NotificationsList from '../../components/NotificationsModal/';
import { Notification } from '../../interfaces/interfaces';
import dbApi from '../../utils/dbApi';
import authApi from '../../utils/authApi';
import swal from '../../utils/swal';
import { CaretCircleRight, BellSimple, MagnifyingGlass } from '@phosphor-icons/react';

function NotificationsListener() {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  // eslint-disable-next-line
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

  const fireNotification = ({ authorId, authorName, content, postId, type }: Notification) => {
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
            {authorName} commented <q className='text-neutral-900'>{content}</q> <span>on your&nbsp;</span>
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

function Header() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const isNotificationShown = useAppSelector((state) => state.popUp.isNotificationShown);
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);
  const [dropdownShown, setDropdownShown] = useState({ profile: false, navLi: false });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-screen items-center justify-between border-b-4 border-green-400 bg-neutral-100 px-16 transition-[padding] duration-300 md:px-8 sm:px-5`}
      onClick={() => {
        Object.values(dropdownShown).some((dropdown) => dropdown === true) &&
          setDropdownShown({ profile: false, navLi: false });
        isNotificationShown && dispatch(closeNotification());
      }}
    >
      {/*{<ScreenSize />}*/}
      <NotificationsListener />
      <div className={`hidden sm:block`}>
        <CaretCircleRight
          size={44}
          color='#171717'
          weight='thin'
          className={`cursor-pointer ${dropdownShown.navLi && 'rotate-90'} transition-all duration-300`}
          onClick={() => {
            !isNotificationShown &&
              setDropdownShown((prev) => {
                const newShown = { ...prev };
                newShown.navLi = !newShown.navLi;
                newShown.profile = false;
                return newShown;
              });
          }}
        />
        <div
          className={`absolute left-0 top-[64px] grid w-screen cursor-pointer grid-rows-4 items-center overflow-hidden whitespace-nowrap bg-white text-center transition-[height] duration-300 ${
            dropdownShown.navLi ? 'h-[40vh] shadow-lg' : 'h-0 shadow-none'
          }`}
        >
          {navLi.map((li) => (
            <NavLink
              to={li.to}
              className={({ isActive }) =>
                `flex h-full items-center justify-center hover:bg-neutral-100 ${isActive && 'bg-neutral-100'}`
              }
              data-text={li.name}
              key={li.name}
            >
              {li.name}
            </NavLink>
          ))}
          <div
            className={`flex h-full items-center justify-center hover:bg-neutral-100`}
            onClick={() => {
              dispatch(showSearch());
            }}
          >
            SEARCH
          </div>
        </div>
      </div>
      <Link to='/' className='mt-1 hidden transition-all hover:text-green-400 sm:block sm:text-3xl'>
        SUSü
      </Link>
      <nav className='sm:hidden'>
        <ul className='flex gap-4'>
          <li>
            <NavLink to='/' className=' mt-8 block pb-8 transition-all hover:text-green-400'>
              SUSü
            </NavLink>
          </li>
          {navLi.map((li) => (
            <li key={li.name}>
              <NavLink
                to={li.to}
                className={({ isActive }) => `navLi ${isActive && 'before:decoration-sky-400 before:decoration-wavy'}`}
                data-text={li.name}
              >
                {li.name}
              </NavLink>
            </li>
          ))}
          <li>
            {/*<MagnifyingGlassIcon
              className='mt-8 h-5 w-5 cursor-pointer text-neutral-900 transition-all duration-150 hover:text-green-400'
              onClick={() => {
                isSearchShown ? dispatch(closeSearch()) : dispatch(showSearch());
              }}
            />*/}
            <MagnifyingGlass
              size={20}
              color='#171717'
              weight='bold'
              className='mt-8 h-5 w-5 cursor-pointer  transition-all duration-150 hover:fill-green-400'
              onClick={() => {
                isSearchShown ? dispatch(closeSearch()) : dispatch(showSearch());
              }}
            />
          </li>
        </ul>
      </nav>

      {!isSignedIn && (
        <div className='group relative cursor-pointer ' onClick={() => dispatch(showAuth())}>
          <span className='decoration-2 underline-offset-2 group-hover:underline'>sign in</span>
          <span className='md:hidden'>&nbsp;to see your profile and notifications!</span>
        </div>
      )}

      {isSignedIn && (
        <div className='flex items-center gap-3'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap text-center lg:max-w-[calc(100vw-128px-390px-180px)] md:hidden'>
            Hi {currentUserName}
          </div>
          <Link to={`/profile/${userId}`} className='group relative sm:hidden'>
            <img
              src={currentUserphotoURL}
              alt=''
              className='box-content h-10 w-10 min-w-[40px] rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
          </Link>
          <div
            className='group hidden cursor-pointer sm:block'
            onClick={() => {
              !isNotificationShown &&
                setDropdownShown((prev) => {
                  const newShown = { ...prev };
                  newShown.profile = !newShown.profile;
                  newShown.navLi = false;
                  return newShown;
                });
            }}
          >
            <img
              src={currentUserphotoURL}
              alt=''
              className='box-content h-10 w-10 min-w-[40px] rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
            <div
              className={`absolute left-0 top-[64px] grid w-screen cursor-pointer grid-rows-3 items-center overflow-hidden whitespace-nowrap bg-white text-center transition-[height] duration-300 ${
                dropdownShown.profile ? 'h-[30vh] shadow-lg' : 'h-0 shadow-none'
              }`}
            >
              <NavLink
                to={`/profile/${userId}`}
                className={({ isActive }) =>
                  `flex h-full items-center justify-center hover:bg-neutral-100 ${isActive && 'bg-neutral-100'}`
                }
              >
                profile
              </NavLink>
              <div
                className='flex h-full items-center justify-center hover:bg-neutral-100'
                onClick={() => {
                  isNotificationShown ? dispatch(closeNotification()) : dispatch(showNotification());
                }}
              >
                notifications
              </div>
              <div
                className={`flex h-full items-center justify-center text-neutral-500 hover:bg-neutral-100`}
                onClick={handleSignOut}
              >
                sign out
              </div>
            </div>
          </div>

          <BellSimple
            size={20}
            color='#171717'
            weight='bold'
            className='h-5 w-5 cursor-pointer transition-all duration-100 hover:fill-green-400 sm:hidden'
            onClick={() => {
              isNotificationShown ? dispatch(closeNotification()) : dispatch(showNotification());
            }}
          />
          {isNotificationShown && <NotificationsList />}
          <div
            onClick={handleSignOut}
            className='cursor-pointer scroll-px-2.5 text-neutral-500 decoration-2 underline-offset-2 hover:underline sm:hidden'
          >
            sign out
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
