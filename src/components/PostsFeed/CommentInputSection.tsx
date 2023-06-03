import React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';

import { Post } from '../../interfaces/interfaces';
import { useAppSelector } from '../../redux/hooks';

interface PostProps {
  post: Post;
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
  index: number;
}

const CommentInputSection: React.FC<PostProps> = ({
  post,
  handleCommentInput,
  handleCommentSubmit,
  index,
}) => {
  const userId = useAppSelector((state) => state.auth.currentUserId);
  const userName = useAppSelector((state) => state.auth.currentUser.name);
  const userPhotoURL = useAppSelector(
    (state) => state.auth.currentUser.photoURL
  );
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  return (
    <div className='py-1'>
      {isSignedIn && (
        <div className='flex items-end'>
          <Link
            to={`/profile/${userId}`}
            className='group mb-1 flex items-center'
          >
            <img
              src={userPhotoURL}
              alt='123'
              className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
            />
            <div className='group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
              {userName}
            </div>
          </Link>
        </div>
      )}
      <textarea
        placeholder={
          isSignedIn
            ? post.comments && post.comments.length > 0
              ? 'write a comment'
              : 'be the first to comment!'
            : 'sign in to comment ☺'
        }
        className='block w-full break-all rounded-md bg-neutral-300 p-2 shadow-inner placeholder:text-neutral-400 focus:outline focus:outline-green-400'
        disabled={!isSignedIn}
        value={post.commentInput}
        onChange={(e) => handleCommentInput(e, index)}
        onKeyDown={(e) =>
          e.key === 'Enter' &&
          !e.shiftKey &&
          userId &&
          handleCommentSubmit(e, post, userId, index)
        }
      />
    </div>
  );
};

export default CommentInputSection;
