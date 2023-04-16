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

function Posts() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [onlySeeFollowing, setOnlySeeFollowing] = useState(currentUser.feedSource || 'all');

  const handlePostsSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOnlySeeFollowing(e.target.value === 'all' ? false : true);
    currentUserId && updateDoc(doc(db, 'users', currentUserId), { feedSource: e.target.value });
  };

  return (
    <div className='flex items-start justify-center gap-10'>
      <CreatePost />
      <div>
        <div>
          <h1 className='font-heal text-3xl'>see posts</h1>
          <select
            name='audience'
            id=''
            className='w-50 my-1 rounded bg-gray-200'
            value={onlySeeFollowing ? 'following' : 'all'}
            onChange={handlePostsSourceChange}
          >
            <option value='all'>all</option>
            <option value='following'>following</option>
          </select>
        </div>
        <PostsFeed onlySeeFollowing={onlySeeFollowing} />
      </div>
    </div>
  );
}

export default Posts;
