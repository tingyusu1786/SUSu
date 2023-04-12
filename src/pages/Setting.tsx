import {
  doc,
  getDoc,
  query,
  Query,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  or,
  and,
} from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';

function Setting() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const { settingUserId } = useParams<{ settingUserId: string }>();

  const updatePhoto = () => {
    // updateAuthProfile
    // updateDoc
  }
  const updateName = () => { 
    // updateAuthProfile
    // updateDoc
  }
  const updateStatus = () => {}

  if (currentUserId !== settingUserId) {
    return <div>you don't have access to this page</div>
  }
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='text-3xl'>Setting</div>
      <div className='flex flex-col items-center'>
        <img className='h-32 w-32 rounded-full object-cover' src={currentUserphotoURL} alt={currentUserName|| ''} />
        <button className='box-border rounded-lg border-2 border-solid px-2 border-lime-800' > change image</button>
        {/*{profileUser.status && <div><span>🎙️ </span><span>{profileUser.status}</span></div>}*/}
        <br/>
        <h3 className='text-2xl'>{currentUserName}</h3>
        <button className='box-border rounded-lg border-2 border-solid px-2 border-lime-800' > change name</button>
        {/*<div className='text-sm text-gray-400'>{profileUser.email}</div>*/}
      </div>
    </div>
  );
}

export default Setting;
