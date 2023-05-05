import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import { closeSearch } from '../app/popUpSlice';
import type { SearchBoxProps } from 'react-instantsearch-hooks-web';
import { PoweredBy } from 'react-instantsearch-hooks-web';
import algoliasearch from 'algoliasearch/lite';
import dbApi from '../utils/dbApi';
import {
  InstantSearch,
  SearchBox,
  useHits,
  Hits,
  Highlight,
  Index,
  useInstantSearch,
} from 'react-instantsearch-hooks-web';

interface Props {
  userId: string;
}
const SearchModal: React.FC = () => {
  const dispatch = useAppDispatch();

  function BrandHit({ hit }: any) {
    return (
      <Link
        to={`/drinkipedia/${hit.objectID}`}
        className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
        onClick={() => dispatch(closeSearch())}
      >
        {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
        <Highlight attribute='name' hit={hit} className='' />
        <Highlight attribute='story' hit={hit} className='text-sm text-neutral-500' />
        <div className='text-sm'>
          <span>總部：</span>
          <Highlight attribute='headquarter' hit={hit} className='text-sm text-neutral-500' />
        </div>
      </Link>
    );
  }

  function UserHit({ hit }: any) {
    return (
      <Link
        to={`/profile/${hit.objectID}`}
        className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
        onClick={() => dispatch(closeSearch())}
      >
        {hit.photoURL && <img src={hit.photoURL} alt={hit.photoURL} />}
        <Highlight attribute='name' hit={hit} className='' />
        {hit.email && (
          <div className='text-sm text-neutral-500'>
            <Highlight attribute='email' hit={hit} className='text-sm' />
          </div>
        )}
        {hit.status && (
          <div className='text-sm'>
            <span>🎙️</span>
            <Highlight attribute='status' hit={hit} className='text-sm' />
          </div>
        )}
      </Link>
    );
  }

  function PostHit({ hit }: any) {
    const [name, setName] = useState('user');
    dbApi.getUserField(hit.authorId, 'name').then((data) => {
      setName(data);
    });
    return (
      <Link
        to={`/log/${hit.objectID}`}
        className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
        onClick={() => dispatch(closeSearch())}
      >
        <div className='text-base '>
          {/*<Highlight attribute='authorId' hit={hit} className='text-sm' />*/}
          {name}
        </div>
        {hit.selfComment && (
          <div className=''>
            <Highlight attribute='selfComment' hit={hit} className='text-base' />
          </div>
        )}
        {hit.hashtags && (
          <div className='text-sm text-neutral-500'>
            <Highlight attribute='hashtags' hit={hit} className='rounded text-sm' />
          </div>
        )}
      </Link>
    );
  }

  interface EmptyProps {
    children: any;
    fallback: any;
  }

  const EmptyQueryBoundary: React.FC<EmptyProps> = ({ children, fallback }) => {
    const { indexUiState } = useInstantSearch();

    if (!indexUiState.query) {
      return fallback;
    }

    return children;
  };

  const NoResultsBoundary: React.FC<EmptyProps> = ({ children, fallback }) => {
    const { results } = useInstantSearch();

    // The `__isArtificial` flag makes sure not to display the No Results message
    // when no hits have been returned yet.
    if (!results.__isArtificial && results.nbHits === 0) {
      return (
        <>
          {fallback}
          <div hidden>{children}</div>
        </>
      );
    }

    return children;
  };

  function NoResults() {
    const { indexUiState } = useInstantSearch();

    return (
      <div>
        <p>
          No results for <q>{indexUiState.query}</q> ☹ try searching another keyword
        </p>
      </div>
    );
  }

  return (
    <div className='fixed top-0 z-50 flex h-screen w-screen items-center justify-center '>
      <div className='animate__faster animate__zoomIn animate__animated absolute top-[15%] z-30 grid max-h-[70vh] w-3/4 max-w-[700px] grid-rows-[60px_1fr] rounded-md border-4 border-neutral-900 bg-neutral-100 p-5 shadow-lg '>
        <div className='relative'>
          <SearchBox
            // queryHook={queryHook}
            // onSubmit={handleRedirect}
            autoFocus
            placeholder='Search anything'
            searchAsYouType={true}
            submitIconComponent={({ classNames }) => <span className={classNames.submitIcon}></span>}
            resetIconComponent={({ classNames }) => <span className={classNames.resetIcon}></span>}
            loadingIconComponent={() => <span></span>}
            classNames={{
              // root: 'MyCustomSearchBox',
              form: '',
              input:
                'h-10 rounded-full border-2 border-solid border-gray-400 p-3 focus:outline focus:outline-green-400 outline-green-400 w-full',
              submitIcon: 'hidden',
              resetIcon: 'hidden',
              loadingIcon: 'hidden',
            }}
          />
          <PoweredBy
            classNames={{
              root: 'w-36 absolute right-3 top-12',
              link: '',
            }}
          />
        </div>

        <div className='mt-4 flex w-full flex-col items-stretch gap-3 overflow-y-scroll border-dashed border-neutral-900'>
          <EmptyQueryBoundary fallback={null}>
            <NoResultsBoundary fallback={<NoResults />}>
              <Index indexName='brands'>
                <div className='text-xl'>brands</div>
                <Hits hitComponent={BrandHit} className='' />
              </Index>
              <Index indexName='users'>
                <div className='text-xl'>users</div>
                <Hits hitComponent={UserHit} className='' />
              </Index>
              <Index indexName='posts'>
                <div className='text-xl'>posts</div>
                <Hits hitComponent={PostHit} className='' />
              </Index>
            </NoResultsBoundary>
          </EmptyQueryBoundary>
        </div>
      </div>
      <div className='absolute top-0 h-full w-full bg-white opacity-80' onClick={() => dispatch(closeSearch())}></div>
    </div>
  );
};

export default SearchModal;
