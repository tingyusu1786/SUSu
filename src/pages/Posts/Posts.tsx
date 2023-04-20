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
    <div
      className='min-h-screen bg-fixed'
      style={{
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className='flex w-screen flex-col items-center justify-start gap-10'>
        <CreatePost />
        <div>
          <div>
            <select
              name='audience'
              id=''
              className='w-50 my-1 rounded bg-gray-200'
              value={feedSource}
              onChange={handlePostsSourceChange}
            >
              <option value='all'>all</option>
              <option value='following'>following</option>
            </select>
          </div>
          <PostsFeed onlySeeFollowing={feedSource === 'following' ? true : false} currentPage='posts' />
        </div>
      </div>
    </div>
  );
}

export default Posts;
