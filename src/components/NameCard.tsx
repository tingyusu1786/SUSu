import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import dbApi from '../utils/dbApi';
import { db } from '../services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { User } from '../interfaces/interfaces';
interface UserCard extends Omit<User, 'notifications' | 'timeCreated' | 'following'> {}

interface Props {
  userId: string;
  handleFollow: (profileUserId: string, isFollowing: boolean | undefined) => Promise<void>;
}
const NameCard: React.FC<Props> = ({ userId, handleFollow }) => {
  const dispatch = useAppDispatch();
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [user, setUser] = useState<UserCard>();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId), (userDoc) => {
      if (userDoc?.data()) {
        const { email, followers, name, photoURL, status } = userDoc.data() as User;
        const userState = { email, followers, name, photoURL, status };
        setUser(userState);
      }
    });
    // const getUser = async () => {
    //   const userDoc = await getDoc(doc(db, 'users', userId));
    //   if (userDoc.exists()) {
    //     const { email, followers, name, photoURL, status } = userDoc.data();
    //     const userState = { email, followers, name, photoURL, status };
    //     setUser(userState);
    //   }
    // };
    // getUser();
    return unsub;
  }, []);

  if (!user) {
    return <div>loading...</div>;
  }

  return (
    <div className='mb-1 w-64 rounded-3xl bg-gray-200'>
      <Link to={`/profile/${userId}`}>
        <img src={user.photoURL} alt='' className='h-10 w-10 rounded-full' />
        <div>{user.name}</div>
      </Link>
      <div>{user.email}</div>
      <div>{user.status}</div>
      {currentUserId && isSignedIn && userId !== currentUserId && (
        <button
          className={`button w-32 rounded-full border-2 border-solid border-neutral-900 px-2 ${
            currentUserId && user?.followers?.includes(currentUserId) ? ' bg-gray-100 ' : 'bg-green-400 '
          }`}
          onClick={() => handleFollow(userId, user?.followers?.includes(currentUserId))}
        >
          {currentUserId && user?.followers?.includes(currentUserId) ? 'unfollow' : 'follow'}
        </button>
      )}
    </div>
  );
};

export default NameCard;
