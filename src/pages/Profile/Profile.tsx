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
  or,
  and,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { openAuthWindow } from '../../components/auth/authSlice';
import { showNotification } from '../../components/notification/notificationSlice';
import { User } from '../../interfaces/interfaces';
import { Notification } from '../../interfaces/interfaces';
import NameCard from '../../components/NameCard';
import dbApi from '../../utils/dbApi';
import PostsSection from './PostsSection';
import DashboardSection from './DashboardSection';

function Profile() {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();
  const [profileUser, setProfileUser] = useState<User>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [usersFollowing, setUsersFollowing] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [usersFollowers, setUsersFollowers] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const { profileUserId } = useParams<{ profileUserId: string }>();
  const [tab, setTab] = useState<'posts' | 'dashboard' | 'followers' | 'following'>('posts');

  // set default tab = dashboard
  useEffect(() => {
    setTab('dashboard');
  }, [profileUserId]);

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

  const getProfileUser = async (id: string) => {
    const profileUserDocRef = doc(db, 'users', id);
    const profileUserDoc = await getDoc(profileUserDocRef);
    if (!profileUserDoc.exists()) {
      // alert('No such document!');
      return;
    }
    const profileUserData = profileUserDoc.data() as User | undefined;
    return profileUserData;
  };

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
      const name = await dbApi.getUserField(followerId, 'name');
      const photoURL = await dbApi.getUserField(followerId, 'photoURL');
      return { id: followerId, name, photoURL };
    });
    if (!userFollowersInfo) return;
    const userFollowersInfos = await Promise.all(userFollowersInfo);
    setUsersFollowers(userFollowersInfos);

    const userFollowingInfo = profileUser?.following?.map(async (followingId) => {
      const name = await dbApi.getUserField(followingId, 'name');
      const photoURL = await dbApi.getUserField(followingId, 'photoURL');
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
        case 'item':
          {
            const idArray = id.split('-');
            docRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', id);
            break;
          }
          deafult: return;
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

  const handleFollow = async () => {
    if (!profileUserId || !currentUserId) {
      return;
    }
    setIsFollowing((prev) => {
      console.log('setIsFollowing');
      return !prev;
    });
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

  if (isLoading) {
    return <div>loading</div>;
  }

  // todo: redirect if null
  if (profileUserId === 'null') {
    return (
      <div className='text-center font-heal text-3xl'>
        <button className='underline' onClick={() => dispatch(openAuthWindow())}>
          sign in
        </button>
        &nbsp;to see your profile 🤗
      </div>
    );
  }

  if (profileUser === undefined) {
    return <div>user not found ~~~ see these users to follow:</div>;
  }

  return (
    <div className='m-10 flex flex-col items-center'>
      {currentUserId === profileUserId && (
        <Link to={`/setting/${currentUserId}`} className='rounded bg-gray-600 text-white'>
          setting
        </Link>
      )}
      {/*personal data*/}
      <div className='flex flex-col items-center'>
        <img className='h-32 w-32 rounded-full object-cover' src={profileUser.photoURL} alt={profileUser.name} />
        {profileUser.status && (
          <div>
            <span>🎙️ </span>
            <span>{profileUser.status}</span>
          </div>
        )}
        <h3 className='text-2xl'>This is {profileUser.name}'s Page</h3>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <div>建立時間：{profileUser.timeCreated?.toDate().toLocaleString()}</div>

        {profileUserId !== currentUserId && isSignedIn && (
          <button
            className={`box-border rounded-lg border-2 border-solid px-2 ${
              isFollowing ? 'border-lime-800' : 'border-white bg-lime-800 text-white'
            }`}
            onClick={handleFollow}
          >
            {isFollowing ? 'unfollow' : 'follow'}
          </button>
        )}
      </div>
      <div className='flex gap-3 text-center'>
        <button
          onClick={() => {
            setTab('posts');
          }}
          className={tab === 'posts' ? 'font-bold text-blue-600' : ''}
        >
          posts
        </button>
        <button
          onClick={() => {
            setTab('dashboard');
          }}
          className={tab === 'dashboard' ? 'font-bold text-blue-600' : ''}
        >
          dashboard
        </button>

        <button
          onClick={() => {
            setTab('following');
          }}
          className={tab === 'following' ? 'font-bold text-blue-600' : ''}
        >
          following<span className='font-bold'> {profileUser.following?.length || 0}</span>
        </button>
        <button
          onClick={() => {
            setTab('followers');
          }}
          className={tab === 'followers' ? 'font-bold text-blue-600' : ''}
        >
          followers
          <span className='font-bold'> {profileUser.followers?.length || 0}</span>
        </button>
      </div>
      <div className='flex gap-5'>
        <div>
          {tab === 'posts' && profileUserId && (
            <PostsSection profileUserPosts={profileUserPosts} profileUserId={profileUserId} />
          )}
          {tab === 'dashboard' && (
            <DashboardSection
              // startDate={startDate}
              // endDate={endDate}
              // values={values}
              profileUserPosts={profileUserPosts}
            />
          )}
          {tab === 'following' &&
            profileUser?.following?.map((followingId) => <NameCard userId={followingId} key={followingId} />)}
          {tab === 'followers' &&
            profileUser?.followers?.map((followerId) => <NameCard userId={followerId} key={followerId} />)}
        </div>
      </div>
    </div>
  );
}

export default Profile;