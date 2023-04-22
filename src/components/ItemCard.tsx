import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import dbApi from '../utils/dbApi';

interface Props {
  userId: string;
}
const NameCard: React.FC<Props> = ({ userId }) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<Record<string, string>>();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);

  useEffect(() => {
    const getUser = async () => {
      const name = await dbApi.getUserField(userId, 'name');
      const photoURL = await dbApi.getUserField(userId, 'photoURL');
      const email = await dbApi.getUserField(userId, 'email');
      const user = { name, photoURL, email };
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) {
    return <div>loading...</div>;
  }

  return (
    <div className='mb-1 w-64 rounded-3xl bg-gray-200'>
      <Link to={`/profile/${userId}`}>
        <img src={user.photoURL} alt='' className='h-10 w-10 rounded-full' />
        <div>{user.name}</div>
        <div>{user.email}</div>
      </Link>
    </div>
  );
};

export default NameCard;
