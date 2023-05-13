import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import dbApi from '../../utils/dbApi';
import { useAppSelector } from '../../app/hooks';
import { User } from '../../interfaces/interfaces';

type CardUser = Omit<User, 'notifications' | 'timeCreated' | 'following'>;

const NameCard = ({ cardUserId }: { cardUserId: string }) => {
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [cardUser, setCardUser] = useState<CardUser>();

  useEffect(() => {
    if (!cardUserId) return;
    const unsub = onSnapshot(doc(db, 'users', cardUserId), (userDoc) => {
      if (userDoc?.data()) {
        const { email, followers, name, photoURL, status } =
          userDoc.data() as User;
        const userState = { email, followers, name, photoURL, status };
        setCardUser(userState);
      }
    });
    return unsub;
  }, [cardUserId]);

  if (!cardUser) {
    return null;
  }

  return (
    <div className='grid w-full max-w-3xl grid-cols-[80px_1fr_128px] items-center gap-5 rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-8 py-3 shadow-[3px_3px_#000] md:px-3 sm:grid-cols-[80px_calc(100%-96px)] sm:gap-3 sm:p-3'>
      <Link to={`/profile/${cardUserId}`} className='focus:outline-none'>
        <img
          src={cardUser.photoURL}
          alt={cardUser.name}
          className='h-20 w-20 min-w-[80px] rounded-full border-2 border-solid border-neutral-900 object-cover hover:border-green-400 peer-hover:border-green-400'
        />
      </Link>
      <div>
        <Link to={`/profile/${cardUserId}`} className='focus:outline-none'>
          <span className='text-xl'>{cardUser.name}</span>
        </Link>
        <div className='mb-px truncate text-sm text-neutral-400'>
          {cardUser.email}
        </div>
        <div
          className={`bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text leading-5 text-transparent ${
            cardUser?.status &&
            cardUser?.status?.trim() !== '' &&
            'before:mr-1 before:content-["-"]'
          }`}
        >
          {cardUser.status}
        </div>
      </div>

      {currentUserId && isSignedIn && cardUserId !== currentUserId && (
        <button
          className={`button ml-auto w-32 rounded-full border-2 border-solid border-neutral-900 px-2 hover:bg-green-300 focus:outline-none ${
            currentUserId && cardUser?.followers?.includes(currentUserId)
              ? ' bg-neutral-100 '
              : 'bg-green-400 '
          }`}
          onClick={() =>
            dbApi.handleFollow(
              currentUserId,
              currentUser.name,
              cardUserId,
              cardUser?.followers?.includes(currentUserId)
            )
          }
        >
          {currentUserId && cardUser?.followers?.includes(currentUserId)
            ? 'unfollow'
            : 'follow'}
        </button>
      )}
    </div>
  );
};

export default NameCard;
