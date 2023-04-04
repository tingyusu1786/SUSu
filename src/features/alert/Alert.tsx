import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showAlert, closeAlert } from './alertSlice'

export function Alert () {
  const dispatch = useAppDispatch();
  // todo: get what i need from useAppSelector
  const content = useAppSelector((state) => state.alert.content);
  return <div>{content}</div>
}