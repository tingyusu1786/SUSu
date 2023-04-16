import { useState, ChangeEvent } from 'react';
import CreatePost from './CreatePost';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { useAppDispatch } from '../../app/hooks';

function Posts() {
  const dispatch = useAppDispatch();
  const [onlySeeFollowing, setOnlySeeFollowing] = useState(false);

  const handlePostsSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOnlySeeFollowing(e.target.value === 'all' ? false : true);
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
            // value={inputs.audience}
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
