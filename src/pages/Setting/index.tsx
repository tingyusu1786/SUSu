import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft } from '@phosphor-icons/react';

import { updateUserName, updateUserPhoto } from '../../redux/authSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import authApi from '../../utils/authApi';
import dbApi from '../../utils/dbApi';
import storageApi from '../../utils/storageApi';
import swal from '../../utils/swal';

function Setting() {
  const { settingUserId } = useParams<{ settingUserId: string }>();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const currentAuthUser = authApi.getCurrentAuthUser();
  const [inputs, setInputs] = useState({
    name: currentUser.name || '',
    status: currentUser.status || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImgPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    return setImgPreview(undefined);
  }, [file]);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    setFile(event.target.files[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    setInputs((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const updatePhoto = async () => {
    if (currentAuthUser === null || file === null || !currentUserId) return;
    await storageApi.uploadUserPhoto(currentUserId, file);

    const photoURL = await storageApi.getPhotoURL(currentUserId);
    if (!photoURL) return;
    await authApi.updateAuthProfile(currentAuthUser, { photoURL });
    await dbApi.updateUserDoc(currentUserId, { photoURL });
    dispatch(updateUserPhoto({ photoURL }));
  };

  const updateName = async () => {
    if (currentAuthUser === null || !currentUserId) return;
    await authApi.updateAuthProfile(currentAuthUser, {
      displayName: inputs.name,
    });
    await dbApi.updateUserDoc(currentUserId, { name: inputs.name });
    dispatch(updateUserName({ name: inputs.name }));
  };

  const updateStatus = async () => {
    if (currentAuthUser === null || !currentUserId) return;
    await dbApi.updateUserDoc(currentUserId, { status: inputs.status });
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
        you don&lsquo;t have access to this page
      </main>
    );
  }

  return (
    <main className='bg-boxes-diag relative min-h-[calc(100vh-64px)] bg-fixed p-10 sm:p-5 sm:pr-10'>
      <div
        className=' group left-10 top-10 flex w-max cursor-pointer items-start gap-2 pr-5 text-lg text-neutral-500 hover:text-neutral-900'
        onClick={() => navigate(-1)}
      >
        <ArrowLeft
          size={24}
          color='#737373'
          weight='regular'
          className='mt-px group-hover:animate-arrowLeft'
        />
        back to profile
      </div>
      <h1 className='mb-6 mt-5 text-center text-3xl sm:my-3'>Edit Profile</h1>
      <div className='mx-auto grid max-w-[960px] grid-cols-[30%_70%] grid-rows-[auto_1fr_1fr_2fr] items-center gap-4'>
        <label className='group relative col-span-2 cursor-pointer justify-self-center'>
          <img
            className='h-32 w-32 rounded-full border-4 border-solid border-neutral-900 object-cover group-hover:border-green-400'
            src={file ? imgPreview : currentUser.photoURL}
            alt={currentUser.name || ''}
          />
          <div className='absolute bottom-1 left-24 w-40 rounded-full border-2 border-solid border-gray-400 bg-white pt-1 text-center'>
            {file ? 'Choose another' : 'Upload new pic'}
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
          className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline focus:outline-green-400'
          value={inputs.name}
          onChange={handleInputChange}
        />
        <div className='justify-self-end'>status</div>
        <input
          name='status'
          type='text'
          maxLength={30}
          placeholder='max 30 characters'
          className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline focus:outline-green-400'
          value={inputs.status}
          onChange={handleInputChange}
        />
        <button
          className='button col-span-2 h-10 justify-self-stretch rounded-full bg-green-300 px-3 hover:bg-green-400 focus:outline focus:outline-green-400'
          onClick={handleConfirmAll}
        >
          CONFIRM
        </button>
      </div>
    </main>
  );
}

export default Setting;
