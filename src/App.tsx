import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './components/Header';

function App() {
  return (
    <>
      {/*<Reset />*/}
      {/*<GlobalStyle />*/}
      <Header />
      <Outlet />
    </>
  );
}

export default App;
