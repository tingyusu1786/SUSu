import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  signInStart,
  signInSuccess,
  signInFail,
  signOutStart,
  signOutSuccess,
  signOutFail,
} from '../features/auth/authSlice';
import { Authentication } from '../features/auth/Authentication';

function Header() {
  const [isAuthDialogOpened, setIsAuthDialogOpened] = useState(false);
  const userId = useAppSelector((state) => state.auth.userId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const userName = useAppSelector((state) => state.auth.userName);
  const photoURL = useAppSelector((state) => state.auth.photoURL);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      dispatch(signInSuccess(JSON.parse(localStorage.getItem('userData') as string)));
    }
  }, []);

  return (
    <div className='mb-8 flex flex-row items-center justify-center gap-5 bg-gray-100'>
      <div>
        <img src={photoURL} alt='' className='h-32 w-32 rounded-full object-cover' />

        <div className='text-center'>{isSignedIn ? `Hi ${userName}` : "not signed-in"}</div>
      </div>
      <Link to='/' className='bg-lime-200'>
        home
      </Link>
      <Link to={`/profile/${userId}`} className='bg-lime-200'>
        profile
      </Link>
      <Link to='/posts' className='bg-lime-200'>
        喝po
      </Link>
      {/*<Link to='/map' className='bg-lime-200'>
        map
      </Link>*/}
      <Link to='/catalogue' className='bg-lime-200'>
        大全
      </Link>
      <Link to='/inspiration' className='bg-lime-200'>
        今天喝什麼
      </Link>
      {/*        <Link to='/counter' className='bg-lime-200'>
          (counter)
        </Link>*/}
      <div>
        <button onClick={() => setIsAuthDialogOpened(true)}>[ open auth window ]</button>
        <button onClick={() => setIsAuthDialogOpened(false)}>[ close ]</button>
        {isAuthDialogOpened && <Authentication />}
      </div>
      <div>
        <h3 className='text-2xl'>auth status</h3>
        <div className=''>{`is signed in: ${isSignedIn}`}</div>
        <div className=''>{`loading: ${loading}`}</div>
        <div className=''>{`error: ${error}`}</div>
        <div className=''>{`signed-in user id: ${userId}`}</div>
      </div>
    </div>
  );
}

export default Header;
