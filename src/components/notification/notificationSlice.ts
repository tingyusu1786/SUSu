import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';

export interface NotificationState {
  isShown: boolean;
  content: string | null;
  type: 'success' | 'fail' | 'normal' | null;
}

const initialState: NotificationState = {
  isShown: false,
  content: null,
  type: null,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.isShown = true;
      state.content = action.payload.content;
      state.type = action.payload.type;
    },
    closeNotification: (state) => {
      state.isShown = false;
      state.content = null;
      state.type = null;
    },
  },
});

export const { showNotification, closeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
