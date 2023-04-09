import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './components/Header';

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox } from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch('CQCQ45KM4I', '343b0909e26f2653041deba6e5b7b442'); //the public API key to use in your frontend code. This key is only usable for search queries and sending data to the Insights API.

// const searchClient = algoliasearch(
//   process.env.REACT_APP_ALGOLIA_APP_ID!,
//   process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
// );

function App() {
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
