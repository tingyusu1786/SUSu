import { ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';

import {
  Trash,
  ChatCircleDots,
  GlobeHemisphereEast,
  UserCircle,
  Star as SolidStar,
  Star as LineStar,
} from '@phosphor-icons/react';

import heartFill from '../../assets/heartFill.png';
import heartLine from '../../assets/heartLine.png';
import { Post } from '../../interfaces/interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { showAuth } from '../../redux/popUpSlice';
import CommentDiv from './CommentDiv';
import CommentInputSection from './CommentInputSection';

interface PostProps {
  post: Post;
  index: number;
  handleDeletePost: (post: Post, index: number) => Promise<void>;
  handleDeleteComment: (
    post: Post,
    postIndex: number,
    commentIndex: number,
    commentId: string
  ) => Promise<void>;
  handleLike: (post: Post, userId: string, index: number) => Promise<void>;
  handleCommentsShown: (index: number) => void;
  handleCommentInput: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    post: Post,
    userId: string,
    index: number
  ) => Promise<void>;
  handleUpdatePost: (
    post: Post,
    userId: string,
    postIndex: number,
    type: 'like' | 'comment'
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
  handleClickHashtag,
}: PostProps) => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const date = post.timeCreated?.toDate();
  const formattedTime = date?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const formattedDate = date?.toLocaleDateString('en-US');
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <div
      className='relative w-full max-w-3xl rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'
      key={index}
    >
      <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-5 sm:h-20 sm:flex-col sm:items-start sm:justify-start sm:px-3 sm:pt-1 sm:mt-1'>
        <Link
          to={`/profile/${post.authorId}`}
          className='group flex items-center sm:justify-center sm:w-full transition-all duration-300'
        >
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
          />
          <span className='text-lg group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px] sm:mt-2 truncate xs:text-base xs:group-hover:underline-offset-[2px]'>
            {post.authorName}
          </span>
        </Link>
        <div className='flex items-center justify-between sm:w-full sm:justify-center shrink-0'>
          <span className='mt-1 after:mx-1 after:content-["•"]'>
            {formattedDateTime}
          </span>
          {post.audience === 'public' ? (
            <GlobeHemisphereEast size={18} color='#171717' weight='bold' />
          ) : (
            <UserCircle size={18} color='#171717' weight='bold' />
          )}
        </div>
      </div>

      <div className='p-5'>
        <div className='flex items-center justify-between gap-3 xs:flex-col xs:items-start xs:gap-0 xs:pb-2'>
          <div className='text-2xl sm:text-xl xs:flex xs:flex-col'>
            <span>I drank </span>
            <Link to={`/drinkipedia/${post.brandId}`}>
              <span className='inline-block hover:bg-gradient-to-l hover:from-sky-500 hover:to-green-500 hover:bg-clip-text hover:text-transparent'>
                {post.brandName}
              </span>
              <span>&rsquo;s </span>
            </Link>
            <Link
              to={`/drinkipedia/${post.brandId}/${post.itemId}`}
              className='hover:translate-y-1'
            >
              <span className='inline-block hover:bg-gradient-to-l hover:from-sky-500 hover:to-green-500 hover:bg-clip-text hover:text-transparent'>
                {post.itemName}
              </span>
            </Link>
          </div>
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
              size={16}
              color='#737373'
              weight='regular'
              className='mb-px ml-auto h-6 w-6 cursor-pointer absolute right-4 bottom-5'
              onClick={() => handleDeletePost(post, index)}
            />
          )}
        </div>
        {post.sugar && (
          <span className='mr-2 text-neutral-400'>{post.sugar}</span>
        )}
        {post.ice && <span className='mr-2 text-neutral-400'>{post.ice}</span>}
        {post?.rating && (
          <div className='mb-4 flex'>
            {[1, 2, 3, 4, 5].map((num) => {
              return Number(post.rating) >= num ? (
                <SolidStar
                  size={26}
                  color='#fbbf24'
                  weight='fill'
                  className='drop-shadow-sm'
                  key={num}
                />
              ) : (
                <LineStar
                  size={26}
                  color='#fbbf24'
                  weight='regular'
                  className='drop-shadow-md'
                  key={num}
                />
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
      <div className='mb-5 grid grid-cols-[repeat(4,30px)] items-center px-5'>
        {post.likes?.some((like) => like.authorId === currentUserId) ? (
          <img
            className='animate__animated animate__rubberBand w-7 cursor-pointer'
            src={heartFill}
            alt='liked'
            onClick={() =>
              currentUserId && handleLike(post, currentUserId, index)
            }
          />
        ) : (
          <img
            className=' w-7 cursor-pointer'
            src={heartLine}
            alt='like'
            onClick={() =>
              currentUserId
                ? handleLike(post, currentUserId, index)
                : dispatch(showAuth())
            }
          />
        )}
        <div className='mt-1 text-center'>{post.likes?.length || ''}</div>

        <ChatCircleDots
          size={28}
          color='#171717'
          weight='bold'
          onClick={() => handleCommentsShown(index)}
          className='mb-px w-7 cursor-pointer'
        />

        <div className='mt-1 text-center'>{post.comments?.length || ''}</div>
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
