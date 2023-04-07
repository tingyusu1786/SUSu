import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';

export interface NoticeState {
  isShown: boolean;
  content: string | null;
  type: 'success' | 'fail' | 'other' | null;
}

const initialState: NoticeState = {
  isShown: false,
  content: null,
  type: null,
};

export const noticeSlice = createSlice({
  name: 'notice',
  initialState,
  reducers: {
    showNotice: (state, action) => {
      state.isShown = true;
      state.content = action.payload.content;
      state.type = action.payload.type;
    },
    closeNotice: (state) => {
      state.isShown = false;
      state.content = null;
      state.type = null;
    },
  },
});

export const { showNotice, closeNotice } = noticeSlice.actions;
export default noticeSlice.reducer;
