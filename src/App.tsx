import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { onAuthStateChanged } from 'firebase/auth';

import Authentication from './components/AuthModal/';
import Header from './components/Header';
import SearchModal from './components/SearchModal/';
import { signInSuccess, signOutSuccess } from './redux/authSlice';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { addAllBrands } from './redux/infoSlice';
import { closeAuth } from './redux/popUpSlice';
import { AppDispatch } from './redux/store';
import { auth } from './services/firebase';
import dbApi from './utils/dbApi';
import swal from './utils/swal';

function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthShown = useAppSelector((state) => state.popUp.isAuthShown);
  const isSearchShown = useAppSelector((state) => state.popUp.isSearchShown);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          const getUser = async () => {
            const userData = await dbApi.getFilteredUser(user.uid);
            if (userData) {
              dispatch(signInSuccess({ user: userData, id: user.uid }));
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

    const loadAllBrands = () => {
      return async (dispatch: AppDispatch) => {
        const allBrands = await dbApi.getAllBrandsInfo();
        dispatch(addAllBrands({ allBrands }));
      };
    };
    dispatch(loadAllBrands());

    return unsubscribe;
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
