import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { Link } from 'react-router-dom';
import { Post, Comment } from '../../interfaces/interfaces';
import { getTimeDiff } from '../../utils/common';
import { ReactComponent as Trash } from '../../images/trash.svg';

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

  const date = comment.timeCreated?.toDate();
  const formattedTime = date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formattedDate = date?.toLocaleDateString('en-US');
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <div className='relative py-1'>
      <div className='flex items-end justify-between'>
        <Link to={`/profile/${comment.authorId}`} className='group mb-1 flex items-center'>
          <img
            src={comment.authorPhoto}
            alt='123'
            className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
          />
          <div className='group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
            {comment.authorName}
          </div>
        </Link>
        <div className=' mb-1 flex items-end'>
          <span className='mr-2 text-sm'>{timeDiff}</span>
          <span className='text-sm'> ({formattedDateTime})</span>
        </div>
      </div>
      <div className='flex w-full rounded-md bg-neutral-200 shadow-inner'>
        <div className='max-w-[680px] grow whitespace-pre-wrap break-words px-3 pb-2 pt-3'>
          {comment.content.replace(/<br>/g, '\n')}
        </div>
        <div className='ml-auto p-3'>
          {comment.authorId === currentUserId && (
            <Trash
              className='h-5 w-5 cursor-pointer'
              onClick={() => handleDeleteComment(post, postIndex, commentIndex, comment.commentId)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentDiv;
