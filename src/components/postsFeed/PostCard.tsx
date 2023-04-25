import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Post } from '../../interfaces/interfaces';
import CommentInputSection from './CommentInputSection';
import CommentDiv from './CommentDiv';
import Button from '../../components/Button';
import {
  TrashIcon,
  GlobeAsiaAustraliaIcon,
  UserIcon,
  HeartIcon as SolidHeart,
  StarIcon as SolidStar,
} from '@heroicons/react/24/solid';
import {
  HeartIcon as LineHeart,
  StarIcon as LineStar,
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

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
      className='relative w-full max-w-3xl rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'
      key={index}
    >
      <div className='absolute right-0 top-32'>
        <div className='absolute right-[15%] top-[1/4] h-52 w-52 -skew-y-12 skew-x-12 scale-x-125 scale-y-50 overflow-hidden rounded-full border-2 border-solid border-neutral-900 bg-gradient-to-l from-sky-500 to-green-500 px-6 pt-10 text-3xl opacity-90'>
          五十嵐紅茶拿鐵sssss一分糖 去冰
        </div>
        <div className='absolute -left-[130px] -top-[20px] h-[130px] w-3 -rotate-[18deg] border-x-2 border-solid border-neutral-900 bg-white opacity-60'></div>
      </div>
      <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-3'>
        <Link to={`/profile/${post.authorId}`} className='group flex items-center'>
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className='mr-2 inline-block h-8 w-8 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
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
      <div className=' p-5'>
        <div className='text-xl'>
          <span>I drank </span>
          <Link to={`/catalogue/${post.brandId}`}>
            <span className=''>{post.brandName}</span>
          </Link>
          <span>'s </span>
          <Link to={`/catalogue/${post.brandId}/${post.itemId}`}>
            <span className=''>{post.itemName}</span>
          </Link>
        </div>
        {post?.rating && (
          <div className='flex text-amber-400'>
            {[1, 2, 3, 4, 5].map((num) => {
              return Number(post.rating) >= num ? (
                <SolidStar className='h-6 drop-shadow-sm' />
              ) : (
                <LineStar className='h-6 drop-shadow-md' />
              );
            })}
          </div>
        )}
        {post.size && (
          <div className='flex items-baseline gap-1'>
            <span className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-neutral-900 bg-green-400 pt-1 text-sm'>
              {post.size}
            </span>
            <span className='before:content-["$"]'>{post.price}</span>
          </div>
        )}
        <span>{post.sugar && `sugar: ${post.sugar} / `}</span>
        <span>{post.ice && `ice: ${post.ice} / `}</span>
        <span>{post.orderNum && `orderNum: ${post.orderNum} / `}</span>

        <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
        <div className='flex flex-wrap gap-3'>
          {post.hashtags?.map((hashtag) => (
            <button
              className=' before:mr-px before:content-["#"] hover:bg-gradient-to-l hover:from-sky-500 hover:to-green-500 hover:bg-clip-text hover:text-transparent '
              key={hashtag}
              onClick={() => {
                handleClickHashtag(hashtag);
              }}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>
      <div className=''>
        <div
          className='relative w-8 rounded-full transition-all hover:scale-110'
          onClick={() => {
            currentUserId && handleLike(post, currentUserId, index);
          }}
        >
          {post.likes?.some((like) => like.authorId === currentUserId) ? (
            <SolidHeart className='cursor-pointer rounded-full ' />
          ) : (
            <LineHeart className='cursor-pointer rounded-full' />
          )}
        </div>

        <span className='ml-2 w-6 pt-2'>{post.likes?.length === 0 ? '' : post.likes?.length || 0}</span>

        {post.comments?.length === 0 ? (
          <ChatBubbleOvalLeftIcon className='w-8 cursor-pointer' onClick={() => handleCommentsShown(index)} />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className='w-8 cursor-pointer' onClick={() => handleCommentsShown(index)} />
        )}
        <span>{post.comments?.length === 0 ? '' : post.comments?.length || 0}</span>
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
