import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import {
//   collection,
  doc,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
//   getDoc,
//   getDocs,
//   query,
//   Query,
//   orderBy,
//   limit,
  onSnapshot,
//   QuerySnapshot,
  Timestamp,
//   updateDoc,
//   where,
//   deleteDoc,
//   startAfter,
//   arrayUnion,
//   arrayRemove,
} from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { openAuthWindow } from '../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification } from '../components/notification/notificationSlice';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  InfiniteHits,
} from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID!,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
);

interface Search {

}

function Search() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const currentUserName = useAppSelector((state) => state.auth.userName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

 
  return (
    <div className='text-xl'>
      <div className='container'>
        <InstantSearch
          searchClient={searchClient}
          indexName='brands'
        ></InstantSearch>
      </div>
      <div>search results:</div>
    </div>
  );
}

export default Search;
