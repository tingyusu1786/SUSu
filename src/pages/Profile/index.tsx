/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  QuerySnapshot,
  and,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { User } from '../../interfaces/interfaces';
import { Notification } from '../../interfaces/interfaces';
import NameCard from './NameCard';
import dbApi from '../../utils/dbApi';
import PostsSection from './PostsSection';
import DashboardSection from './DashboardSection';
import { User as UserIcon, UsersThree, ArrowRight, Browsers, PresentationChart } from '@phosphor-icons/react';

function Profile() {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserName = useAppSelector((state) => state.auth.currentUser.name);
  // const dispatch = useAppDispatch();
  const [profileUser, setProfileUser] = useState<User>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [usersFollowing, setUsersFollowing] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [usersFollowers, setUsersFollowers] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const { profileUserId } = useParams<{ profileUserId: string }>();
  const [tab, setTab] = useState<TabName>('DASHBOARD');

  type TabName = 'LOGS' | 'DASHBOARD' | 'FOLLOWING' | 'FOLLOWERS';

  useEffect(() => setTab('DASHBOARD'), [profileUserId]);

  useEffect(() => {
    if (!profileUserId) return;
    const unsub = onSnapshot(doc(db, 'users', profileUserId), (doc) => {
      setProfileUser(doc.data() as User);
    });
    const fetchProfileUser = async (profileUserId: string) => {
      // const profileUserInfo = await getProfileUser(profileUserId);
      // profileUserInfo && setProfileUser(profileUserInfo);

      const posts = await getProfileUserPosts(profileUserId);
      setProfileUserPosts(posts);
    };
    profileUserId && fetchProfileUser(profileUserId);
    return unsub;
  }, [profileUserId, currentUserId]);

  useEffect(() => {
    const isFollowing = checkIsFollowing();
    setIsFollowing(isFollowing);
  }, [profileUser]);

  useEffect(() => {
    getProfileUserFollows();
  }, []);

  // const getProfileUser = async (id: string) => {
  //   const profileUserDocRef = doc(db, 'users', id);
  //   const profileUserDoc = await getDoc(profileUserDocRef);
  //   if (!profileUserDoc.exists()) {
  //     // alert('No such document!');
  //     return;
  //   }
  //   const profileUserData = profileUserDoc.data() as User | undefined;
  //   return profileUserData;
  // };

  const getProfileUserPosts = async (profileUserId: string) => {
    const postsRef = collection(db, 'posts');
    // console.log(currentUserId);

    let q;
    if (profileUserId === currentUserId) {
      q = query(postsRef, where('authorId', '==', profileUserId), orderBy('timeCreated', 'desc'));
    } else {
      q = query(
        postsRef,
        and(where('audience', '==', 'public'), where('authorId', '==', profileUserId)),
        orderBy('timeCreated', 'desc')
      );
    }

    const querySnapshot: QuerySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      const brandName: string = await getName(postData.brandId || '', 'brand');
      const itemName: string = await getName(postData.itemId || '', 'item');
      return { ...postData, postId: change.id, brandName, itemName };
    });

    const postsWithQueriedInfos = await Promise.all(posts);
    // console.log(postsWithQueriedInfos);
    return postsWithQueriedInfos;
  };

  const getProfileUserFollows = async () => {
    const userFollowersInfo = profileUser?.followers?.map(async (followerId) => {
      const name = (await dbApi.getUserField(followerId, 'name')) || 'user';
      const photoURL = (await dbApi.getUserField(followerId, 'photoURL')) || '';
      return { id: followerId, name, photoURL };
    });
    if (!userFollowersInfo) return;
    const userFollowersInfos = await Promise.all(userFollowersInfo);
    setUsersFollowers(userFollowersInfos);

    const userFollowingInfo = profileUser?.following?.map(async (followingId) => {
      const name = (await dbApi.getUserField(followingId, 'name')) || 'user';
      const photoURL = (await dbApi.getUserField(followingId, 'photoURL')) || '';
      return { id: followingId, name, photoURL };
    });
    if (!userFollowingInfo) return;
    const userFollowingInfos = await Promise.all(userFollowingInfo);
    setUsersFollowing(userFollowingInfos);
  };

  const getName = async (id: string, type: string) => {
    if (id !== '') {
      let docRef;
      switch (type) {
        case 'brand': {
          docRef = doc(db, 'brands', id);
          break;
        }
        case 'item': {
          const idArray = id.split('-');
          docRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', id);
          break;
        }
      }
      if (docRef !== undefined) {
        const theDoc = await getDoc(docRef);
        if (!theDoc.exists()) {
          // alert('No such document!');
          return '';
        }
        const theData = theDoc.data();
        return theData.name;
      }
    }
  };

  const handleFollow = async (profileUserId: string, isFollowing: boolean | undefined) => {
    if (!profileUserId || !currentUserId) {
      return;
    }
    const profileUserRef = doc(db, 'users', profileUserId);
    const currentUserRef = doc(db, 'users', currentUserId);
    const newEntry = {
      authorId: currentUserId,
      authorName: currentUserName,
      timeCreated: new Date(),
      type: 'follow',
      unread: true,
    };
    if (!isFollowing) {
      await updateDoc(profileUserRef, { followers: arrayUnion(currentUserId) });
      await updateDoc(currentUserRef, { following: arrayUnion(profileUserId) });
      await updateDoc(profileUserRef, { notifications: arrayUnion(newEntry) });
    } else {
      await updateDoc(profileUserRef, { followers: arrayRemove(currentUserId) });
      await updateDoc(currentUserRef, { following: arrayRemove(profileUserId) });
      const profileUserData = await getDoc(profileUserRef);
      const originNotifications = profileUserData.data()?.notifications;
      if (!originNotifications) return;
      const notificationToRemove = originNotifications.find(
        (notification: Notification) => notification.authorId === currentUserId && notification.type === 'follow'
      );
      await updateDoc(profileUserRef, { notifications: arrayRemove(notificationToRemove) });
    }
  };

  const checkIsFollowing = () => {
    if (currentUserId && profileUser?.followers?.includes(currentUserId)) {
      return true;
    }
    return false;
  };

  const tabToComponentMap: Record<TabName, React.ReactNode> = {
    LOGS: <PostsSection profileUserPosts={profileUserPosts} profileUserId={profileUserId || ''} />,
    DASHBOARD: <DashboardSection profileUserPosts={profileUserPosts} profileUserId={profileUserId} />,
    FOLLOWING: (
      <div className='flex flex-col flex-nowrap items-center gap-5'>
        {profileUser?.following?.map((followingId) => (
          <NameCard userId={followingId} key={followingId} handleFollow={handleFollow} />
        ))}
      </div>
    ),
    FOLLOWERS: (
      <div className='flex flex-col flex-nowrap items-center gap-4'>
        {profileUser?.followers?.map((followerId) => (
          <NameCard userId={followerId} key={followerId} handleFollow={handleFollow} />
        ))}
      </div>
    ),
  };

  if (profileUser === undefined) {
    return (
      <main className='bg-boxes-diag relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-fixed p-10'>
        user not found ☹&nbsp;
        <Link to='/feeds' className='decoration-2 underline-offset-2 hover:underline'>
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
          <Link to={`/setting/${currentUserId}`} className=' opacity-60 transition-all duration-100 hover:opacity-100'>
            Edit Profile
          </Link>
        </div>
      )}
      {/*personal data*/}
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
          member since{' '}
          {profileUser.timeCreated
            ?.toDate()
            .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .replace(/\//g, '/')}
        </div>

        {profileUserId && profileUserId !== currentUserId && isSignedIn && (
          <button
            className={`button w-32 rounded-full border-2 border-solid border-neutral-900 px-2 hover:bg-green-300 ${
              isFollowing ? ' bg-gray-100 ' : 'bg-green-400 '
            }`}
            onClick={() => handleFollow(profileUserId, isFollowing)}
          >
            {isFollowing ? 'unfollow' : 'follow'}
          </button>
        )}
      </div>
      <div className='my-10 grid h-10 w-full grid-cols-4 justify-stretch transition-all duration-1000 sm:my-5 sm:grid-cols-[repeat(4,auto)]'>
        {['DASHBOARD', 'LOGS', 'FOLLOWING', 'FOLLOWERS'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => {
              setTab(tabName as 'LOGS' | 'DASHBOARD' | 'FOLLOWING' | 'FOLLOWERS');
            }}
            className={`truncate rounded-t-3xl border-2 border-solid border-neutral-900 px-2 pt-2 transition-[width] duration-1000 md:text-sm sm:text-xs ${
              tab === tabName ? 'grow border-b-0' : 'text-neutral-400'
            }`}
          >
            {tabName === 'FOLLOWING' ? (
              <>
                <span className='sm:hidden'>FOLLOWING ({profileUser.following?.length || 0})</span>
                <UserIcon
                  size={20}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
                <ArrowRight
                  size={20}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
                <UsersThree
                  size={24}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='duotone'
                  className='hidden sm:inline-block'
                />
              </>
            ) : tabName === 'FOLLOWERS' ? (
              <>
                <span className='sm:hidden'>FOLLOWERS ({profileUser.followers?.length || 0})</span>
                <UsersThree
                  size={24}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='duotone'
                  className='hidden sm:inline-block'
                />
                <ArrowRight
                  size={20}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
                <UserIcon
                  size={20}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
              </>
            ) : tabName === 'LOGS' ? (
              <>
                <span className='sm:hidden'>{tabName}</span>
                <Browsers
                  size={24}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
              </>
            ) : (
              <>
                <span className='sm:hidden'>{tabName}</span>
                <PresentationChart
                  size={24}
                  color={`${tab === tabName ? '#171717' : '#a3a3a3'}`}
                  weight='regular'
                  className='hidden sm:inline-block'
                />
              </>
            )}
          </button>
        ))}
      </div>

      <div>{tabToComponentMap[tab]}</div>
    </main>
  );
}

export default Profile;
