import './index.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import Profile from './pages/Profile';
import Setting from './pages/Setting';
import Posts from './pages/Posts/Posts';
import Map from './pages/Map';
import Catalogue from './pages/Catalogue';
import Inspiration from './pages/Inspiration';
import Counter from './pages/RenderCounter';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<App />}>
          <Route path='/profile' element={<Profile />}>
            <Route path='/profile/setting' element={<Setting />} />
          </Route>
          <Route path='/posts' element={<Posts />} />
          <Route path='/map' element={<Map />} />
          <Route path='/catalogue' element={<Catalogue />} />
          <Route path='/inspiration' element={<Inspiration />} />
          <Route path='/counter' element={<Counter />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
);
