import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Authentication from './components/auth/Authentication';
import { useAppSelector, useAppDispatch } from './app/hooks';
import {
  signInStart,
  signInSuccess,
  signInFail,
  signOutStart,
  signOutSuccess,
  signOutFail,
  openAuthWindow,
  closeAuthWindow,
} from './components/auth/authSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { db } from './services/firebase';
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox } from 'react-instantsearch-hooks-web';
import dbApi from './utils/dbApi';

const searchClient = algoliasearch('CQCQ45KM4I', '343b0909e26f2653041deba6e5b7b442'); //the public API key to use in your frontend code. This key is only usable for search queries and sending data to the Insights API.

// const searchClient = algoliasearch(
//   process.env.REACT_APP_ALGOLIA_APP_ID!,
//   process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
// );

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthWindow = useAppSelector((state) => state.auth.isAuthWindow);
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
          }
        };
        getUser();
      } else {
        dispatch(signOutSuccess());
      }
    });
    return unsubscribe;
  }, []);

  // useEffect(() => {
  // Navigate to the current URL when the authentication state changes
  // userId === null && navigate(window.location.pathname);
  // Refresh the page when the authentication state changes
  // window.location.reload();
  // }, [isSignedIn]);

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <>
      {/*<Reset />*/}
      {/*<GlobalStyle />*/}
      <InstantSearch searchClient={searchClient} indexName='brands'>
        <Header />
        {isAuthWindow && <Authentication />}
        <Outlet />
      </InstantSearch>
    </>
  );
}

export default App;
