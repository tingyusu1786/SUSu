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
  collection,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Link, useParams } from 'react-router-dom';
import { db, auth, storage } from '../services/firebase';
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { User } from '../interfaces/interfaces';
import { updateUserName, updateUserPhoto } from '../components/auth/authSlice';

function Setting() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const currentAuthUser = auth.currentUser;
  const { settingUserId } = useParams<{ settingUserId: string }>();
  const [profileUser, setProfileUser] = useState<User>();
  const [inputs, setInputs] = useState({
    name: currentUserName || '',
    status: profileUser?.status || '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUserId === null) return;
    const fectchProfileUser = async () => {
      const profileUser = await getProfileUser(currentUserId);
      setProfileUser(profileUser);
    };
    fectchProfileUser();
  }, []);

  useEffect(() => {
    if (!profileUser) {
      return;
    }
    setInputs({ name: profileUser?.name, status: profileUser?.status || '' });
  }, [profileUser]);

  const updatePhoto = async () => {
    // updateDoc
    if (currentAuthUser === null || file === null || !currentUserId) return;

    // updateAuthProfile
    // Upload the new user photo to Firebase Storage
    const storageRef = ref(storage, `userPhotos/${currentAuthUser.uid}`);
    await uploadBytes(storageRef, file);

    // Update the user's photoURL in Firebase Auth
    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(currentAuthUser, { photoURL });

    // Update the user's photoURL in Firestore
    const userDocRef = doc(db, 'users', currentUserId);
    await updateDoc(userDocRef, { photoURL });

    dispatch(updateUserPhoto({ photoURL }));

    // 用一樣名字會直接蓋掉就不用另外刪掉
  };

  const updateName = async () => {
    if (currentAuthUser === null || !currentUserId) return;
    // updateAuthProfile
    await updateProfile(currentAuthUser, { displayName: inputs.name });
    // updateDoc
    const userDocRef = doc(db, 'users', currentUserId);
    await updateDoc(userDocRef, { name: inputs.name });

    dispatch(updateUserName({ name: inputs.name }));
  };
  const updateStatus = async () => {
    if (currentAuthUser === null || !currentUserId) return;
    const userDocRef = doc(db, 'users', currentUserId);
    await updateDoc(userDocRef, { status: inputs.status });
  };

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

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFile(event.target.files[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    switch (key) {
      case 'name': {
        setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value, itemId: '', size: '', price: '' };
          return newInput;
        });
        break;
      }
      case 'status': {
        setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value, size: '', price: '' };
          return newInput;
        });
        break;
      }
      default: {
        return;
      }
    }
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
      {/*<div className='text-3xl'>Setting</div>*/}
      <button>
        <Link to={`/profile/${currentUserId}`} className='text-3xl'>
          back to profile
        </Link>
      </button>
      <div className='flex flex-col items-center'>
        <div className='text-sm text-gray-400'>{profileUser.email}</div>
        <div>
          <img
            className='inline-block h-32 w-32 rounded-full object-cover'
            src={currentUserphotoURL}
            alt={currentUserName || ''}
          />
          <label>
            upload new image
            <input
              type='file'
              className='box-border rounded-lg border-2 border-solid border-lime-800 px-2'
              onChange={handleFileInputChange}
            />
          </label>
          <button onClick={updatePhoto}>confirm</button>
        </div>
        <br />
        <div>
          <input name='name' type='text' className='text-2xl' value={inputs.name} onChange={handleInputChange} />
          <button className='box-border rounded-lg border-2 border-solid border-lime-800 px-2' onClick={updateName}>
            confirm
          </button>
        </div>
        <div>
          <input name='status' type='text' value={inputs.status} onChange={handleInputChange} />
          <button className='box-border rounded-lg border-2 border-solid border-lime-800 px-2' onClick={updateStatus}>
            confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setting;
