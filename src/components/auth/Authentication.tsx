import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { db } from '../../services/firebase'; //todo
import { useNavigate } from 'react-router-dom';
import storageApi from '../../utils/storageApi';
import authApi from '../../utils/authApi';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { EyeIcon, EyeSlashIcon, HeartIcon } from '@heroicons/react/24/solid';
import Button from '../../components/Button';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'animate.css';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  signInStart,
  signInSuccess,
  signInFail,
  signOutStart,
  signOutSuccess,
  signOutFail,
  openAuthWindow,
  closeAuthWindow,
} from './authSlice';

function Authentication() {
  const dispatch = useAppDispatch();
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [input, setInput] = useState({ name: '', email: '', password: '' });
  const [haveAccount, setHaveAccount] = useState(false);
  const [passwordType, setPasswordType] = useState('password');
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const MySwal = withReactContent(Swal);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: true,
    confirmButtonColor: '#4ade80',
    timer: 2500,
    timerProgressBar: true,
    showClass: {
      popup: '',
      backdrop: 'swal2-backdrop-show',
      icon: 'swal2-icon-show',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  useEffect(() => {
    //todo: any
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') {
        dispatch(closeAuthWindow());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNativeSignUp = async (name: string, email: string, password: string) => {
    if ([name, email, password].some((input) => input === '')) {
      // alert(`please fill in all input field`);
      return;
    }
    try {
      dispatch(signInStart());
      // sign up new user
      const userCredential = await authApi.getUserCredential('signUp', email, password);

      if (userCredential === undefined) {
        throw new Error();
      }

      const user = userCredential.user;

      const imgUrl = await storageApi.getInitPhotoURL('initPhoto.png'); /////

      // update user profile with name and init photo
      await authApi.updateAuthProfile(user, name, imgUrl);

      // add user to firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        timeCreated: new Date(),
      });
      Toast.fire({
        icon: 'success',
        title: 'Signed up successful 🫰',
        confirmButtonText: 'ya',
      });
      // alert(`Signed up user: ${user.displayName} (${user.email})`);
      dispatch(
        signInSuccess({
          user: {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          },
          id: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
        })
      );
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      // alert(`error: ${errorMessage}, code: ${errorCode}`);
      MySwal.fire({
        title: `☹️ ${errorCode}`,
        icon: 'error',
        confirmButtonColor: '#b91c1c',
      });
      dispatch(signInFail(errorMessage));
    }
  };

  const nativeSignIn = async (email: string, password: string) => {
    try {
      dispatch(signInStart());
      const userCredential = await authApi.getUserCredential('signIn', email, password);

      if (userCredential === undefined) {
        throw new Error();
      }

      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.data();

      if (userData) {
        let filteredUserData: { [key: string]: any } = Object.keys(userDoc)
          .filter((key) => key !== 'timeCreated' && key !== 'notifications')
          .reduce((acc: { [key: string]: any }, key) => {
            acc[key] = userData[key];
            return acc;
          }, {});
        dispatch(
          signInSuccess({ user: filteredUserData, id: user.uid, name: userData.name, photoURL: userData.photoURL })
        );
      }
      Toast.fire({
        icon: 'success',
        title: `Welcome back ${userData?.name} 🫰`,
        confirmButtonText: 'hi!',
      });
      // alert(`Logged in user: ${userDoc.data()?.name} (${user.email})`);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      // alert(`error: ${errorMessage}, code: ${errorCode}`);
      MySwal.fire({
        title: `☹️ ${errorCode}`,
        icon: 'error',
        confirmButtonColor: '#b91c1c',
      });
      dispatch(signInFail(errorMessage));
    }
  };

  const googleSignIn = async () => {
    try {
      dispatch(signInStart());
      const OAuthUserCredential = await authApi.getOAuthUserCredential('google');
      if (OAuthUserCredential === undefined) {
        throw new Error();
      }
      const OAuthCredential = await authApi.getOAuthCredential('google', OAuthUserCredential);
      if (OAuthCredential === undefined) {
        throw new Error();
      }

      if (OAuthCredential !== null) {
        const token = OAuthCredential.accessToken;
        // The signed-in user info.
        const user = OAuthUserCredential.user;
        const isNewUser = await authApi.checkIfNewUser(OAuthUserCredential);
        if (isNewUser === undefined) {
          throw new Error();
        }
        if (isNewUser) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            timeCreated: serverTimestamp(),
          });
          Toast.fire({
            icon: 'success',
            title: `Hi ${user.displayName} 🫰`,
            confirmButtonText: 'hi!',
          });
          // alert(`google sign up successful, new user created: ${user.displayName}`);
        } else {
          Toast.fire({
            icon: 'success',
            title: `Welcome back ${user.displayName} 🫰`,
            confirmButtonText: 'hi!',
          });
          // alert(`google sign in successful, user: ${user.displayName}`);
        }
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        const userData = userDoc.data();
        if (userData) {
          let filteredUserData: { [key: string]: any } = Object.keys(userDoc)
            .filter((key) => key !== 'timeCreated' && key !== 'notifications')
            .reduce((acc: { [key: string]: any }, key) => {
              acc[key] = userData[key];
              return acc;
            }, {});
          dispatch(
            signInSuccess({ user: filteredUserData, id: user.uid, name: user.displayName, photoURL: user.photoURL })
          );
        }
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      MySwal.fire({
        title: `☹️ ${errorCode}`,
        icon: 'error',
        confirmButtonColor: '#b91c1c',
      });
      // alert(`error: ${errorMessage}, code: ${errorCode}`);
      dispatch(signInFail(errorMessage));

      // The email of the user's account used
      const errEmail = error.customData.email;
      MySwal.fire({
        title: `☹️ error: email used (${errEmail})`,
        icon: 'error',
        confirmButtonColor: '#b91c1c',
      });
      // alert(`error: email used: ${errEmail}`);

      // The AuthCredential type that was used
      // const credential = GoogleAuthProvider.credentialFromError(error);
      const errorOAuthCredential = await authApi.getErrorOAuthCredential(error);
      // alert(`credential error: ${errorOAuthCredential}`);
      MySwal.fire({
        title: `☹️ credential error: ${errorOAuthCredential}`,
        icon: 'error',
        confirmButtonColor: '#b91c1c',
      });
    }
  };

  const handleReset = () => {
    setInput({ name: '', email: '', password: '' });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    setInput(() => {
      return { ...input, [key]: e.target.value };
    });
  };

  return (
    <div className='fixed top-0 z-50 flex h-screen w-screen items-center justify-center'>
      <form className='animate__faster animate__animated animate__bounceIn z-30  flex w-96 flex-col items-center justify-start gap-3 rounded-md border-[3px] border-solid border-neutral-900 bg-[#F5F3EA] px-4 py-5 shadow-[4px_4px_#10172A]'>
        <div className='text-2xl'>SUSü</div>

        <div className='mb-3 text-center text-lg font-bold'>
          {haveAccount ? 'Welcome back!' : 'Start logging your drinks ;)'}
        </div>
        <button
          onClick={googleSignIn}
          className='button mb-3 h-10 w-full rounded-full bg-green-300 p-0 text-xl transition-all duration-100 hover:bg-green-400'
        >
          continue with Google
        </button>
        <div className='flex w-full items-baseline justify-around gap-3 px-6'>
          <div className='grow border-b border-solid border-gray-400'></div>
          <span className='text-sm '>or</span>
          <div className='grow border-b border-solid border-gray-400'></div>
        </div>
        {!haveAccount && (
          <label className='flex w-full flex-col'>
            <span className='ml-4'>name</span>
            <input
              id='name'
              name='name'
              type='text'
              className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline-green-400'
              value={input.name}
              onChange={handleInputChange}
              autoComplete='name'
              required
            />
          </label>
        )}
        <label className='flex w-full flex-col'>
          <span className='ml-4'>email</span>
          <input
            id='email'
            name='email'
            type='text'
            className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline-green-400'
            value={input.email}
            onChange={handleInputChange}
            autoComplete={haveAccount ? 'email' : 'off'}
            required
          />
        </label>
        <label className='flex w-full flex-col'>
          <span className='ml-4'>password</span>
          <div className='relative'>
            <input
              id='password'
              type={passwordType}
              name='password'
              className='h-10 w-full rounded-full border-2 border-solid border-gray-400 p-3 focus:outline-green-400'
              value={input.password}
              onChange={handleInputChange}
              autoComplete={haveAccount ? 'current-password' : 'new-password'}
              required
            />
            {passwordType === 'password' ? (
              <EyeSlashIcon
                className='absolute right-4 top-[0.6rem] h-5 w-5 text-gray-400 hover:text-green-400'
                onClick={() => {
                  setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'));
                }}
              />
            ) : (
              <EyeIcon
                className='absolute right-4 top-[0.6rem] h-5 w-5 text-gray-400 hover:text-green-400'
                onClick={() => {
                  setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'));
                }}
              />
            )}
          </div>
        </label>
        {haveAccount && (
          <div className='-mt-2 mr-4 self-end text-sm'>
            <span>Forgot password? </span>
            <span className='cursor-pointer hover:underline'>Reset</span>
          </div>
        )}

        {haveAccount ? (
          <button
            onClick={() => {
              nativeSignIn(input.email, input.password);
              // handleReset();
            }}
            className='button mb-3 h-10 w-full rounded-full bg-white p-0 text-xl transition-all duration-100 hover:bg-green-400'
          >
            Sign in by email
          </button>
        ) : (
          <button
            onClick={() => {
              handleNativeSignUp(input.name, input.email, input.password);
              // handleReset();
            }}
            className='button mb-3 h-10 w-full rounded-full bg-white p-0 text-xl transition-all duration-100 hover:bg-green-400'
          >
            Sign up
          </button>
        )}

        {haveAccount ? (
          <div className='text-sm'>
            <span>Don't have an account? </span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(false);
                handleReset();
              }}
              aria-label='Create an account'
            >
              Sign up
            </span>
          </div>
        ) : (
          <div className='text-sm'>
            <span>Already have an account? </span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(true);
              }}
              aria-label='Log in with email'
            >
              Sign in
            </span>
          </div>
        )}
      </form>
      <div
        className='absolute top-0 h-full w-full bg-white opacity-80'
        onClick={() => dispatch(closeAuthWindow())}
      ></div>
    </div>
  );
}

export default Authentication;
