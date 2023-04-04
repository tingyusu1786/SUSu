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

function Header() {
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
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
        <img src={photoURL} alt='' className='rounded-full' />
        {isSignedIn ? <div> {`Hi ${userName}`}</div> : <div>please sign in</div>}
      </div>
      <Link to='/' className='bg-lime-200'>
        home
      </Link>
      <Link to='/profile' className='bg-lime-200'>
        profile
      </Link>
      <Link to='/posts' className='bg-lime-200'>
        喝po
      </Link>
      <Link to='/map' className='bg-lime-200'>
        map
      </Link>
      <Link to='/catalogue' className='bg-lime-200'>
        大全
      </Link>
      <Link to='/inspiration' className='bg-lime-200'>
        今天喝什麼
      </Link>
      {/*        <Link to='/counter' className='bg-lime-200'>
          (counter)
        </Link>*/}
    </div>
  );
}

export default Header;
