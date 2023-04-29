import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import { doc, DocumentSnapshot, DocumentReference, DocumentData, onSnapshot, Timestamp } from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showSearch, closeSearch } from '../app/popUpSlice';
import { Link } from 'react-router-dom';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  useHits,
  Hits,
  Highlight,
  RefinementList,
  Index,
  InfiniteHits,
} from 'react-instantsearch-hooks-web';

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

// 直接render出post?
function PostHit({ hit }: any) {
  return (
    <article className='my-5 text-center'>
      {/*<button className='hover:font-bold hover:text-lime-700'>
        <Link to={`/profile/${hit.objectID}`}>
          <Highlight attribute='name' hit={hit} className='my-0 rounded' />
        </Link>
      </button>*/}
      {hit.brandId && (
        <div className='text-sm text-gray-400'>
          <Highlight attribute='brandId' hit={hit} className='rounded text-sm' />
        </div>
      )}
      {hit.itemId && (
        <div className='text-sm text-gray-400'>
          <Highlight attribute='itemId' hit={hit} className='rounded text-sm' />
        </div>
      )}
      {hit.hashtags && (
        <div className='text-sm text-gray-400'>
          <Highlight attribute='hashtags' hit={hit} className='rounded text-sm' />
        </div>
      )}
    </article>
  );
}

function Search() {
  const dispatch = useAppDispatch();
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const tabs = ['all', 'brands', 'items', 'posts', 'users'];
  const [tab, setTab] = useState('all');

  return (
    <main
      className='flex min-h-[calc(100vh-64px)] flex-col items-center bg-fixed p-10'
      style={{
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className='text-center text-7xl'>I hop you find what you want</div>
      {/*<RefinementList attribute={"name"} />*/}
      <nav className='flex gap-3'>
        {tabs.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={tab === tabName ? 'font-bold text-sky-400 underline decoration-2 underline-offset-8' : ''}
          >
            {tabName}
          </button>
        ))}
      </nav>
      {/*把全部的hits放在一起變成all*/}
      {tab === 'brands' && (
        <Index indexName='brands'>
          <InfiniteHits hitComponent={BrandHit} className='flex flex-col items-center' showPrevious={false} />
        </Index>
      )}
      {tab === 'posts' && (
        <Index indexName='posts'>
          <InfiniteHits hitComponent={PostHit} className='flex flex-col items-center' showPrevious={false} />
        </Index>
      )}
      {tab === 'users' && (
        <Index indexName='users'>
          <InfiniteHits hitComponent={UserHit} className='flex flex-col items-center' showPrevious={false} />
        </Index>
      )}
    </main>
  );
}

export default Search;
