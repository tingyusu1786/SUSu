import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../components/counter/counterSlice';
import authReducer from '../components/auth/authSlice';
import infoReducer from './infoSlice';
import popUpReducer from './popUpSlice';
// import postsReducer from '../components/postsFeed/postsSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    info: infoReducer,
    popUp: popUpReducer,
    // posts: postsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
