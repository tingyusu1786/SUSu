import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import nullPhoto from '../../images/nullPhoto.png';

export interface AuthState {
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserPhotoURL: string;
  isAuthWindow: boolean;
}

const initialState: AuthState = {
  isSignedIn: false,
  isLoading: true,
  error: null,
  currentUserId: null,
  currentUserName: null,
  currentUserPhotoURL: nullPhoto,
  isAuthWindow: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.isLoading = false;
      state.isSignedIn = true;
      state.isAuthWindow = false;
      state.currentUserId = action.payload.id;
      state.currentUserName = action.payload.name;
      state.currentUserPhotoURL = action.payload.photoURL;
    },
    signInFail: (state, action) => {
      state.isLoading = false;
      state.isSignedIn = false;
      state.error = action.payload;
    },
    signOutStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signOutSuccess: (state) => {
      state.isLoading = false;
      state.isSignedIn = false;
      state.isAuthWindow = false;
      state.currentUserId = null;
      state.currentUserName = null;
      state.currentUserPhotoURL = nullPhoto;
    },
    signOutFail: (state, action) => {
      state.isLoading = false;
      state.isSignedIn = true;
      state.error = action.payload;
    },
    openAuthWindow: (state) => {
      state.isAuthWindow = true;
    },
    closeAuthWindow: (state) => {
      state.isAuthWindow = false;
    },
    updateUserName: (state, action) => {
      state.currentUserName = action.payload.name;
    },
    updateUserPhoto: (state, action) => {
      state.currentUserPhotoURL = action.payload.photoURL;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFail,
  signOutStart,
  signOutSuccess,
  signOutFail,
  openAuthWindow,
  closeAuthWindow,
  updateUserName,
  updateUserPhoto,
} = authSlice.actions;
export default authSlice.reducer;
