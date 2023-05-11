// import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
// import { RootState, AppThunk } from './store';

export interface AuthState {
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | null;
  currentUser: any; //todo
  currentUserId: string | null;
}

const initialState: AuthState = {
  isSignedIn: false,
  isLoading: true,
  error: null,
  currentUser: {},
  currentUserId: null,
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
      state.currentUser = action.payload.user;
      state.currentUserId = action.payload.id;
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
      state.currentUser = {};
      state.currentUserId = null;
    },
    signOutFail: (state, action) => {
      state.isLoading = false;
      state.isSignedIn = true;
      state.error = action.payload;
    },
    updateUserName: (state, action) => {
      state.currentUser.name = action.payload.name;
    },
    updateUserPhoto: (state, action) => {
      state.currentUser.photoURL = action.payload.photoURL;
    },
    updateUserFeedSource: (state, action) => {
      state.currentUser.feedSource = action.payload.feedSource;
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
  updateUserName,
  updateUserPhoto,
  updateUserFeedSource,
} = authSlice.actions;
export default authSlice.reducer;
