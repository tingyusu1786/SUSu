import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { db } from '../../services/firebase'; //todo
import { useNavigate } from 'react-router-dom';
import storageApi from '../../utils/storageApi';
import authApi from '../../utils/authApi';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import Button from '../../components/Button';

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

  useEffect(() => {
    //todo: any
    const handleKeyDown = (event: any) => {
      // alert(event.key);
      if (
        ![nameRef, emailRef, passwordRef].some((ref) => document.activeElement === ref.current) &&
        event.key === 'Escape'
      ) {
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
      alert(`please fill in all input field`);
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
      alert(`Signed up user: ${user.displayName} (${user.email})`);
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
      alert(`error: ${errorMessage}, code: ${errorCode}`);
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

      alert(`Logged in user: ${userDoc.data()?.name} (${user.email})`);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`error: ${errorMessage}, code: ${errorCode}`);
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
          alert(`google sign up successful, new user created: ${user.displayName}`);
        } else {
          alert(`google sign in successful, user: ${user.displayName}`);
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
      alert(`error: ${errorMessage}, code: ${errorCode}`);
      dispatch(signInFail(errorMessage));

      // The email of the user's account used
      const errEmail = error.customData.email;
      alert(`error: email used: ${errEmail}`);

      // The AuthCredential type that was used
      // const credential = GoogleAuthProvider.credentialFromError(error);
      const errorOAuthCredential = await authApi.getErrorOAuthCredential(error);
      alert(`credential error: ${errorOAuthCredential}`);
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
    <div className='fixed top-0 z-10 h-screen w-screen'>
      <form
        className='absolute left-1/2 top-1/2 z-30 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-md border-[3px] border-solid border-slate-900 bg-[#F5F3EA] p-3'
        style={{ boxShadow: '4px 4px rgb(15 23 42)' }}
      >
        <button onClick={() => dispatch(closeAuthWindow())} className='text-xs'>
          ESC
        </button>
        <h1 className='text-center text-2xl font-bold'>{haveAccount ? 'Welcome back!' : 'start using su-su today'}</h1>
        <div className='flex flex-col'>
          <button onClick={googleSignIn} className=''>
            continue with Google
          </button>
          <div>or</div>
          <h1 className='text-xl font-bold'>{haveAccount ? 'sign in with email' : 'sign up with email'}</h1>
          {!haveAccount && (
            <label htmlFor='name'>
              name:
              <input
                id='name'
                name='name'
                type='text'
                className='border-2 border-solid border-gray-400'
                value={input.name}
                onChange={handleInputChange}
                autoComplete='name'
                required
              />
            </label>
          )}
          <label htmlFor='email'>email:</label>
          <input
            id='email'
            name='email'
            type='text'
            className='border-2 border-solid border-gray-400'
            value={input.email}
            onChange={handleInputChange}
            autoComplete={haveAccount ? 'email' : 'off'}
            required
          />
          <label>
            password:
            <input
              id='password'
              type={passwordType}
              name='password'
              className='border-2 border-solid border-gray-400'
              value={input.password}
              onChange={handleInputChange}
              autoComplete={haveAccount ? 'current-password' : 'new-password'}
              required
            />
            <span>
              {passwordType === 'password' ? (
                <EyeIcon
                  className='-ml-10 inline h-6 w-6'
                  onClick={() => {
                    setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'));
                  }}
                />
              ) : (
                <EyeSlashIcon
                  className='-ml-10 inline h-6 w-6'
                  onClick={() => {
                    setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'));
                  }}
                />
              )}
            </span>
          </label>
        </div>
        {haveAccount && <span>Forgot password?</span>}
        {!haveAccount && (
          <button
            onClick={() => {
              handleNativeSignUp(input.name, input.email, input.password);
              handleReset();
            }}
            className=''
          >
            sign up
          </button>
        )}
        {haveAccount && (
          <button
            onClick={() => {
              nativeSignIn(input.email, input.password);
              handleReset();
            }}
            className=''
          >
            sign in by email
          </button>
        )}

        {haveAccount && (
          <div>
            <span>Don't have an account?</span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(false);
              }}
            >
              Create one
            </span>
          </div>
        )}
        {!haveAccount && (
          <div>
            <span>Already have an account?</span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(true);
              }}
            >
              Log in with email
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
