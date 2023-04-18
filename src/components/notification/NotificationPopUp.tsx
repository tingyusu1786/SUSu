import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotification, closeNotification } from './notificationSlice';
// import { Notification } from '../../interfaces/interfaces';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function NotificationPopUp() {
  const dispatch = useAppDispatch();
  // todo: get what i need from useAppSelector
  const content = useAppSelector((state) => state.notification.content);
  const [displayMessage, setDisplayMessage] = useState<any>('');

  useEffect(() => {
    if (typeof content === 'object' && content !== null) {
      // content is a Notification instance
      setDisplayMessage(
        <div>
          <Link to={`/profile/${content.authorId}`} className='hover:font-bold'>
            {content.authorName}
          </Link>
          {content.type === 'follow' ? (
            <span> {` started following you!`}</span>
          ) : (
            <span>
              {` ${content.type}${content.type === 'like' ? 'd' : 'ed'} on your post! (post id: ${content.postId})`}
            </span>
          )}
        </div>
      );
    } else {
      // content is either a string or null
      setDisplayMessage(content);
    }
  }, []);

  return (
    <div className='top-30 left-30 fixed z-10 rounded bg-lime-200/30 backdrop-blur-md'>
      <button onClick={() => dispatch(closeNotification())} className='absolute right-3 top-3'>
        close
      </button>
      <div>{displayMessage}</div>
      <br />
      <br />
    </div>
  );
}
