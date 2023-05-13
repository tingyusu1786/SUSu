import { useState, ChangeEvent } from 'react';

import { doc, updateDoc } from 'firebase/firestore';

import PostsFeed from '../../components/PostsFeed/';
import { updateUserFeedSource } from '../../redux/authSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { db } from '../../services/firebase';
import CreatePost from './CreateLog';

function Posts() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [feedSource, setFeedSource] = useState<string>(
    currentUser.feedSource || 'all'
  );
  const [dropdownShown, setDropdownShown] = useState({ audience: false });

  const handlePostsSourceChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFeedSource(e.target.value);
    currentUserId &&
      updateDoc(doc(db, 'users', currentUserId), {
        feedSource: e.target.value,
      });
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
      <h1 className='pageTitle mb-10 '>Log your drinks</h1>
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
              className='h-8 w-full grow rounded-full border border-solid border-neutral-900 bg-transparent p-0 px-2 pt-1 text-base focus:outline focus:outline-green-400'
            >
              {feedSource === 'all'
                ? 'all over the world'
                : 'people you follow'}
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
                />
              </label>
              <label className='cursor-pointer px-3 pt-1 text-center text-base hover:bg-neutral-100'>
                people you follow
                <input
                  type='radio'
                  name='audience'
                  value='following'
                  className='hidden'
                  onChange={handlePostsSourceChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <PostsFeed
        onlySeeFollowing={feedSource === 'following' ? true : false}
        currentPage='posts'
      />
    </main>
  );
}

export default Posts;
