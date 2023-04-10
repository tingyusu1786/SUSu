import React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Post } from '../../interfaces/interfaces';

interface PostProps {
  post: Post;
  handleCommentInput: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleCommentSubmit: (
    event: KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => Promise<void>;
  index: number;
}

const CommentInputSection: React.FC<PostProps> = ({ post, handleCommentInput, handleCommentSubmit, index }) => {
  const userId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const userPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  return (
    <div className='rounded-lg p-1'>
      {isSignedIn && (
        <Link to={`/profile/${userId}`}>
          <img src={userPhotoURL} alt='' className='mr-1 inline-block h-6 w-6 rounded-full object-cover' />
        </Link>
      )}
      <div className='inline-block'>
        <Link to={`/profile/${userId}`}>
          <div>{userName}</div>
        </Link>
        <input
          type='text'
          placeholder={
            isSignedIn ? (post.comments && post.comments.length > 0 ? 'write a comment' : 'be the first to comment!') : 'sign in to comment'
          }
          className='bg-transparent'
          disabled={!isSignedIn}
          value={post.commentInput}
          onChange={(e) => handleCommentInput(e, index)}
          onKeyPress={(e) => e.key === 'Enter' && userId && handleCommentSubmit(e, post, userId, index)}
        />
      </div>
    </div>
  );
};

export default CommentInputSection;
