import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot, Timestamp } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { openAuthWindow } from '../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification } from '../components/notification/notificationSlice';
import { Link } from 'react-router-dom';

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, RefinementList } from 'react-instantsearch-hooks-web';

function Hit({ hit }: any) {
  return (
    <article className='my-5 text-center'>
      {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
      {/*<h1>{hit.name}</h1>*/}
      <button className='hover:text-lime-700 hover:font-bold'>
        <Link to={`/catalogue/${hit.objectID}`}>
        <Highlight attribute='name' hit={hit} className='rounded my-0' />
        </Link>
      </button>
      {hit.story.length > 0 && <div className='text-sm'><span>story：</span><Highlight attribute='story' hit={hit} className='rounded text-sm' /></div>}
      {hit.headquarter && (
        <div className='text-sm'>
          <span>總部：</span>
          <Highlight attribute='headquarter' hit={hit} className='rounded text-sm' />
        </div>
      )}
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
      <div className="font-heal text-3xl text-center">search results:</div>
      {/*<RefinementList attribute={"name"} />*/}
      <Hits hitComponent={Hit} className='flex flex-col items-center'/>
    </div>
  );
}

export default Search;
