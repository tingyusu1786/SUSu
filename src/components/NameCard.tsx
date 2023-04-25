import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { User } from '../interfaces/interfaces';
interface UserCard extends Omit<User, 'notifications' | 'timeCreated' | 'following'> {}

interface Props {
  userId: string;
  handleFollow: (profileUserId: string, isFollowing: boolean | undefined) => Promise<void>;
}
const NameCard: React.FC<Props> = ({ userId, handleFollow }) => {
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
    return unsub;
  }, [userId]);

  if (!user) {
    return <div></div>;
  }

  return (
    <div className=' grid w-full max-w-3xl grid-cols-[80px_1fr_128px] items-center gap-5 rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-8 py-3 shadow-[3px_3px_#000] md:px-3 sm:grid-cols-[80px_1fr] sm:gap-3 sm:p-3'>
      <Link to={`/profile/${userId}`} className=''>
        <img
          src={user.photoURL}
          alt=''
          className='h-20 w-20 min-w-[80px] rounded-full border-2 border-solid border-neutral-900 object-cover hover:border-green-400 peer-hover:border-green-400'
        />
      </Link>
      <div className=''>
        <Link to={`/profile/${userId}`}>
          <span className=' text-xl'>{user.name}</span>
        </Link>
        <div className='text-sm text-gray-400'>{user.email}</div>
        <div
          className={`bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent ${
            user?.status && user?.status?.trim() !== '' && 'before:mr-1 before:content-["-"]'
          }`}
        >
          {user.status}
        </div>
      </div>

      {currentUserId && isSignedIn && userId !== currentUserId && (
        <button
          className={`button ml-auto w-32 rounded-full border-2 border-solid border-neutral-900 px-2 hover:bg-green-300 ${
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
