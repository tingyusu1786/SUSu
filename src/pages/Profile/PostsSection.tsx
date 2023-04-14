import React from 'react';

interface PostProps {
  profileUserPosts: any;
}

const PostsSection: React.FC<PostProps> = ({ profileUserPosts }) => {
  return (
    <div>
      {profileUserPosts.map((post: any, index: number) => {
        return (
          <div className='my-1 rounded bg-gray-100 p-3' key={index}>
            <div>{`audience: ${post.audience}`}</div>
            <div>
              <span className='text-xl after:content-["の"]'>{post.brandName}</span>
              <span className='text-xl  font-bold'>{post.itemName}</span>
            </div>
            <div>{post.size && `size: ${post.size}`}</div>
            <div>{post.sugar && `sugar: ${post.sugar}`}</div>
            <div>{post.ice && `ice: ${post.ice}`}</div>
            <div>{post.orderNum && `orderNum: ${post.orderNum}`}</div>
            <div>{post.rating && `rating: ${post.rating}`}</div>
            <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
            <div className='flex flex-wrap gap-1'>
              {post.hashtags?.map((hashtag: string) => (
                <span className='rounded bg-gray-300 px-2 before:content-["#"]' key={hashtag}>
                  {hashtag}
                </span>
              ))}
            </div>
            <div>{post.timeCreated?.toDate().toLocaleString()}</div>

            <span>likes: {post.likes?.length || 0}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PostsSection;
