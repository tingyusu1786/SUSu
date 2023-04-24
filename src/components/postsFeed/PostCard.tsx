import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Post } from '../../interfaces/interfaces';
import CommentInputSection from './CommentInputSection';
import CommentDiv from './CommentDiv';
import Button from '../../components/Button';
import { TrashIcon, GlobeAsiaAustraliaIcon, UserIcon, HeartIcon as SolidHeart } from '@heroicons/react/24/solid';
import { HeartIcon as LineHeart } from '@heroicons/react/24/outline';

interface PostProps {
  post: Post;
  index: number;
  handleDeletePost: (post: Post, index: number) => Promise<void>;
  handleDeleteComment: (post: Post, postIndex: number, commentIndex: number, commentId: string) => Promise<void>;
  handleLike: (post: Post, userId: string, index: number) => Promise<void>;
  handleCommentsShown: (index: number) => void;
  handleCommentInput: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => Promise<void>;
  handleUpdatePost: (post: Post, userId: string, postIndex: number, type: 'like' | 'comment') => Promise<void>;
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

  const date = post.timeCreated?.toDate();
  const formattedTime = date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formattedDate = date?.toLocaleDateString('en-US');
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <div
      className='relative w-full rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'
      key={index}
    >
      <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-2'>
        <Link to={`/profile/${post.authorId}`} className='group flex items-center'>
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className='mr-2 inline-block h-8 w-8 rounded-full border-2 border-solid border-neutral-900 object-cover transition-all'
          />
          <span className=' group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
            {post.authorName}
          </span>
        </Link>
        <div className=' flex items-center justify-between'>
          <span className='mt-1 after:mx-1 after:content-["•"]'>{formattedDateTime}</span>
          {post.audience === 'public' ? (
            <GlobeAsiaAustraliaIcon className=' h-4 w-4 ' title='public' />
          ) : (
            <UserIcon className='h-4 w-4 ' title='private' />
          )}
        </div>
      </div>
      {post.authorId === currentUserId && (
        <TrashIcon
          title='delete post'
          className='absolute right-3 top-14 h-6 w-6 cursor-pointer rounded border-2 border-solid border-neutral-900 bg-red-700 p-1 text-sm text-white shadow-[1px_1px_#171717] active:translate-y-0.5 active:shadow-[0.5px_0,5px_#171717]'
          onClick={() => handleDeletePost(post, index)}
        />
      )}
      <div>
        <span>I drank </span>
        <Link to={`/catalogue/${post.brandId}`}>
          <span className='text-xl after:content-[]'>{post.brandName}</span>
        </Link>
        <span>'s </span>
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

      <div className=''>
        <div className='w-6'>
          <SolidHeart />
          <LineHeart />
        </div>
        <Button
          disabled={!currentUserId}
          liked={post.likes?.some((like) => like.authorId === currentUserId)}
          onClick={() => {
            currentUserId && handleLike(post, currentUserId, index);
          }}
        >
          like
        </Button>

        <span className='ml-2 w-6 pt-2'>{post.likes?.length === 0 ? '' : post.likes?.length || 0}</span>
        <button className='' onClick={() => handleCommentsShown(index)}>
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
