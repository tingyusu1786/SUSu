import reportWebVitals from './reportWebVitals';
import './index.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import Map from './pages/Map';
import Counter from './pages/RenderCounter';
import Profile from './pages/Profile';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route index element={<App />}/>
        <Route path="/map" element={<Map />}/>
        <Route path="/counter" element={<Counter />}/>
        <Route path="/profile" element={<Profile />}/>
      </Routes>
    </Provider>
  </BrowserRouter>
);
