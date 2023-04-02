import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// the default Dispatch type does not know about thunks. In order to correctly dispatch thunks, you need to use the specific customized AppDispatch type
export const useAppDispatch = () => useDispatch<AppDispatch>();
// saves you the need to type (state: RootState) every time
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
