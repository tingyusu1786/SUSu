import './index.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';
import Posts from './pages/Posts/Posts';
import Notifications from './pages/Notifications';
import Map from './pages/Map';
import Catalogue from './pages/Catalogue/Catalogue';
import Inspiration from './pages/Inspiration';
import Search from './pages/Search';
import Counter from './pages/RenderCounter';
import 'react-tooltip/dist/react-tooltip.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<App />}>
          {/*<Route index element={<Home />}/>*/}
          <Route
            path='/profile/:profileUserId?'
            element={<Profile />}
            // loader={}
            // action={}
          />
          <Route path='/setting/:settingUserId' element={<Setting />} />
          <Route path='/posts/:postId?' element={<Posts />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/map' element={<Map />} />
          <Route path='/catalogue/:catalogueBrandId?/:catalogueItemId?' element={<Catalogue />} />
          <Route path='/inspiration' element={<Inspiration />} />
          <Route path='/search' element={<Search />} />
          <Route path='/counter' element={<Counter />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
);
