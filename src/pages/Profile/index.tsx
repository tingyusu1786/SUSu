import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';
import { User } from '../../interfaces/interfaces';
import NameCard from './NameCard';
import dbApi from '../../utils/dbApi';
import PostsSection from './PostsSection';
import DashboardSection from './DashboardSection';
import {
  User as UserIcon,
  UsersThree,
  ArrowRight,
  Browsers,
  PresentationChart,
} from '@phosphor-icons/react';

function Profile() {
  const { profileUserId } = useParams<{ profileUserId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [profileUser, setProfileUser] = useState<User>();
  const [tab, setTab] = useState<TabName>('DASHBOARD');

  type TabName = 'LOGS' | 'DASHBOARD' | 'FOLLOWING' | 'FOLLOWERS';

  useEffect(() => setTab('DASHBOARD'), [profileUserId]);

  useEffect(() => {
    if (!profileUserId) return;
    const unsub = onSnapshot(doc(db, 'users', profileUserId), (doc) => {
      setProfileUser(doc.data() as User);
    });
    return unsub;
  }, [profileUserId, currentUserId]);

  const tabToComponentMap: Record<TabName, React.ReactNode> = {
    DASHBOARD: <DashboardSection profileUserId={profileUserId} />,
    LOGS: <PostsSection profileUserId={profileUserId} />,
    FOLLOWING: (
      <div className='flex flex-col flex-nowrap items-center gap-5'>
        {profileUser?.following?.map((followingId) => (
          <NameCard cardUserId={followingId} key={followingId} />
        ))}
      </div>
    ),
    FOLLOWERS: (
      <div className='flex flex-col flex-nowrap items-center gap-4'>
        {profileUser?.followers?.map((followerId) => (
          <NameCard cardUserId={followerId} key={followerId} />
        ))}
      </div>
    ),
  };

  const tabToButtonMap: Record<TabName, React.ReactNode> = {
    DASHBOARD: (
      <>
        <span className='sm:hidden'>DASHBOARD</span>
        <PresentationChart
          size={24}
          color={`${tab === 'DASHBOARD' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
      </>
    ),
    LOGS: (
      <>
        <span className='sm:hidden'>LOGS</span>
        <Browsers
          size={24}
          color={`${tab === 'LOGS' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
      </>
    ),
    FOLLOWING: (
      <>
        <span className='sm:hidden'>
          FOLLOWING ({profileUser?.following?.length || 0})
        </span>
        <UserIcon
          size={20}
          color={`${tab === 'FOLLOWING' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
        <ArrowRight
          size={20}
          color={`${tab === 'FOLLOWING' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
        <UsersThree
          size={24}
          color={`${tab === 'FOLLOWING' ? '#171717' : '#a3a3a3'}`}
          weight='duotone'
          className='hidden sm:inline-block'
        />
      </>
    ),
    FOLLOWERS: (
      <>
        <span className='sm:hidden'>
          FOLLOWERS ({profileUser?.followers?.length || 0})
        </span>
        <UsersThree
          size={24}
          color={`${tab === 'FOLLOWERS' ? '#171717' : '#a3a3a3'}`}
          weight='duotone'
          className='hidden sm:inline-block'
        />
        <ArrowRight
          size={20}
          color={`${tab === 'FOLLOWERS' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
        <UserIcon
          size={20}
          color={`${tab === 'FOLLOWERS' ? '#171717' : '#a3a3a3'}`}
          weight='regular'
          className='hidden sm:inline-block'
        />
      </>
    ),
  };

  if (!profileUserId || !profileUser) {
    return (
      <main className='bg-boxes-diag relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-fixed p-10'>
        user not found ☹&nbsp;
        <Link
          to='/feeds'
          className='decoration-2 underline-offset-2 hover:underline'
        >
          go to feeds
        </Link>
        &nbsp;to explore other users
      </main>
    );
  }

  return (
    <main className='bg-boxes-diag relative min-h-[calc(100vh-64px)] bg-fixed p-10 sm:p-5'>
      {currentUserId === profileUserId && (
        <div className='mb-2 w-full text-center'>
          <Link
            to={`/setting/${currentUserId}`}
            className=' opacity-60 transition-all duration-100 hover:opacity-100'
          >
            Edit Profile
          </Link>
        </div>
      )}
      <div className='flex flex-col items-center gap-4'>
        <img
          className='h-32 w-32 rounded-full border-4 border-solid border-neutral-900 object-cover'
          src={profileUser.photoURL}
          alt={profileUser.name}
        />
        {profileUser.status && (
          <span className='-mt-8 w-max -skew-y-6 rounded-full bg-white bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 pt-1 text-center text-white'>
            {profileUser.status}
          </span>
        )}
        <h3 className='text-3xl selection:bg-green-400'>{profileUser.name}</h3>
        <div className='-mt-4 text-sm text-gray-400'>{profileUser.email}</div>
        <div>
          <span className='mr-1'>member since</span>
          {profileUser.timeCreated
            ?.toDate()
            .toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '/')}
        </div>

        {currentUserId &&
          profileUserId &&
          profileUserId !== currentUserId &&
          isSignedIn && (
            <button
              className={`button w-32 rounded-full border-2 border-solid border-neutral-900 px-2 hover:bg-green-300 ${
                profileUser?.followers?.includes(currentUserId)
                  ? ' bg-gray-100 '
                  : 'bg-green-400 '
              }`}
              onClick={() =>
                dbApi.handleFollow(
                  currentUserId,
                  currentUser.name,
                  profileUserId,
                  profileUser?.followers?.includes(currentUserId)
                )
              }
            >
              {profileUser?.followers?.includes(currentUserId)
                ? 'unfollow'
                : 'follow'}
            </button>
          )}
      </div>
      <div className='my-10 grid h-10 w-full grid-cols-4 justify-stretch transition-all duration-1000 sm:my-5 sm:grid-cols-[repeat(4,auto)]'>
        {['DASHBOARD', 'LOGS', 'FOLLOWING', 'FOLLOWERS'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => {
              setTab(
                tabName as 'LOGS' | 'DASHBOARD' | 'FOLLOWING' | 'FOLLOWERS'
              );
            }}
            className={`truncate rounded-t-3xl border-2 border-solid border-neutral-900 px-2 pt-2 transition-[width] duration-1000 md:text-sm sm:text-xs ${
              tab === tabName ? 'grow border-b-0' : 'text-neutral-400'
            }`}
          >
            {tabToButtonMap[tabName as TabName]}
          </button>
        ))}
      </div>

      <div>{tabToComponentMap[tab]}</div>
    </main>
  );
}

export default Profile;
