import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { db } from '../services/firebase';
import {
//   collection,
  doc,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
//   getDoc,
//   getDocs,
//   query,
//   Query,
//   orderBy,
//   limit,
  onSnapshot,
//   QuerySnapshot,
  Timestamp,
//   updateDoc,
//   where,
//   deleteDoc,
//   startAfter,
//   arrayUnion,
//   arrayRemove,
} from 'firebase/firestore';
import dbApi from '../utils/dbApi';
import { openAuthWindow } from '../components/auth/authSlice';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { showNotification } from '../components/notification/notificationSlice';

interface Search {

}

function Search() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const currentUserName = useAppSelector((state) => state.auth.userName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const initSnap = useRef(true);

  let currentUserRef: DocumentReference<DocumentData> | undefined;

  if (currentUserId) {
    currentUserRef = doc(db, 'users', currentUserId);
  }

  

  return (
    <div className='text-xl'>
      <div>search results:</div>
    </div>
  );
}

export default Search;
