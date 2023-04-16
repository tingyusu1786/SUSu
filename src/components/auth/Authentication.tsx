import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; //todo
import { useNavigate } from 'react-router-dom';
import storageApi from '../../utils/storageApi';
import authApi from '../../utils/authApi';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';

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

export function Authentication() {
  const dispatch = useAppDispatch();
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  const [input, setInput] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

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
            timeCreated: new Date(),
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

      userDoc.data() &&
        dispatch(
          signInSuccess({
            user: userDoc.data(),
            id: userDoc.id,
            name: userDoc.data()?.name,
            photoURL: userDoc.data()?.photoURL,
          })
        );

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
        dispatch(
          signInSuccess({ user: userDoc.data(), id: user.uid, name: user.displayName, photoURL: user.photoURL })
        );
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

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      dispatch(signOutStart());
      alert('sign out successful!');
      dispatch(signOutSuccess());
      // localStorage.removeItem('userData');
    } catch (error: any) {
      alert(`Error logging out. (${error})`);
      dispatch(signOutFail(error));
    }
  };

  const handleReset = () => {
    setInput({ name: '', email: '', password: '' });
  };

  const inputField = (
    <div className='flex flex-col'>
      <label htmlFor='name'>name:</label>
      <input
        id='name'
        type='text'
        className='border-2 border-solid border-gray-400'
        value={input.name}
        onChange={(e) => {
          setInput(() => {
            return { ...input, name: e.target.value };
          });
        }}
      />
      <label htmlFor='email'>email:</label>
      <input
        id='email'
        type='text'
        className='border-2 border-solid border-gray-400'
        value={input.email}
        onChange={(e) => {
          setInput(() => {
            return { ...input, email: e.target.value };
          });
        }}
      />
      <label htmlFor='password'>password:</label>
      <input
        id='password'
        type='text'
        className='border-2 border-solid border-gray-400'
        value={input.password}
        onChange={(e) => {
          setInput(() => {
            return { ...input, password: e.target.value };
          });
        }}
      />
    </div>
  );

  const buttonNativeSignUp = (
    <button
      onClick={() => {
        handleNativeSignUp(input.name, input.email, input.password);
        handleReset();
      }}
      className='rounded border border-solid border-gray-600 px-2'
    >
      create user by email
    </button>
  );

  const buttonNativeSignIn = (
    <button
      onClick={() => {
        nativeSignIn(input.email, input.password);
        handleReset();
      }}
      className='rounded border border-solid border-gray-600 px-2'
    >
      sign in by email
    </button>
  );

  const buttonGoogleSignIn = (
    <button onClick={googleSignIn} className='rounded border border-solid border-gray-600 px-12'>
      sign in by google
    </button>
  );

  const buttonSignOut = (
    <button onClick={handleSignOut} className='scroll-px-28 rounded border border-solid border-gray-600'>
      sign out
    </button>
  );

  const buttonResetInputField = (
    <button className='rounded border border-solid border-gray-600 px-2' onClick={handleReset}>
      reset
    </button>
  );

  return (
    <div className='absolute left-1/3 top-1/4 z-50 flex flex-col items-center gap-10 rounded-xl bg-lime-100 p-10'>
      <button onClick={() => dispatch(closeAuthWindow())}>X</button>
      {inputField}
      <div className='flex gap-3'>
        <>{buttonNativeSignUp}</>
        <>{buttonNativeSignIn}</>
        <>{buttonGoogleSignIn}</>
        <>{buttonSignOut}</>
        <>{buttonResetInputField}</>
      </div>
    </div>
  );
}
