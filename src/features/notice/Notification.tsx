import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotice, closeNotice } from './noticeSlice';

export function Notification() {
  const dispatch = useAppDispatch();
  // todo: get what i need from useAppSelector
  const content = useAppSelector((state) => state.notice.content);
  return (
    <div className='fixed top-10 z-10 h-48 w-96 bg-yellow-600'>
      <span>123123</span>
      <span>{content}</span>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <button onClick={()=>dispatch(closeNotice())}>X</button>
    </div>
  );
}
