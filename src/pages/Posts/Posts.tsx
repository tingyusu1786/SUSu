import { useState, ChangeEvent } from 'react';
import CreatePost from './CreatePost';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateUserFeedSource } from '../../components/auth/authSlice';

function Posts() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [feedSource, setFeedSource] = useState<string>(currentUser.feedSource || 'all');

  const handlePostsSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFeedSource(e.target.value);
    currentUserId && updateDoc(doc(db, 'users', currentUserId), { feedSource: e.target.value });
    dispatch(updateUserFeedSource({ feedSource: e.target.value }));
  };

  return (
    <main className='bg-boxes relative min-h-[calc(100vh-64px)] bg-fixed p-10'>
      <h1 className='mb-10 text-center text-7xl'>Drink. Log. Repeat.</h1>
      {/*<div className='flex w-screen flex-col items-center justify-start gap-10 bg-red-300'>*/}
      <CreatePost />
      {/*<div className='bg-sky-200'>*/}
      <select
        name='audience'
        className='w-50 my-1 rounded bg-gray-200'
        value={feedSource}
        onChange={handlePostsSourceChange}
      >
        <option value='all'>all</option>
        <option value='following'>following</option>
      </select>
      <PostsFeed onlySeeFollowing={feedSource === 'following' ? true : false} currentPage='posts' />
      {/*</div>*/}
      {/*</div>*/}
    </main>
  );
}

export default Posts;
