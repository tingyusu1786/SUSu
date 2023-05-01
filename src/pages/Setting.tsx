import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Link, useParams } from 'react-router-dom';
import { db, auth, storage } from '../services/firebase';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { User } from '../interfaces/interfaces';
import { updateUserName, updateUserPhoto } from '../components/auth/authSlice';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import swal from '../utils/swal';

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
  const [imgPreview, setImgPreview] = useState<string>();

  useEffect(() => {
    if (currentUserId === null) return;
    const fectchProfileUser = async () => {
      const profileUser = await getProfileUser(currentUserId);
      setProfileUser(profileUser);
    };
    fectchProfileUser();
  }, [currentUserId]);

  useEffect(() => {
    if (!profileUser) {
      return;
    }
    setInputs({ name: profileUser?.name, status: profileUser?.status || '' });
  }, [profileUser]);

  useEffect(() => {
    if (!file) {
      setImgPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImgPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFile(event.target.files[0]);
  };

  const updatePhoto = async () => {
    if (currentAuthUser === null || file === null || !currentUserId) return;

    // updateAuthProfile
    // Upload the new user photo to Firebase Storage
    const storageRef = ref(storage, `userPhotos/${currentAuthUser.uid}`);
    await uploadBytes(storageRef, file);

    // Update the user's photoURL in Firebase Auth
    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(currentAuthUser, { photoURL });

    // updateDoc
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

  const handleConfirmAll = async () => {
    try {
      swal.showLoading();
      await Promise.all([updatePhoto(), updateName(), updateStatus()]);
      swal.hideLoading();
      swal.success('Profile updated!', '', 'ok');
    } catch {
      swal.hideLoading();
      swal.error('something went wrong...', 'try again later', 'ok');
    }
  };

  if (currentUserId !== settingUserId) {
    return (
      <main className='bg-boxes-diag relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-fixed p-10 text-xl'>
        you don't have access to this page
      </main>
    );
  }

  return (
    <main className='bg-boxes-diag relative min-h-[calc(100vh-64px)] bg-fixed p-10'>
      <h1 className='mb-6 mt-10 text-center text-3xl'>Edit Profile</h1>
      <Link to={`/profile/${currentUserId}`} className='group absolute left-10 top-10 flex items-start gap-2 text-lg '>
        <ArrowLeftIcon className='w-6 group-hover:animate-arrowLeft' />
        back to profile
      </Link>
      <div className='mx-auto grid max-w-[960px] grid-cols-[30%_70%] grid-rows-[auto_1fr_1fr_2fr] items-center gap-4'>
        <label className='group relative col-span-2 cursor-pointer justify-self-center'>
          <img
            className='h-32 w-32 rounded-full border-4 border-solid border-neutral-900 object-cover group-hover:border-green-400'
            src={file ? imgPreview : currentUserphotoURL}
            alt={currentUserName || ''}
          />
          <div className='absolute bottom-1 left-24 w-40 rounded-full border-2 border-solid border-gray-400 bg-white pt-1 text-center'>
            {file ? 'cancel' : 'Upload new pic'}
          </div>
          <input
            type='file'
            className='box-border hidden rounded-lg border-2 border-solid border-lime-800 px-2'
            onChange={handleFileInputChange}
          />
        </label>
        <div className='justify-self-end'>nick name</div>
        <input
          name='name'
          type='text'
          maxLength={20}
          placeholder='max 20 characters'
          className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline-green-400'
          value={inputs.name}
          onChange={handleInputChange}
        />
        <div className='justify-self-end'>status</div>
        <input
          name='status'
          type='text'
          maxLength={30}
          placeholder='max 30 characters'
          className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline-green-400'
          value={inputs.status}
          onChange={handleInputChange}
        />
        <button
          className='button col-span-2 h-10 justify-self-stretch rounded-full bg-green-300 px-3 hover:bg-green-400 focus:outline-green-400'
          onClick={handleConfirmAll}
        >
          CONFIRM
        </button>
      </div>
    </main>
  );
}

export default Setting;
