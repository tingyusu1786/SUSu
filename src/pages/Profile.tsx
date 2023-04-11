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
  arrayRemove
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { openAuthWindow } from '../components/auth/authSlice';
import { showNotification } from '../components/notification/notificationSlice';
import { User } from '../interfaces/interfaces';
import { Notification } from '../interfaces/interfaces';

function Profile() {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const dispatch = useAppDispatch();
  const [profileUser, setProfileUser] = useState<User>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const { profileUserId } = useParams<{ profileUserId: string }>();

  useEffect(() => {
    if (isLoading) return;
    const fetchProfileUser = async (profileUserId: string) => {
      const profileUserInfo = await getProfileUser(profileUserId);
      profileUserInfo && setProfileUser(profileUserInfo);

      const posts = await getProfileUserPosts(profileUserId);
      setProfileUserPosts(posts);
    };
    profileUserId && fetchProfileUser(profileUserId);
  }, [profileUserId, currentUserId]);

  useEffect(() => {
    const isFollowing = checkIsFollowing();
    setIsFollowing(isFollowing);
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
    console.log(currentUserId);

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
    console.log(postsWithQueriedInfos);
    return postsWithQueriedInfos;
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
    setIsFollowing((prev) => !prev);
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
        (notification: Notification) =>
          notification.authorId === currentUserId && notification.type === 'follow'
      );
      await updateDoc(profileUserRef, { notifications: arrayRemove(notificationToRemove) });
    }
    // if isFollowing
    // update自己
    // update別人
    // 通知
  };

  const checkIsFollowing = () => {
    if (profileUserId === currentUserId) {
      return false;
    }
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
        to see your profile 🤗
      </div>
    );
  }

  if (profileUser === undefined) {
    return <div>user not found ~~~ see these users to follow:</div>;
  }

  return (
    <div className='m-10 flex flex-col items-center'>
      <Link to='/setting' className='rounded bg-gray-600 text-white'>
        setting
      </Link>

      <div className='flex flex-col items-center'>
        <img className='h-32 w-32 rounded-full object-cover' src={profileUser.photoURL} alt={profileUser.name} />
        <h3 className='text-2xl'>This is {profileUser.name}'s Page</h3>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <div>建立時間：{profileUser.timeCreated?.toDate().toLocaleString()}</div>
        {profileUserId !== currentUserId && currentUserId !== undefined && (
          <button
            className={`box-border rounded-lg border-2 border-solid px-2 ${
              isFollowing ? 'border-lime-800' : 'border-white bg-lime-800 text-white'
            }`}
            onClick={handleFollow}
          >
            follow
          </button>
        )}
      </div>
      {profileUserPosts.map((post, index) => {
        return (
          <div className='my-1 w-4/5 rounded bg-gray-100 p-3' key={index}>
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
  );
}

export default Profile;
