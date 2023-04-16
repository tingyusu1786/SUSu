import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';
import { Query, DocumentData } from 'firebase/firestore';
import { Post } from '../interfaces/interfaces';

export interface postsState {
  querySpec: Query<DocumentData> | undefined;
  posts: Post[];
}

const initialState: postsState = {
  querySpec: undefined,
  posts: [],
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    changeQuerySpec: (state, action) => {
      state.querySpec = action.payload.querySpec;
    },
    updatePosts: (state, action) => {
      state.posts = action.payload.updatedPosts;
    },
  },
});

export const { changeQuerySpec, updatePosts } = postsSlice.actions;
export default postsSlice.reducer;
