import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Link, useParams } from 'react-router-dom';
import { db, auth, storage } from '../services/firebase';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { User } from '../interfaces/interfaces';
import { updateUserName, updateUserPhoto } from '../components/auth/authSlice';
import swal from '../utils/swal';
import PostCard from '../components/postsFeed/PostCard';
import PostsFeed from '../components/postsFeed/PostsFeed';

function Log() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const currentAuthUser = auth.currentUser;
  const { logId } = useParams<{ logId: string }>();

  // if (currentUserId) {
  //   return (
  //     <main className='bg-boxes-diag relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-fixed p-10 text-xl'>
  //       you don't have access to this page
  //     </main>
  //   );
  // }

  return (
    <main className='bg-boxes-diag relative min-h-[calc(100vh-64px)] bg-fixed p-10'>
      <PostsFeed currentPage='log' logId={logId} />
      loggggg id: {logId}
    </main>
  );
}

export default Log;
