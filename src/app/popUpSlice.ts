import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';

export interface infoState {
  isNotificationShown: boolean;
  isSearchShown: boolean;
}

const initialState: infoState = {
  isNotificationShown: false,
  isSearchShown: false,
};

export const popUpSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    closeNotification: (state) => {
      state.isNotificationShown = false;
    },
    showNotification: (state) => {
      state.isNotificationShown = true;
    },
    closeSearch: (state) => {
      state.isSearchShown = false;
    },
    showSearch: (state) => {
      state.isSearchShown = true;
    },
  },
});

export const { closeNotification, showNotification, closeSearch, showSearch } = popUpSlice.actions;
export default popUpSlice.reducer;
