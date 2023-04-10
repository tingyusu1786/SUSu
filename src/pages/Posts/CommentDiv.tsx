import React from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../interfaces/interfaces';
import { getTimeDiff } from '../../utils/common';

interface CommentsProps {
  comment: Comment;
  index: number;
}

const CommentDiv: React.FC<CommentsProps> = ({ comment, index }) => {
  const timeDiff = getTimeDiff(comment.timeCreated);
  return (
    <div className='rounded-lg bg-white p-1' key={index}>
      <Link to={`/profile/${comment.authorId}`}>
        <img src={comment.authorPhoto} alt='123' className='mr-1 inline-block h-6 w-6 rounded-full object-cover' />
      </Link>
      <div className='inline-block'>
        <Link to={`/profile/${comment.authorId}`}>
          <div>{comment.authorName}</div>
        </Link>
        <div>{timeDiff}</div>
        {<div>{comment.timeCreated.toDate().toLocaleString()}</div>}
        <div>{comment.content}</div>
      </div>
    </div>
  );
};

export default CommentDiv;
