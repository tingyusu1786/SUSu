import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'react-tooltip/dist/react-tooltip.css';

import App from './App';
import './index.css';
import Drinkipedia from './pages/Drinkipedia/';
import Feeds from './pages/Feeds/';
import Inspiration from './pages/Inspiration/';
import Landing from './pages/Landing/';
import Log from './pages/Log/';
import PageNotFound from './pages/PageNotFound/';
import Profile from './pages/Profile/';
import Setting from './pages/Setting/';
import { store } from './redux/store';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Landing />} />
          <Route path='/profile/:profileUserId?' element={<Profile />} />
          <Route path='/setting/:settingUserId' element={<Setting />} />
          <Route path='/feeds/:postId?' element={<Feeds />} />
          <Route path='/log/:logId' element={<Log />} />
          <Route
            path='/drinkipedia/:pageBrandId?/:pageItemId?'
            element={<Drinkipedia />}
          />
          <Route path='/inspiration' element={<Inspiration />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
);
