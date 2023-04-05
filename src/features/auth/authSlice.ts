import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import nullPhoto from '../../images/nullPhoto.png';

export interface AuthState {
  isSignedIn: boolean;
  loading: boolean;
  error: string | null;
  userId: string | null;
  userName: string | null;
  photoURL: string;
}

const initialState: AuthState = {
  isSignedIn: false,
  loading: false,
  error: null,
  userId: null,
  userName: null,
  photoURL: nullPhoto,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.isSignedIn = true;
      state.userId = action.payload.id;
      state.userName = action.payload.name;
      state.photoURL = action.payload.photoURL;
    },
    signInFail: (state, action) => {
      state.loading = false;
      state.isSignedIn = false;
      state.error = action.payload;
    },
    signOutStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signOutSuccess: (state) => {
      state.loading = false;
      state.isSignedIn = false;
      state.userId = null;
      state.userName = null;
      state.photoURL = nullPhoto;
    },
    signOutFail: (state, action) => {
      state.loading = false;
      state.isSignedIn = true;
      state.error = action.payload;
    },
  },
});

export const { signInStart, signInSuccess, signInFail, signOutStart, signOutSuccess, signOutFail } = authSlice.actions;
export default authSlice.reducer;
