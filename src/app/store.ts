import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import infoReducer from './infoSlice';
import popUpReducer from './popUpSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    info: infoReducer,
    popUp: popUpReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
