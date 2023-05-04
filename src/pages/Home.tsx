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
  collection,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Link, useParams } from 'react-router-dom';
import { db, auth, storage } from '../services/firebase';
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { User } from '../interfaces/interfaces';
import { updateUserName, updateUserPhoto } from '../components/auth/authSlice';
import blur from '../images/nullPhoto.png';
import Typed from 'typed.js';

function Home() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserphotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const currentAuthUser = auth.currentUser;
  // Create reference to store the DOM element containing the animation
  const el = useRef(null);
  // Create reference to store the Typed instance itself
  const typed = useRef<any>(null);

  useEffect(() => {
    const options = {
      strings: ['Drink.^600 Log.^600 Repeat.^200 '],
      stringss: ['npm install^1000\n `installing components...` ^1000\n `Fetching from source...`'],
      typeSpeed: 40,
      backSpeed: 30,
      loop: true,
    };

    // elRef refers to the <span> rendered below
    typed.current = new Typed(el.current, options);

    return () => {
      // Make sure to destroy Typed instance during cleanup
      // to prevent memory leaks
      typed.current.destroy();
    };
  }, []);

  return (
    <main className='bg-boxes flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-fixed px-36'>
      <div className='type-wrap flex-col items-center justify-start text-center text-9xl selection:bg-green-400'>
        {/*<span>SUSü is a platform where you can...</span>*/}
        {<span style={{ whiteSpace: 'pre' }} ref={el} />}
      </div>
    </main>
  );
}

export default Home;
