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
  openAuthWindow,
  closeAuthWindow,
} from '../features/auth/authSlice';
import { showNotice, closeNotice } from '../features/notice/noticeSlice';
import { Authentication } from '../features/auth/Authentication';
import { Notification } from '../features/notice/Notification';

function Header() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userId);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const userName = useAppSelector((state) => state.auth.userName);
  const photoURL = useAppSelector((state) => state.auth.photoURL);
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
  const isNotice = useAppSelector((state) => state.notice.isShown);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      dispatch(signInSuccess(JSON.parse(localStorage.getItem('userData') as string)));
    }
  }, []);

  const fireNotice = ()=> {
    dispatch(showNotice({ type: 'success', content: 'hihi' }));
    setTimeout(() => dispatch(closeNotice()), 10000);
  }

  return (
    <div className='mb-8 flex flex-row items-center justify-center gap-5 bg-gray-100'>
      <div>
        <img src={photoURL} alt='' className='h-32 w-32 rounded-full object-cover' />

        <div className='text-center'>{isSignedIn ? `Hi ${userName}` : 'not signed-in'}</div>
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
      <Link to='/catalogue' className='bg-lime-200'>
        大全
      </Link>
      <Link to='/inspiration' className='bg-lime-200'>
        今天喝什麼
      </Link>
      <div>
        <button onClick={() => dispatch(openAuthWindow())}>[ open auth window ]</button>
        <button onClick={() => dispatch(closeAuthWindow())}>[ close ]</button>
        <button
          onClick={fireNotice}
        >
          [ show notice ]
        </button>

        {isAuthWindow && <Authentication />}
        {isNotice && <Notification />}
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
