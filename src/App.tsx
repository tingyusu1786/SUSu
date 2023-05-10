import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Authentication from './components/AuthModal/';
import SearchModal from './components/SearchModal/';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { signInStart, signInSuccess, signInFail, signOutStart, signOutSuccess, signOutFail } from './app/authSlice';
import { showAuth, closeAuth } from './app/popUpSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import dbApi from './utils/dbApi';
import commonApi from './utils/commonApi';
import { addAllBrands } from './app/infoSlice';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthShown = useAppSelector((state) => state.popUp.isAuthShown);
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);
  const userId = useAppSelector((state) => state.auth.currentUserId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const getUser = async () => {
          const userName = await dbApi.getUserField(user.uid, 'name');
          const userPhotoURL = await dbApi.getUserField(user.uid, 'photoURL');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          if (userData) {
            let filteredUserData: { [key: string]: any } = Object.keys(userData)
              .filter((key) => key !== 'timeCreated' && key !== 'notifications')
              .reduce((acc: { [key: string]: any }, key) => {
                acc[key] = userData[key];
                return acc;
              }, {});
            dispatch(signInSuccess({ user: filteredUserData, id: user.uid, name: userName, photoURL: userPhotoURL }));
            dispatch(closeAuth());
          }
        };
        getUser();
      } else {
        dispatch(signOutSuccess());
      }
    });
    return unsubscribe;
  }, []);

  const loadAllBrands = () => {
    return async (dispatch: any) => {
      const allBrands = await commonApi.fetchAllBrandsInfo();
      dispatch(addAllBrands({ allBrands }));
    };
  };

  useEffect(() => {
    dispatch(loadAllBrands());
  }, []);

  //#get all brands and send to redux
  // useEffect(() => {
  //   const allBrands = commonApi.fetchAllBrandsInfo();
  //   dispatch(addAllBrands({ allBrands }));
  // }, []);

  if (isLoading) {
    return (
      <main className='bg-boxes flex h-screen w-screen items-center justify-center bg-fixed text-6xl'>
        <p className='animate__animated animate__swing'>SUSü</p>
      </main>
    );
  }

  return (
    <>
      <Header />
      {isAuthShown && <Authentication />}
      {isSearchShown && <SearchModal />}
      <Outlet />
    </>
  );
}

export default App;
