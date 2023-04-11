import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { openAuthWindow } from '../components/auth/authSlice';
import { showNotification } from '../components/notification/notificationSlice';

function Profile() {
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const photoURL = useAppSelector((state) => state.auth.photoURL);
  const dispatch = useAppDispatch();
  const [profileUser, setProfileUser] = useState<any>({});
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const { profileUserId } = useParams<{ profileUserId: string }>();

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (profileUserId) {
        const profileUserInfo = await getProfileUserInfo(profileUserId);
        const posts = await getProfileUserPosts(profileUserId);
        setProfileUser(profileUserInfo);
        setProfileUserPosts(posts);
      }
    };
    fetchProfileUser();
  }, []);

  const getProfileUserInfo = async (id: string) => {
    const profileUserDocRef = doc(db, 'users', id);
    const profileUserDoc = await getDoc(profileUserDocRef);
    if (!profileUserDoc.exists()) {
      // alert('No such document!');
      return '';
    }
    const profileUserData = profileUserDoc.data();
    return profileUserData;
  };

  const getProfileUserPosts = async (profileUserId: string) => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('authorId', '==', profileUserId), orderBy('timeCreated', 'desc'));
    const querySnapshot: QuerySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      const brandName: string = await getName(postData.brandId || '', 'brand');
      const itemName: string = await getName(postData.itemId || '', 'item');
      return { ...postData, postId: change.id, brandName, itemName };
    });

    const postsWithQueriedInfos = await Promise.all(posts);
    return postsWithQueriedInfos;
    // setProfileUserPosts(postsWithQueriedInfos);
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

  if (profileUserId === 'null') {
    return <div className='text-center font-heal text-3xl'><button className='underline' onClick={() => dispatch(openAuthWindow())}>sign in</button> to see your profile 🤗</div>
  }

  return (
    <div className='m-10 flex flex-col items-center'>
      <Link to='/setting' className='bg-gray-600 text-white rounded'>
        setting
      </Link>

      <div className='flex flex-col items-center'>
        <img className='h-32 w-32 rounded-full object-cover' src={profileUser.photoURL} alt={photoURL || ''} />
        <h3 className='text-2xl'>This is {profileUser.name}'s Page</h3>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <div>建立時間：{profileUser.timeCreated?.toDate().toLocaleString()}</div>
      </div>
      {profileUserPosts.map((post, index) => {
        return (
          <div className='w-4/5 rounded bg-gray-100 p-3 my-1' key={index}>
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
