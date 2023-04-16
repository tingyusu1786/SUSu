import CreatePost from './CreatePost';
import PostsFeed from './PostsFeed';

function Posts() {
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
            // onChange={handleInputChange}
          >
            <option value='all'>（all）</option>
            <option value='friends'>（friends）</option>
          </select>
        </div>
        <PostsFeed />
      </div>
    </div>
  );
}

export default Posts;
