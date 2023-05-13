import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
  CaretCircleRight,
  BellSimple,
  MagnifyingGlass,
} from '@phosphor-icons/react';

import NotificationsList from '../../components/NotificationsModal/';
import { signOutFail } from '../../redux/authSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  showNotification,
  closeNotification,
  showSearch,
  closeSearch,
  showAuth,
} from '../../redux/popUpSlice';
import authApi from '../../utils/authApi';
import swal from '../../utils/swal';

function Header() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isNotificationShown = useAppSelector(
    (state) => state.popUp.isNotificationShown
  );
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);
  const [dropdownShown, setDropdownShown] = useState({
    profile: false,
    navLi: false,
  });

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
        swal.success('signed out', 'come back soon!', 'ok');
      } catch (error: any) {
        swal.error('oh no!', 'something went wrong...try again later', 'ok');
        dispatch(signOutFail(error));
      }
    }
  };

  const navLi = [
    { name: 'FEEDS', to: '/feeds' },
    { name: 'DRINKIPEDIA', to: '/drinkipedia' },
    { name: 'INSPIRATION', to: '/inspiration' },
  ];

  const closeDropdown = () => {
    Object.values(dropdownShown).some((dropdown) => dropdown === true) &&
      setDropdownShown({ profile: false, navLi: false });
    isNotificationShown && dispatch(closeNotification());
  };

  const toggleDropdown = (type: 'navLi' | 'profile') => {
    if (isNotificationShown) return;
    const newShown = {
      navLi: type === 'navLi',
      profile: type === 'profile',
    };
    setDropdownShown(newShown);
  };

  const toggleNotificationShown = () => {
    isNotificationShown
      ? dispatch(closeNotification())
      : dispatch(showNotification());
  };

  const toggleSearchShown = () => {
    isSearchShown ? dispatch(closeSearch()) : dispatch(showSearch());
  };

  const renderSmProfileDropdown = () => (
    <div
      className='group hidden sm:block'
      onClick={() => {
        toggleDropdown('profile');
      }}
    >
      <img
        src={currentUser.photoURL}
        alt=''
        className='box-content h-10 w-10 min-w-[40px] cursor-pointer rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
      />
      <div
        className={`absolute left-0 top-[64px] grid w-screen grid-rows-[repeat(3,10vh)_1fr] items-center overflow-hidden whitespace-nowrap text-center transition-[height] duration-500 ${
          dropdownShown.profile ? 'h-[calc(100vh-64px)] ' : 'h-0 shadow-none'
        }`}
      >
        <NavLink
          to={`/profile/${userId}`}
          className={({ isActive }) =>
            `flex h-full cursor-pointer items-center justify-center  hover:bg-neutral-100 ${
              isActive ? 'bg-neutral-100' : 'bg-white'
            }`
          }
        >
          profile
        </NavLink>
        <div
          className='flex h-full cursor-pointer items-center justify-center bg-white hover:bg-neutral-100'
          onClick={toggleNotificationShown}
        >
          notifications
        </div>
        <div
          className={`flex h-full cursor-pointer items-center justify-center bg-white text-neutral-500 shadow-lg hover:bg-neutral-100`}
          onClick={handleSignOut}
        >
          sign out
        </div>
        <div className='h-full bg-transparent' onClick={closeDropdown} />
      </div>
    </div>
  );

  const renderSmNavLiDropdown = () => (
    <div className='hidden sm:block'>
      <CaretCircleRight
        size={44}
        color='#171717'
        weight='thin'
        className={`cursor-pointer ${
          dropdownShown.navLi && 'rotate-90'
        } transition-all duration-300`}
        onClick={() => {
          toggleDropdown('navLi');
        }}
      />
      <div
        className={`absolute left-0 top-[64px] grid w-screen grid-rows-[repeat(4,10vh)_1fr] items-center overflow-hidden whitespace-nowrap  text-center transition-[height] duration-300 ${
          dropdownShown.navLi ? 'h-[calc(100vh-64px)] ' : 'h-0 shadow-none'
        }`}
      >
        {navLi.map((li) => (
          <NavLink
            to={li.to}
            className={({ isActive }) =>
              `flex h-full cursor-pointer items-center justify-center bg-white hover:bg-neutral-100 ${
                isActive && 'bg-neutral-100'
              }`
            }
            data-text={li.name}
            key={li.name}
          >
            {li.name}
          </NavLink>
        ))}
        <div
          className={`flex h-full cursor-pointer items-center justify-center bg-white shadow-lg hover:bg-neutral-100`}
          onClick={toggleSearchShown}
        >
          SEARCH
        </div>
        <div className='h-full bg-transparent' onClick={closeDropdown} />
      </div>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-screen items-center justify-between border-b-4 border-green-400 bg-neutral-100 px-16 transition-[padding] duration-300 md:px-8 sm:px-5`}
      onClick={closeDropdown}
    >
      {renderSmNavLiDropdown()}
      <Link
        to='/'
        className='mt-1 hidden transition-all hover:text-green-400 sm:block sm:text-3xl'
      >
        SUSü
      </Link>
      <nav className='sm:hidden'>
        <ul className='flex gap-4'>
          <li>
            <NavLink
              to='/'
              className=' mt-8 block pb-8 transition-all hover:text-green-400'
            >
              SUSü
            </NavLink>
          </li>
          {navLi.map((li) => (
            <li key={li.name}>
              <NavLink
                to={li.to}
                className={({ isActive }) =>
                  `navLi ${
                    isActive &&
                    'before:decoration-sky-400 before:decoration-wavy'
                  }`
                }
                data-text={li.name}
              >
                {li.name}
              </NavLink>
            </li>
          ))}
          <li>
            <MagnifyingGlass
              size={20}
              color='#171717'
              weight='bold'
              className='mt-8 cursor-pointer transition-all duration-150 hover:fill-green-400'
              onClick={toggleSearchShown}
            />
          </li>
        </ul>
      </nav>

      {isSignedIn ? (
        <div className='flex items-center gap-3'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap text-center lg:max-w-[calc(100vw-128px-390px-180px)] md:hidden'>
            Hi {currentUser.name}
          </div>
          <Link to={`/profile/${userId}`} className='group relative sm:hidden'>
            <img
              src={currentUser.photoURL}
              alt={currentUser.name || 'user avatar'}
              className='box-content h-10 w-10 min-w-[40px] rounded-full border-2 border-solid border-neutral-900 object-cover transition-all duration-100 hover:border-green-400 '
            />
          </Link>
          {renderSmProfileDropdown()}
          <BellSimple
            size={20}
            color='#171717'
            weight='bold'
            className='cursor-pointer transition-all duration-100 hover:fill-green-400 sm:hidden'
            onClick={toggleNotificationShown}
          />

          <div
            onClick={handleSignOut}
            className='cursor-pointer scroll-px-2.5 text-neutral-500 decoration-2 underline-offset-2 hover:underline sm:hidden'
          >
            sign out
          </div>
        </div>
      ) : (
        <div
          className='group relative cursor-pointer '
          onClick={() => dispatch(showAuth())}
        >
          <span className='decoration-2 underline-offset-2 group-hover:underline'>
            sign in
          </span>
          <span className='md:hidden'>
            &nbsp;to see your profile and notifications!
          </span>
        </div>
      )}
      <NotificationsList />
    </header>
  );
}

export default Header;
