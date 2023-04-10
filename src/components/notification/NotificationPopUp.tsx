import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotification, closeNotification } from './notificationSlice';

export function NotificationPopUp() {
  const dispatch = useAppDispatch();
  // todo: get what i need from useAppSelector
  const content = useAppSelector((state) => state.notification.content);
  return (
    <div className='fixed top-30 right-0 mr-5 z-10 w-64 bg-yellow-600'>
      <span>123123</span>
      <span>{content}</span>
      <br/>
      <br/>
      <button onClick={() => dispatch(closeNotification())}>X</button>
    </div>
  );
}
