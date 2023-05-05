import { useState, ChangeEvent } from 'react';
import CreatePost from './CreateLog';
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
  const [dropdownShown, setDropdownShown] = useState({ audience: false });

  const handlePostsSourceChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFeedSource(e.target.value);
    currentUserId && updateDoc(doc(db, 'users', currentUserId), { feedSource: e.target.value });
    dispatch(updateUserFeedSource({ feedSource: e.target.value }));
  };

  return (
    <main
      className='bg-boxes min-h-[calc(100vh-64px)] bg-fixed p-10'
      onClick={() => {
        if (Object.values(dropdownShown).some((show) => show === true)) {
          setDropdownShown({ audience: false });
        }
      }}
    >
      <h1 className='mb-10 text-center text-7xl selection:bg-green-400'>Log your drinks</h1>
      <CreatePost />
      <div className='mb-3 mt-10 grid grid-cols-[1fr_48rem_1fr]'>
        <div className='col-start-2'>
          <span>✦ see logs from </span>
          <div className='relative inline-block'>
            <button
              onClick={() =>
                setDropdownShown((prev) => {
                  const newShown = { ...prev };
                  newShown.audience = !newShown.audience;
                  return newShown;
                })
              }
              className='h-8 w-full grow rounded-xl border border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base  focus:outline focus:outline-green-400'
            >
              {feedSource === 'all' ? 'all over the world' : 'people you follow'}
            </button>
            <div
              className={`flex ${
                !dropdownShown.audience && 'hidden'
              } absolute z-10 w-48 flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-1 shadow-lg`}
            >
              <label className='cursor-pointer px-1 pt-1 text-center text-base hover:bg-neutral-100'>
                all over the world
                <input
                  type='radio'
                  name='audience'
                  value='all'
                  className='hidden'
                  onChange={handlePostsSourceChange}
                ></input>
              </label>
              <label className='cursor-pointer px-3 pt-1 text-center text-base hover:bg-neutral-100'>
                people you follow
                <input
                  type='radio'
                  name='audience'
                  value='following'
                  className='hidden'
                  onChange={handlePostsSourceChange}
                ></input>
              </label>
            </div>
          </div>
          {/*  <select
            name='audience'
            className='w-50 my-1 h-6 border-b-2 border-neutral-900 bg-transparent focus:outline-0'
            value={feedSource}
            onChange={handlePostsSourceChange}
          >
            <option value='all'>all over the world</option>
            <option value='following'>people you follow</option>
          </select>*/}
        </div>
      </div>
      <PostsFeed onlySeeFollowing={feedSource === 'following' ? true : false} currentPage='posts' />
    </main>
  );
}

export default Posts;
