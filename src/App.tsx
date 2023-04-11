import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Header from './components/Header';
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
  const userId = useAppSelector((state) => state.auth.userId);

  useEffect(() => {
    dispatch(signInStart());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(signInStart());
      if (user) {
        const getUser = async () => {
          const userName = await dbApi.getUserField(user.uid, 'name');
          const userPhotoURL = await dbApi.getUserField(user.uid, 'photoURL');
          dispatch(signInSuccess({ id: user.uid, name: userName, photoURL: userPhotoURL }));
        };
        getUser();
      } else {
        dispatch(signOutSuccess());
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Navigate to the current URL when the authentication state changes
    // userId === null && navigate(window.location.pathname);
    // Refresh the page when the authentication state changes
    // window.location.reload();
  }, [isSignedIn]);

  return (
    <>
      {/*<Reset />*/}
      {/*<GlobalStyle />*/}
      <InstantSearch searchClient={searchClient} indexName='brands'>
        <Header />
        <Outlet />
      </InstantSearch>
    </>
  );
}

export default App;
