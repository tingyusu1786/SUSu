import { useState } from 'react';
import {
  Hits,
  Highlight,
  Index,
  InstantSearch,
  PoweredBy,
  SearchBox,
  useInstantSearch,
} from 'react-instantsearch-hooks-web';
import { Link } from 'react-router-dom';

import algoliasearch from 'algoliasearch/lite';

import { useAppDispatch } from '../../redux/hooks';
import { closeSearch } from '../../redux/popUpSlice';
import dbApi from '../../utils/dbApi';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID!,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
);

interface HitProps {
  hit: {
    objectID: string;
    authorId: string;
    name: string;
    headquarter: string;
    story: string | string[];
    email: string;
    status: string;
    selfComment: string;
    hashtags: string[];
    __position: number;
    __queryID?: string | undefined;
  };
}

function BrandHit({ hit }: HitProps): JSX.Element {
  const dispatch = useAppDispatch();
  return (
    <Link
      to={`/drinkipedia/${hit.objectID}`}
      className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
      onClick={() => dispatch(closeSearch())}
    >
      <Highlight attribute='name' hit={hit} />
      <Highlight
        attribute='story'
        hit={hit}
        className='text-sm text-neutral-500'
      />
      <div className='text-sm'>
        <span>總部：</span>
        <Highlight
          attribute='headquarter'
          hit={hit}
          className='text-sm text-neutral-500'
        />
      </div>
    </Link>
  );
}

function UserHit({ hit }: HitProps): JSX.Element {
  const dispatch = useAppDispatch();
  return (
    <Link
      to={`/profile/${hit.objectID}`}
      className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
      onClick={() => dispatch(closeSearch())}
    >
      <Highlight attribute='name' hit={hit} />
      <Highlight
        attribute='email'
        hit={hit}
        className='text-sm text-neutral-500'
      />
      {hit.status && (
        <q>
          <Highlight attribute='status' hit={hit} className='text-sm' />
        </q>
      )}
    </Link>
  );
}

function PostHit({ hit }: HitProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('user');
  dbApi.getUserField(hit.authorId, 'name').then((data) => {
    if (data) {
      setName(data);
    }
  });
  return (
    <Link
      to={`/log/${hit.objectID}`}
      className='mb-2 flex w-full flex-col rounded border-2 border-neutral-900 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1'
      onClick={() => dispatch(closeSearch())}
    >
      <div className='text-base'>{name}</div>
      {hit.selfComment && (
        <div>
          <Highlight attribute='selfComment' hit={hit} className='text-base' />
        </div>
      )}
      {hit.hashtags && (
        <div className='text-sm text-neutral-500'>
          <Highlight
            attribute='hashtags'
            hit={hit}
            className='rounded text-sm'
          />
        </div>
      )}
    </Link>
  );
}

interface FallbackProps {
  children: React.ReactElement | null;
  fallback: React.ReactElement | null;
}

const EmptyQueryBoundary: React.FC<FallbackProps> = ({
  children,
  fallback,
}) => {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return fallback;
  }

  return children;
};

const NoResultsBoundary: React.FC<FallbackProps> = ({
  children,
  fallback,
}: FallbackProps) => {
  const { results } = useInstantSearch();

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

const NoResults: React.FC = () => {
  return <p>No results. Try searching another keyword</p>;
};

const SearchModal: React.FC = () => {
  const dispatch = useAppDispatch();

  const indices = [
    { indexName: 'brands', hitComponent: BrandHit },
    { indexName: 'users', hitComponent: UserHit },
    { indexName: 'posts', hitComponent: PostHit },
  ];

  return (
    <InstantSearch searchClient={searchClient} indexName='brands'>
      <div className='fixed top-0 z-50 flex h-screen w-screen items-center justify-center '>
        <div className='animate__faster animate__zoomIn animate__animated absolute top-[15%] z-30 grid max-h-[70vh] w-3/4 max-w-[700px] grid-rows-[60px_1fr] rounded-md border-4 border-neutral-900 bg-neutral-100 p-5 shadow-lg sm:w-11/12'>
          <div className='relative'>
            <SearchBox
              autoFocus
              placeholder='Search anything'
              searchAsYouType={true}
              classNames={{
                input:
                  'h-10 rounded-full border-2 border-solid border-gray-400 p-3 focus:outline focus:outline-green-400 outline-green-400 w-full',
                submitIcon: 'hidden',
                resetIcon: 'hidden',
                loadingIcon: 'hidden',
              }}
            />
            <PoweredBy classNames={{ root: 'w-36 absolute right-3 top-12' }} />
          </div>
          <div className='mt-4 flex w-full flex-col items-stretch gap-3 overflow-y-scroll border-dashed border-neutral-900'>
            <EmptyQueryBoundary fallback={null}>
              <>
                {indices.map(({ indexName, hitComponent }) => (
                  <Index key={indexName} indexName={indexName}>
                    <div className='text-xl'>{indexName}</div>
                    <NoResultsBoundary fallback={<NoResults />}>
                      <Hits hitComponent={hitComponent} />
                    </NoResultsBoundary>
                  </Index>
                ))}
              </>
            </EmptyQueryBoundary>
          </div>
        </div>
        <div
          className='absolute top-0 h-full w-full bg-white opacity-80'
          onClick={() => dispatch(closeSearch())}
        />
      </div>
    </InstantSearch>
  );
};

export default SearchModal;
