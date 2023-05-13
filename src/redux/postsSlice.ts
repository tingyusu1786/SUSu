import { createSlice } from '@reduxjs/toolkit';

import { Post } from '../interfaces/interfaces';

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
