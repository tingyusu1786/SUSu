import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { Link } from 'react-router-dom';
import { Post, Comment } from '../../interfaces/interfaces';
import { getTimeDiff } from '../../utils/common';

interface CommentsProps {
  post: Post;
  postIndex: number;
  comment: Comment;
  commentIndex: number;
  handleDeleteComment: (post: Post, postIndex: number, commentIndex: number, commentId: string) => Promise<void>;
}

const CommentDiv: React.FC<CommentsProps> = ({ post, postIndex, comment, commentIndex, handleDeleteComment }) => {
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const timeDiff = getTimeDiff(comment.timeCreated);

  return (
    <div className='relative rounded-lg bg-white p-1'>
      {comment.authorId === currentUserId && (
        <button
          className='absolute right-1 top-1'
          onClick={() => {
            handleDeleteComment(post, postIndex, commentIndex, comment.commentId);
          }}
        >
          delete
        </button>
      )}
      <Link to={`/profile/${comment.authorId}`}>
        <img src={comment.authorPhoto} alt='123' className='mr-1 inline-block h-6 w-6 rounded-full object-cover' />
      </Link>
      <div className='inline-block'>
        <Link to={`/profile/${comment.authorId}`}>
          <div>{comment.authorName}</div>
        </Link>
        <div>{timeDiff}</div>
        <div>{comment.timeCreated.toDate().toLocaleString()}</div>
        <div>{comment.content}</div>
      </div>
    </div>
  );
};

export default CommentDiv;
