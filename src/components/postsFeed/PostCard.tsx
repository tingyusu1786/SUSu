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
import heartFill from '../../images/heartFill.png';
import heartLine from '../../images/heartLine.png';
import comment from '../../images/comment.png';
import { ReactComponent as Trash } from '../../images/trash.svg';

import { Random_0, Random_1, Random_2 } from '../../images/star_10';

interface PostProps {
  post: Post;
  index: number;
  handleDeletePost: (post: Post, index: number) => Promise<void>;
  handleDeleteComment: (post: Post, postIndex: number, commentIndex: number, commentId: string) => Promise<void>;
  handleLike: (post: Post, userId: string, index: number) => Promise<void>;
  handleCommentsShown: (index: number) => void;
  handleCommentInput: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
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
  const [randomNum, setRandomNum] = useState(getRandomInt(3));
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  return (
    <div
      className='relative w-full max-w-3xl rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'
      key={index}
    >
      <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-5'>
        <Link to={`/profile/${post.authorId}`} className='group flex items-center'>
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
          />
          <span className='text-lg group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
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

      <div className=' p-5'>
        <div className='flex items-center gap-3'>
          <span className='text-2xl'>
            <span>I drank </span>
            <Link to={`/catalogue/${post.brandId}`}>
              <span className='inline-block transition-all duration-150 ease-out hover:-translate-y-1'>
                {post.brandName}
              </span>
            </Link>
            <span>'s </span>
            <Link to={`/catalogue/${post.brandId}/${post.itemId}`} className='hover:translate-y-1'>
              <span className='inline-block transition-all duration-150 ease-out hover:-translate-y-1'>
                {post.itemName}
              </span>
            </Link>
          </span>
          {post.size && (
            <span className='flex items-baseline gap-1'>
              <span className='flex h-6 w-8 items-center justify-center rounded-full border-2 border-solid border-neutral-900 pt-1 text-sm'>
                {post.size}
              </span>
              <span className='before:content-["$"]'>{post.price}</span>
            </span>
          )}
          {post.authorId === currentUserId && (
            <Trash
              className='mb-px ml-auto h-5 w-5 cursor-pointer hover:text-red-600'
              onClick={() => handleDeletePost(post, index)}
            />
          )}
        </div>
        {post.sugar && (
          <span className='mr-2'>
            <span className='text-neutral-500'>sugar_ </span>
            {post.sugar}
          </span>
        )}
        {post.ice && (
          <span>
            <span className='text-neutral-500'>ice_ </span>
            {post.ice}
          </span>
        )}
        {post?.rating && (
          <div className='mb-4 flex text-amber-400'>
            {[1, 2, 3, 4, 5].map((num) => {
              return Number(post.rating) >= num ? (
                <SolidStar className='h-6 drop-shadow-sm' key={num} />
              ) : (
                <LineStar className='h-6 drop-shadow-md' key={num} />
              );
            })}
          </div>
        )}

        {post.selfComment && <div className='text-xl'>{post.selfComment}</div>}
        <div className='flex flex-wrap gap-x-3'>
          {post.hashtags?.map((hashtag) => (
            <button
              className='text-neutral-400 before:mr-px before:content-["#"] hover:bg-gradient-to-l hover:from-sky-500 hover:to-green-500 hover:bg-clip-text hover:text-transparent'
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
      {/*<SolidHeart
            className='w-8 cursor-pointer'
            onClick={() => currentUserId && handleLike(post, currentUserId, index)}
          />*/}
      {/*<LineHeart
        className='w-8 cursor-pointer'
        onClick={() => currentUserId && handleLike(post, currentUserId, index)}
      />*/}
      <div className='mb-5 grid grid-cols-[repeat(4,30px)] items-center px-5'>
        {post.likes?.some((like) => like.authorId === currentUserId) ? (
          <img
            className='animate__animated animate__rubberBand cursor-pointer'
            src={heartFill}
            alt=''
            onClick={() => currentUserId && handleLike(post, currentUserId, index)}
          />
        ) : (
          <img
            className=' cursor-pointer'
            src={heartLine}
            alt=''
            onClick={() => currentUserId && handleLike(post, currentUserId, index)}
          />
        )}
        {/*todo: signin to like*/}
        <div className='mt-1 text-center'>{post.likes?.length || ''}</div>

        {/*<ChatBubbleOvalLeftIcon className='mb-1 w-8 cursor-pointer' onClick={() => handleCommentsShown(index)} />*/}
        <img className='mb-px w-7 cursor-pointer' src={comment} alt='' onClick={() => handleCommentsShown(index)} />

        <div className='mt-1 text-center'>{post.comments?.length || ''}</div>
        {/*<div className='absolute right-6 top-10 hover:rotate-90'>
          {randomNum === 0 && <Random_0 />}
          {randomNum === 1 && <Random_1 />}
          {randomNum === 2 && <Random_2 />}
        </div>*/}
      </div>

      <div
        className={`
        ${
          post.commentsShown ? 'flex' : 'hidden'
        } flex-col gap-y-1 overflow-hidden border-t-2 border-dashed border-neutral-900 px-3 py-2 transition-all duration-300`}
      >
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
    </div>
  );
};

export default PostCard;
