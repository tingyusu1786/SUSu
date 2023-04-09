import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot, Timestamp } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { openAuthWindow } from '../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification } from '../components/notification/notificationSlice';
import { Link } from 'react-router-dom';

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, RefinementList, Index } from 'react-instantsearch-hooks-web';

function BrandHit({ hit }: any) {
  return (
    <article className='my-5 text-center'>
      {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
      {/*{<h1>{hit.name}</h1>}*/}
      <button className='hover:font-bold hover:text-lime-700'>
        <Link to={`/catalogue/${hit.objectID}`}>
          <Highlight attribute='name' hit={hit} className='my-0 rounded' />
        </Link>
      </button>
      {hit.story?.length > 0 && (
        <div className='text-sm'>
          <span>story：</span>
          <Highlight attribute='story' hit={hit} className='rounded text-sm' />
        </div>
      )}
      {hit?.headquarter && (
        <div className='text-sm'>
          <span>總部：</span>
          <Highlight attribute='headquarter' hit={hit} className='rounded text-sm' />
        </div>
      )}
    </article>
  );
}

function UserHit({ hit }: any) {
  return (
    <article className='my-5 text-center'>
      {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
      <button className='hover:font-bold hover:text-lime-700'>
        <Link to={`/profile/${hit.objectID}`}>
          <Highlight attribute='name' hit={hit} className='my-0 rounded' />
        </Link>
      </button>
      {hit.email && (
        <div className='text-sm text-gray-400'>
          <Highlight attribute='email' hit={hit} className='rounded text-sm' />
        </div>
      )}
      {hit.status && (
        <div className='text-sm'>
          <span>🎙️</span>
          <Highlight attribute='status' hit={hit} className='rounded text-sm' />
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
  const [tab, setTab] = useState('brands');

  return (
    <div className='text-xl'>
      <div className='text-center font-heal text-3xl'>search results:</div>
      {/*<RefinementList attribute={"name"} />*/}
      <div className='text-center'>
        <button
          onClick={() => {
            setTab('brands');
          }}
          className={tab === 'brands' ? 'font-bold text-blue-600' : ''}
        >
          brands
        </button>
        <span>&nbsp;&nbsp;&nbsp;</span>
        <button
          onClick={() => {
            setTab('users');
          }}
          className={tab === 'users'? 'font-bold text-blue-600': ''}
        >
          users
        </button>
      </div>
      {tab === 'brands' && (
        <Index indexName='brands'>
          <Hits hitComponent={BrandHit} className='flex flex-col items-center' />
        </Index>
      )}
      {tab === 'users' && (
        <Index indexName='users'>
          <Hits hitComponent={UserHit} className='flex flex-col items-center' />
        </Index>
      )}
    </div>
  );
}

export default Search;
