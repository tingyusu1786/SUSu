import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Authentication from './components/AuthModal/';
import SearchModal from './components/SearchModal/';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { signInSuccess, signOutSuccess } from './app/authSlice';
import { closeAuth } from './app/popUpSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import dbApi from './utils/dbApi';
import { addAllBrands } from './app/infoSlice';
import swal from './utils/swal';

function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthShown = useAppSelector((state) => state.popUp.isAuthShown);
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);

  type FilteredUserData = {
    name: string;
    email: string;
    photoURL: string;
    timeCreated: Date;
    status?: string;
    followers?: string[];
    following?: string[];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          const getUser = async () => {
            const userName = await dbApi.getUserField(user.uid, 'name');
            const userPhotoURL = await dbApi.getUserField(user.uid, 'photoURL');
            const userData = await dbApi.getUser(user.uid);
            if (userData) {
              let filteredUserData: FilteredUserData = Object.keys(userData)
                .filter((key) => key !== 'notifications')
                .reduce((acc: any, key) => {
                  acc[key] = userData[key];
                  if (key === 'timeCreated') {
                    acc.timeCreated = userData.timeCreated.toDate();
                  }
                  return acc;
                }, {});
              dispatch(signInSuccess({ user: filteredUserData, id: user.uid, name: userName, photoURL: userPhotoURL }));
            }
          };
          getUser();
        } catch {
          swal.error('Something went wrong', 'try again later', 'ok');
        } finally {
          dispatch(closeAuth());
        }
      } else {
        dispatch(signOutSuccess());
      }
    });
    return unsubscribe;
  }, []);

  const loadAllBrands = () => {
    return async (dispatch: any) => {
      const allBrands = await dbApi.getAllBrandsInfo();
      dispatch(addAllBrands({ allBrands }));
    };
  };

  useEffect(() => {
    dispatch(loadAllBrands());
  }, []);

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
