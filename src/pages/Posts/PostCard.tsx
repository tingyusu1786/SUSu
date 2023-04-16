import { ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Post } from '../../interfaces/interfaces';
import CommentInputSection from './CommentInputSection';
import CommentDiv from './CommentDiv';

interface PostProps {
  post: Post;
  index: number;
  handleDeletePost: (post: Post, index: number) => Promise<void>;
  handleLike: (post: Post, userId: string, index: number) => Promise<void>;
  handleCommentsShown: (index: number) => void;
  handleCommentInput: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => Promise<void>;
  handleUpdatePost: (post: Post, userId: string, index: number, type: 'like' | 'comment') => Promise<void>;
  handleClickHashtag: (hashtag: string) => void;
}

const PostCard: React.FC<PostProps> = ({
  post,
  index,
  handleDeletePost,
  handleLike,
  handleCommentsShown,
  handleCommentInput,
  handleCommentSubmit,
  handleUpdatePost,
  handleClickHashtag,
}) => {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);

  return (
    <div className='relative w-96 rounded bg-gray-100 p-3' key={index}>
      {<div>{`audience: ${post.audience}`}</div>}
      {post.authorId === currentUserId && (
        <button className='absolute right-1 top-1' onClick={() => handleDeletePost(post, index)}>
          delete post
        </button>
      )}
      <Link to={`/profile/${post.authorId}`}>
        <img src={post.authorPhoto} alt='' className='inline-block h-10 w-10 rounded-full object-cover' />
        <span>{post.authorName}</span>
      </Link>
      <br />
      <span> 喝了</span>
      <div>
        <Link to={`/catalogue/${post.brandId}`}>
          <span className='text-xl after:content-["の"]'>{post.brandName}</span>
        </Link>
        <Link to={`/catalogue/${post.brandId}/${post.itemId}`}>
          <span className='text-xl  font-bold'>{post.itemName}</span>
        </Link>
      </div>
      <span>{post.size && `size: ${post.size} / `}</span>
      <span>{post.sugar && `sugar: ${post.sugar} / `}</span>
      <span>{post.ice && `ice: ${post.ice} / `}</span>
      <span>{post.orderNum && `orderNum: ${post.orderNum} / `}</span>
      <span>{post.rating && `rating: ${post.rating} / `}</span>
      <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
      <div className='flex flex-wrap gap-1'>
        {post.hashtags?.map((hashtag) => (
          <button
            className='rounded bg-gray-300 px-2 before:content-["#"]'
            key={hashtag}
            onClick={() => {
              handleClickHashtag(hashtag);
            }}
          >
            {hashtag}
          </button>
        ))}
      </div>
      <div>{post.timeCreated?.toDate().toLocaleString()}</div>
      <div className='flex gap-3'>
        <button
          onClick={() => {
            currentUserId && handleLike(post, currentUserId, index);
          }}
          className={`rounded border-2 border-solid border-gray-400 ${
            currentUserId && post.likes?.some((like) => like.authorId === currentUserId) && 'bg-gray-800 text-white'
          }`}
        >
          likes
        </button>

        <span>{post.likes?.length || 0}</span>
        <button className='rounded border-2 border-solid border-gray-400' onClick={() => handleCommentsShown(index)}>
          comments
        </button>
        <span>{post.comments?.length || 0}</span>
      </div>
      {post.commentsShown && (
        <div className='mt-2 flex flex-col gap-1 rounded-lg bg-gray-300 p-1'>
          {post.comments?.map((comment, index) => (
            <CommentDiv comment={comment} index={index} />
          ))}

          <CommentInputSection
            post={post}
            handleCommentInput={handleCommentInput}
            handleCommentSubmit={handleCommentSubmit}
            index={index}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
