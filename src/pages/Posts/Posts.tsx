import CreatePost from './CreatePost';
import RenderPosts from './RenderPosts';

function Posts() {
  return (
    <div className='flex items-start justify-center gap-10'>
      <CreatePost />
      <RenderPosts />
    </div>
  );
}

export default Posts;
