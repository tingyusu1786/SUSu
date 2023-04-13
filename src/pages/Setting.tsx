import {
  doc,
  getDoc,
  query,
  Query,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  or,
  and,
} from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { User } from '../interfaces/interfaces';

function Setting() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const { settingUserId } = useParams<{ settingUserId: string }>();
  const [profileUser, setProfileUser] = useState<User>();

  useEffect(() => {
    if (currentUserId === null) return;
    const fectchProfileUser = async () => {
      const profileUser = await getProfileUser(currentUserId);
      setProfileUser(profileUser);
    };
    fectchProfileUser();
  }, []);

  const updatePhoto = () => {
    // updateAuthProfile
    // updateDoc
  };
  const updateName = () => {
    // updateAuthProfile
    // updateDoc
  };
  const updateStatus = () => {};

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

  if (currentUserId !== settingUserId) {
    return <div>you don't have access to this page</div>;
  }
  if (currentUserId === null) {
    return <div>please log in</div>;
  }
  if (profileUser === undefined) {
    return <div>loading...</div>;
  }
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='text-3xl'>Setting</div>
      <button>
        <Link to={`/profile/${currentUserId}`}>done</Link>
      </button>
      <div className='flex flex-col items-center'>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <img className='h-32 w-32 rounded-full object-cover' src={currentUserphotoURL} alt={currentUserName || ''} />
        <button className='box-border rounded-lg border-2 border-solid border-lime-800 px-2'> change image</button>
        <br />
        <h3 className='text-2xl'>{currentUserName}</h3>
        <button className='box-border rounded-lg border-2 border-solid border-lime-800 px-2'> change name</button>
        <span>{profileUser.status}</span>
        <button className='box-border rounded-lg border-2 border-solid border-lime-800 px-2'> change status</button>
      </div>
    </div>
  );
}

export default Setting;
