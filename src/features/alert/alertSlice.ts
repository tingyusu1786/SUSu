import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';

export interface AlertState {
  isShown: boolean;
  content: string | null;
  type: 'success' | 'fail' | 'other' | null;
}

const initialState: AlertState = {
  isShown: false,
  content: null,
  type: null,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.isShown = true;
      state.content = action.payload.content;
      state.type = action.payload.type;
    },
    closeAlert: (state) => {
      state.isShown = false;
      state.content = null;
      state.type = null;
    },
  },
});

export const { showAlert, closeAlert } = alertSlice.actions;
export default alertSlice.reducer;
