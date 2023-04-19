import { useState, ChangeEvent } from 'react';
import CreatePost from './CreatePost';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { db } from '../../services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Query,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  or,
  and,
} from 'firebase/firestore';
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
      className='flex items-start justify-center gap-10 '
      style={{
        backgroundColor: '#F6F6F9',
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <CreatePost />
      <div>
        <div>
          <h1 className='font-heal text-3xl'>see posts</h1>
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
        <PostsFeed onlySeeFollowing={feedSource == 'following' ? true : false} currentPage='posts' />
      </div>
    </div>
  );
}

export default Posts;
