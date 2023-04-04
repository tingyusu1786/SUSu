import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Authentication } from '../features/auth/Authentication';
// import { auth, db } from '../utils/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  signInSuccess,
  // signInStart,
  // signInFail,
  // signOutStart,
  // signOutSuccess,
  // signOutFail,
} from '../features/auth/authSlice';
// import Setting from '../pages/Setting';

function Profile() {
  const [isAuthDialogOpened, setIsAuthDialogOpened] = useState(true);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const userId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const photoURL = useAppSelector((state) => state.auth.photoURL);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      dispatch(signInSuccess(JSON.parse(localStorage.getItem('userData') as string)));
    }
  }, []);

  // if (userId !== null) {
  //   const docRef = doc(db, 'users', userId);
  //   const docSnap = getDoc(docRef);
  //   getDoc(docRef).then(docSnap => { console.log("Document data:", docSnap.data()?.email); })
  // }

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     setName(user.displayName || '');
  //     setEmail(user.email || '');
  //     setUserId(user.uid || '');
  //     // ...
  //   } else {
  //     // User is signed out
  //     // ...
  //     setUserId('');
  //     setName('');
  //     setEmail('');
  //     setUserId('');
  //   }
  // });

  return (
    <div className='m-10 flex flex-col items-center'>
      <Link to='/profile/setting' className='bg-lime-600 text-white'>
        setting
      </Link>
      <button onClick={() => setIsAuthDialogOpened(true)}>[ start auth procedure ]</button>
      <button onClick={() => setIsAuthDialogOpened(false)}>[ close ]</button>
      {isAuthDialogOpened && <Authentication />}
      <div className='flex flex-col items-center'>
        <h3 className='text-2xl'>auth status</h3>
        <div className=''>{`is signed in: ${isSignedIn}`}</div>
        <div className=''>{`loading: ${loading}`}</div>
        <div className=''>{`error: ${error}`}</div>
        <div className=''>{`signed-in user id: ${userId}`}</div>
        <h3 className='text-2xl'>user info</h3>
        <img className='rounded-full' src={photoURL} alt={photoURL || ''} />
        <div>{`name: ${userName}`}</div>
      </div>
    </div>
  );
}

export default Profile;
