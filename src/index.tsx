import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import Profile from './pages/Profile/';
import Setting from './pages/Setting/';
import Landing from './pages/Landing/';
import Log from './pages/Log/';
import Feeds from './pages/Feeds/';
import Drinkipedia from './pages/Drinkipedia/';
import Inspiration from './pages/Inspiration/';
import PageNotFound from './pages/PageNotFound/';
import 'react-tooltip/dist/react-tooltip.css';

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
