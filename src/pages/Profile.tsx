import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../services/firebase';
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
  onSnapshot
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { openAuthWindow } from '../components/auth/authSlice';
import { showNotification } from '../components/notification/notificationSlice';
import { User } from '../interfaces/interfaces';
import { Notification } from '../interfaces/interfaces';
import dbApi from '../utils/dbApi';

function Profile() {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();
  const [profileUser, setProfileUser] = useState<User>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [usersFollowing, setUsersFollowing] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [usersFollower, setUsersFollower] = useState<{ id: string; name: string; photoURL: string }[]>([]);
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const { profileUserId } = useParams<{ profileUserId: string }>();

  useEffect(() => {
    if (!profileUserId) return;
    const unsub = onSnapshot(doc(db, "users", profileUserId), (doc) => {
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
    console.log(checkIsFollowing());
    setIsFollowing(isFollowing);
  }, [profileUser]);

  useEffect(() => {
    getProfileUserFollows();
  }, [isFollowing]);

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

  // todo: fetch name, photo就會錯QAQ
  const getProfileUserFollows = async () => {
    console.log('getProfileUserFollows')
    // if (!profileUser) {
    //   return;
    // }
    console.log('getProfileUserFollows2')
    const userFollowersInfo = profileUser?.followers?.map(async (followerId) => {
      const name = await dbApi.getUserField(followerId, 'name');
      const photoURL = await dbApi.getUserField(followerId, 'photoURL');
      return { id: followerId, name, photoURL };
    });
    if (!userFollowersInfo) return;
    const userFollowersInfos = await Promise.all(userFollowersInfo);
    setUsersFollower(userFollowersInfos);

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
    // if isFollowing
    // update自己
    // update別人
    // 通知
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
    <div className='m-10 flex flex-col items-center bg-pink-100'>
      {/*<Link to='/setting' className='rounded bg-gray-600 text-white'>
        setting
      </Link>*/}
      {/*personal data*/}
      <div className='flex flex-col items-center'>
        <img className='h-32 w-32 rounded-full object-cover' src={profileUser.photoURL} alt={profileUser.name} />
        <h3 className='text-2xl'>This is {profileUser.name}'s Page</h3>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <div>建立時間：{profileUser.timeCreated?.toDate().toLocaleString()}</div>
        <div className='flex gap-3'>
          {/*follower/follwing*/}
          <div>
            <div>followers<span className='font-bold'>  {profileUser.followers?.length || 0}</span></div>
           {/* {usersFollower.map((follower) => (
              <Link to={`/profile/${follower.id}`} key={follower.id}>
                <div className='flex items-center rounded bg-gray-100'>
                  <img src={follower.photoURL} alt='' className='h-10 w-10 rounded-full' />
                  <div>{follower.name}</div>
                </div>
              </Link>
            ))}*/}
          </div>
          {/*follwing*/}
          <div>
            <div>following<span className='font-bold'>  {profileUser.following?.length || 0}</span></div>
            {/*{usersFollowing.map((following) => (
              <Link to={`/profile/${following.id}`} key={following.id}>
                <div className='flex items-center rounded bg-gray-100'>
                  <img src={following.photoURL} alt='' className='h-10 w-10 rounded-full' />
                  <div>{following.name}</div>
                </div>
              </Link>
            ))}*/}
          </div>
        </div>
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
      <div className='flex gap-5'>
        {/*post*/}
        <div>
          {profileUserPosts.map((post, index) => {
            return (
              <div className='my-1 rounded bg-gray-100 p-3' key={index}>
                <div>{`audience: ${post.audience}`}</div>
                <div>
                  <span className='text-xl after:content-["の"]'>{post.brandName}</span>
                  <span className='text-xl  font-bold'>{post.itemName}</span>
                </div>
                <div>{post.size && `size: ${post.size}`}</div>
                <div>{post.sugar && `sugar: ${post.sugar}`}</div>
                <div>{post.ice && `ice: ${post.ice}`}</div>
                <div>{post.orderNum && `orderNum: ${post.orderNum}`}</div>
                <div>{post.rating && `rating: ${post.rating}`}</div>
                <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
                <div className='flex flex-wrap gap-1'>
                  {post.hashtags?.map((hashtag: string) => (
                    <span className='rounded bg-gray-300 px-2 before:content-["#"]' key={hashtag}>
                      {hashtag}
                    </span>
                  ))}
                </div>
                <div>{post.timeCreated?.toDate().toLocaleString()}</div>

                <span>likes: {post.likes?.length || 0}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Profile;
