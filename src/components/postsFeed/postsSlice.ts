import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { Query, DocumentData } from 'firebase/firestore';
import { Post } from '../../interfaces/interfaces';

export interface postsState {
  posts: Post[];
}

const initialState: postsState = {
  posts: [],
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    updatePosts: (state, action) => {
      state.posts = action.payload.updatedPosts;
    },
  },
});

export const { updatePosts } = postsSlice.actions;
export default postsSlice.reducer;
