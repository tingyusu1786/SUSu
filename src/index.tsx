import './index.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';
import Home from './pages/Home';
import Log from './pages/Log';
import Feeds from './pages/Feeds/Feeds';
import Catalogue from './pages/Catalogue/Catalogue';
import Inspiration from './pages/Inspiration';
import Search from './pages/Search';
import PageNotFound from './pages/PageNotFound';
import 'react-tooltip/dist/react-tooltip.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Home />} />
          <Route
            path='/profile/:profileUserId?'
            element={<Profile />}
            // loader={}
            // action={}
          />
          <Route path='/setting/:settingUserId' element={<Setting />} />
          <Route path='/feeds/:postId?' element={<Feeds />} />
          <Route path='/log/:logId' element={<Log />} />
          <Route path='/drinkipedia/:catalogueBrandId?/:catalogueItemId?' element={<Catalogue />} />
          <Route path='/inspiration' element={<Inspiration />} />
          <Route path='/search' element={<Search />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
);
