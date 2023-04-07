import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  UserCredential,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { signInStart, signInSuccess, signInFail, signOutStart, signOutSuccess, signOutFail, openAuthWindow, closeAuthWindow } from './authSlice';
import initPhoto from '../../images/initPhoto.png';

export function Authentication() {
  const dispatch = useAppDispatch();
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);

  const [input, setInput] = useState({ name: '', email: '', password: '' });

  const nativeSignUp = async (email: string, password: string, name: string) => {
    try {
      dispatch(signInStart());
      // sign up new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await getDownloadURL(ref(storage, 'initPhoto.png'));

      // update user profile with name and init photo
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: imgUrl,
      });

      const user = userCredential.user;

      // add user to firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        timeCreated: serverTimestamp(),
      });
      alert(`Signed up user: ${user.displayName} (${user.email})`);
      dispatch(signInSuccess({ id: user.uid, name: user.displayName, photoURL: user.photoURL }));
      localStorage.setItem(
        'userData',
        JSON.stringify({ id: user.uid, name: user.displayName, photoURL: user.photoURL })
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      userDoc.data() &&
        dispatch(signInSuccess({ id: userDoc.id, name: userDoc.data()?.name, photoURL: userDoc.data()?.photoURL }));

      localStorage.setItem(
        'userData',
        JSON.stringify({ id: user.uid, name: userDoc.data()?.name, photoURL: userDoc.data()?.photoURL })
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
    const provider = new GoogleAuthProvider();
    try {
      dispatch(signInStart());
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (credential !== null) {
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
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
        dispatch(signInSuccess({ id: user.uid, name: user.displayName, photoURL: user.photoURL }));
        // console.log(getAdditionalUserInfo(result)?.profile);
        localStorage.setItem(
          'userData',
          JSON.stringify({ id: user.uid, name: user.displayName, photoURL: user.photoURL })
        );
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`error: ${errorMessage}, code: ${errorCode}`);
      dispatch(signInFail(errorMessage));

      // The email of the user's account used.
      const errEmail = error.customData.email;
      alert(`error: email used: ${errEmail}`);

      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert(`credential error: ${credential}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(signOutStart());
      alert('sign out successful!');
      dispatch(signOutSuccess());
      localStorage.removeItem('userData');
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
        nativeSignUp(input.email, input.password, input.name);
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
      <button onClick={()=>dispatch(closeAuthWindow())}>X</button>
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
