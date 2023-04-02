import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from './app/hooks';

function App() {
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const userName = useAppSelector((state) => state.auth.userName);
  const photoURL = useAppSelector((state) => state.auth.photoURL);

  return (
    <div className='App'>
      <img src={photoURL} alt='' className='rounded-full' />
      {isSignedIn ? <div> {`Hi ${userName}`}</div> : <div>please sign in</div>}
      <Link to='/profile' className='bg-lime-200'>
        profile
      </Link>
      <br />
      <Link id='map' to='/map'>
        map
      </Link>
      <br />
      <Link to='/counter'>counter</Link>
    </div>
  );
}

export default App;
