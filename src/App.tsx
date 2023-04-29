import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Authentication from './components/auth/Authentication';
import SearchModal from './components/SearchModal';
import { useAppSelector, useAppDispatch } from './app/hooks';
import {
  signInStart,
  signInSuccess,
  signInFail,
  signOutStart,
  signOutSuccess,
  signOutFail,
  // openAuthWindow,
  // closeAuthWindow,
} from './components/auth/authSlice';
import { showAuth, closeAuth } from './app/popUpSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { db } from './services/firebase';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox } from 'react-instantsearch-hooks-web';
import dbApi from './utils/dbApi';

const searchClient = algoliasearch('CQCQ45KM4I', '343b0909e26f2653041deba6e5b7b442'); //the public API key to use in your frontend code. This key is only usable for search queries and sending data to the Insights API.

// const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID!, process.env.REACT_APP_ALGOLIA_SEARCH_KEY!);

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

  if (isLoading) {
    return (
      <main className='bg-boxes flex h-screen w-screen items-center justify-center bg-fixed text-3xl'>
        <p className='animate-bounce '>SUSü</p>
      </main>
    );
  }

  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName='brands'
        // initialUiState={{
        //   SearchBox: {
        //     query: 'phone',
        //     page: 0,
        //   },
        // }}
      >
        <Header />
        {isAuthShown && <Authentication />}
        {isSearchShown && <SearchModal />}
        <Outlet />
      </InstantSearch>
    </>
  );
}

export default App;
