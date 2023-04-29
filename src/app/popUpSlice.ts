import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';

export interface infoState {
  isNotificationShown: boolean;
  isSearchShown: boolean;
  isAuthShown: boolean;
}

const initialState: infoState = {
  isNotificationShown: false,
  isSearchShown: false,
  isAuthShown: false,
};

export const popUpSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state) => {
      state.isNotificationShown = true;
    },
    closeNotification: (state) => {
      state.isNotificationShown = false;
    },
    showSearch: (state) => {
      state.isSearchShown = true;
    },
    closeSearch: (state) => {
      state.isSearchShown = false;
    },
    showAuth: (state) => {
      state.isAuthShown = true;
    },
    closeAuth: (state) => {
      state.isAuthShown = false;
    },
  },
});

export const { showNotification, closeNotification, showSearch, closeSearch, showAuth, closeAuth } = popUpSlice.actions;
export default popUpSlice.reducer;
