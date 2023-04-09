import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
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
import { InstantSearch, SearchBox, Hits, Highlight, RefinementList } from 'react-instantsearch-hooks-web';

function Hit({ hit }: any) {
  return (
    <article className="bg-white z-10">
      <img src={hit.photoURL} alt={hit.photoURL} />
      {/*<h1>{hit.name}</h1>*/}
      <h1>
        <Highlight attribute="name" hit={hit} className='rounded'/>
      </h1>
      <Highlight attribute="story" hit={hit} className='text-sm rounded' />
      {hit.headquarter && <div className='text-sm'><span>總部：</span>< Highlight attribute="headquarter" hit={hit} className='text-sm rounded' /></div>}
    </article>
  );
}

function Search() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const currentUserName = useAppSelector((state) => state.auth.userName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  return (
    <div className='text-xl'>
      <div>search results:</div>
      <Hits hitComponent={Hit} />
    </div>
  );
}

export default Search;
