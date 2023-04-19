import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Post, Comment } from '../../interfaces/interfaces';
import CommentInputSection from './CommentInputSection';
import CommentDiv from './CommentDiv';

interface PostProps {
  post: Post;
  index: number;
  handleDeletePost: (post: Post, index: number) => Promise<void>;
  handleDeleteComment: (
    userId: string,
    post: Post,
    postIndex: number,
    comment: Comment,
    commentIndex: number
  ) => Promise<void>;
  handleLike: (post: Post, userId: string, index: number) => Promise<void>;
  handleCommentsShown: (index: number) => void;
  handleCommentInput: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => Promise<void>;
  handleUpdatePost: (
    post: Post,
    userId: string,
    index: number,
    type: 'like' | 'comment' | 'deleteComment',
    commentIndexToDelete?: number
  ) => Promise<void>;
  handleClickHashtag: (hashtag: string) => void;
}

const PostCard: React.FC<PostProps> = ({
  post,
  index,
  handleDeletePost,
  handleDeleteComment,
  handleLike,
  handleCommentsShown,
  handleCommentInput,
  handleCommentSubmit,
  handleUpdatePost,
  handleClickHashtag,
}) => {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className='relative w-96 rounded-md border-[3px] border-solid border-slate-900 bg-gray-100 p-3'
      style={{ boxShadow: '4px 4px rgb(15 23 42)' }}
      key={index}
    >
      {<div>{`audience: ${post.audience}`}</div>}
      {post.authorId === currentUserId && (
        <button
          className='absolute right-1 top-1 h-5 w-5 rounded-full border-2 border-solid border-slate-900 bg-red-700 pb-px text-sm text-white active:translate-y-0.5'
          style={{ boxShadow: isActive ? '1px 1px rgb(15 23 42)' : '1px 1px rgb(15 23 42)' }}
          onClick={() => handleDeletePost(post, index)}
        >
          x
        </button>
      )}
      <Link to={`/profile/${post.authorId}`}>
        <img
          src={post.authorPhoto}
          alt={post.authorName}
          className='inline-block h-10 w-10 rounded-full object-cover outline outline-2 outline-offset-2 outline-slate-900'
        />
      </Link>
      <Link to={`/profile/${post.authorId}`}>
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
          onMouseDown={() => {
            setIsActive(true);
          }}
          onMouseUp={() => {
            setIsActive(false);
          }}
          className={`w-16 rounded border-2 border-solid border-slate-900 pt-1 font-sayger active:translate-y-0.5 ${
            currentUserId && post.likes?.some((like) => like.authorId === currentUserId) && 'bg-[#3ddc84] '
          }`}
          style={{ boxShadow: isActive ? '1px 1px rgb(15 23 42)' : '3px 3px rgb(15 23 42)' }}
        >
          like
        </button>
        <span className='ml-2 w-6 pt-2'>{post.likes?.length === 0 ? '' : post.likes?.length || 0}</span>
        <button className='rounded border-2 border-solid border-gray-400' onClick={() => handleCommentsShown(index)}>
          comments
        </button>
        <span>{post.comments?.length || 0}</span>
      </div>
      {post.commentsShown && (
        <div className='mt-2 flex flex-col gap-1 rounded-lg bg-gray-300 p-1'>
          {post.comments?.map((comment, commentIndex) => (
            <CommentDiv
              key={commentIndex}
              post={post}
              postIndex={index}
              comment={comment}
              commentIndex={commentIndex}
              handleDeleteComment={handleDeleteComment}
            />
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
